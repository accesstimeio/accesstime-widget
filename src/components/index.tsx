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
    subscriptionText,
    onSubscription,
    onTimeAmount,
    onConnectWallet,
    onSwitchNetwork,
    className,
    style,
}: SubscriptionButtonProps) => {
    return (
        <AccessTimeProvider wagmiConfig={wagmiConfig} wagmiState={wagmiState}>
            <Button
                chainId={chainId}
                accessTime={accessTime}
                packageId={packageId}
                subscriptionText={subscriptionText}
                onSubscription={onSubscription}
                onTimeAmount={onTimeAmount}
                onConnectWallet={onConnectWallet}
                onSwitchNetwork={onSwitchNetwork}
                className={className}
                style={style}
            />
        </AccessTimeProvider>
    )
}

export const SubscriptionCard = ({
    wagmiConfig,
    wagmiState,
    chainId,
    accessTime,
    cardBodyType,
    subscriptionText,
    packageId,
    children,
    backgroundImage,
    icon,
    styles,
    classNames,
    onSubscription,
    onConnectWallet,
    onSwitchNetwork,
}: SubscriptionCardProps) => {
    return (
        <AccessTimeProvider wagmiConfig={wagmiConfig} wagmiState={wagmiState}>
            <Card
                wagmiConfig={wagmiConfig}
                wagmiState={wagmiState}
                chainId={chainId}
                accessTime={accessTime}
                cardBodyType={cardBodyType}
                subscriptionText={subscriptionText}
                packageId={packageId}
                children={children}
                backgroundImage={backgroundImage}
                icon={icon}
                styles={styles}
                classNames={classNames}
                onSubscription={onSubscription}
                onConnectWallet={onConnectWallet}
                onSwitchNetwork={onSwitchNetwork}
            />
        </AccessTimeProvider>
    )
}
