"use client";

import "@rainbow-me/rainbowkit/styles.css";
import {
RainbowKitProvider,
darkTheme,
getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const config = getDefaultConfig({
appName: "PENQUIN dApp",
projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID ?? "",
chains: [mainnet],
transports: {
[mainnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL ?? ""),
},
});

const queryClient = new QueryClient();

export function Providers({ children }) {
return (
<WagmiProvider config={config}>
<QueryClientProvider client={queryClient}>
<RainbowKitProvider theme={darkTheme()}>
{children}
</RainbowKitProvider>
</QueryClientProvider>
</WagmiProvider>
);
}