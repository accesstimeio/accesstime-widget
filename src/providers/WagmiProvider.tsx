import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Config, WagmiProvider as Provider, State } from "wagmi";

const queryClient = new QueryClient();

export const WagmiProvider = ({
    children,
    wagmiConfig,
    wagmiState
}: {
    children: React.ReactNode,
    wagmiConfig: Config,
    wagmiState?: State
}) => {
    return (
        <Provider config={wagmiConfig} initialState={wagmiState}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </Provider>
    );
}