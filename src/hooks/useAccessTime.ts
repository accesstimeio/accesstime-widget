import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { Address, Hash, zeroAddress } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import {
    Contract,
    DashboardApi,
    ProjectResponseDto,
    getFactoryAddress,
    isSupportedChainId
} from "@accesstimeio/accesstime-common";

import { ZERO_AMOUNT } from "../config";

interface useAccessTimeReturnType {
    loading: boolean;
    loadingDetails: {
        contractDetails: boolean,
        contractAPIDetails: boolean
    },
    error: boolean;
    errorDetails: {
        contractDetails: boolean,
        contractAPIDetails: boolean
    },
    walletConnection: boolean;
    walletConnectionDetails: {
        isSupportedChain: boolean,
        isWalletConnected: boolean,
        isCorrectChainConnected: boolean
    },
    contractDetails: {
        deployed: boolean,
        accessTimeId?: bigint;
        packageModule?: boolean;
        extraTimeModule?: boolean;
        name?: string;
        description?: string;
        website?: string;
    },
    contractAPIDetails?: ProjectResponseDto,
    subscribe: (amount: bigint, paymentToken: Address) => Promise<Hash>,
    subscribePackage: (amount: bigint, paymentToken: Address, packageId: string) => Promise<Hash>
}
export const useAccessTime = (chainId: number, accessTime: Address): useAccessTimeReturnType => {
    const { isConnected, address, chain, chainId: connectedChainId } = useAccount();
    const { writeContractAsync } = useWriteContract();

    const factoryAddress = useMemo(() => {
        if (!chainId) {
            return zeroAddress;
        }
        return getFactoryAddress(chainId);
    }, [chainId]);

    const { walletConnection, walletConnectionDetails } = useMemo(() => {
        const isSupportedChain = isSupportedChainId(chainId);
        const isWalletConnected = (isConnected && address) ? true : false;
        const isCorrectChainConnected = (connectedChainId == chainId) ? true : false;

        return {
            walletConnection: isSupportedChain && isWalletConnected && isCorrectChainConnected,
            walletConnectionDetails: {
                isSupportedChain,
                isWalletConnected,
                isCorrectChainConnected
            }
        };
    }, [isConnected, address, chainId, connectedChainId])

    const {
        data: contractDetails,
        isSuccess: contractDetailsSuccess,
        isLoading: contractDetailsLoading,
        isError: contractDetailsError,
    } = useReadContract({
        query: {
            enabled: walletConnectionDetails.isSupportedChain
        },
        abi: Contract.abis.factory,
        address: factoryAddress,
        functionName: "deploymentDetails",
        args: [accessTime],
        chainId,
    });

    const contractDetailsFormatted = useMemo(() => {
        if (!contractDetails || !contractDetailsSuccess || contractDetails[0] != true) {
            return {
                deployed: false
            };
        }
        return {
            deployed: contractDetails[0],
            accessTimeId: contractDetails[1],
            packageModule: contractDetails[3],
            extraTimeModule: contractDetails[2],
            name: contractDetails[4],
            description: contractDetails[5],
            website: contractDetails[6],
        };
    }, [contractDetails, contractDetailsSuccess])

    const {
        data: contractAPIDetails,
        isSuccess: contractAPIDetailsSuccess,
        isLoading: contractAPIDetailsLoading,
        isError: contractAPIDetailsError,
    } = useQuery({
        enabled: contractDetailsFormatted.deployed,
        queryKey: [
            "contractAPIDetails",
            contractDetailsFormatted.deployed,
            contractDetailsFormatted.accessTimeId ? contractDetailsFormatted.accessTimeId.toString() : "not-deployed"
        ],
        queryFn: async () => {
            if (!contractDetailsFormatted.accessTimeId) {
                throw new Error("AccessTime is invalid!");
            }
            return await DashboardApi.project(chainId, Number(contractDetailsFormatted.accessTimeId.toString()));
        }
    })

    const subscribe = useCallback(async (amount: bigint, paymentToken: Address) => {
        if (!walletConnection) {
            throw new Error("Wallet is not connected or not correct!");
        }
        if (!contractAPIDetailsSuccess || !contractAPIDetails) {
            throw new Error("API failed!");
        }
        if (contractDetailsFormatted.deployed != true) {
            throw new Error("AccessTime is invalid!");
        }
        if (contractDetailsFormatted.packageModule == true) {
            throw new Error("Package module is active!");
        }
        if (!contractAPIDetails.paymentMethods?.includes(paymentToken.toLowerCase() as Address)) {
            throw new Error("Payment method is not exist!");
        }

        return await writeContractAsync({
            abi: Contract.abis.accessTime,
            address: accessTime,
            functionName: "purchase",
            args: [amount, paymentToken],
            value: paymentToken == zeroAddress ? amount : ZERO_AMOUNT,
            account: address,
            chain
        })
    }, [contractAPIDetails, contractAPIDetailsSuccess]);

    const subscribePackage = useCallback(async (amount: bigint, paymentToken: Address, packageId: string) => {
        if (!walletConnection) {
            throw new Error("Wallet is not connected or not correct!");
        }
        if (!contractAPIDetailsSuccess || !contractAPIDetails) {
            throw new Error("API failed!");
        }
        if (contractDetailsFormatted.deployed != true) {
            throw new Error("AccessTime is invalid!");
        }
        if (contractDetailsFormatted.packageModule != true) {
            throw new Error("Package module is not active!");
        }
        if (!contractAPIDetails.packages?.includes(packageId)) {
            throw new Error("Package is not active!");
        }
        if (!contractAPIDetails.paymentMethods?.includes(paymentToken.toLowerCase() as Address)) {
            throw new Error("Payment method is not exist!");
        }

        return await writeContractAsync({
            abi: Contract.abis.accessTime,
            address: accessTime,
            functionName: "purchasePackage",
            args: [amount, paymentToken, BigInt(packageId)],
            value: paymentToken == zeroAddress ? amount : ZERO_AMOUNT,
            account: address,
            chain
        })
    }, [contractDetailsFormatted, contractAPIDetails, contractAPIDetailsSuccess]);

    const loading = useMemo(() => {
        return contractDetailsLoading || contractAPIDetailsLoading;
    }, [contractDetailsLoading, contractAPIDetailsLoading])

    const error = useMemo(() => {
        return contractDetailsError || contractAPIDetailsError;
    }, [contractDetailsError, contractAPIDetailsError])

    return {
        loading,
        loadingDetails: {
            contractDetails: contractDetailsLoading,
            contractAPIDetails: contractAPIDetailsLoading,
        },
        error,
        errorDetails: {
            contractDetails: contractDetailsError,
            contractAPIDetails: contractAPIDetailsError,
        },
        walletConnection,
        walletConnectionDetails,
        contractDetails: contractDetailsFormatted,
        contractAPIDetails,
        subscribe,
        subscribePackage
    }
}
