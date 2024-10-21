import { Button } from "@chakra-ui/react"
import { ThemeProvider } from "../providers/ThemeProvider"
import { isSupportedChainId } from "../helpers";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";

export interface SubscriptionButtonProps {
    chainId: number;
    subscriptionText?: string;
}
export const SubscriptionButton = ({
    chainId,
    subscriptionText
}: SubscriptionButtonProps) => {
    const { isConnected, address, chain } = useAccount();
    const { open } = useAppKit();

    const isSupportedChain = isSupportedChainId(chainId);
    const isWalletConnected = (isConnected && address) ? true : false;
    const isCorrectChainConnected = (chain?.id == chainId) ? true : false;
    const buttonText = subscriptionText ? subscriptionText : "Subscribe";

    return (
        <ThemeProvider>
            {
                !isWalletConnected ? 
                    <Button w="full" colorScheme="blue" onClick={() => {open();}}>Connect Wallet</Button>
                : 
                isSupportedChain == false ?
                    <Button w="full" colorScheme="gray">Config is invalid!</Button>
                :
                isCorrectChainConnected == false ?
                    <Button w="full" colorScheme="yellow" onClick={() => {open({view: "Networks"});}}>Switch Network</Button>
                :
                    <Button w="full" colorScheme="blue">{buttonText}</Button>
            }
        </ThemeProvider>
    );
}
