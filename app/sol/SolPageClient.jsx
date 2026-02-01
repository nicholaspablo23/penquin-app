"use client";
import dynamic from "next/dynamic";

const SolPage = dynamic(() => import("./SolPage"), { ssr: false });

export default function SolPageClient() {
return <SolPage />;
}