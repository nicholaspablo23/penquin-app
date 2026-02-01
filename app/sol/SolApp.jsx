"use client";

import SolanaProviders from "./SolanaProvidersClient";
import SolPage from "./SolPage";

export default function SolApp() {
return (
<SolanaProvidersClient>
<SolPage />
</SolanaProvidersClient>
);
}