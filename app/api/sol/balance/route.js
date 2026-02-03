import { NextResponse } from "next/server";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

export async function GET(req) {
try {
const RPC = process.env.SOL_RPC || process.env.NEXT_PUBLIC_SOL_RPC;

if (!RPC) {
return NextResponse.json(
{ error: "Missing SOL_RPC / NEXT_PUBLIC_SOL_RPC" },
{ status: 500 }
);
}

const { searchParams } = new URL(req.url);
const address = searchParams.get("address");

if (!address) {
return NextResponse.json({ error: "Missing address" }, { status: 400 });
}

const connection = new Connection(RPC, "confirmed");
const lamports = await connection.getBalance(new PublicKey(address));

return NextResponse.json({ sol: lamports / LAMPORTS_PER_SOL });
} catch (e) {
return NextResponse.json(
{ error: String(e?.message || e) },
{ status: 500 }
);
}
}