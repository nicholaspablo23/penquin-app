import dynamic from "next/dynamic";

export const dynamic = "force-dynamic";

const SolClient = dynamic(() => import("./SolClient"), {
ssr: false,
});

export default function Page() {
return <SolClient />;
}