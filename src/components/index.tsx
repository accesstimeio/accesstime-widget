import {
    SubscriptionButton as Button,
    SubscriptionButtonProps as ButtonProps
} from "./SubscriptionButton";
import { SubscriptionCard as Card, SubscriptionCardProps as CardProps } from "./SubscriptionCard";

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
}: ButtonProps) => {
    return (
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
    );
};

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
}: CardProps) => {
    return (
        <Card
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
    );
};
