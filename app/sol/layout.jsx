export const metadata = {
title: "PENQUIN SOL Dashboard",
};

export const dynamic = "force-dynamic";

import SolanaProvidersClient from "./SolanaProvidersClient";

export default function SolLayout({ children }) {
return <SolanaProvidersClient>{children}</SolanaProvidersClient>;
}