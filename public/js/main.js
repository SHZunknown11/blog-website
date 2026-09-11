document.addEventListener('DOMContentLoaded', () => {
  const ta = document.getElementById('postBody');
  const chars = document.getElementById('chars');

  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  // mobile nav hamburger toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', (e) => {
      if (!navLinks.classList.contains('open')) return;
      if (navLinks.contains(e.target) || navToggle.contains(e.target)) return;
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  }

  function autosize(el) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  function updateCount() {
    if (!ta || !chars) return;

    const len = ta.value.length;
    chars.textContent = String(len);
    chars.style.color = len > 500 ? 'crimson' : '';
  }

  if (ta) {
    autosize(ta);
    ta.addEventListener('input', () => {
      autosize(ta);
      updateCount();
    });
  }

  if (chars && ta) {
    updateCount();
  }
});
