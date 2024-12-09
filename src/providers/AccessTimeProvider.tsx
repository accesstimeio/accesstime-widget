import { Config, State } from "wagmi";
import { WagmiProvider } from "./WagmiProvider";
import { ThemeProvider } from "./ThemeProvider";
import { ColorMode } from "@chakra-ui/react";

export const AccessTimeProvider = ({
    children,
    wagmiConfig,
    wagmiState,
    colorMode
}: {
    children: React.ReactNode,
    wagmiConfig: Config,
    wagmiState?: State,
    colorMode?: ColorMode
}) => {
    return (
        <WagmiProvider wagmiConfig={wagmiConfig} wagmiState={wagmiState}>
            <ThemeProvider colorMode={colorMode}>
                {children}
            </ThemeProvider>
        </WagmiProvider>
    )
}