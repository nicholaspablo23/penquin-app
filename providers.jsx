import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

const { chains, publicClient } = configureChains(
[mainnet],
[
jsonRpcProvider({
rpc: (chain) => {
if (chain.id !== mainnet.id) return null;
return {
http: process.env.NEXT_PUBLIC_RPC_URL,
};
},
}),
publicProvider(),
]
);

const { connectors } = getDefaultWallets({
appName: "PENQUIN Dashboard",
projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID,
chains,
});

const wagmiConfig = createConfig({
autoConnect: true,
connectors,
publicClient,
});

export function Providers({ children }) {
return (
<WagmiConfig config={wagmiConfig}>
<RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
</WagmiConfig>
);
}