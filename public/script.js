// Dark mode toggle functionality
(function() {
  // Get saved theme or default to light
  const savedTheme = localStorage.getItem('theme') || 'light';
  const root = document.documentElement;
  
  // Apply saved theme
  if (savedTheme === 'dark') {
    root.classList.add('dark');
  }
  
  // Set up theme toggle button
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    // Update button state
    if (savedTheme === 'dark') {
      themeToggle.classList.add('dark');
    }
    
    // Handle clicks
    themeToggle.addEventListener('click', function() {
      const isDark = root.classList.contains('dark');
      
      if (isDark) {
        root.classList.remove('dark');
        themeToggle.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      } else {
        root.classList.add('dark');
        themeToggle.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      }
    });
  }
  
  // Handle smooth scrolling for anchor links
  document.addEventListener('click', function(e) {
    // Check if clicked element is an anchor link
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    
    e.preventDefault();
    
    const targetId = link.getAttribute('href').slice(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      // Close mobile sidebar if open
      const sidebarToggle = document.getElementById('sidebar-toggle');
      if (sidebarToggle && sidebarToggle.checked) {
        sidebarToggle.checked = false;
      }
      
      // Scroll to element with offset
      const offset = 80; // Header height + padding
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
})();