"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
PhantomWalletAdapter,
SolflareWalletAdapter,
TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";

// If you want the default wallet-adapter modal styling, uncomment this line
// import "@solana/wallet-adapter-react-ui/styles.css";

export default function SolanaProviders({ children }) {
const endpoint = useMemo(() => {
const env = (process.env.NEXT_PUBLIC_SOL_RPC || "").trim();

// Prevent placeholder values from ever being used
if (!env || env.includes("your_provider_rpc_url")) {

return "https://rpc.ankr.com/solana";
}

return env;
}, []);

const wallets = useMemo(
() => [new PhantomWalletAdapter(), new SolflareWalletAdapter(), new TorusWalletAdapter()],
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