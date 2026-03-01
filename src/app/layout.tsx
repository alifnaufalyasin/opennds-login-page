import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "OpenNDS Login",
  description: "Login page for OpenNDS authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
