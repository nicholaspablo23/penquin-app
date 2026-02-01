"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
PhantomWalletAdapter,
SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

import "@solana/wallet-adapter-react-ui/styles.css";

function normalizeRpc(rpc) {
if (!rpc) return "https://api.mainnet-beta.solana.com";
if (rpc.startsWith("http")) return rpc;
return `https://${rpc}`;
}

export default function ProvidersClient({ children }) {
const endpoint = useMemo(
() => normalizeRpc(process.env.NEXT_PUBLIC_SOL_RPC),
[]
);

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