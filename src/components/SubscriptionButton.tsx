import { Button } from "@chakra-ui/react"
import { ThemeProvider } from "../providers/ThemeProvider"
import { useAccessTime } from "../hooks";
import { Address, Hash, zeroHash } from "viem";
import { Config, WagmiProvider } from "wagmi";
import { useMemo } from "react";

export interface SubscriptionButtonProps {
    wagmiConfig: Config;
    chainId: number;
    accessTime: Address;
    paymentMethod: Address;
    packageId?: string;
    subscriptionText?: string;
    onSubscription?: (transactionHash: Hash) => void;
    className?: string;
    style?: React.CSSProperties;
}
export const SubscriptionButton = ({
    wagmiConfig,
    chainId,
    accessTime,
    paymentMethod,
    packageId,
    subscriptionText,
    onSubscription,
    className,
    style
}: SubscriptionButtonProps) => {
    const { walletConnectionDetails, subscribe, subscribePackage, contractAPIDetails, loading, error } = useAccessTime(chainId, accessTime);

    const buttonText = subscriptionText ? subscriptionText : "Subscribe";

    const subscribeRouter = async () => {
        let transactionHash: Hash = zeroHash;
        if (packageId) {
            transactionHash = await subscribePackage(BigInt("0"), paymentMethod, packageId);
        } else {
            transactionHash = await subscribe(BigInt("0"), paymentMethod);
        }
        if (transactionHash != zeroHash) {
            onSubscription && onSubscription(transactionHash);
        }
    }

    const paymentMethodExist = useMemo(() => {
        if (contractAPIDetails && contractAPIDetails.paymentMethods) {
            return contractAPIDetails.paymentMethods.length > 0 ? true : false;
        }
        return true; // due to loading
    }, [contractAPIDetails]);

    return (
        <WagmiProvider config={wagmiConfig}>
            <ThemeProvider>
                {
                    !walletConnectionDetails.isWalletConnected ?
                        <Button className={className} style={style} w="full" colorScheme="blue">Connect Wallet</Button>
                        :
                        walletConnectionDetails.isSupportedChain == false ?
                            <Button className={className} style={style} w="full" colorScheme="gray">Config is invalid!</Button>
                            :
                            walletConnectionDetails.isCorrectChainConnected == false ?
                                <Button className={className} style={style} w="full" colorScheme="yellow">Switch Network</Button>
                                :
                                paymentMethodExist == false ?
                                    <Button className={className} style={style} w="full" colorScheme="red" disabled>Payment Method not found!</Button>
                                    :
                                    <Button className={className} style={style} w="full" colorScheme={error ? "red" : "blue"} isLoading={loading} disabled={loading || error} onClick={subscribeRouter}>
                                        {
                                            error ?
                                                "Error occurred!"
                                                :
                                                buttonText
                                        }
                                    </Button>
                }
            </ThemeProvider>
        </WagmiProvider>
    );
}
