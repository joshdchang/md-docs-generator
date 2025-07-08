import type { Route } from "./+types/home";
import markdown from "~/assets/test.md?raw";
import DocsPage from "~/components/DocsPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Documentation - Home" },
    { name: "description", content: "Modern documentation site generator" },
  ];
}

export default function Home() {
  return (
    <DocsPage
      markdown={markdown}
      title="Zod"
      logo={
        <img
          src="https://raw.githubusercontent.com/colinhacks/zod/main/logo.svg"
          alt="Zod"
          style={{ width: "30px", height: "30px" }}
        />
      }
    />
  );
}
