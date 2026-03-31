"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import LoadingScreen from "./LoadingScreen";
import DynamicFonts from "./DynamicFonts";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <DynamicFonts />
      <LoadingScreen />
      <Navbar />
      <main>{children}</main>
    </>
  );
}
