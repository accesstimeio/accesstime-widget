import { Button } from "@chakra-ui/react"
import { ThemeProvider } from "../providers/ThemeProvider"
import { useAccessTime } from "../hooks";
import { Address } from "viem";
import { Config, WagmiProvider } from "wagmi";

export interface SubscriptionButtonProps {
    wagmiConfig: Config;
    chainId: number;
    accessTime: Address;
    paymentMethod: Address;
    packageId?: string;
    subscriptionText?: string;
}
export const SubscriptionButton = ({
    wagmiConfig,
    chainId,
    accessTime,
    paymentMethod,
    packageId,
    subscriptionText
}: SubscriptionButtonProps) => {
    const { walletConnectionDetails, subscribe, subscribePackage, loading, error } = useAccessTime(chainId, accessTime);

    const buttonText = subscriptionText ? subscriptionText : "Subscribe";

    const subscribeRouter = async () => {
        if (packageId) {
            await subscribePackage(BigInt("0"), paymentMethod, packageId);
        } else {
            await subscribe(BigInt("0"), paymentMethod);
        }
    }

    return (
        <WagmiProvider config={wagmiConfig}>
            <ThemeProvider>
                {
                    !walletConnectionDetails.isWalletConnected ?
                        <Button w="full" colorScheme="blue">Connect Wallet</Button>
                        :
                        walletConnectionDetails.isSupportedChain == false ?
                            <Button w="full" colorScheme="gray">Config is invalid!</Button>
                            :
                            walletConnectionDetails.isCorrectChainConnected == false ?
                                <Button w="full" colorScheme="yellow">Switch Network</Button>
                                :
                                <Button w="full" colorScheme={error ? "red" : "blue"} isLoading={loading} disabled={loading || error} onClick={subscribeRouter}>
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
