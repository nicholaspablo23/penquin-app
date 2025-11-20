"use client";

import { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { ethers } from "ethers";

// ---- CONSTANTS ----

// PENQUIN token (ETH mainnet)
const PENQUIN_ADDRESS = "0xc05202bb0BcD2e30AE68F596622eD00ca94556Ba";

// WETH (ETH mainnet) – checksummed EXACTLY
const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

// USDC (ETH mainnet)
const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

// Uniswap V2 router (ETH mainnet)
const UNISWAP_V2_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

// Minimal ABI...
const UNISWAP_V2_ABI = [
"function swapExactETHForTokensSupportingFeeOnTransferTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) payable",
];

export default function Page() {
const { address, isConnected } = useAccount();

// Live PENQUIN balance
const { data: balanceData, isLoading: balLoading } = useBalance({
address,
token: PENQUIN_ADDRESS,
watch: true,
});

// Local UI state
const [mounted, setMounted] = useState(false);
const [ethAmount, setEthAmount] = useState("0.01");
const [isSwapping, setIsSwapping] = useState(false);
const [error, setError] = useState("");
const [txHash, setTxHash] = useState("");
const [ethPrice, setEthPrice] = useState(null);

// Hydration guard
useEffect(() => {
setMounted(true);
}, []);

// Simple ETH price feed (CoinGecko)
useEffect(() => {
async function fetchPrice() {
try {
const res = await fetch(
"https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
);
const data = await res.json();
if (data?.ethereum?.usd) {
setEthPrice(data.ethereum.usd);
}
} catch (err) {
console.error("Error fetching ETH price:", err);
}
}

fetchPrice();
const id = setInterval(fetchPrice, 60_000); // refresh every 60s
return () => clearInterval(id);
}, []);

const balance = balanceData?.value ?? 0n;

// ---- SWAP HANDLER ----
async function handleSwap() {
setError("");
setTxHash("");

try {
if (typeof window === "undefined" || !window.ethereum) {
setError("No wallet found. Please install MetaMask.");
return;
}
if (!address) {
setError("Connect your wallet first.");
return;
}

const value = ethers.parseEther(ethAmount || "0");
if (value <= 0n) {
setError("Enter a valid ETH amount.");
return;
}

setIsSwapping(true);

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// Route: ETH -> WETH -> USDC -> PENQUIN (via USDC pool)
const path = [WETH_ADDRESS, USDC_ADDRESS, PENQUIN_ADDRESS];
const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes

const router = new ethers.Contract(
UNISWAP_V2_ROUTER,
UNISWAP_V2_ABI,
signer
);

const tx =
await router.swapExactETHForTokensSupportingFeeOnTransferTokens(
0, // amountOutMin = 0 (no on-chain slippage protection)
path,
address,
deadline,
{ value }
);

const receipt = await tx.wait();
setTxHash(receipt.hash ?? tx.hash);
} catch (err) {
console.error(err);
if (err.code === "CALL_EXCEPTION") {
setError(
"Swap reverted. Check that there is Uniswap V2 liquidity for the ETH → USDC → PENQUIN route."
);
} else {
setError(err?.shortMessage || err?.message || "Swap failed. Check console.");
}
} finally {
setIsSwapping(false);
}
}

// Prevent hydration mismatch
if (!mounted) return null;

const formattedBalance =
balanceData && !balLoading
? Number(
ethers.formatUnits(balanceData.value, balanceData.decimals)
).toLocaleString(undefined, {
maximumFractionDigits: 4,
})
: "0";

return (
<main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white flex items-center justify-center p-4 sm:p-8">
<div className="w-full max-w-4xl rounded-3xl border border-sky-700/40 bg-slate-950/70 shadow-[0_0_45px_rgba(56,189,248,0.45)] backdrop-blur-xl px-5 py-6 sm:px-8 sm:py-8 space-y-6">
{/* Top bar */}
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
{/* Left: Logo + titles */}
<div className="flex items-start gap-4">
{/* Logo box */}
<div
className="
flex items-center justify-center
w-20 h-20
rounded-full
shadow-[0_0_22px_rgba(255,204,0,0.75)]
animate-auraflow
"
>
<img
src="/penquin-logo.png"
alt="PENQUIN Logo"
className="
w-20 h-20
object-contain
drop-shadow-[0_0_14px_rgba(255,200,0,0.55)]
"
/>
</div>

{/* Text */}
<div className="space-y-1">
<p className="text-xs font-semibold tracking-[0.2em] text-sky-400 uppercase">
PenQuiQui Control Panel
</p>
<h1
className="
text-3xl sm:text-4xl
font-semibold
bg-gradient-to-r from-sky-200 via-emerald-300 to-amber-200
bg-clip-text text-transparent
"
>
PENQUIN Dashboard
</h1>
<p className="text-sm text-slate-300 max-w-xl">
Connect your wallet, check your holdings, and swap ETH
directly into <span className="font-semibold">PENQUIN</span>.
</p>

<div className="flex flex-wrap gap-2 pt-1">
<span className="px-2.5 py-1 rounded-full border border-sky-500/60 bg-sky-900/50 text-[11px] font-medium text-sky-100">
Ethereum Mainnet
</span>
<span className="px-2.5 py-1 rounded-full border border-amber-400/60 bg-amber-500/10 text-[11px] font-medium text-amber-200">
Token: PENQUIN
</span>
</div>
</div>
</div>

{/* Right: RainbowKit connect button sits up here in layout */}
<div className="self-stretch flex items-start sm:items-center justify-end">
<span className="text-xs text-slate-400" />
</div>
</div>

{/* Main content */}
<div className="grid md:grid-cols-2 gap-5 md:gap-6">
{/* Balance card */}
<div className="rounded-2xl border border-sky-700/40 bg-slate-900/70 p-5 sm:p-6 flex flex-col justify-between">
<div className="flex items-center justify-between gap-2 mb-3">
<h2 className="text-base font-semibold text-sky-100">
Your PENQUIN Balance
</h2>
<span className="px-2 py-0.5 rounded-full text-[10px] border border-sky-500/60 bg-sky-900/60 text-sky-100">
Live on-chain
</span>
</div>

{isConnected ? (
<div className="space-y-3">
{balLoading ? (
<p className="text-slate-300 text-sm">
Fetching balance…
</p>
) : (
<p className="text-3xl sm:text-4xl font-semibold tracking-tight">
{formattedBalance}{" "}
<span className="text-sky-300 text-xl align-middle">
PENQUIN
</span>
</p>
)}
<p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
PENQUIN · Contract:{" "}
<span className="font-mono break-all text-slate-300">
{PENQUIN_ADDRESS}
</span>
</p>
</div>
) : (
<p className="text-sm text-slate-300">
Connect your wallet to view your PENQUIN balance.
</p>
)}

<div className="mt-4 pt-4 border-t border-slate-700/60 text-[11px] text-slate-400">
Tip: After your first swap, add PENQUIN to your wallet
using this contract address so balances show up nicely.
</div>
</div>

{/* Swap card */}
<div className="rounded-2xl border border-amber-400/50 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-amber-900/30 p-5 sm:p-6 space-y-4">
<div className="flex items-center justify-between gap-2 mb-2">
<h2 className="text-base font-semibold text-amber-100">
Buy PENQUIN
</h2>
<span className="px-2 py-0.5 rounded-full text-[10px] border border-amber-400/70 bg-amber-500/20 text-amber-50">
ETH → PENQUIN
</span>
</div>

<p className="text-sm text-slate-100/90">
Swap ETH for PENQUIN directly.
</p>

<div className="space-y-3">
<label className="text-xs text-slate-300">
Amount in ETH
</label>
<div className="mt-1 flex items-center gap-2">
<input
type="number"
min="0"
step="0.0001"
value={ethAmount}
onChange={(e) => setEthAmount(e.target.value)}
className="
flex-1 rounded-xl bg-slate-900/80 border border-slate-600/70
px-3.5 py-2.5 text-sm text-slate-50
focus:outline-none focus:ring-2 focus:ring-amber-400/70
placeholder:text-slate-500
"
placeholder="0.01"
/>
<span className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-600/70 text-xs font-semibold text-slate-100">
ETH
</span>
</div>

{ethPrice && (
<p className="text-[11px] text-slate-400">
ETH price: ${ethPrice.toLocaleString(undefined, {
maximumFractionDigits: 2,
})}
</p>
)}
</div>

<button
onClick={handleSwap}
disabled={!isConnected || isSwapping}
className="
w-full mt-2
rounded-full
bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300
text-slate-900 font-semibold
py-3
shadow-[0_12px_30px_rgba(250,204,21,0.45)]
hover:shadow-[0_16px_40px_rgba(250,204,21,0.65)]
disabled:opacity-60 disabled:cursor-not-allowed
transition-all
animate-pulse-subtle
"
>
{isSwapping ? "Swapping..." : "Swap ETH for PENQUIN"}
</button>

{error && (
<p className="text-xs text-red-400 bg-red-950/40 border border-red-500/30 rounded-lg px-3 py-2 mt-2">
{error}
</p>
)}

{txHash && (
<p className="text-xs text-emerald-300 mt-2">
Swap submitted. View on Etherscan:{" "}
<a
href={`https://etherscan.io/tx/${txHash}`}
target="_blank"
rel="noreferrer"
className="underline text-emerald-200"
>
{txHash.slice(0, 10)}…
</a>
</p>
)}

<div className="mt-4 pt-3 border-t border-amber-400/30 text-[11px] text-amber-50/80">
This simple swap does not include slippage protection
(<code className="font-mono">amountOutMin = 0</code>). For
larger trades, you can also use the full Uniswap UI to set
custom slippage.
</div>
</div>
</div>

{/* Footer / future section */}
<div className="mt-2 rounded-2xl border border-slate-800/70 bg-slate-950/70 px-5 py-4">
<h3 className="text-sm font-semibold text-slate-100">
Vaults &amp; Staking (Coming Soon)
</h3>
<p className="text-xs text-slate-400 mt-1">
This area will host PENQUIN staking, rewards, and the{" "}
<span className="italic">"Insert PENQUIN to Play"</span> arcade
integration for the game.
</p>
</div>
</div>
</main>
);
}