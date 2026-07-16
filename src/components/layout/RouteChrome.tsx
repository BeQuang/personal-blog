"use client";

import { usePathname } from "next/navigation";

interface RouteChromeProps {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
}

export function RouteChrome({ children, header, footer }: RouteChromeProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminRoute) {
    return <main id="main-content">{children}</main>;
  }

  return (
    <div className="site-shell">
      {header}
      <main id="main-content" className="flex min-w-0 flex-1 flex-col">
        {children}
      </main>
      {footer}
    </div>
  );
}
