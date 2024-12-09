import { Config, State } from "wagmi";
import { ColorMode } from "@chakra-ui/react";

import {
    SubscriptionButton as Button,
    SubscriptionButtonProps as ButtonProps
} from "./SubscriptionButton"
import {
    SubscriptionCard as Card,
    SubscriptionCardProps as CardProps
} from "./SubscriptionCard"
import { AccessTimeProvider } from "../providers/AccessTimeProvider";

interface SubscriptionButtonProps extends ButtonProps {
    wagmiConfig: Config;
    wagmiState?: State;
    colorMode?: ColorMode;
}
export const SubscriptionButton = ({
    wagmiConfig,
    wagmiState,
    colorMode,
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
    return (
        <AccessTimeProvider wagmiConfig={wagmiConfig} wagmiState={wagmiState} colorMode={colorMode}>
            <Button
                chainId={chainId}
                accessTime={accessTime}
                packageId={packageId}
                config={config}
                className={className}
                style={style}
                onSubscription={onSubscription}
                onTimeAmount={onTimeAmount}
                onConnectWallet={onConnectWallet}
                onSwitchNetwork={onSwitchNetwork}
            />
        </AccessTimeProvider>
    )
}

interface SubscriptionCardProps extends CardProps {
    colorMode?: ColorMode;
}
export const SubscriptionCard = ({
    wagmiConfig,
    wagmiState,
    colorMode,
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
    return (
        <AccessTimeProvider wagmiConfig={wagmiConfig} wagmiState={wagmiState} colorMode={colorMode}>
            <Card
                wagmiConfig={wagmiConfig}
                wagmiState={wagmiState}
                chainId={chainId}
                accessTime={accessTime}
                packageId={packageId}
                config={config}
                classNames={classNames}
                styles={styles}
                children={children}
                onSubscription={onSubscription}
                onConnectWallet={onConnectWallet}
                onSwitchNetwork={onSwitchNetwork}
            />
        </AccessTimeProvider>
    )
}
