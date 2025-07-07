import { Link, useLocation } from "react-router";
import { useState } from "react";
import { ChevronRight, Home, FileText, Book, Code2, Layers, Package } from "lucide-react";

interface NavItem {
  title: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  items?: NavItem[];
  isSection?: boolean;
  badge?: string;
}

const navigation: NavItem[] = [
  {
    title: "Getting Started",
    isSection: true,
  },
  {
    title: "Introduction",
    href: "/",
    icon: Home,
  },
  {
    title: "Installation",
    href: "/installation",
    icon: Package,
  },
  {
    title: "Quick Start",
    href: "/quick-start",
    icon: FileText,
  },
  {
    title: "Core Concepts",
    isSection: true,
  },
  {
    title: "Schemas",
    icon: Book,
    items: [
      { title: "Basic Types", href: "/schemas/basic-types" },
      { title: "Objects", href: "/schemas/objects" },
      { title: "Arrays", href: "/schemas/arrays" },
      { title: "Unions", href: "/schemas/unions" },
      { title: "Custom Types", href: "/schemas/custom", badge: "New" },
    ],
  },
  {
    title: "Validation",
    icon: Code2,
    items: [
      { title: "Basic Validation", href: "/validation/basic" },
      { title: "Error Handling", href: "/validation/errors" },
      { title: "Custom Rules", href: "/validation/custom" },
      { title: "Async Validation", href: "/validation/async" },
    ],
  },
  {
    title: "Advanced",
    isSection: true,
  },
  {
    title: "Type Inference",
    href: "/type-inference",
    icon: Layers,
  },
  {
    title: "Transformations",
    href: "/transformations",
    icon: Code2,
  },
  {
    title: "API Reference",
    href: "/api",
    icon: Book,
  },
];

export function Sidebar() {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (title: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedItems(newExpanded);
  };

  const isActive = (href: string) => location.pathname === href;

  const renderNavItem = (item: NavItem, depth = 0) => {
    if (item.isSection) {
      return (
        <div key={item.title} className="sidebar-section">
          <h3 className="sidebar-title">{item.title}</h3>
        </div>
      );
    }

    if (item.items) {
      const isExpanded = expandedItems.has(item.title);
      const hasActiveChild = item.items.some(child => child.href && isActive(child.href));

      return (
        <div key={item.title} className="mb-1">
          <button
            onClick={() => toggleExpanded(item.title)}
            className={`nav-link w-full justify-between ${hasActiveChild ? 'text-primary-600 dark:text-primary-400' : ''}`}
          >
            <div className="flex items-center gap-2">
              {item.icon && <item.icon className="w-4 h-4" />}
              <span>{item.title}</span>
            </div>
            <ChevronRight
              className={`w-4 h-4 transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`}
            />
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-0.5">
              {item.items.map(child => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    if (item.href) {
      return (
        <Link
          key={item.title}
          to={item.href}
          className={`nav-link ${isActive(item.href) ? 'nav-link-active' : ''} ${
            depth > 0 ? 'pl-6' : ''
          }`}
        >
          {item.icon && <item.icon className="w-4 h-4" />}
          <span className="flex-1">{item.title}</span>
          {item.badge && (
            <span className="text-xs px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded">
              {item.badge}
            </span>
          )}
        </Link>
      );
    }

    return null;
  };

  return (
    <aside className="hidden lg:block w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 h-screen sticky top-0 overflow-y-auto">
      <div className="p-4">
        <Link to="/" className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            D
          </div>
          <span className="font-semibold text-lg">Docs Generator</span>
        </Link>
        
        <nav className="space-y-0.5">
          {navigation.map(item => renderNavItem(item))}
        </nav>
      </div>
    </aside>
  );
}