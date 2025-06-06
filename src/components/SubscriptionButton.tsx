// @ts-nocheck: added due to deep and possibly infinite on useReadContracts calls
"use client";
import {
    AbsoluteCenter,
    Box,
    Button,
    Card,
    Divider,
    GridItem,
    NumberInput,
    NumberInputField,
    Select,
    SimpleGrid,
    Skeleton,
    Tag,
    Text
} from "@chakra-ui/react";
import {
    Address,
    formatUnits,
    getAddress,
    Hash,
    parseAbi,
    parseEther,
    zeroAddress,
    zeroHash
} from "viem";
import { useReadContract, useReadContracts, useTransactionReceipt } from "wagmi";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";
import {
    Contract,
    getChainCurrencySymbol,
    getChainCurrencyDecimals,
    SUPPORTED_CHAIN,
    Dashboard
} from "@accesstimeio/accesstime-common";

import { ZERO_AMOUNT } from "../config";
import { useAccessTime, useTokenAllowance } from "../hooks";

export interface ButtonConfig {
    text?: string;
    showTimeInformation?: boolean;
}

export interface SubscriptionButtonProps {
    chainId: number;
    accessTime: Address;
    packageId?: string;
    config?: ButtonConfig;
    className?: string;
    style?: React.CSSProperties;
    onSubscription?: (transactionHash: Hash) => void;
    onTimeAmount?: (timeAmount: number | null) => void;
    onConnectWallet?: () => void;
    onSwitchNetwork?: () => void;
}
export const SubscriptionButton = ({
    chainId,
    accessTime,
    packageId,
    config,
    className,
    style,
    onSubscription,
    onTimeAmount,
    onConnectWallet,
    onSwitchNetwork
}: SubscriptionButtonProps) => {
    const {
        walletConnectionDetails,
        subscribe,
        subscribePackage,
        contractDetails,
        contractAPIDetails,
        loading,
        error
    } = useAccessTime(chainId, accessTime);
    const [paymentMethod, setPaymentMethod] = useState<Address | null>(null);
    const [customTimeToggle, setCustomTimeToggle] = useState<boolean>(false);
    const [timeAmount, setTimeAmount] = useState<number | null>(null);
    const [subscribeLoading, setSubscribeLoading] = useState<boolean>(false);

    const {
        approveRequired,
        approveLoading,
        approve,
        updateConfig: updateApproveConfig,
        refetch: approveRefetch
    } = useTokenAllowance(chainId, accessTime);

    const [subscribeHash, setSubscribeHash] = useState<Hash>(zeroHash);
    const { data: subscribeReceipt, isSuccess: subscribeReceiptSuccess } = useTransactionReceipt({
        query: {
            enabled: subscribeHash != zeroHash ? true : false
        },
        hash: subscribeHash
    });

    const buttonText = config && config?.text ? config.text : "Subscribe";

    const isPackageExist = useMemo(() => {
        let isExist = false;
        if (
            packageId &&
            contractDetails.deployed &&
            contractDetails.packageModule &&
            contractAPIDetails &&
            contractAPIDetails.packages
        ) {
            isExist = contractAPIDetails.packages.indexOf(packageId) != -1 ? true : false;
        }
        return isExist;
    }, [contractAPIDetails, contractDetails.deployed, contractDetails.packageModule, packageId]);

    const { data: packageData, isSuccess: packageDataSuccess } = useReadContract({
        query: {
            enabled: isPackageExist
        },
        address: accessTime,
        abi: Contract.abis.accessTime,
        functionName: "packages",
        args: [packageId ? BigInt(packageId) : ZERO_AMOUNT],
        chainId
    });

    const multiplePaymentMethod = useMemo(() => {
        let isMultiple = false;
        if (contractDetails.deployed && contractAPIDetails && contractAPIDetails.paymentMethods) {
            isMultiple = contractAPIDetails.paymentMethods.length > 1 ? true : false;
        }
        return isMultiple;
    }, [contractAPIDetails, contractDetails]);

    const calls = useMemo(() => {
        if (
            !contractAPIDetails ||
            !contractAPIDetails.paymentMethods ||
            contractAPIDetails.paymentMethods.length == 0
        ) {
            return {
                tokenSymbols: [],
                tokenDecimals: []
            };
        }
        const symbolAbi = parseAbi(["function symbol() view returns (string)"]);
        const decimalsAbi = parseAbi(["function decimals() view returns (uint8)"]);
        return {
            tokenSymbols: contractAPIDetails.paymentMethods
                .filter((paymentMethod) => paymentMethod != zeroAddress)
                .map((paymentMethod) => ({
                    abi: symbolAbi,
                    address: getAddress(paymentMethod),
                    functionName: "symbol",
                    chainId
                })),
            tokenDecimals: contractAPIDetails.paymentMethods
                .filter((paymentMethod) => paymentMethod != zeroAddress)
                .map((paymentMethod) => ({
                    abi: decimalsAbi,
                    address: getAddress(paymentMethod),
                    functionName: "decimals",
                    chainId
                }))
        };
    }, [chainId, contractAPIDetails]);

    const {
        data: tokenSymbolData,
        isLoading: tokenSymbolDataLoading,
        isSuccess: tokenSymbolDataSuccess
    } = useReadContracts({
        query: {
            enabled: calls.tokenSymbols.length > 0
        },
        contracts: calls.tokenSymbols
    });

    const { data: tokenDecimalsData, isSuccess: tokenDecimalsDataSuccess } = useReadContracts({
        query: {
            enabled: calls.tokenDecimals.length > 0
        },
        contracts: calls.tokenDecimals
    });

    const paymentMethodOptions: { value: string; text: string; decimals: number }[] =
        useMemo(() => {
            if (
                !contractAPIDetails ||
                !contractAPIDetails.paymentMethods ||
                contractAPIDetails.paymentMethods.length == 0
            ) {
                return [];
            }
            let paymentMethodTokenIndex = 0;
            return contractAPIDetails.paymentMethods.map((paymentMethod) => {
                const tokenSymbol =
                    tokenSymbolDataSuccess &&
                    tokenSymbolData[paymentMethodTokenIndex]?.status == "success"
                        ? tokenSymbolData[paymentMethodTokenIndex]?.result
                        : "TKN";
                const tokenDecimals =
                    tokenDecimalsDataSuccess &&
                    tokenDecimalsData[paymentMethodTokenIndex]?.status == "success"
                        ? tokenDecimalsData[paymentMethodTokenIndex]?.result
                        : 18;
                const text =
                    paymentMethod == zeroAddress
                        ? getChainCurrencySymbol(chainId as SUPPORTED_CHAIN)
                        : tokenSymbol
                          ? tokenSymbol
                          : "-";
                const decimals =
                    paymentMethod == zeroAddress
                        ? getChainCurrencyDecimals(chainId as SUPPORTED_CHAIN)
                        : tokenDecimals
                          ? tokenDecimals
                          : 18;

                if (paymentMethod != zeroAddress) {
                    paymentMethodTokenIndex++;
                }
                return {
                    value: paymentMethod.toLowerCase(),
                    text,
                    decimals
                };
            });
        }, [
            contractAPIDetails,
            tokenSymbolDataSuccess,
            tokenSymbolData,
            tokenDecimalsDataSuccess,
            tokenDecimalsData,
            chainId
        ]);

    const paymentMethodsRateCalls = useMemo(() => {
        if (!paymentMethodOptions || paymentMethodOptions.length == 0) {
            return [];
        }
        const requiredAbi = [
            Contract.abis.accessTime.find(
                (abi) => abi.type == "function" && abi.name == "tokenRates"
            )
        ] as const;

        return paymentMethodOptions.map((paymentMethod) => ({
            abi: requiredAbi,
            address: accessTime,
            functionName: "tokenRates",
            args: [getAddress(paymentMethod.value)],
            chainId
        }));
    }, [paymentMethodOptions, accessTime, chainId]);

    const { data: paymentMethodRateData, isSuccess: paymentMethodRateDataSuccess } =
        useReadContracts({
            query: {
                enabled: paymentMethodsRateCalls.length > 0
            },
            contracts: paymentMethodsRateCalls
        });

    const paymetMethodTotalPayment = useMemo(() => {
        if (
            paymentMethodRateData &&
            paymentMethodRateDataSuccess &&
            paymentMethod != null &&
            paymentMethodOptions.length > 0
        ) {
            const paymentMethodIndex = paymentMethodOptions.findIndex(
                (paymentMethod_) =>
                    paymentMethod_.value.toLowerCase() == paymentMethod.toLowerCase()
            );

            if (paymentMethodIndex != -1) {
                const rateAsHour =
                    paymentMethodRateData[paymentMethodIndex].status == "success"
                        ? paymentMethodRateData[paymentMethodIndex].result
                        : ZERO_AMOUNT;
                const desiredTime = timeAmount != null ? timeAmount : ZERO_AMOUNT;

                if (rateAsHour != ZERO_AMOUNT && BigInt(desiredTime) != ZERO_AMOUNT) {
                    const desiredHours = (parseEther("1") * BigInt(desiredTime)) / BigInt("3600");

                    return {
                        amount: rateAsHour * desiredHours,
                        symbol: paymentMethodOptions[paymentMethodIndex].text,
                        decimals: paymentMethodOptions[paymentMethodIndex].decimals,
                        calculated: true
                    };
                }
            }
        }
        return {
            amount: ZERO_AMOUNT,
            symbol: "-",
            decimals: 18,
            calculated: false
        };
    }, [
        paymentMethodRateData,
        paymentMethodRateDataSuccess,
        paymentMethod,
        paymentMethodOptions,
        timeAmount
    ]);

    const requiredTotalPayment = useMemo(() => {
        return paymetMethodTotalPayment.amount / parseEther("1");
    }, [paymetMethodTotalPayment.amount]);

    const subscribeRouter = useCallback(async () => {
        if (
            timeAmount != null &&
            paymentMethod != null &&
            paymetMethodTotalPayment.amount > ZERO_AMOUNT &&
            paymetMethodTotalPayment.calculated == true
        ) {
            setSubscribeLoading(true);
            let transactionHash: Hash = zeroHash;
            try {
                if (packageId) {
                    transactionHash = await subscribePackage(
                        requiredTotalPayment,
                        getAddress(paymentMethod),
                        packageId
                    );
                } else {
                    transactionHash = await subscribe(
                        requiredTotalPayment,
                        getAddress(paymentMethod)
                    );
                }
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (_err) {
                setSubscribeLoading(false);
                throw new Error("Contract call failed!");
            }
            setSubscribeHash(transactionHash);
            if (transactionHash != zeroHash && onSubscription) {
                onSubscription(transactionHash);
            }
        } else {
            setSubscribeLoading(false);
            throw new Error("Requested time is invalid!");
        }
    }, [
        onSubscription,
        packageId,
        paymentMethod,
        paymetMethodTotalPayment.amount,
        paymetMethodTotalPayment.calculated,
        requiredTotalPayment,
        subscribe,
        subscribePackage,
        timeAmount
    ]);

    const paymentMethodExist = useMemo(() => {
        if (contractAPIDetails && contractAPIDetails.paymentMethods) {
            return contractAPIDetails.paymentMethods.length > 0 ? true : false;
        }
        return true; // due to loading
    }, [contractAPIDetails]);

    const timeAmountHumanized = useMemo(() => {
        if (timeAmount == null) {
            return "-";
        }
        const dateNow = DateTime.now();
        const datePlusExtraTime = DateTime.fromSeconds(dateNow.toSeconds() + timeAmount);

        return datePlusExtraTime.diff(dateNow).rescale().toHuman({ listStyle: "long" });
    }, [timeAmount]);

    useEffect(() => {
        if (paymentMethodOptions.length > 0 && paymentMethod == null) {
            setPaymentMethod(getAddress(paymentMethodOptions[0].value));
        }
    }, [paymentMethod, paymentMethodOptions]);

    useEffect(() => {
        if (!isNaN(Number(packageId))) {
            if (packageData && packageDataSuccess) {
                const packageTimeInSeconds = Number(packageData[0].toString());
                setTimeAmount(packageTimeInSeconds);
            }
        } else {
            setTimeAmount(3600);
        }
    }, [packageData, packageDataSuccess, packageId]);

    useEffect(() => {
        if (onTimeAmount) {
            onTimeAmount(timeAmount);
        }
    }, [onTimeAmount, timeAmount]);

    useEffect(() => {
        if (paymentMethod != null) {
            updateApproveConfig(paymentMethod, requiredTotalPayment);
        }
    }, [paymetMethodTotalPayment, paymentMethod, updateApproveConfig, requiredTotalPayment]);

    const refetch = useCallback(async () => {
        await approveRefetch();
        setSubscribeLoading(false);
        setSubscribeHash(zeroHash);
    }, [approveRefetch]);

    useEffect(() => {
        if (subscribeHash != zeroHash && subscribeReceipt && subscribeReceiptSuccess) {
            refetch();
        }
    }, [refetch, subscribeHash, subscribeReceipt, subscribeReceiptSuccess]);

    const resetCustomTime = useCallback(() => {
        if (typeof packageId == "undefined") {
            setCustomTimeToggle(false);
            setTimeAmount(3600);
        }
    }, [packageId]);

    const totalPaymentAmount = formatUnits(requiredTotalPayment, paymetMethodTotalPayment.decimals);
    const totalPaymentText =
        totalPaymentAmount.split(".").length == 1
            ? totalPaymentAmount
            : totalPaymentAmount.split(".")[0] +
              "." +
              (totalPaymentAmount.split(".")[1].length > 5
                  ? totalPaymentAmount.split(".")[1].slice(0, 4)
                  : totalPaymentAmount.split(".")[1]);

    return (
        <>
            {!walletConnectionDetails.isWalletConnected ? (
                <Button
                    className={className}
                    style={style}
                    w="full"
                    colorScheme="blue"
                    onClick={onConnectWallet}
                >
                    Connect Wallet
                </Button>
            ) : walletConnectionDetails.isSupportedChain == false ? (
                <Button className={className} style={style} w="full" colorScheme="gray">
                    Config is invalid!
                </Button>
            ) : walletConnectionDetails.isCorrectChainConnected == false ? (
                <Button
                    className={className}
                    style={style}
                    w="full"
                    colorScheme="yellow"
                    onClick={onSwitchNetwork}
                >
                    Switch Network
                </Button>
            ) : paymentMethodExist == false ? (
                <Button className={className} style={style} w="full" colorScheme="red" disabled>
                    Payment Method not found!
                </Button>
            ) : (
                <SimpleGrid columns={5} columnGap="2" w="full">
                    {contractDetails.packageModule == false && !customTimeToggle ? (
                        <GridItem mb={2} colSpan={5}>
                            <SimpleGrid columns={5} columnGap="2" w="full">
                                {Dashboard.fixedTimes.map((fixedTime, index) => (
                                    <GridItem onClick={() => setTimeAmount(fixedTime.value)}>
                                        <Tag
                                            key={`${accessTime}_${chainId}_fixedTime_${index}`}
                                            cursor={"pointer"}
                                            w={"full"}
                                            size={"sm"}
                                            variant={
                                                timeAmount == fixedTime.value ? "solid" : "outline"
                                            }
                                            className="pointer"
                                        >
                                            <Text w={"full"} textAlign={"center"}>
                                                {fixedTime.text}
                                            </Text>
                                        </Tag>
                                    </GridItem>
                                ))}
                                <GridItem colSpan={2} onClick={() => setCustomTimeToggle(true)}>
                                    <Tag
                                        key={`${accessTime}_${chainId}_fixedTime_custome`}
                                        cursor={"pointer"}
                                        w={"full"}
                                        size={"sm"}
                                        variant={"outline"}
                                        className="pointer"
                                    >
                                        <Text w={"full"} textAlign={"center"}>
                                            Custom
                                        </Text>
                                    </Tag>
                                </GridItem>
                            </SimpleGrid>
                        </GridItem>
                    ) : (
                        <GridItem mb={2} colSpan={5}>
                            <SimpleGrid columns={5} columnGap="2" w="full">
                                <GridItem colSpan={3}>
                                    {timeAmount != null && config?.showTimeInformation == true && (
                                        <Text fontSize="xs">
                                            Subscribe Time:
                                            <br /> {timeAmountHumanized}
                                        </Text>
                                    )}
                                </GridItem>
                                {contractDetails.packageModule == false && (
                                    <>
                                        <GridItem colSpan={2} w={"full"} alignContent={"center"}>
                                            <Tag
                                                key={`${accessTime}_${chainId}_fixedTime_custome`}
                                                cursor={"pointer"}
                                                w={"full"}
                                                size={"sm"}
                                                variant={"outline"}
                                                className="pointer"
                                            >
                                                <Text
                                                    w={"full"}
                                                    textAlign={"center"}
                                                    onClick={resetCustomTime}
                                                >
                                                    Reset
                                                </Text>
                                            </Tag>
                                        </GridItem>
                                        <GridItem colSpan={5}>
                                            <NumberInput
                                                min={1}
                                                max={9999999999}
                                                value={timeAmount == null ? 1 : timeAmount}
                                                onChange={(e) => {
                                                    !isNaN(Number(e)) &&
                                                        Number(e) < 9999999999 &&
                                                        setTimeAmount(Number(e));
                                                }}
                                            >
                                                <NumberInputField />
                                            </NumberInput>
                                        </GridItem>
                                    </>
                                )}
                            </SimpleGrid>
                        </GridItem>
                    )}
                    {multiplePaymentMethod &&
                        (tokenSymbolDataLoading ? (
                            <GridItem colSpan={2}>
                                <Skeleton height="100%" borderRadius="lg" />
                            </GridItem>
                        ) : (
                            paymentMethodOptions.length > 0 && (
                                <GridItem colSpan={2}>
                                    <Select
                                        fontSize="sm"
                                        variant="filled"
                                        borderRadius="lg"
                                        onChange={(e) => {
                                            setPaymentMethod(getAddress(e.currentTarget.value));
                                        }}
                                    >
                                        {paymentMethodOptions.map((paymentMethod, index) => (
                                            <option
                                                key={`paymentMethod-${accessTime}-${index}`}
                                                value={paymentMethod.value}
                                            >
                                                {paymentMethod.text}
                                            </option>
                                        ))}
                                    </Select>
                                </GridItem>
                            )
                        ))}
                    <GridItem colSpan={multiplePaymentMethod ? 3 : 5}>
                        <Button
                            className={className}
                            style={style}
                            w="full"
                            colorScheme={
                                error ? "red" : approveRequired.status == true ? "yellow" : "blue"
                            }
                            isLoading={loading || subscribeLoading || approveLoading}
                            disabled={loading || subscribeLoading || approveLoading || error}
                            onClick={approveRequired.status ? approve : subscribeRouter}
                        >
                            {error
                                ? "Error occurred!"
                                : approveRequired.status
                                  ? "Approve"
                                  : buttonText}
                        </Button>
                    </GridItem>
                    {paymentMethod != null && (
                        <GridItem colSpan={5}>
                            <Box position="relative">
                                <Divider mt={4} mb={2} />
                                <AbsoluteCenter>
                                    <Card px="4" whiteSpace="nowrap" boxShadow="none" fontSize="xs">
                                        <Skeleton
                                            isLoaded={paymetMethodTotalPayment.calculated}
                                            opacity="0.7"
                                        >
                                            Total Payment:{" "}
                                            {`${totalPaymentText} ${paymetMethodTotalPayment.symbol}`}
                                        </Skeleton>
                                    </Card>
                                </AbsoluteCenter>
                            </Box>
                        </GridItem>
                    )}
                </SimpleGrid>
            )}
        </>
    );
};
