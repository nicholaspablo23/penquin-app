"use client";

import { Buffer } from "buffer";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";

import { LAMPORTS_PER_SOL, VersionedTransaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import styles from "./sol.module.css";

const SOL_RPC = process.env.NEXT_PUBLIC_SOL_RPC;
if (!SOL_RPC) throw new Error("Missing NEXT_PUBLIC_SOL_RPC");

const WalletButtonClient = dynamic(() => import("./WalletButtonClient"), {
ssr: false,
});

function parseSolToLamports(amountStr) {
const s = String(amountStr ?? "").trim();
if (!s) return null;
if (!/^\d*\.?\d*$/.test(s)) return null;

const num = Number(s);
if (!Number.isFinite(num) || num <= 0) return null;

const lamports = Math.floor(num * LAMPORTS_PER_SOL);
if (lamports <= 0) return null;

return lamports;
}

export default function SolPage() {
const { connection } = useConnection();
const { publicKey, connected, signTransaction, signAllTransactions } = useWallet();

const [solBalance, setSolBalance] = useState(null); // number | "RPC blocked" | null
const [amount, setAmount] = useState("0.05");

const [swapping, setSwapping] = useState(false);
const [swapError, setSwapError] = useState("");
const [swapSig, setSwapSig] = useState("");

const shortKey = useMemo(() => {
if (!publicKey) return "";
const b58 = publicKey.toBase58();
return `${b58.slice(0, 4)}...${b58.slice(-4)}`;
}, [publicKey]);

// Balance polling (only when connected)
useEffect(() => {
let alive = true;

const loadBalance = async () => {
try {
if (!connected || !publicKey) {
if (alive) setSolBalance(null);
return;
}

const res = await fetch(`/api/sol/balance?address=${publicKey.toBase58()}`);

console.log("balance fetch status:", res.status);

const data = await res.json();
console.log("balance data:", data);

if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

if (alive) setSolBalance(data.sol);

} catch (e) {
console.error("getBalance failed:", e);
const msg = String(e?.message || "");

if (msg.includes("403") || msg.toLowerCase().includes("forbidden")) {
if (alive) setSolBalance("RPC blocked");
} else {
if (alive) setSolBalance(null);
}
}
};

loadBalance();
const t = setInterval(loadBalance, 12000);

return () => {
alive = false;
clearInterval(t);
};
}, [connection, publicKey, connected]);

const lamportsIn = parseSolToLamports(amount);
const rpcBlocked = solBalance === "RPC blocked";

// keep a SOL cushion for fees/rent
const feeCushionLamports = Math.floor(0.01 * LAMPORTS_PER_SOL);

const walletLamports =
typeof solBalance === "number" ? Math.floor(solBalance * LAMPORTS_PER_SOL) : null;

const insufficientForFees =
walletLamports !== null ? walletLamports < feeCushionLamports : false;

const swapDisabled =
!connected ||
swapping ||
!publicKey ||
!lamportsIn ||
rpcBlocked ||
insufficientForFees ||
(walletLamports !== null ? lamportsIn > walletLamports - feeCushionLamports : false);

async function swapSolForPenquin() {
setSwapError("");
setSwapSig("");

if (!connected || !publicKey) {
setSwapError("Connect your wallet first.");
return;
}

if (rpcBlocked) {
setSwapError("RPC blocked (403). Switch to a different Solana RPC.");
return;
}

if (!lamportsIn) {
setSwapError("Enter a valid SOL amount.");
return;
}

if (typeof solBalance === "number" && solBalance < 0.01) {
setSwapError("You need at least ~0.01 SOL left for fees.");
return;
}

if (!signTransaction && !signAllTransactions) {
setSwapError("Wallet does not support transaction signing in this setup.");
return;
}

try {
setSwapping(true);

// ✅ Build swap server-side (avoids CORS + empty buildJson + CU price loops)
const res = await fetch("/api/sol/raydium/swap", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
wallet: publicKey.toBase58(),
outputMint: "3hmwVLNXjWX9ek631yx7s2fhsoiZMPxnPxQumrBh3aLN", // your PENQUIN mint
amountInLamports: String(lamportsIn),
slippageBps: 150,
txVersion: "V0",
wrapSol: true,
unwrapSol: false,
}),
});


const json = await res.json();
if (!json?.ok) {
throw new Error(json?.error || "Swap build failed.");
}

const steps = Array.isArray(json.data) ? json.data : [];
if (!steps.length) throw new Error("No transactions returned from Raydium.");

const txs = steps.map((item) => {
const b64 = item?.transaction;
if (!b64) throw new Error("Missing transaction payload from Raydium.");
const buf = Buffer.from(b64, "base64");
return VersionedTransaction.deserialize(buf);
});

// sign
let signedTxs = [];
if (signAllTransactions) {
signedTxs = await signAllTransactions(txs);
} else {
for (const tx of txs) signedTxs.push(await signTransaction(tx));
}

// send+confirm in order
for (const signedTx of signedTxs) {
const sig = await connection.sendRawTransaction(signedTx.serialize(), {
skipPreflight: false,
maxRetries: 5,
});

const latest = await connection.getLatestBlockhash("confirmed");
await connection.confirmTransaction({ signature: sig, ...latest }, "confirmed");

setSwapSig(sig);
}
} catch (e) {
console.error(e);
setSwapError(e?.message || "Swap failed.");
} finally {
setSwapping(false);
}
}

return (
<div className={styles.page}>
<div className={styles.shell}>
<div className={styles.panel}>
<div className={styles.panelInner}>
{/* HEADER */}
<div className={styles.headerRow}>
<div className={styles.brand}>
<div className={styles.logoGlowWrap}>
<Image
src="/penquin-logo.png"
alt="PENQUIN"
width={96}
height={96}
className={styles.logo}
priority
/>
</div>

<div>
<div className={styles.kicker}>PENQUIQUI CONTROL PANEL</div>

<h1 className={styles.h1}>
PENQUIN{" "}
<span className={`${styles.solGradientText} ${styles.solGlowText}`}>
SOL
</span>{" "}
<span className={styles.solSoftTitle}>Dashboard</span>
</h1>

<div className={styles.sub}>
Connect your Solana wallet. Swap UI is live.
</div>

<div className={styles.pillsRow}>
<span className={styles.pill}>
<span className={styles.pillDot} />
Solana • Mainnet
</span>
<span className={`${styles.pill} ${styles.pulseSlow} ${styles.pillViolet}`}>
Token: PENQUIN (SOL)
</span>
</div>
</div>
</div>

<div className={styles.rightMeta}>
<div className={styles.topRightPills}>
<span className={styles.smallPill}>Solana • Mainnet</span>
<span className={`${styles.smallPill} ${styles.beta}`}>BETA</span>
</div>
<WalletButtonClient />
</div>
</div>

{/* GRID */}
<div className={styles.grid}>
{/* LEFT CARD */}
<div className={styles.card}>
<div className={styles.cardTitleRow}>
<div className={styles.cardTitle}>PENQUIN (SOL) Info</div>
<div className={styles.quickRef}>Quick reference</div>
</div>

<div className={styles.rows}>
<div className={styles.row}>
<div className={styles.label}>Wallet status</div>
<div className={styles.value}>{connected ? "Connected" : "Not connected"}</div>
</div>

<div className={styles.row}>
<div className={styles.label}>Address</div>
<div className={styles.value}>{connected ? shortKey : "—"}</div>
</div>

<div className={styles.row}>
<div className={styles.label}>SOL balance</div>
<div className={styles.value}>
{solBalance === null
? "—"
: typeof solBalance === "string"
? solBalance
: solBalance.toFixed(4)}
</div>
</div>
</div>

<div className={styles.tipBox}>
<div className={styles.tipTitle}>Tip</div>
Keep ~0.01 SOL for fees. Swaps are built server-side and signed in-wallet.
</div>
</div>

{/* RIGHT CARD */}
<div className={styles.card}>
<div className={styles.buyTopRow}>
<div className={styles.cardTitle}>Buy PENQUIN (SOL)</div>
<div className={styles.routePill}>SOL → PENQUIN</div>
</div>

<div className={styles.label}>Amount in SOL</div>

<div className={styles.inputRow}>
<input
className={styles.input}
value={amount}
onChange={(e) => setAmount(e.target.value)}
inputMode="decimal"
placeholder="0.00"
/>
<div className={styles.tokenTag}>SOL</div>
</div>

<div className={styles.statusRow}>
<div>Status</div>
<div>Live swap (Raydium)</div>
</div>

<button
className={`${styles.buyBtn} ${
swapDisabled ? styles.buyBtnDisabled : styles.buyBtnReady
}`}
disabled={swapDisabled}
onClick={swapSolForPenquin}
title={
rpcBlocked
? "RPC blocked (403) — fix your RPC endpoint"
: insufficientForFees
? "You need at least ~0.01 SOL left for fees."
: ""
}
>
{swapping ? "Building swap… Confirm in wallet" : "Swap SOL for PENQUIN"}
</button>

{swapError ? <div className={styles.errorText}>⚠️ {swapError}</div> : null}

{swapSig && (
<div className={styles.successText}>
✅ Swap confirmed —{" "}
<a
href={`https://solscan.io/tx/${swapSig}`}
target="_blank"
rel="noreferrer"
className={styles.txLink}
>
{swapSig.slice(0, 6)}…{swapSig.slice(-6)}
</a>
</div>
)}

<div className={styles.footerNote}>
Swaps route WSOL → PENQUIN via Raydium. If it fails, the server response will
include the exact Raydium error stage (quote/build).
</div>
</div>
</div>
{/* /grid */}
</div>
</div>
</div>
</div>
);
}