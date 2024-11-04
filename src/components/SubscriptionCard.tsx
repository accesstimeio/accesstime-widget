import {
    AbsoluteCenter,
    Badge,
    Box,
    Card,
    CardBody,
    CardFooter,
    Icon,
    Skeleton,
} from "@chakra-ui/react"
import { ThemeProvider } from "../providers/ThemeProvider";
import { IconType } from "react-icons";
import { SubscriptionButton } from "./SubscriptionButton";
import { useMemo, useState } from "react";
import { Address, Hash } from "viem";
import { Config, useReadContract, useReadContracts, WagmiProvider } from "wagmi";
import { ACCESTIME_ABI, ZERO_AMOUNT } from "../config";
import { getChainName } from "../helpers";
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
    onConnectWallet?: () => void;
    onSwitchNetwork?: () => void;
    buttonClassName?: string;
    buttonStyle?: React.CSSProperties;
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
    onSubscription,
    onConnectWallet,
    onSwitchNetwork,
    buttonClassName,
    buttonStyle
}: SubscriptionCardProps) => {
    const { contractDetails, contractAPIDetails } = useAccessTime(chainId, accessTime);
    const [timeAmount, setTimeAmount] = useState<number | null>(null);

    const isPackageExist = useMemo(() => {
        let isExist = false;
        if (
            packageId &&
            (contractDetails.deployed && contractDetails.packageModule) &&
            (contractAPIDetails && contractAPIDetails.packages)
        ) {
            isExist = contractAPIDetails.packages.indexOf(packageId) != -1 ? true : false;
        }
        return isExist;
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
            setTimeAmount(packageTimeInSeconds);

            return datePlusPackageTime.diff(dateNow).rescale().toHuman({ listStyle: "long" });
        }
        return "-";
    }, [packageData, packageDataSuccess]);

    const extraTimeIds = useMemo(() => {
        if (contractAPIDetails && contractAPIDetails.extraTimes) {
            return contractAPIDetails.extraTimes.map((extraTime) => {
                return {
                    abi: ACCESTIME_ABI,
                    address: accessTime,
                    functionName: "extras",
                    args: [BigInt(extraTime)],
                    chainId
                }
            })
        }
        return [];
    }, [contractAPIDetails])

    const {
        data: extraTimeData,
        isLoading: extraTimeDataLoading,
        isSuccess: extraTimeDataSuccess
    } = useReadContracts({
        query: {
            enabled: extraTimeIds.length > 0 ? true : false
        },
        contracts: extraTimeIds
    })

    const availableExtraTime: number | null = useMemo(() => {
        if (extraTimeData && extraTimeDataSuccess && timeAmount != null) {
            let foundExtraTime: number = 0;

            for (let i = 0; i < extraTimeData.length; i++) {
                const extraTime = extraTimeData[i];
                if (extraTime.status == "success") {
                    const [limit, percent, available] = extraTime.result as unknown as [bigint, bigint, boolean];
                    const limit_ = Number(limit.toString());
                    const percent_ = Number(percent.toString());

                    const calculatedExtraTime = (timeAmount / 100) * percent_;
                    if (available && timeAmount >= limit_ && calculatedExtraTime >= foundExtraTime) {
                        foundExtraTime = calculatedExtraTime;
                    }
                }
            }

            if (foundExtraTime == 0) {
                return null;
            }

            return foundExtraTime;
        }

        return null;
    }, [extraTimeData, extraTimeDataSuccess, timeAmount]);

    const extraTimeHumanized = useMemo(() => {
        if (availableExtraTime != null) {
            const dateNow = DateTime.now();
            const datePlusExtraTime = DateTime.fromSeconds(dateNow.toSeconds() + availableExtraTime);

            return datePlusExtraTime.diff(dateNow).rescale().toHuman({ listStyle: "long" });
        }
        return "-";
    }, [availableExtraTime]);

    return (
        <WagmiProvider config={wagmiConfig}>
            <ThemeProvider>
                <Card borderRadius="lg" w={270} m={10}>
                    <CardBody
                        borderTopRadius="lg"
                        backgroundPosition="center"
                        backgroundImage={cardBodyType == "backgroundImage" ? backgroundImage : undefined}
                    >
                        <Box display="flex" flexDirection="column" position="absolute" top="3" left="3">
                            {
                                packageId && isPackageExist &&
                                    packageDataLoading ? (
                                    <Skeleton borderRadius="lg" mb="1" height="18px" width="115px" />
                                ) :
                                    packageDataSuccess && (
                                        <Badge
                                            colorScheme="green"
                                            width="fit-content"
                                            borderRadius="lg"
                                            textTransform="unset"
                                            mb="1"
                                        >
                                            Package: {packageTimeHumanized}
                                        </Badge>
                                    )
                            }
                            {
                                extraTimeDataLoading ? (
                                    <Skeleton borderRadius="lg" mb="1" height="18px" width="85px" />
                                ) : availableExtraTime != null && (
                                    <Badge
                                        colorScheme="purple"
                                        width="fit-content"
                                        borderRadius="lg"
                                        textTransform="unset"
                                        mb="1"
                                    >
                                        ExtraTime: {extraTimeHumanized}
                                    </Badge>
                                )
                            }
                            <Badge
                                display="flex"
                                alignItems="center"
                                colorScheme="gray"
                                width="fit-content"
                                fontSize="10"
                                borderRadius="lg"
                                textTransform="unset"
                            >
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
                        <SubscriptionButton
                            wagmiConfig={wagmiConfig}
                            accessTime={accessTime}
                            chainId={chainId}
                            subscriptionText={subscriptionText}
                            packageId={packageId}
                            onSubscription={onSubscription}
                            onTimeAmount={(_timeAmount) => {
                                setTimeAmount(_timeAmount);
                            }}
                            onConnectWallet={onConnectWallet}
                            onSwitchNetwork={onSwitchNetwork}
                            className={buttonClassName}
                            style={buttonStyle}
                        />
                    </CardFooter>
                </Card>
            </ThemeProvider>
        </WagmiProvider>
    );
}
