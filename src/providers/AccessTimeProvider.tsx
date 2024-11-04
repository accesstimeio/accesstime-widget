import { Config, State } from "wagmi";
import { WagmiProvider } from "./WagmiProvider";
import { ThemeProvider } from "./ThemeProvider";

export const AccessTimeProvider = ({
    children,
    wagmiConfig,
    wagmiState
}: {
    children: React.ReactNode,
    wagmiConfig: Config,
    wagmiState?: State
}) => {
    return (
        <WagmiProvider wagmiConfig={wagmiConfig} wagmiState={wagmiState}>
            <ThemeProvider>
                {children}
            </ThemeProvider>
        </WagmiProvider>
    )
}