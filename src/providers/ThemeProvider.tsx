import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const theme = extendTheme({
        config: {
            cssVarPrefix: 'accesstime-widget-ck',
        },
    });

    return (
        <ChakraProvider disableGlobalStyle theme={theme}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </ChakraProvider>
    );
}
