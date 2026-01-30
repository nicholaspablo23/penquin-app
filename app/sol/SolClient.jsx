"use client";

import { useEffect, useState } from "react";

export default function SolClient() {
const [rpc, setRpc] = useState("");

useEffect(() => {
const v = (process.env.NEXT_PUBLIC_SOLANA_RPC || "").trim();
setRpc(v || "https://api.mainnet-beta.solana.com");
}, []);

return (
<div style={{ padding: 24 }}>
<h1>SOL Page</h1>
<p>RPC: {rpc}</p>
</div>
);
}