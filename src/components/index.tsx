import { Config, State } from "wagmi";
import {
    SubscriptionButton as Button,
    SubscriptionButtonProps as ButtonProps
} from "./SubscriptionButton"
import {
    SubscriptionCard as Card,
    SubscriptionCardProps
} from "./SubscriptionCard"
import { AccessTimeProvider } from "../providers/AccessTimeProvider";

interface SubscriptionButtonProps extends ButtonProps {
    wagmiConfig: Config;
    wagmiState?: State;
}
export const SubscriptionButton = ({
    wagmiConfig,
    wagmiState,
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
        <AccessTimeProvider wagmiConfig={wagmiConfig} wagmiState={wagmiState}>
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

export const SubscriptionCard = ({
    wagmiConfig,
    wagmiState,
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
        <AccessTimeProvider wagmiConfig={wagmiConfig} wagmiState={wagmiState}>
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
