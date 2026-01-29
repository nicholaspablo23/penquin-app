import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Providers } from "./providers";

export default function RootLayout({ children }) {
return (
<html lang="en" suppressHydrationWarning>
<body>
<Providers>{children}</Providers>
</body>
</html>
);
}