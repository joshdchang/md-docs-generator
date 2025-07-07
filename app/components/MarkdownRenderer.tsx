import React, { type JSX } from "react";
import type { Token, Tokens } from "marked";

interface MarkdownRendererProps {
  tokens: Token[];
}

export function MarkdownRenderer({ tokens }: MarkdownRendererProps) {
  return <>{tokens.map((token, index) => renderToken(token, index))}</>;
}

function renderToken(token: Token, key: number): React.ReactNode {
  switch (token.type) {
    case "heading":
      return renderHeading(token as Tokens.Heading, key);
    case "paragraph":
      return renderParagraph(token as Tokens.Paragraph, key);
    case "list":
      return renderList(token as Tokens.List, key);
    case "blockquote":
      return renderBlockquote(token as Tokens.Blockquote, key);
    case "code":
      return renderCode(token as Tokens.Code, key);
    case "html":
      return renderHTML(token as Tokens.HTML, key);
    case "hr":
      return renderHr(token as Tokens.Hr, key);
    case "table":
      return renderTable(token as Tokens.Table, key);
    case "space":
      return null; // Space tokens don't render anything
    default:
      // For any unhandled token types, render as text
      if ("text" in token) {
        return <span key={key}>{(token as any).text}</span>;
      }
      return null;
  }
}

function renderHeading(token: Tokens.Heading, key: number): React.ReactNode {
  const Tag = `h${token.depth}` as keyof JSX.IntrinsicElements;
  return <Tag key={key}>{renderInlineTokens(token.tokens)}</Tag>;
}

function renderParagraph(token: Tokens.Paragraph, key: number): React.ReactNode {
  return <p key={key}>{renderInlineTokens(token.tokens)}</p>;
}

function renderList(token: Tokens.List, key: number): React.ReactNode {
  const Tag = token.ordered ? "ol" : "ul";
  const props: any = {};
  if (token.ordered && token.start !== 1) {
    props.start = token.start;
  }
  
  return (
    <Tag key={key} {...props}>
      {token.items.map((item, index) => renderListItem(item, `${key}-${index}`))}
    </Tag>
  );
}

function renderListItem(item: Tokens.ListItem, key: string): React.ReactNode {
  const content = renderInlineTokens(item.tokens);
  
  if (item.task) {
    return (
      <li key={key}>
        <input type="checkbox" checked={item.checked} disabled />
        {" "}
        {content}
      </li>
    );
  }
  
  return <li key={key}>{content}</li>;
}

function renderBlockquote(token: Tokens.Blockquote, key: number): React.ReactNode {
  return (
    <blockquote key={key}>
      {token.tokens.map((t, index) => renderToken(t, index))}
    </blockquote>
  );
}

function renderCode(token: Tokens.Code, key: number): React.ReactNode {
  return (
    <pre key={key}>
      <code className={token.lang ? `language-${token.lang}` : undefined}>
        {token.text}
      </code>
    </pre>
  );
}

function renderHTML(token: Tokens.HTML, key: number): React.ReactNode {
  // For security, we'll render HTML as text by default
  // In production, you might want to use a sanitizer like DOMPurify
  return <div key={key} dangerouslySetInnerHTML={{ __html: token.text }} />;
}

function renderHr(token: Tokens.Hr, key: number): React.ReactNode {
  return <hr key={key} />;
}

function renderTable(token: Tokens.Table, key: number): React.ReactNode {
  return (
    <table key={key}>
      <thead>
        <tr>
          {token.header.map((cell, index) => (
            <th key={index} align={cell.align || undefined}>
              {renderInlineTokens(cell.tokens)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {token.rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} align={cell.align || undefined}>
                {renderInlineTokens(cell.tokens)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function renderInlineTokens(tokens: Token[]): React.ReactNode {
  return tokens.map((token, index) => renderInlineToken(token, index));
}

function renderInlineToken(token: Token, key: number): React.ReactNode {
  switch (token.type) {
    case "text":
      return renderText(token as Tokens.Text, key);
    case "strong":
      return renderStrong(token as Tokens.Strong, key);
    case "em":
      return renderEm(token as Tokens.Em, key);
    case "codespan":
      return renderCodespan(token as Tokens.Codespan, key);
    case "br":
      return renderBr(token as Tokens.Br, key);
    case "del":
      return renderDel(token as Tokens.Del, key);
    case "link":
      return renderLink(token as Tokens.Link, key);
    case "image":
      return renderImage(token as Tokens.Image, key);
    case "escape":
      return renderEscape(token as Tokens.Escape, key);
    default:
      // For block tokens that might appear inline, render them appropriately
      return renderToken(token, key);
  }
}

function renderText(token: Tokens.Text, key: number): React.ReactNode {
  if (token.tokens) {
    return <span key={key}>{renderInlineTokens(token.tokens)}</span>;
  }
  return token.text;
}

function renderStrong(token: Tokens.Strong, key: number): React.ReactNode {
  return <strong key={key}>{renderInlineTokens(token.tokens)}</strong>;
}

function renderEm(token: Tokens.Em, key: number): React.ReactNode {
  return <em key={key}>{renderInlineTokens(token.tokens)}</em>;
}

function renderCodespan(token: Tokens.Codespan, key: number): React.ReactNode {
  return <code key={key}>{token.text}</code>;
}

function renderBr(token: Tokens.Br, key: number): React.ReactNode {
  return <br key={key} />;
}

function renderDel(token: Tokens.Del, key: number): React.ReactNode {
  return <del key={key}>{renderInlineTokens(token.tokens)}</del>;
}

function renderLink(token: Tokens.Link, key: number): React.ReactNode {
  return (
    <a key={key} href={token.href} title={token.title || undefined}>
      {renderInlineTokens(token.tokens)}
    </a>
  );
}

function renderImage(token: Tokens.Image, key: number): React.ReactNode {
  return (
    <img
      key={key}
      src={token.href}
      alt={token.text}
      title={token.title || undefined}
    />
  );
}

function renderEscape(token: Tokens.Escape, key: number): React.ReactNode {
  return token.text;
}