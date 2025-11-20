import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
title: "PENQUIN dApp",
description: "PENQUIN wallet dashboard",
};

export default function RootLayout({ children }) {
return (
<html lang="en">
<body className="bg-slate-900 text-white min-h-screen">
<Providers>{children}</Providers>
</body>
</html>
);
}