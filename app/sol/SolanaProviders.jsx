"use client";

import dynamic from "next/dynamic";

const SolanaProvidersInner = dynamic(() => import("./SolanaProvidersInner"), {
ssr: false,
});

export default function SolanaProviders({ children }) {
return <SolanaProvidersInner>{children}</SolanaProvidersInner>;
}