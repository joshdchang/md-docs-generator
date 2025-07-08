import path from "path";

export interface Config {
  contentPath: string;
  title: string;
  logo: string;
  githubUrl: string;
}

const config: Config = {
  contentPath: path.resolve("content.md"),
  title: "Zod",
  logo: /*html */ `<img src="https://raw.githubusercontent.com/colinhacks/zod/main/logo.svg" height="24" width="24" alt="Zod" />`,
  githubUrl: "https://github.com/colinhacks/zod",
};

export default config;
