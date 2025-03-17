"use client";
import { Config, State } from "wagmi";
import { WagmiProvider } from "./WagmiProvider";
import { ThemeProvider } from "./ThemeProvider";
import { ColorMode } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export const AccessTimeProvider = ({
    children,
    wagmiConfig,
    wagmiState,
    colorMode
}: {
    children: React.ReactNode;
    wagmiConfig: Config;
    wagmiState?: State;
    colorMode?: ColorMode;
}) => {
    const [cachedColorMode, setCachedColorMode] = useState<ColorMode>("light");

    useEffect(() => {
        if (colorMode) {
            setCachedColorMode(colorMode);
        }
    }, [colorMode]);

    return (
        <WagmiProvider wagmiConfig={wagmiConfig} wagmiState={wagmiState}>
            <ThemeProvider colorMode={cachedColorMode}>{children}</ThemeProvider>
        </WagmiProvider>
    );
};
