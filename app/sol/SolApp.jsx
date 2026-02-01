"use client";

import SolanaProvidersClient from "./SolanaProvidersClient";
import SolPage from "./SolPage";

export default function SolApp() {
return (
<SolanaProvidersClient>
<SolPage />
</SolanaProvidersClient>
);
}