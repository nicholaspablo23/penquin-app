export const dynamic = "force-dynamic";

import dynamicImport from "next/dynamic";

const SolClient = dynamicImport(() => import("./SolClient"), { ssr: false });

export default function Page() {
return <SolClient />;
}