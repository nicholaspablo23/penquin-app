"use client";

import "@rainbow-me/rainbowkit/styles.css";
import {
RainbowKitProvider,
getDefaultConfig,
darkTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, http } from "wagmi";
import { bsc } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;

if (!projectId) {
console.warn("Missing NEXT_PUBLIC_WC_PROJECT_ID in .env.local");
}

const config = getDefaultConfig({
appName: "PENQUIN Dashboard",
projectId,
chains: [bsc],
transports: {
[bsc.id]: http("https://bsc-dataseed.binance.org"),
},
ssr: true, // ✅ IMPORTANT
});

const queryClient = new QueryClient();

export function Providers({ children }) {
return (
<WagmiProvider config={config}>
<QueryClientProvider client={queryClient}>
<RainbowKitProvider
modalSize="compact"
theme={darkTheme({
accentColor: "#facc15",
accentColorForeground: "#020617",
borderRadius: "large",
})}
>
{children}
</RainbowKitProvider>
</QueryClientProvider>
</WagmiProvider>
);
}