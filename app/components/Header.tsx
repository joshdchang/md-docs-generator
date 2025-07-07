import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Search, Sun, Moon, Menu, X, Github } from "lucide-react";

export function Header() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem("theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme as "light" | "dark");
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <>
      {/* Announcement Banner */}
      <div className="banner">
        <p>
          🎉 Version 2.0 is now available!{" "}
          <Link to="/changelog" className="underline font-semibold">
            Read the announcement
          </Link>
        </p>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="layout-container">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            {/* Left section */}
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>

              {/* Logo */}
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                  D
                </div>
                <span className="font-semibold hidden sm:block">
                  Docs Generator
                </span>
              </Link>
            </div>

            {/* Center section - Search */}
            <div className="flex-1 max-w-md mx-4 hidden md:block">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Search documentation...</span>
                <kbd className="ml-auto text-xs bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2">
              {/* Mobile search button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </button>

              {/* GitHub link */}
              <a
                href="https://github.com/yourusername/md-docs-generator"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="fixed inset-x-4 top-20 max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
            <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documentation..."
                className="flex-1 bg-transparent outline-none"
                autoFocus
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Cancel
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                Start typing to search...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm">
          <nav className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-xl">
            {/* Mobile navigation content will be added here */}
            <div className="p-4">
              <p className="text-gray-500">Mobile navigation coming soon...</p>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}