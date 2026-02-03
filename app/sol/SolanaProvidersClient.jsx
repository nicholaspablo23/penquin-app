"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
PhantomWalletAdapter,
SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

import "@solana/wallet-adapter-react-ui/styles.css";

function normalizeEndpoint(raw) {
const fallback = "https://mainnet.helius-rpc.com/?api-key=96e972be-5199-4e72-a27c-44fc904f0ced";
const v = (raw || "").trim();

if (!v) return fallback;
if (v.startsWith("http://") || v.startsWith("https://")) return v;

// If someone pasted without protocol, fix it safely:
return `https://${v.replace(/^\/+/, "")}`;
}

export default function SolanaProvidersClient({ children }) {
const endpoint = useMemo(() => {
return normalizeEndpoint(process.env.NEXT_PUBLIC_SOL_RPC);
}, []);

const wallets = useMemo(
() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
[]
);

return (
<ConnectionProvider endpoint={endpoint}>
<WalletProvider wallets={wallets} autoConnect>
<WalletModalProvider>{children}</WalletModalProvider>
</WalletProvider>
</ConnectionProvider>
);
}