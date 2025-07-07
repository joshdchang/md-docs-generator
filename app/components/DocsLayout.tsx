import type { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { TableOfContents } from "./TableOfContents";

interface DocsLayoutProps {
  children: ReactNode;
  showToc?: boolean;
}

export function DocsLayout({ children, showToc = true }: DocsLayoutProps) {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="layout-container">
        <div className="flex">
          <Sidebar />
          <main className="flex-1 min-w-0">
            <div className="flex gap-8">
              <article className="flex-1 max-w-4xl mx-auto px-8 py-12 prose prose-gray dark:prose-invert">
                {children}
              </article>
              {showToc && <TableOfContents />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}