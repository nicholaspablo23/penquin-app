"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

import "@solana/wallet-adapter-react-ui/styles.css";

function normalizeRpc(raw) {
const v = String(raw || "").trim();
if (!v) return "https://api.mainnet-beta.solana.com";
if (/^https?:\/\//i.test(v)) return v;
return `https://${v}`;
}

export default function SolanaProvidersClient({ children }) {
const endpoint = useMemo(() => {
const raw =
process.env.NEXT_PUBLIC_SOL_RPC ||
process.env.NEXT_PUBLIC_SOLANA_RPC ||
process.env.NEXT_PUBLIC_SOL_RPC_URL ||

"https://api.mainnet-beta.solana.com";

return normalizeRpc(raw);
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