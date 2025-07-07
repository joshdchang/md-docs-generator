import { useEffect, useRef } from "react";
import { marked, type Tokens } from "marked";

interface MarkdownContentProps {
  content: string;
}

// Configure marked with syntax highlighting
marked.setOptions({
  gfm: true,
  breaks: true,
  async: false,
});

// Custom renderer for code blocks
const renderer = new marked.Renderer();

renderer.code = function({ text, lang, escaped }) {
  const id = Math.random().toString(36).substring(2, 9);
  const language = lang || "text";
  const code = escaped ? text : escapeHtml(text);
  
  return `
    <div class="code-block" data-code-id="${id}">
      <div class="relative">
        <pre class="language-${language}"><code class="language-${language}">${code}</code></pre>
        <button 
          class="code-copy-button" 
          data-code="${encodeURIComponent(text)}"
          aria-label="Copy code"
        >
          <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
          </svg>
          <svg class="check-icon hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
      </div>
    </div>
  `;
};

// Add IDs to headings for navigation
renderer.heading = function({ tokens, depth }) {
  const text = this.parser?.parseInline(tokens) || "";
  const id = text.toLowerCase().replace(/[^\w]+/g, '-');
  return `<h${depth} id="${id}">${text}</h${depth}>`;
};

function escapeHtml(text: string) {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    // Handle copy button clicks
    const handleCopyClick = async (e: MouseEvent) => {
      const button = (e.target as HTMLElement).closest('.code-copy-button');
      if (!button) return;

      const code = decodeURIComponent(button.getAttribute('data-code') || '');

      try {
        await navigator.clipboard.writeText(code);
        
        // Toggle icons
        const copyIcon = button.querySelector('.copy-icon');
        const checkIcon = button.querySelector('.check-icon');
        if (copyIcon && checkIcon) {
          copyIcon.classList.add('hidden');
          checkIcon.classList.remove('hidden');
          
          setTimeout(() => {
            copyIcon.classList.remove('hidden');
            checkIcon.classList.add('hidden');
          }, 2000);
        }
      } catch (err) {
        console.error('Failed to copy code:', err);
      }
    };

    contentRef.current.addEventListener('click', handleCopyClick);

    return () => {
      contentRef.current?.removeEventListener('click', handleCopyClick);
    };
  }, []);

  const html = marked(content, { renderer });

  return (
    <div 
      ref={contentRef}
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}