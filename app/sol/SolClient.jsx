"use client";

import { useEffect, useState } from "react";

const SOL_RPC =
process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com";

export default function SolClient() {
const [rpc, setRpc] = useState("");

useEffect(() => {
setRpc(SOL_RPC);
}, []);

return (
<div style={{ padding: 24 }}>
<h1>SOL Page</h1>
<p>RPC: {rpc}</p>
</div>
);
}