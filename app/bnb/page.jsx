export const dynamic = "force-dynamic"; // prevents build-time prerender issues

import BnbSwapClient from "./BnbSwapClient";

export default function Page() {
return <BnbSwapClient />;
}