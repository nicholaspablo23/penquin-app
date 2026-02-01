import dynamic from "next/dynamic";

export const dynamic = "force-dynamic";

const SolanaProvidersClient = dynamic(() => import("./SolanaProvidersClient"), {
ssr: false,
});

export default function SolLayout({ children }) {
return <SolanaProvidersClient>{children}</SolanaProvidersClient>;
}