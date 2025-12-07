"use client";

import "@rainbow-me/rainbowkit/styles.css";
import {
getDefaultConfig,
RainbowKitProvider,
darkTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiConfig } from "wagmi";
import { mainnet, bsc } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Wagmi + RainbowKit config (mainnet + BSC)
export const wagmiConfig = getDefaultConfig({
appName: "PENQUIN Dashboard",
projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID ?? "test",
chains: [mainnet, bsc],
ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }) {
return (
<WagmiConfig config={wagmiConfig}>
<QueryClientProvider client={queryClient}>
<RainbowKitProvider
theme={darkTheme({
accentColor: "#facc15", // amber
accentColorForeground: "#020617", // near-black
borderRadius: "large",
})}
>
{children}
</RainbowKitProvider>
</QueryClientProvider>
</WagmiConfig>
);
}

export default Providers;