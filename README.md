# Markdown Documentation Generator

A fast, modern documentation generator that converts markdown files into beautiful, responsive HTML documentation sites.

## Features

- 🚀 **Fast builds** with Bun
- 🎨 **Beautiful UI** with dark/light theme toggle
- 📱 **Mobile responsive** with collapsible sidebar
- 🔍 **Full-text search** functionality
- 📑 **Auto-generated table of contents** from headings
- 🎯 **Syntax highlighting** for code blocks
- 📋 **Copy code** buttons for easy copying
- ⚡ **Hot reload** development server
- 🔗 **Smooth scrolling** to anchor links
- 🏷️ **Auto-generated heading IDs** for deep linking

## Requirements

- [Bun](https://bun.sh) runtime

## Quick Start

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd md-docs-generator
   bun install
   ```

2. **Configure your documentation:**
   Edit `config.ts` to customize your site:
   ```typescript
   const config: Config = {
     contentPath: path.resolve("content.md"),  // Path to your markdown file
     title: "Your Documentation Title",        // Site title
     logo: `<img src="logo.svg" alt="Logo" />`, // HTML for your logo
     githubUrl: "https://github.com/user/repo", // GitHub repository URL
   };
   ```

3. **Add your content:**
   Replace the content in `content.md` with your own markdown documentation.

4. **Start development server:**
   ```bash
   bun run dev
   ```
   Your documentation will be available at `http://localhost:3000` with hot reload.

## Available Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server with hot reload |
| `bun run build` | Build static files for production |
| `bun run start` | Serve built files (production mode) |
| `bun run typecheck` | Run TypeScript type checking |

## Writing Documentation

### Markdown Features

The generator supports all standard markdown features plus:

- **GitHub Flavored Markdown** (tables, task lists, strikethrough, etc.)
- **Syntax highlighting** for code blocks
- **Raw HTML** support when needed
- **Automatic heading IDs** for navigation

### Code Blocks

Code blocks automatically get syntax highlighting and copy buttons:

```typescript
// TypeScript example
interface User {
  name: string;
  email: string;
}
```

### Images and Media

You can use standard markdown image syntax or HTML for more control:

```markdown
![Alt text](https://example.com/image.jpg)

<!-- Or with HTML for more control -->
<img src="https://example.com/image.jpg" alt="Alt text" width="500" />
```

### Theme-Aware Images

For images that should change based on the theme:

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="dark-image.png">
  <img src="light-image.png" alt="Description" />
</picture>
```

## Project Structure

```
md-docs-generator/
├── config.ts          # Site configuration
├── content.md          # Your markdown documentation
├── main.ts            # Frontend JavaScript (theme, search, etc.)
├── styles.css         # Styles for the documentation site
├── generate.ts        # Markdown processing and HTML generation
├── build.ts          # Production build script
├── dev.ts            # Development server with hot reload
├── serve.ts          # Production server
├── public/           # Static assets (copied to dist/)
└── dist/            # Built files (generated)
```

## Configuration Options

### `config.ts`

```typescript
export interface Config {
  contentPath: string;  // Path to your markdown file
  title: string;        // Site title (appears in title bar and header)
  logo: string;         // HTML for logo (can include <img>, <svg>, etc.)
  githubUrl: string;    // GitHub repository URL for the header link
}
```

### Customizing Styles

Edit `styles.css` to customize the appearance. The CSS includes:

- CSS custom properties for easy theming
- Responsive design variables
- Dark/light theme support
- Mobile-first approach

## Development Workflow

1. **Edit your content** in `content.md`
2. **Save the file** - the dev server will automatically rebuild and reload the page
3. **Preview changes** instantly at `http://localhost:3000`

The development server includes:
- **Hot reload** - automatically refreshes when content changes
- **WebSocket connection** - instant updates without manual refresh
- **Error handling** - shows build errors in the console

## Building for Production

1. **Build the site:**
   ```bash
   bun run build
   ```

2. **Serve locally** (optional):
   ```bash
   bun run start
   ```

3. **Deploy the `dist/` folder** to your hosting provider

The build process:
- Processes markdown to HTML
- Bundles and minifies JavaScript/CSS
- Copies static assets from `public/`
- Generates a `dist/` folder with the built files


## Features in Detail

### Table of Contents

Automatically generated from your markdown headings (h1-h6). The TOC:
- Shows heading hierarchy with proper indentation
- Highlights current section while scrolling
- Supports smooth scrolling to sections
- Collapses on mobile after navigation

### Search

Full-text search across all content:
- Searches headings and content
- Highlights matching terms
- Keyboard navigation (↑/↓ arrows, Enter)
- Accessible with proper ARIA labels

### Dark Mode

Intelligent theme handling:
- Respects system preference by default
- Manual toggle available
- Remembers user preference
- URL parameter support (`?theme=dark` or `?theme=light`)
- Maintains scroll position when switching themes

### Mobile Support

Responsive design features:
- Collapsible sidebar navigation
- Touch-friendly interface
- Optimized for small screens
- Proper viewport handling

## Deployment

The built site is a static HTML/CSS/JS application that can be deployed anywhere:

- **Netlify**: Drag and drop the `dist/` folder
- **Vercel**: Connect your repository and set build command to `bun run build`
- **GitHub Pages**: Use the built files in `dist/`
- **Any static hosting**: Upload the contents of `dist/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `bun run dev`
5. Submit a pull request

## License

MIT
