"use client";
import { useEffect, useMemo, useState } from "react";
import { Address, Hash, parseAbi, zeroAddress, zeroHash } from "viem";
import { useAccount, useReadContract, useTransactionReceipt, useWriteContract } from "wagmi";

import { ZERO_AMOUNT } from "../config";

interface useTokenAllowanceReturnType {
    approveRequired: {
        status: boolean,
        amount: bigint,
    };
    approveCheckLoading: boolean;
    approveLoading: boolean;
    approve: () => Promise<Hash>;
    updateConfig: (tokenAddress: Address, desiredAmount: bigint) => void;
    refetch: () => Promise<void>;
}

export const useTokenAllowance = (chainId: number, accessTime: Address): useTokenAllowanceReturnType => {
    const { address, chain } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const [tokenAddress, setTokenAddress] = useState<Address>(zeroAddress);
    const [desiredAmount, setDesiredAmount] = useState<bigint>(ZERO_AMOUNT);
    const [approveLoading, setApproveLoading] = useState<boolean>(false);

    const [approveHash, setApproveHash] = useState<Hash>(zeroHash);
    const { data: approveReceipt, isSuccess: approveReceiptSuccess } = useTransactionReceipt({
        query: {
            enabled: approveHash != zeroHash ? true : false
        },
        hash: approveHash
    })

    const {
        data: allowanceData,
        isLoading: approveCheckLoading,
        isSuccess: allowanceSuccess,
        refetch: allowanceRefetch
    } = useReadContract({
        query: {
            enabled: tokenAddress == zeroAddress ? false : true
        },
        address: tokenAddress,
        abi: parseAbi(["function allowance(address owner, address spender) view returns (uint256)"]),
        functionName: "allowance",
        args: [address ? address : zeroAddress, accessTime],
        chainId
    })

    const approveRequired = useMemo(() => {
        if ((tokenAddress != zeroAddress) && (desiredAmount > ZERO_AMOUNT) && allowanceSuccess) {
            if (desiredAmount > allowanceData) {
                return {
                    status: true,
                    amount: desiredAmount - allowanceData
                }
            }
        }
        return {
            status: false,
            amount: ZERO_AMOUNT
        };
    }, [tokenAddress, desiredAmount, allowanceData, allowanceSuccess]);

    const approve = async (): Promise<Hash> => {
        setApproveLoading(true);
        try {
            if (chain?.id != chainId) {
                setApproveLoading(false);
                throw new Error("Invalid chainId!");
            }

            const { status } = approveRequired;
            if (status) {
                const transactionHash = await writeContractAsync({
                    address: tokenAddress,
                    abi: parseAbi(["function approve(address spender,uint256 amount) returns (bool)"]),
                    functionName: "approve",
                    args: [accessTime, desiredAmount],
                    account: address,
                    chain
                });

                setApproveHash(transactionHash);
                return transactionHash;
            }

            setApproveLoading(false);
            throw new Error("Approve is not required!");
        } catch (_err) {
            setApproveLoading(false);
            throw new Error("Approve failed!");
        }
    };

    const updateConfig = (tokenAddress: Address, desiredAmount: bigint) => {
        setTokenAddress(tokenAddress);
        setDesiredAmount(desiredAmount);
    };

    const refetch = async () => {
        await allowanceRefetch();
        setApproveLoading(false);
        setApproveHash(zeroHash);
    }

    useEffect(() => {
        if (approveHash != zeroHash && approveReceipt && approveReceiptSuccess) {
            refetch();
        }
    }, [approveHash, approveReceipt, approveReceiptSuccess]);

    return {
        approveRequired,
        approveCheckLoading,
        approveLoading,
        approve,
        updateConfig,
        refetch
    }
}
