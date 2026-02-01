"use client";

import SolanaProviders from "./SolanaProviders";
import SolPage from "./SolPage";

export default function SolApp() {
return (
<SolanaProviders>
<SolPage />
</SolanaProviders>
);
}