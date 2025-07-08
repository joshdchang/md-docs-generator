import "./styles.css";

// Get theme from URL or localStorage
function getTheme(): string {
  const urlParams = new URLSearchParams(window.location.search);
  const urlTheme = urlParams.get("theme");
  
  if (urlTheme === "dark" || urlTheme === "light") {
    // Save URL theme to localStorage
    localStorage.setItem("theme", urlTheme);
    return urlTheme;
  }
  
  // Fall back to localStorage
  return localStorage.getItem("theme") || "light";
}

// Override picture element media queries for custom dark mode
function overridePictureElements(isDark: boolean) {
  const pictures = document.querySelectorAll("picture");
  
  pictures.forEach((picture) => {
    const sources = picture.querySelectorAll("source");
    
    sources.forEach((source) => {
      const media = source.getAttribute("media");
      
      if (media?.includes("prefers-color-scheme")) {
        // Store original media query if not already stored
        if (!source.hasAttribute("data-original-media")) {
          source.setAttribute("data-original-media", media);
        }
        
        const originalMedia = source.getAttribute("data-original-media");
        
        if (originalMedia?.includes("prefers-color-scheme: dark")) {
          // Show dark variant when our custom dark mode is active
          source.setAttribute("media", isDark ? "all" : "none");
        } else if (originalMedia?.includes("prefers-color-scheme: light")) {
          // Show light variant when our custom dark mode is NOT active
          source.setAttribute("media", !isDark ? "all" : "none");
        }
      }
    });
  });
}

// Dark mode toggle functionality
function initDarkMode() {
  const themeToggle = document.getElementById("theme-toggle");
  const html = document.documentElement;

  // Get theme and apply it
  const currentTheme = getTheme();
  const isCurrentlyDark = currentTheme === "dark";
  html.classList.toggle("dark", isCurrentlyDark);
  
  // Override picture elements to use our custom dark mode
  overridePictureElements(isCurrentlyDark);

  // Update toggle button state
  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", isCurrentlyDark.toString());
    themeToggle.classList.toggle("dark", isCurrentlyDark);
  }

  // Toggle theme
  themeToggle?.addEventListener("click", () => {
    const newTheme = isCurrentlyDark ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    
    // Save current scroll position
    sessionStorage.setItem("theme-switch-scroll", window.scrollY.toString());
    
    // Update URL with new theme
    const url = new URL(window.location.href);
    url.searchParams.set("theme", newTheme);
    
    // Navigate to new URL
    window.location.href = url.toString();
  });
}

// Smooth scrolling for anchor links
function initSmoothScroll() {
  const offset = 80; // Offset for fixed header

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    // Check if clicked element is an anchor link
    if (
      target.tagName === "A" &&
      target.getAttribute("href")?.startsWith("#")
    ) {
      e.preventDefault();

      const targetId = target.getAttribute("href")!.slice(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const targetPosition = targetElement.offsetTop - offset;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });

        // Close mobile sidebar if open
        const sidebarToggle = document.getElementById(
          "sidebar-toggle"
        ) as HTMLInputElement;
        if (sidebarToggle?.checked) {
          sidebarToggle.checked = false;
        }

        // Update URL
        history.pushState(null, "", `#${targetId}`);
      }
    }
  });
}

// Copy code functionality
function initCopyCode() {
  const copyButtons = document.querySelectorAll(".copy-button");
  
  copyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const codeBlock = button.parentElement?.querySelector("pre code");
      if (!codeBlock) return;
      
      try {
        // Get the text content from the code block
        const text = codeBlock.textContent || "";
        
        // Copy to clipboard
        await navigator.clipboard.writeText(text);
        
        // Update button state
        button.setAttribute("data-copied", "true");
        
        // Reset after 2 seconds
        setTimeout(() => {
          button.setAttribute("data-copied", "false");
        }, 2000);
      } catch (err) {
        console.error("Failed to copy code:", err);
      }
    });
  });
}

// Restore scroll position after theme switch
function restoreScrollPosition() {
  const savedScroll = sessionStorage.getItem("theme-switch-scroll");
  if (savedScroll) {
    // Temporarily disable smooth scrolling
    const html = document.documentElement;
    const originalScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    
    // Instantly jump to saved position
    window.scrollTo(0, parseInt(savedScroll, 10));
    
    // Clear the saved position
    sessionStorage.removeItem("theme-switch-scroll");
    
    // Re-enable smooth scrolling after a small delay
    requestAnimationFrame(() => {
      html.style.scrollBehavior = originalScrollBehavior;
    });
  }
}

// Update URL hash based on scroll position
function initScrollSpy() {
  let ticking = false;
  
  function updateHashOnScroll() {
    const scrollPosition = window.scrollY;
    const offset = 100; // Offset for header
    
    // Find all headings with IDs
    const headings = document.querySelectorAll("h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]");
    let currentHeading = null;
    
    // Find the current heading based on scroll position
    for (let i = headings.length - 1; i >= 0; i--) {
      const heading = headings[i] as HTMLElement;
      const headingTop = heading.offsetTop;
      
      if (scrollPosition >= headingTop - offset) {
        currentHeading = heading;
        break;
      }
    }
    
    // Update URL hash if we found a heading
    if (currentHeading && currentHeading.id) {
      const currentHash = window.location.hash.slice(1);
      if (currentHash !== currentHeading.id) {
        // Use replaceState to avoid adding to browser history
        history.replaceState(null, "", `#${currentHeading.id}`);
      }
    } else if (scrollPosition < 100) {
      // Clear hash when at the top of the page
      if (window.location.hash) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
    
    ticking = false;
  }
  
  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updateHashOnScroll);
      ticking = true;
    }
  }
  
  // Throttle scroll events using requestAnimationFrame
  window.addEventListener("scroll", requestTick, { passive: true });
}

// Search functionality
interface SearchIndex {
  sections: SearchSection[];
}

interface SearchSection {
  id: string;
  title: string;
  content: string;
  level: number;
}

let searchIndex: SearchIndex = { sections: [] };
let selectedResultIndex = -1;

function buildSearchIndex() {
  const sections: SearchSection[] = [];
  
  // Get all headings and their associated content
  const headings = document.querySelectorAll("h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]");
  
  headings.forEach((heading, index) => {
    const id = heading.id;
    const title = heading.textContent || "";
    const level = parseInt(heading.tagName[1]);
    
    // Collect content until the next heading
    let content = "";
    let currentElement = heading.nextElementSibling;
    const nextHeading = index < headings.length - 1 ? headings[index + 1] : null;
    
    while (currentElement && currentElement !== nextHeading) {
      // Skip navigation elements
      if (!currentElement.closest('.nav') && !currentElement.closest('.sidebar')) {
        content += " " + (currentElement.textContent || "");
      }
      currentElement = currentElement.nextElementSibling;
    }
    
    sections.push({
      id,
      title: title.trim(),
      content: content.trim().toLowerCase(),
      level
    });
  });
  
  searchIndex = { sections };
}

function searchContent(query: string): SearchSection[] {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  const words = normalizedQuery.split(/\s+/);
  
  const results = searchIndex.sections
    .map(section => {
      const titleMatch = section.title.toLowerCase().includes(normalizedQuery);
      const contentMatch = section.content.includes(normalizedQuery);
      
      // Calculate relevance score
      let score = 0;
      if (titleMatch) score += 10;
      if (contentMatch) score += 1;
      
      // Boost score for all words matching
      const allWordsMatch = words.every(word => 
        section.title.toLowerCase().includes(word) || 
        section.content.includes(word)
      );
      if (allWordsMatch) score += 5;
      
      // Extract content snippet around the match
      let snippet = "";
      if (contentMatch) {
        const index = section.content.indexOf(normalizedQuery);
        const start = Math.max(0, index - 60);
        const end = Math.min(section.content.length, index + normalizedQuery.length + 60);
        snippet = section.content.slice(start, end);
        
        if (start > 0) snippet = "..." + snippet;
        if (end < section.content.length) snippet = snippet + "...";
      }
      
      return {
        section,
        score,
        snippet
      };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // Limit to top 10 results
  
  return results.map(r => ({ ...r.section, snippet: r.snippet } as any));
}

function highlightText(text: string, query: string): string {
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

function renderSearchResults(results: any[], query: string) {
  const container = document.getElementById("search-results");
  if (!container) return;
  
  if (results.length === 0 && query.length >= 2) {
    container.innerHTML = `
      <div class="searchEmpty">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.5">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.3-4.3"></path>
        </svg>
        <p>No results found for "${query}"</p>
      </div>
    `;
    return;
  }
  
  if (results.length === 0) {
    container.innerHTML = `
      <div class="searchEmpty">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.5">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.3-4.3"></path>
        </svg>
        <p>Start typing to search</p>
      </div>
    `;
    return;
  }
  
  const html = results.map((result, index) => {
    const levelText = `H${result.level}`;
    return `
      <a href="#${result.id}" class="searchResultItem ${index === selectedResultIndex ? 'selected' : ''}" data-index="${index}">
        <div class="searchResultTitle">
          <span>${highlightText(result.title, query)}</span>
          <span class="searchResultSection">${levelText}</span>
        </div>
        ${result.snippet ? `
          <div class="searchResultContent">
            ${highlightText(result.snippet, query)}
          </div>
        ` : ''}
      </a>
    `;
  }).join('');
  
  container.innerHTML = html;
}

function initSearch() {
  buildSearchIndex();
  
  const overlay = document.getElementById("search-overlay");
  const input = document.getElementById("search-input") as HTMLInputElement;
  const searchButtons = document.querySelectorAll(".searchButton, .iconButton[aria-label='Open Search']");
  const closeButton = document.querySelector(".searchClose");
  
  if (!overlay || !input) return;
  
  // Open search
  function openSearch() {
    if (!overlay) return;
    overlay.classList.add("active");
    input.value = "";
    input.focus();
    selectedResultIndex = -1;
    renderSearchResults([], "");
    document.body.style.overflow = "hidden";
  }
  
  // Close search
  function closeSearch() {
    if (!overlay) return;
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }
  
  // Search event listeners
  searchButtons.forEach(button => {
    button.addEventListener("click", openSearch);
  });
  
  closeButton?.addEventListener("click", closeSearch);
  
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeSearch();
  });
  
  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Cmd/Ctrl + K to open search
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      openSearch();
    }
    
    // Escape to close
    if (e.key === "Escape" && overlay.classList.contains("active")) {
      closeSearch();
    }
  });
  
  // Search input handling
  let searchTimeout: number;
  input.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = window.setTimeout(() => {
      const query = input.value;
      const results = searchContent(query);
      selectedResultIndex = -1;
      renderSearchResults(results, query);
    }, 150);
  });
  
  // Keyboard navigation
  input.addEventListener("keydown", (e) => {
    const results = document.querySelectorAll(".searchResultItem");
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedResultIndex = Math.min(selectedResultIndex + 1, results.length - 1);
      updateSelectedResult(results);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedResultIndex = Math.max(selectedResultIndex - 1, -1);
      updateSelectedResult(results);
    } else if (e.key === "Enter" && selectedResultIndex >= 0) {
      e.preventDefault();
      const selectedResult = results[selectedResultIndex] as HTMLAnchorElement;
      if (selectedResult) {
        closeSearch();
        window.location.href = selectedResult.href;
      }
    }
  });
  
  // Update selected result visual state
  function updateSelectedResult(results: NodeListOf<Element>) {
    results.forEach((result, index) => {
      if (index === selectedResultIndex) {
        result.classList.add("selected");
        result.scrollIntoView({ block: "nearest" });
      } else {
        result.classList.remove("selected");
      }
    });
  }
  
  // Handle result clicks
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const resultItem = target.closest(".searchResultItem");
    
    if (resultItem) {
      closeSearch();
    }
  });
}

// Add link buttons to headings
function initHeadingLinks() {
  const headings = document.querySelectorAll(".markdown h1[id], .markdown h2[id], .markdown h3[id], .markdown h4[id], .markdown h5[id], .markdown h6[id]");
  
  headings.forEach(heading => {
    // Create link button
    const button = document.createElement("button");
    button.className = "headingLink";
    button.setAttribute("aria-label", "Copy link to this section");
    button.setAttribute("data-copied", "false");
    
    // Add link and check icons
    button.innerHTML = `
      <svg class="link-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
      </svg>
      <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;
    
    // Add click handler
    button.addEventListener("click", async (e) => {
      e.preventDefault();
      
      // Build the full URL with hash
      const url = new URL(window.location.href);
      url.hash = heading.id;
      
      try {
        await navigator.clipboard.writeText(url.toString());
        
        // Show success state
        button.setAttribute("data-copied", "true");
        
        // Reset after 2 seconds
        setTimeout(() => {
          button.setAttribute("data-copied", "false");
        }, 2000);
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    });
    
    // Append button at the end of heading
    heading.appendChild(button);
  });
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initDarkMode();
  restoreScrollPosition();
  initSmoothScroll();
  initCopyCode();
  initScrollSpy();
  initSearch();
  initHeadingLinks();
});
