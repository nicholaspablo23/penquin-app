import SolanaProvidersClient from "./SolanaProvidersClient";

export const metadata = {
title: "PENQUIN SOL Dashboard",
};

export default function SolLayout({ children }) {
return (
<SolanaProvidersClient>
{children}
</SolanaProvidersClient>
);
}