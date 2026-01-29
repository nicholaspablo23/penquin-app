import SolanaProviders from "./SolanaProviders";

export const metadata = {
title: "PENQUIN SOL Dashboard",
};

export default function SolLayout({ children }) {
return <SolanaProviders>{children}</SolanaProviders>;
}