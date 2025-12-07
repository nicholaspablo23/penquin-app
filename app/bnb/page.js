"use client";

import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { ethers } from "ethers";

// ---------- CONSTANTS ----------

// wPENQUIN token (BNB chain)
const WPENQUIN_ADDRESS = "0xb4d6bce21c09eda206ef8b8eb2add09ce1b08fad".toLowerCase();

// WBNB (wrapped BNB) on BSC
const WBNB_ADDRESS = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c".toLowerCase();

// PancakeSwap V2 Router (BSC mainnet)
const PANCAKESWAP_V2_ROUTER = "0x10ed43c718714eb63d5aa57b78b54704e256024e".toLowerCase();

// Minimal ABI: swapExactETHForTokensSupportingFeeOnTransferTokens
const PANCAKE_V2_ABI = [
"function swapExactETHForTokensSupportingFeeOnTransferTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) payable",
];

export default function Page() {
const { address, isConnected } = useAccount();

const [mounted, setMounted] = useState(false);
const [bnbAmount, setBnbAmount] = useState("0.002");
const [isSwapping, setIsSwapping] = useState(false);
const [error, setError] = useState("");
const [txHash, setTxHash] = useState("");
const [bnbPrice, setBnbPrice] = useState(null);

// Hydration guard
useEffect(() => {
setMounted(true);
}, []);

// Simple BNB price feed (CoinGecko)
useEffect(() => {
async function fetchPrice() {
try {
const res = await fetch(
"https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd"
);
const data = await res.json();
if (data?.binancecoin?.usd) {
setBnbPrice(data.binancecoin.usd);
}
} catch (err) {
console.error("Error fetching BNB price:", err);
}
}

fetchPrice();
const id = setInterval(fetchPrice, 60_000);
return () => clearInterval(id);
}, []);

// ---------- SWAP HANDLER ----------

async function handleSwapBNB() {
setError("");
setTxHash("");

try {
if (typeof window === "undefined" || !window.ethereum) {
setError(
"No injected wallet found. Use MetaMask / Rabby / Phantom EVM on BNB."
);
return;
}

if (!address) {
setError("Connect your wallet first.");
return;
}

const value = ethers.parseEther(bnbAmount || "0");
if (value <= 0n) {
setError("Enter a valid BNB amount.");
return;
}

setIsSwapping(true);

// Use the injected provider (MetaMask, Rabby, Phantom EVM, etc.)
const provider = new ethers.BrowserProvider(window.ethereum);
const network = await provider.getNetwork();
console.log("Detected chainId:", network.chainId);

// Ensure wallet is on BNB Smart Chain (chainId 56)
if (network.chainId !== 56n) {
setError(
"Please switch your wallet to BNB Smart Chain (BSC) and try again."
);
setIsSwapping(false);
return;
}

const signer = await provider.getSigner();
const userAddress = await signer.getAddress();

// Route: BNB (wrapped as WBNB) -> wPENQUIN
const path = [WBNB_ADDRESS, WPENQUIN_ADDRESS];
const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes

const router = new ethers.Contract(
PANCAKESWAP_V2_ROUTER,
PANCAKE_V2_ABI,
signer
);

const tx =
await router.swapExactETHForTokensSupportingFeeOnTransferTokens(
0, // amountOutMin = 0 (no on-chain slippage protection)
path,
userAddress,
deadline,
{ value }
);

const receipt = await tx.wait();
setTxHash(receipt.hash ?? tx.hash);
} catch (err) {
console.error(err);
if (err?.code === "CALL_EXCEPTION") {
setError(
"Swap reverted. Check that there is PancakeSwap V2 liquidity for the BNB → WBNB → wPENQUIN route."
);
} else if (err?.code === "ACTION_REJECTED") {
setError("Transaction rejected in wallet.");
} else {
setError(
err?.shortMessage || err?.message || "Swap failed. Check console."
);
}
} finally {
setIsSwapping(false);
}
}

if (!mounted) return null;

return (
<main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white flex items-center justify-center p-4 sm:p-8">
<div className="w-full max-w-5xl rounded-3xl border border-emerald-500/40 bg-slate-950/80 shadow-[0_0_45px_rgba(16,185,129,0.45)] backdrop-blur-xl px-5 py-6 sm:px-8 sm:py-8 space-y-6">
{/* Top bar */}
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
{/* Left: Logo + titles */}
<div className="flex items-start gap-4">
{/* Logo circle */}
<div
className="
flex items-center justify-center
w-20 h-20
rounded-full
shadow-[0_0_22px_rgba(250,204,21,0.75)]
animate-auraflow
"
>
<img
src="/penquin-logo.png"
alt="PENQUIN Logo"
className="w-18 h-18 object-contain drop-shadow-[0_0_14px_rgba(250,204,21,0.6)]"
/>
</div>

<div className="space-y-1">
<p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase">
PenQuiQui Control Panel
</p>
<h1
className="
text-3xl sm:text-4xl
font-semibold
bg-gradient-to-r from-emerald-200 via-sky-200 to-amber-200
bg-clip-text text-transparent
"
>
PENQUIN BNB Dashboard
</h1>
<p className="text-sm text-slate-200 max-w-xl">
This is the BNB Chain variant of PENQUIN. Connect your wallet
and swap BNB directly into{" "}
<span className="font-semibold">wPENQUIN</span>.
</p>

<div className="flex flex-wrap gap-2 pt-1">
<span className="px-2.5 py-1 rounded-full border border-emerald-500/70 bg-emerald-900/40 text-[11px] font-medium text-emerald-100">
BNB Chain (Mainnet)
</span>
<span className="px-2.5 py-1 rounded-full border border-amber-400/70 bg-amber-500/10 text-[11px] font-medium text-amber-200">
Token: wPENQUIN (BNB)
</span>
</div>
</div>
</div>

{/* Right: Connect Button */}
<div className="self-stretch flex items-start sm:items-center justify-end">
<ConnectButton />
</div>
</div>

{/* Main content */}
<div className="grid md:grid-cols-2 gap-5 md:gap-6">
{/* Info card */}
<div className="rounded-2xl border border-emerald-600/50 bg-slate-900/70 p-5 sm:p-6 flex flex-col justify-between">
<div className="flex items-center justify-between gap-2 mb-3">
<h2 className="text-base font-semibold text-emerald-100">
wPENQUIN (BNB) Info
</h2>
<span className="px-2 py-0.5 rounded-full text-[10px] border border-emerald-500/60 bg-emerald-900/60 text-emerald-100">
Quick reference
</span>
</div>

<div className="space-y-3 text-sm text-slate-200">
{isConnected ? (
<p>
Wallet connected on BNB. After swapping, your PENQUIN balance
will show inside your wallet once you add the token.
</p>
) : (
<p>Connect your wallet to begin using the BNB dashboard.</p>
)}

<div className="pt-2 text-[11px] text-slate-400 leading-relaxed">
<p className="font-semibold text-slate-200">
wPENQUIN Contract (BNB):
</p>
<p className="font-mono break-all text-slate-300 mt-1">
{WPENQUIN_ADDRESS}
</p>
</div>
</div>

<div className="mt-4 pt-4 border-t border-slate-700/60 text-[11px] text-slate-400">
Tip: Add this contract as a custom token on BNB Chain so wPENQUIN
shows up in your wallet asset list.
</div>
</div>

{/* Swap card */}
<div className="rounded-2xl border border-amber-400/60 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-amber-900/30 p-5 sm:p-6 space-y-4">
<div className="flex items-center justify-between gap-2 mb-2">
<h2 className="text-base font-semibold text-amber-100">
Buy wPENQUIN (BNB)
</h2>
<span className="px-2 py-0.5 rounded-full text-[10px] border border-amber-400/80 bg-amber-500/20 text-amber-50">
BNB → wPENQUIN
</span>
</div>

<p className="text-sm text-slate-100/90">
Swap native BNB for PENQUIN using the PancakeSwap V2 route. Make
sure your wallet is set to BNB Chain.
</p>

<div className="space-y-3">
<label className="text-xs text-slate-300">Amount in BNB</label>
<div className="mt-1 flex items-center gap-2">
<input
type="number"
min="0"
step="0.0001"
value={bnbAmount}
onChange={(e) => setBnbAmount(e.target.value)}
className="
flex-1 rounded-xl bg-slate-900/80 border border-slate-600/70
px-3.5 py-2.5 text-sm text-slate-50
focus:outline-none focus:ring-2 focus:ring-amber-400/70
placeholder:text-slate-500
"
placeholder="0.002"
/>
<span className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-600/70 text-xs font-semibold text-slate-100">
BNB
</span>
</div>

{bnbPrice && (
<p className="text-[11px] text-slate-400">
BNB price: $
{bnbPrice.toLocaleString(undefined, {
maximumFractionDigits: 2,
})}
</p>
)}
</div>

<button
onClick={handleSwapBNB}
disabled={!isConnected || isSwapping}
className="
w-full mt-2
rounded-full
bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300
text-slate-900 font-semibold
py-3
shadow-[0_12px_30px_rgba(250,204,21,0.45)]
hover:shadow-[0_18px_45px_rgba(250,204,21,0.75)]
hover:scale-[1.02]
disabled:opacity-60 disabled:cursor-not-allowed
transition-all
animate-pulse-subtle
"
>
{isSwapping ? "Swapping..." : "Swap BNB for PENQUIN"}
</button>

{error && (
<p className="text-xs text-red-400 bg-red-950/40 border border-red-500/30 rounded-lg px-3 py-2 mt-2">
{error}
</p>
)}

{txHash && (
<p className="text-xs text-emerald-300 mt-2">
Swap submitted. View on BscScan:{" "}
<a
href={`https://bscscan.com/tx/${txHash}`}
target="_blank"
rel="noreferrer"
className="underline text-emerald-200"
>
{txHash.slice(0, 10)}…
</a>
</p>
)}

<div className="mt-4 pt-3 border-t border-amber-400/30 text-[11px] text-amber-50/80">
This simple swap does not include slippage protection (
<code className="font-mono">amountOutMin = 0</code>). For larger
trades, you can also use the full PancakeSwap UI to set custom
slippage.
</div>
</div>
</div>

{/* Footer */}
<div className="mt-2 rounded-2xl border border-slate-800/70 bg-slate-950/70 px-5 py-4">
<h3 className="text-sm font-semibold text-slate-100">
Cross-Chain PENQUIN Network
</h3>
<p className="text-xs text-slate-400 mt-1">
This dashboard is for the BNB Chain variant of PENQUIN. The Ethereum
and BNB ecosystems will both feed into the wider PENQUIN Universe of
games, staking, and lore.
</p>
</div>
</div>
</main>
);
}