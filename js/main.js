// =========================================================
// main.js
// Two independent, dependency-free widgets:
//   1. Mobile nav toggle (hamburger menu)
//   2. Image carousel (replaces the old Bootstrap-only markup,
//      which never worked because Bootstrap's JS/CSS was never
//      actually loaded on the page)
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    initNavToggle();
    document.querySelectorAll('.carousel').forEach(initCarousel);
});

/* ---------------------------------------------------------
   Mobile nav toggle
--------------------------------------------------------- */
function initNavToggle() {
    const toggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close the menu after a link is tapped
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
}

/* ---------------------------------------------------------
   Carousel
   Works on any element matching:
   <div class="carousel">
     <div class="carousel-inner">
       <div class="carousel-item">...</div>
       ...
     </div>
     <ol class="carousel-indicators">...</ol>          (optional)
     <button class="carousel-control-prev">...</button> (optional)
     <button class="carousel-control-next">...</button> (optional)
   </div>
--------------------------------------------------------- */
function initCarousel(root) {
    const items = Array.from(root.querySelectorAll('.carousel-item'));
    if (items.length === 0) return;

    const indicators = Array.from(root.querySelectorAll('.carousel-indicators [data-slide-to]'));
    const prevBtn = root.querySelector('.carousel-control-prev');
    const nextBtn = root.querySelector('.carousel-control-next');
    const inner = root.querySelector('.carousel-inner');

    const AUTOPLAY_MS = 5000;
    let current = Math.max(items.findIndex(el => el.classList.contains('active')), 0);
    let autoplayId = null;

    function show(index) {
        current = (index + items.length) % items.length;

        items.forEach((item, i) => {
            item.classList.toggle('active', i === current);
            item.setAttribute('aria-hidden', i === current ? 'false' : 'true');
        });

        indicators.forEach((dot, i) => {
            dot.classList.toggle('active', i === current);
        });
    }

    function next() { show(current + 1); }
    function prev() { show(current - 1); }

    function startAutoplay() {
        stopAutoplay();
        autoplayId = window.setInterval(next, AUTOPLAY_MS);
    }

    function stopAutoplay() {
        if (autoplayId) {
            window.clearInterval(autoplayId);
            autoplayId = null;
        }
    }

    // Controls
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAutoplay(); });

    indicators.forEach((dot, i) => {
        dot.addEventListener('click', () => { show(i); startAutoplay(); });
    });

    // Keyboard support when the carousel has focus
    root.setAttribute('tabindex', '0');
    root.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { next(); startAutoplay(); }
        if (e.key === 'ArrowLeft') { prev(); startAutoplay(); }
    });

    // Touch swipe support for mobile
    let touchStartX = 0;
    if (inner) {
        inner.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].clientX;
        }, { passive: true });

        inner.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(dx) > 40) {
                dx < 0 ? next() : prev();
                startAutoplay();
            }
        }, { passive: true });
    }

    // Pause on hover/focus so people can actually read a slide
    root.addEventListener('mouseenter', stopAutoplay);
    root.addEventListener('mouseleave', startAutoplay);
    root.addEventListener('focusin', stopAutoplay);
    root.addEventListener('focusout', startAutoplay);

    // Respect reduced-motion preference: no autoplay, manual control only
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    show(current);
    if (!prefersReducedMotion) startAutoplay();
}
