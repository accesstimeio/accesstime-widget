import { ChakraProvider, extendTheme } from "@chakra-ui/react";

export const ThemeProvider = ({children}: {children: React.ReactNode}) => {
    const theme = extendTheme({
        config: {
            cssVarPrefix: 'accesstime-widget-ck',
        },
    });
    
    return (
        <ChakraProvider disableGlobalStyle theme={theme}>
            {children}
        </ChakraProvider>
    );
}
