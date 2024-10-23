import {
    AbsoluteCenter,
    Badge,
    Box,
    Card,
    CardBody,
    CardFooter,
    Divider,
    GridItem,
    Icon,
    Select,
    SimpleGrid,
    Skeleton,
} from "@chakra-ui/react"
import { ThemeProvider } from "../providers/ThemeProvider";
import { IconType } from "react-icons";
import { SubscriptionButton } from "./SubscriptionButton";
import { useEffect, useMemo, useState } from "react";
import { Address, formatEther, getAddress, Hash, parseAbi, zeroAddress } from "viem";
import { Config, useReadContract, useReadContracts, WagmiProvider } from "wagmi";
import { ACCESTIME_ABI, ZERO_AMOUNT } from "../config";
import { getChainCurrencyName, getChainName } from "../helpers";
import { useAccessTime } from "../hooks";
import { DateTime } from "luxon";

export interface SubscriptionCardProps {
    wagmiConfig: Config;
    chainId: number;
    accessTime: Address;
    cardBodyType: "backgroundImage" | "react-icons" | "child-component";
    subscriptionText?: string;
    packageId?: string;
    children?: React.ReactNode;
    backgroundImage?: string;
    icon?: IconType;
    style?: React.CSSProperties;
    className?: string;
    onSubscription?: (transactionHash: Hash) => void;
}
export const SubscriptionCard = ({
    wagmiConfig,
    chainId,
    accessTime,
    cardBodyType,
    subscriptionText,
    packageId,
    children,
    backgroundImage,
    icon,
    style,
    className,
    onSubscription
}: SubscriptionCardProps) => {
    const [paymentMethod, setPaymentMethod] = useState<Address | null>(null);
    const { contractDetails, contractAPIDetails } = useAccessTime(chainId, accessTime);

    const isPackageExist = useMemo(() => {
        let isExist = false;
        if (packageId && (contractDetails.deployed && contractDetails.packageModule) && (contractAPIDetails && contractAPIDetails.packages)) {
            isExist = contractAPIDetails.packages.indexOf(packageId) != -1 ? true : false;
        }
        return isExist;
    }, [contractAPIDetails, contractDetails]);

    const multiplePaymentMethod = useMemo(() => {
        let isMultiple = false;
        if (contractDetails.deployed && (contractAPIDetails && contractAPIDetails.paymentMethods)) {
            isMultiple = contractAPIDetails.paymentMethods.length > 0 ? true : false;
        }
        return isMultiple;
    }, [contractAPIDetails, contractDetails]);

    const {
        data: packageData,
        isLoading: packageDataLoading,
        isSuccess: packageDataSuccess,
    } = useReadContract({
        query: {
            enabled: isPackageExist
        },
        address: accessTime,
        abi: ACCESTIME_ABI,
        functionName: "packages",
        args: [packageId ? BigInt(packageId) : ZERO_AMOUNT],
        chainId
    })

    const packageTimeHumanized = useMemo(() => {
        if (packageData && packageDataSuccess) {
            const packageTimeInSeconds = Number(packageData[0].toString());

            const dateNow = DateTime.now();
            const datePlusPackageTime = DateTime.fromSeconds(dateNow.toSeconds() + packageTimeInSeconds);

            return datePlusPackageTime.diff(dateNow).rescale().toHuman({ listStyle: "long" });
        }
        return "-";
    }, [packageData, packageDataSuccess]);

    const tokenContracts = useMemo(() => {
        if (contractAPIDetails && contractAPIDetails.paymentMethods) {
            const tokenBasicABI = parseAbi(["function symbol() view returns (string)"]);
            return contractAPIDetails.paymentMethods.filter((paymentMethod) => paymentMethod != zeroAddress).map((paymentMethod) => {
                return {
                    abi: tokenBasicABI,
                    address: paymentMethod,
                    chainId
                }
            })
        }
        return [];
    }, [contractAPIDetails])

    const {
        data: tokenSymbolData,
        isLoading: tokenSymbolDataLoading,
        isSuccess: tokenSymbolDataSuccess
    } = useReadContracts({
        query: {
            enabled: tokenContracts.length > 0
        },
        contracts: tokenContracts.map((tokenContract) => {
            return {
                ...tokenContract,
                functionName: "symbol"
            }
        })
    })

    const paymentMethodOptions: { value: string, text: string }[] = useMemo(() => {
        if (contractAPIDetails && contractAPIDetails.paymentMethods) {
            let paymentMethodTokenIndex = 0;
            return contractAPIDetails.paymentMethods.map((paymentMethod) => {
                const tokenSymbol = (tokenSymbolDataSuccess && tokenSymbolData[paymentMethodTokenIndex].result == "success") ?
                    tokenSymbolData[paymentMethodTokenIndex].result : "TKN";
                const text = paymentMethod == zeroAddress ? getChainCurrencyName(chainId) : tokenSymbol ? tokenSymbol : "-";

                if (paymentMethod != zeroAddress) {
                    paymentMethodTokenIndex++;
                }
                return {
                    value: paymentMethod.toLowerCase(),
                    text
                }
            })
        }
        return [];
    }, [contractAPIDetails, tokenSymbolData, tokenSymbolDataSuccess]);

    const paymentMethodsRateCalls = useMemo(() => {
        if (paymentMethodOptions.length > 0) {
            return paymentMethodOptions.map((paymentMethod) => {
                return {
                    abi: ACCESTIME_ABI,
                    address: accessTime,
                    functionName: "tokenRates",
                    args: [getAddress(paymentMethod.value)],
                    chainId
                }
            })
        }
        return [];
    }, [paymentMethodOptions])

    const {
        data: paymentMethodRateData,
        isSuccess: paymentMethodRateDataSuccess
    } = useReadContracts({
        query: {
            enabled: paymentMethodsRateCalls.length > 0
        },
        contracts: paymentMethodsRateCalls
    })

    const paymetMethodTotalPayment = useMemo(() => {
        if (paymentMethodRateData && paymentMethodRateDataSuccess && paymentMethod != null && paymentMethodOptions.length > 0) {
            const paymentMethodIndex = paymentMethodOptions.findIndex((paymentMethod_) => paymentMethod_.value.toLowerCase() == paymentMethod.toLowerCase());

            if (paymentMethodIndex != -1) {
                const rateAsHour = paymentMethodRateData[paymentMethodIndex].status == "success" ? paymentMethodRateData[paymentMethodIndex].result : ZERO_AMOUNT;
                const packageTime = packageDataSuccess ? packageData[0] : ZERO_AMOUNT;

                if (rateAsHour != ZERO_AMOUNT && packageTime != ZERO_AMOUNT) {
                    const desiredHours = packageTime / BigInt("3600");

                    return {
                        amount: rateAsHour * desiredHours,
                        symbol: paymentMethodOptions[paymentMethodIndex].text
                    }
                }
            }
        }
        return {
            amount: ZERO_AMOUNT,
            symbol: "-"
        };
    }, [paymentMethodRateData, paymentMethodRateDataSuccess, paymentMethod, packageDataSuccess, packageData, paymentMethodOptions]);

    useEffect(() => {
        if (paymentMethodOptions.length > 0 && paymentMethod == null) {
            setPaymentMethod(getAddress(paymentMethodOptions[0].value));
        }
    }, [paymentMethodOptions]);

    return (
        <WagmiProvider config={wagmiConfig}>
            <ThemeProvider>
                <Card borderRadius="lg" w={270} m={10}>
                    <CardBody borderTopRadius="lg" backgroundPosition="center" backgroundImage={cardBodyType == "backgroundImage" ? backgroundImage : undefined}>
                        <Box display="flex" flexDirection="column" position="absolute" top="3" left="3">
                            {
                                packageId && isPackageExist &&
                                    packageDataLoading ? (
                                    <Skeleton borderRadius="lg" mb="1" height="18px" width="115px" />
                                ) :
                                    packageDataSuccess && (
                                        <Badge colorScheme="green" width="fit-content" borderRadius="lg" textTransform="unset" mb="1">
                                            Package: {packageTimeHumanized}
                                        </Badge>
                                    )
                            }
                            <Badge display="flex" alignItems="center" colorScheme="gray" width="fit-content" fontSize="10" borderRadius="lg" textTransform="unset">
                                {getChainName(chainId)}
                            </Badge>
                        </Box>
                        <Box position="relative" minH={180} w="full">
                            <AbsoluteCenter className={className} style={style}>
                                {
                                    cardBodyType == "child-component" ?
                                        children :
                                        cardBodyType == "react-icons" && <Icon as={icon} boxSize={24} />
                                }
                            </AbsoluteCenter>
                        </Box>
                    </CardBody>
                    <CardFooter>
                        <SimpleGrid columns={5} columnGap="2" w="full">
                            {
                                multiplePaymentMethod &&
                                (tokenSymbolDataLoading ? (
                                    <GridItem colSpan={2}><Skeleton height="100%" borderRadius="lg" /></GridItem>
                                ) :
                                    paymentMethodOptions.length > 0 && (
                                        <GridItem colSpan={2}>
                                            <Select fontSize="sm" variant="filled" borderRadius="lg" onChange={(e) => { setPaymentMethod(getAddress(e.currentTarget.value)) }}>
                                                {
                                                    paymentMethodOptions.map((paymentMethod, index) => <option key={`paymentMethod-${accessTime}-${index}`} value={paymentMethod.value}>{paymentMethod.text}</option>)
                                                }
                                            </Select>
                                        </GridItem>
                                    ))
                            }
                            <GridItem colSpan={multiplePaymentMethod ? 3 : 5}>
                                <SubscriptionButton
                                    wagmiConfig={wagmiConfig}
                                    accessTime={accessTime}
                                    chainId={chainId}
                                    paymentMethod={paymentMethod ? paymentMethod : zeroAddress}
                                    subscriptionText={subscriptionText}
                                    packageId={packageId}
                                    onSubscription={onSubscription}
                                />
                            </GridItem>
                            {
                                paymentMethod != null && (
                                    <GridItem colSpan={5}>
                                        <Box position="relative" fontSize="xs" color="blackAlpha.700">
                                            <Divider mt={4} mb={2} />
                                            <AbsoluteCenter bg='white' px='4' whiteSpace="nowrap">
                                                <Skeleton isLoaded={paymetMethodTotalPayment.amount != ZERO_AMOUNT ? true : false}>
                                                    Total Payment: {`${formatEther(paymetMethodTotalPayment.amount)} ${paymetMethodTotalPayment.symbol}`}
                                                </Skeleton>
                                            </AbsoluteCenter>
                                        </Box>
                                    </GridItem>
                                )
                            }
                        </SimpleGrid>
                    </CardFooter>
                </Card>
            </ThemeProvider>
        </WagmiProvider>
    );
}
