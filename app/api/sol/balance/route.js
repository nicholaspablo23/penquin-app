import { NextResponse } from "next/server";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const RPC =
process.env.SOL_RPC || "https://api.mainnet-beta.solana.com";

export async function GET(req) {
try {
const { searchParams } = new URL(req.url);
const address = searchParams.get("address");

if (!address) {
return NextResponse.json(
{ error: "Missing address" },
{ status: 400 }
);
}

const connection = new Connection(RPC, "confirmed");
const lamports = await connection.getBalance(
new PublicKey(address)
);

return NextResponse.json({
sol: lamports / LAMPORTS_PER_SOL,
});
} catch (e) {
return NextResponse.json(
{ error: e.message },
{ status: 500 }
);
}
}