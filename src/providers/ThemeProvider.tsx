"use client";
import { ChakraProvider, ColorMode, ColorModeProvider, extendTheme } from "@chakra-ui/react";

export const ThemeProvider = ({
    children,
    colorMode
}: {
    children: React.ReactNode;
    colorMode?: ColorMode;
}) => {
    const theme = extendTheme({
        config: {
            cssVarPrefix: "accesstime-widget-ck"
        }
    });

    return (
        <ChakraProvider disableGlobalStyle theme={theme}>
            <ColorModeProvider value={colorMode}>{children}</ColorModeProvider>
        </ChakraProvider>
    );
};
