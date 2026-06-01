import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchDialog } from "@/components/search-command";
import { getCurrentUserFromCookies } from "@/lib/session";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Black Pill",
  icons: {
    icon: "/blackpill.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUserFromCookies();

  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col">
        <div className="min-h-screen relative">
          <div className="relative z-20">
            <Header
              currentUser={
                currentUser
                  ? {
                      steamId64: currentUser.steamId64,
                      username: currentUser.username,
                      steamPersonaName: currentUser.steamPersonaName,
                      steamAvatarUrl: currentUser.steamAvatarUrl,
                      systemRole: currentUser.systemRole,
                    }
                  : null
              }
            />
          </div>
          {children}
          <SearchDialog />
          <div className="absolute bottom-0 left-0 right-0 flex justify-center z-20">
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
