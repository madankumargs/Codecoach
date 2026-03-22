// 📚 WHAT IS THIS FILE?
// "Providers" is a client component that wraps your app with context providers.
// NextAuth's SessionProvider makes the current user's session available to 
// every component in your app — so any component can call useSession() to 
// know if the user is logged in.
//
// "use client" means this component runs in the BROWSER, not on the server.
// In Next.js App Router, components are SERVER components by default.
// You only add "use client" when you need browser APIs, event handlers, or hooks.

"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  );
}
