export const dynamic = "force-dynamic";

import dynamic from "next/dynamic";


const SolClient = dynamic(() => import("./SolClient"), {
ssr: false,
});

export default function Page() {
return <SolClient />;
}