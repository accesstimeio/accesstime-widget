// @ts-nocheck: added due to deep and possibly infinite on useReadContracts calls
"use client";
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
import { IconType } from "react-icons";
import { useMemo, useState } from "react";
import { Address, Hash } from "viem";
import { useReadContract, useReadContracts } from "wagmi";
import { DateTime } from "luxon";
import { Contract, getChainName } from "@accesstimeio/accesstime-common";

import { SubscriptionButton, ButtonConfig } from "./SubscriptionButton";

import { ZERO_AMOUNT } from "../config";
import { useAccessTime } from "../hooks";

interface BoxConfig {
    type: "backgroundImage" | "react-icons" | "child-component";
    backgroundImage?: string;
    icon?: IconType;
};

export interface SubscriptionCardProps {
    chainId: number;
    accessTime: Address;
    packageId?: string;
    config: {
        box: BoxConfig;
        button?: ButtonConfig;
    };
    classNames?: {
        card?: string;
        cardBody?: string;
        cardFooter?: string;
        cardBox?: string;
        button?: string;
    };
    styles?: {
        card?: React.CSSProperties;
        cardBody?: React.CSSProperties;
        cardFooter?: React.CSSProperties;
        cardBox?: React.CSSProperties;
        button?: React.CSSProperties;
    };
    children?: React.ReactNode;
    onSubscription?: (transactionHash: Hash) => void;
    onConnectWallet?: () => void;
    onSwitchNetwork?: () => void;
}
export const SubscriptionCard = ({
    chainId,
    accessTime,
    packageId,
    config,
    classNames,
    styles,
    children,
    onSubscription,
    onConnectWallet,
    onSwitchNetwork
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
        abi: Contract.abis.accessTime,
        functionName: "packages",
        args: [packageId ? BigInt(packageId) : ZERO_AMOUNT],
        chainId
    })

    const packageTimeHumanized = useMemo(() => {
        if (!packageData || !packageDataSuccess) {
            return "-";
        }
        const packageTimeInSeconds = Number(packageData[0].toString());

        const dateNow = DateTime.now();
        const datePlusPackageTime = DateTime.fromSeconds(dateNow.toSeconds() + packageTimeInSeconds);
        setTimeAmount(packageTimeInSeconds);

        return datePlusPackageTime.diff(dateNow).rescale().toHuman({ listStyle: "long" });
    }, [packageData, packageDataSuccess]);

    const extraTimeCalls = useMemo(() => {
        if (!contractAPIDetails || !contractAPIDetails.extraTimes || contractAPIDetails.extraTimes.length == 0) {
            return [];
        }
        const requiredAbi = [Contract.abis.accessTime.find((abi) => abi.type == "function" && abi.name == "extras")] as const;

        return contractAPIDetails.extraTimes.map((extraTime) => ({
            abi: requiredAbi,
            address: accessTime,
            functionName: "extras",
            args: [BigInt(extraTime)],
            chainId
        }))
    }, [contractAPIDetails])

    const {
        data: extraTimeData,
        isLoading: extraTimeDataLoading,
        isSuccess: extraTimeDataSuccess
    } = useReadContracts({
        query: {
            enabled: extraTimeCalls.length > 0
        },
        contracts: extraTimeCalls
    })

    const availableExtraTime: number | null = useMemo(() => {
        if (!extraTimeData || !extraTimeDataSuccess || timeAmount == null) {
            return null;
        }
        let foundExtraTime: number = 0;

        for (let i = 0; i < extraTimeData.length; i++) {
            const extraTime = extraTimeData[i];
            if (extraTime.status == "success") {
                const [limit, percent, available] = extraTime.result;
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
    }, [extraTimeData, extraTimeDataSuccess, timeAmount]);

    const extraTimeHumanized = useMemo(() => {
        if (availableExtraTime == null) {
            return "-";
        }
        const dateNow = DateTime.now();
        const datePlusExtraTime = DateTime.fromSeconds(dateNow.toSeconds() + availableExtraTime);

        return datePlusExtraTime.diff(dateNow).rescale().toHuman({ listStyle: "long" });
    }, [availableExtraTime]);

    return (
        <>
            <Card className={classNames?.card} style={styles?.card} borderRadius="lg" w={270}>
                <CardBody
                    className={classNames?.cardBody}
                    style={styles?.cardBody}
                    borderTopRadius="lg"
                    backgroundPosition="center"
                    backgroundImage={config.box.type == "backgroundImage" ? config.box.backgroundImage : undefined}
                >
                    <Box zIndex={1} display="flex" flexDirection="column" position="absolute" top="3" left="3" mr={3}>
                        {
                            packageId && isPackageExist &&
                                packageDataLoading ? (
                                <Skeleton borderRadius="lg" mb="1" height="18px" width="115px" />
                            ) :
                                packageDataSuccess && (
                                    <Badge
                                        whiteSpace="normal"
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
                                    whiteSpace="normal"
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
                        <AbsoluteCenter className={classNames?.cardBox} style={styles?.cardBox}>
                            {
                                config.box.type == "child-component" ?
                                    children :
                                    config.box.type == "react-icons" && <Icon as={config.box.icon} boxSize={24} />
                            }
                        </AbsoluteCenter>
                    </Box>
                </CardBody>
                <CardFooter className={classNames?.cardFooter} style={styles?.cardFooter}>
                    <SubscriptionButton
                        accessTime={accessTime}
                        chainId={chainId}
                        packageId={packageId}
                        config={config.button}
                        className={classNames?.button}
                        style={styles?.button}
                        onSubscription={onSubscription}
                        onTimeAmount={(_timeAmount) => {
                            setTimeAmount(_timeAmount);
                        }}
                        onConnectWallet={onConnectWallet}
                        onSwitchNetwork={onSwitchNetwork}
                    />
                </CardFooter>
            </Card>
        </>
    );
}
