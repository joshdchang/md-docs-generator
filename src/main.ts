// Dark mode toggle functionality
function initDarkMode() {
  const themeToggle = document.getElementById("theme-toggle");
  const html = document.documentElement;

  // Check for saved theme preference or default to light
  const savedTheme = localStorage.getItem("theme") || "light";
  html.classList.toggle("dark", savedTheme === "dark");

  // Update toggle button state
  if (themeToggle) {
    const isCurrentlyDark = savedTheme === "dark";
    themeToggle.setAttribute("aria-pressed", isCurrentlyDark.toString());
  }

  // Toggle theme
  themeToggle?.addEventListener("click", () => {
    const isDark = html.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    themeToggle.setAttribute("aria-pressed", isDark.toString());
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

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initDarkMode();
  initSmoothScroll();
});
