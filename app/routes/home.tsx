import type { Route } from "./+types/home";
import { DocsLayout } from "../components/DocsLayout";
import { MarkdownContent } from "../components/MarkdownContent";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Documentation - Home" },
    { name: "description", content: "Modern documentation site generator" },
  ];
}

const introContent = `
# Welcome to Docs Generator

A modern documentation site generator inspired by the best documentation sites like Zod, built with React Router, TypeScript, and Tailwind CSS.

## Features

- **🎨 Beautiful Design** - Clean, modern interface inspired by Zod documentation
- **🌗 Dark Mode** - Built-in theme switching with system preference detection
- **📱 Responsive** - Mobile-first design that works on all devices
- **🔍 Search** - Fast, client-side search (coming soon)
- **⚡ Fast** - Built with Vite and React Router for optimal performance
- **🎯 TypeScript** - Full TypeScript support out of the box
- **📝 Markdown** - Write your docs in Markdown with GFM support

## Getting Started

To get started with the documentation generator, you'll need to:

1. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   \`\`\`

2. **Start the development server**
   \`\`\`bash
   npm run dev
   # or
   pnpm dev
   # or
   yarn dev
   \`\`\`

3. **Build for production**
   \`\`\`bash
   npm run build
   # or
   pnpm build
   # or
   yarn build
   \`\`\`

## Project Structure

\`\`\`
docs-generator/
├── app/
│   ├── components/      # React components
│   ├── routes/          # Route components
│   ├── assets/          # Static assets
│   └── app.css          # Global styles
├── public/              # Public assets
└── package.json         # Dependencies
\`\`\`

## Writing Documentation

Create your documentation files in Markdown format. The generator supports:

- **GitHub Flavored Markdown** - Tables, task lists, strikethrough, and more
- **Code highlighting** - Automatic syntax highlighting for code blocks
- **Table of contents** - Automatically generated from your headings
- **Navigation** - Organize your docs with nested navigation

### Example Markdown

\`\`\`markdown
# My Documentation

This is a paragraph with **bold** and *italic* text.

## Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Features

- Feature one
- Feature two
- Feature three
\`\`\`

## Customization

The documentation generator is fully customizable:

### Themes

Customize colors and styling in \`app/app.css\`:

\`\`\`css
@theme {
  --color-primary-500: #10b981;
  /* Add your custom colors */
}
\`\`\`

### Navigation

Edit the navigation structure in \`app/components/Sidebar.tsx\`:

\`\`\`typescript
const navigation = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/" },
      { title: "Installation", href: "/installation" },
    ]
  }
];
\`\`\`

## Deployment

The documentation site can be deployed to any static hosting service:

- **Vercel** - Zero-config deployment
- **Netlify** - Drag and drop deployment
- **GitHub Pages** - Free hosting for open source
- **Cloudflare Pages** - Fast global CDN

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT License - feel free to use this for your own documentation sites!
`;

export default function Home() {
  return (
    <DocsLayout>
      <MarkdownContent content={introContent} />
    </DocsLayout>
  );
}
