import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { getSession } from "@auth0/nextjs-auth0";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaimeSpace",
  description: "Der interaktive Tutor aus dem digitalen Herzen Thüringens!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const user = session?.user;
  return (
    <html lang="en">
      <UserProvider>
        <body className={inter.className}>
          <div className="flex font">
            <div className="w-16">
              <Navbar />
            </div>
            <main className="flex-1">
              {user && children} {/* This will be the main content area */}
              {!user && (
                <main className="flex min-h-screen flex-col items-center p-24">
                  <a href="/api/auth/login" className="text-blue-500 text-3xl font-bold">
                    Login
                  </a>
                </main>
              )
              }

            </main>
          </div>
        </body>
      </UserProvider>
    </html>
  );
}
