document.addEventListener('DOMContentLoaded', () => {
  // Client Logos Carousel Scrolling
  const container = document.getElementById('logos-container');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  if (container && prevBtn && nextBtn) {
    const scrollAmount = 240;

    prevBtn.addEventListener('click', () => {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth'
          });
        }
      }
    });
  });
});
