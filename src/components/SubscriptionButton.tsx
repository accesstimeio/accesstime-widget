import { Button } from "@chakra-ui/react"
import { ThemeProvider } from "../providers/ThemeProvider"
import { useAppKit } from "@reown/appkit/react";
import { useAccessTime } from "../hooks";
import { Address } from "viem";

export interface SubscriptionButtonProps {
    chainId: number;
    accessTime: Address;
    paymentMethod: Address;
    packageId?: string;
    subscriptionText?: string;
}
export const SubscriptionButton = ({
    chainId,
    accessTime,
    paymentMethod,
    packageId,
    subscriptionText
}: SubscriptionButtonProps) => {
    const { open } = useAppKit();
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
        <ThemeProvider>
            {
                !walletConnectionDetails.isWalletConnected ?
                    <Button w="full" colorScheme="blue" onClick={() => { open(); }}>Connect Wallet</Button>
                    :
                    walletConnectionDetails.isSupportedChain == false ?
                        <Button w="full" colorScheme="gray">Config is invalid!</Button>
                        :
                        walletConnectionDetails.isCorrectChainConnected == false ?
                            <Button w="full" colorScheme="yellow" onClick={() => { open({ view: "Networks" }); }}>Switch Network</Button>
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
    );
}
