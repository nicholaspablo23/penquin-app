// app/api/sol/raydium/swap/route.js
import { NextResponse } from "next/server";

const SWAP_HOST = "https://transaction-v1.raydium.io";

// WSOL mint on Solana
const WSOL_MINT = "So11111111111111111111111111111111111111112";

export async function POST(req) {
try {
const body = await req.json();

const {
wallet, // user's pubkey base58
outputMint, // PENQUIN mint
amountInLamports, // integer string/number
slippageBps = 100, // 100 = 1.00%
txVersion = "V0", // "V0" or "LEGACY"
wrapSol = true,
unwrapSol = false,
inputAccount, // optional if input is SOL
outputAccount, // optional if output is SOL
// OPTIONAL: force a specific pool (see below)
forcePoolId
} = body;

// 1) Quote: compute swap-base-in
const quoteUrl =
`${SWAP_HOST}/compute/swap-base-in` +
`?inputMint=${WSOL_MINT}` +
`&outputMint=${outputMint}` +
`&amount=${amountInLamports}` +
`&slippageBps=${slippageBps}` +
`&txVersion=${txVersion}`;

const quoteRes = await fetch(quoteUrl);
const quoteJson = await quoteRes.json();

if (!quoteRes.ok || !quoteJson?.success) {
return NextResponse.json(
{ ok: false, error: quoteJson?.msg || quoteJson?.error || "Quote failed", raw: quoteJson },
{ status: 500 }
);
}

let swapResponse = quoteJson;

// OPTIONAL: Force the pool you just added liquidity to (if you know its poolId)
// Many Raydium responses include a route plan / pool keys.
// We only keep routes that include your chosen pool.
if (forcePoolId) {
const rp = swapResponse?.data?.routePlan;
if (Array.isArray(rp)) {
const filtered = rp.filter(step =>
step?.poolId === forcePoolId ||
step?.poolKey === forcePoolId ||
step?.id === forcePoolId
);
if (filtered.length) {
swapResponse = {
...swapResponse,
data: { ...swapResponse.data, routePlan: filtered }
};
}
}
}

// 2) Build tx: transaction/swap-base-in
const buildRes = await fetch(`${SWAP_HOST}/transaction/swap-base-in`, {
method: "POST",
headers: { "content-type": "application/json" },
body: JSON.stringify({
swapResponse, // IMPORTANT: pass the whole quote response
txVersion,
wallet,
wrapSol,
unwrapSol,
inputAccount: wrapSol ? undefined : inputAccount,
outputAccount: unwrapSol ? undefined : outputAccount,
// You can set priority fee later; keep simple for now:
computeUnitPriceMicroLamports: "0",
}),
});

const buildJson = await buildRes.json();

if (!buildRes.ok || !buildJson?.success) {
return NextResponse.json(
{ ok: false, error: buildJson?.msg || buildJson?.error || "Build failed", raw: buildJson },
{ status: 500 }
);
}

return NextResponse.json({ ok: true, data: buildJson.data });
} catch (e) {
return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
}
}