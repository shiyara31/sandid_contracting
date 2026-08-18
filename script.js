document.addEventListener('DOMContentLoaded', () => {
  // Client Logos Infinite Automatic Side Scrolling (Ticker / Marquee)
  const container = document.getElementById('logos-container');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  if (container) {
    // Clone children twice to guarantee seamless infinite scrolling on all screens
    const originalChildren = Array.from(container.children);
    if (originalChildren.length > 0) {
      originalChildren.forEach(child => {
        container.appendChild(child.cloneNode(true));
      });
      originalChildren.forEach(child => {
        container.appendChild(child.cloneNode(true));
      });

      let speed = 0.75; // Smooth px per frame
      let isPaused = false;
      let resumeTimeout = null;

      function stepScroll() {
        if (!isPaused) {
          container.scrollLeft += speed;
          // One third of total scroll width is the exact width of one full set of items
          const singleSetWidth = container.scrollWidth / 3;
          if (container.scrollLeft >= singleSetWidth * 2) {
            container.scrollLeft -= singleSetWidth;
          } else if (container.scrollLeft <= 0) {
            container.scrollLeft += singleSetWidth;
          }
        }
        requestAnimationFrame(stepScroll);
      }

      requestAnimationFrame(stepScroll);

      // Pause on mouse hover for easy viewing
      container.addEventListener('mouseenter', () => { isPaused = true; });
      container.addEventListener('mouseleave', () => { isPaused = false; });

      // Pause on mobile touch, resume automatically after release
      container.addEventListener('touchstart', () => { isPaused = true; }, { passive: true });
      container.addEventListener('touchend', () => {
        clearTimeout(resumeTimeout);
        resumeTimeout = setTimeout(() => { isPaused = false; }, 1500);
      });

      // Manual navigation buttons
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          isPaused = true;
          container.scrollBy({ left: -280, behavior: 'smooth' });
          clearTimeout(resumeTimeout);
          resumeTimeout = setTimeout(() => { isPaused = false; }, 2000);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          isPaused = true;
          container.scrollBy({ left: 280, behavior: 'smooth' });
          clearTimeout(resumeTimeout);
          resumeTimeout = setTimeout(() => { isPaused = false; }, 2000);
        });
      }
    }
  }

  // Smooth scroll for anchor & HOME links on index.html
  document.querySelectorAll('a[href="index.html"], a[href="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      // If already on home page (index.html or root), scroll smoothly to top to replay video
      const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
      const targetId = this.getAttribute('href');

      if (isHomePage && (targetId === 'index.html' || targetId === '#')) {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    });
  });

  // Category Filtering for Projects Page
  const filterTabs = document.querySelectorAll('.filter-tab');
  const projectCards = document.querySelectorAll('.project-card');

  if (filterTabs.length > 0 && projectCards.length > 0) {
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filterValue = tab.getAttribute('data-filter');

        projectCards.forEach(card => {
          const categories = card.getAttribute('data-category') || '';
          if (filterValue === 'all' || categories.includes(filterValue)) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // Contact Form Submission & Toast Notification
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('fullname').value.trim();
      const email = document.getElementById('email').value.trim();
      const subject = document.getElementById('subject').value.trim();
      const message = document.getElementById('message').value.trim();

      if (!name || !email || !subject || !message) {
        showToast('Please fill out all required fields.', 'warning');
        return;
      }

      // Simulate successful message submission
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'SENDING...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        contactForm.reset();
        showToast('Thank you! Your message has been sent successfully.', 'success');
      }, 1000);
    });
  }

  function showToast(msg, type = 'info') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${msg}</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Apple-Style Ultra-Smooth 60fps Canvas WebP Scroll Scrubbing
  const canvas = document.getElementById('dubai-scroll-canvas');
  const videoTrack = document.getElementById('video-scroll-track');
  const videoOverlay = document.getElementById('video-scroll-overlay');
  const fallbackVideo = document.getElementById('dubai-scroll-video');

  if ((canvas || fallbackVideo) && videoTrack) {
    const totalFrames = 240;
    const images = [];
    let loadedCount = 0;
    let currentFrame = 0;
    let targetFrame = 0;
    const ctx = canvas ? canvas.getContext('2d') : null;

    // Helper to format frame filename with 3-digit zero padding
    function getFrameUrl(index) {
      const padded = String(index + 1).padStart(3, '0');
      return `images/drone-frames/frame_${padded}.webp`;
    }

    // Canvas object-fit cover rendering algorithm
    function renderFrame(index) {
      if (!ctx || !canvas) return;

      const img = images[index];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      // Handle retina / high-DPI scaling dynamically
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = canvas.clientWidth || window.innerWidth;
      const displayHeight = canvas.clientHeight || window.innerHeight;

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;

      const imgRatio = imgWidth / imgHeight;
      const canvasRatio = displayWidth / displayHeight;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (canvasRatio > imgRatio) {
        drawWidth = displayWidth;
        drawHeight = displayWidth / imgRatio;
        offsetX = 0;
        offsetY = (displayHeight - drawHeight) / 2;
      } else {
        drawWidth = displayHeight * imgRatio;
        drawHeight = displayHeight;
        offsetX = (displayWidth - drawWidth) / 2;
        offsetY = 0;
      }

      ctx.clearRect(0, 0, displayWidth, displayHeight);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      ctx.restore();
    }

    // Preload image sequence with priority on early frames
    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);
      img.onload = () => {
        loadedCount++;
        if (i === 0) {
          renderFrame(0);
        }
      };
      images.push(img);
    }

    // Resize handler to ensure canvas remains crisp on window resize
    window.addEventListener('resize', () => {
      renderFrame(Math.round(currentFrame));
    });

    const endScrollOverlay = document.getElementById('end-scroll-overlay');

    // Continuous 60fps Smooth Lerp Scroll Scrub Loop
    function smoothScrollLoop() {
      const rect = videoTrack.getBoundingClientRect();
      const maxScroll = videoTrack.offsetHeight - window.innerHeight;

      if (maxScroll > 0) {
        // Scroll progress between 0.0 (top) and 1.0 (bottom)
        const progress = Math.max(0, Math.min(1, -rect.top / maxScroll));
        targetFrame = progress * (totalFrames - 1);

        // Smooth Lerp: 15% interpolation per frame for silky-smooth motion
        const diff = targetFrame - currentFrame;
        if (Math.abs(diff) > 0.01) {
          currentFrame += diff * 0.15;
          renderFrame(Math.round(currentFrame));
        }

        // Scale canvas element subtly during scroll for cinematic depth effect
        const scaleAmount = 1 + (progress * 0.06);
        const targetEl = canvas || fallbackVideo;
        if (targetEl) {
          targetEl.style.transform = `scale(${scaleAmount})`;
        }

        // Reveal luxury end-of-scroll overlay right as drone video completes descent to villa
        if (endScrollOverlay) {
          if (progress > 0.68) {
            endScrollOverlay.classList.add('is-visible');
          } else {
            endScrollOverlay.classList.remove('is-visible');
          }
        }
      }

      requestAnimationFrame(smoothScrollLoop);
    }

    // Start 60fps continuous animation loop
    requestAnimationFrame(smoothScrollLoop);
  }

  // ======================================================================
  // Generic Album + Photo Viewer System
  // ======================================================================
  const photoViewer = document.getElementById('photo-viewer');
  const photoViewerImg = document.getElementById('photo-viewer-img');
  const photoViewerCounter = document.getElementById('photo-viewer-counter');
  const photoViewerClose = document.getElementById('photo-viewer-close');
  const photoViewerBackdrop = document.getElementById('photo-viewer-backdrop');
  const photoViewerPrev = document.getElementById('photo-viewer-prev');
  const photoViewerNext = document.getElementById('photo-viewer-next');

  let activeViewerImages = [];
  let currentViewerIndex = 0;

  function openViewer(images, index) {
    activeViewerImages = images;
    currentViewerIndex = index;
    updateViewer();
    photoViewer.classList.add('is-open');
  }

  function closeViewer() {
    photoViewer.classList.remove('is-open');
  }

  function updateViewer() {
    photoViewerImg.style.opacity = '0';
    setTimeout(() => {
      photoViewerImg.src = activeViewerImages[currentViewerIndex];
      photoViewerImg.style.opacity = '1';
    }, 120);
    photoViewerCounter.textContent = `${currentViewerIndex + 1} / ${activeViewerImages.length}`;
  }

  function nextViewerPhoto() {
    currentViewerIndex = (currentViewerIndex + 1) % activeViewerImages.length;
    updateViewer();
  }

  function prevViewerPhoto() {
    currentViewerIndex = (currentViewerIndex - 1 + activeViewerImages.length) % activeViewerImages.length;
    updateViewer();
  }

  if (photoViewer) {
    photoViewerClose.addEventListener('click', closeViewer);
    photoViewerBackdrop.addEventListener('click', closeViewer);
    photoViewerNext.addEventListener('click', nextViewerPhoto);
    photoViewerPrev.addEventListener('click', prevViewerPhoto);
  }

  // Setup function for any album
  function setupAlbum(cardId, overlayId, closeId, backId) {
    const card = document.getElementById(cardId);
    const overlay = document.getElementById(overlayId);
    const closeBtn = document.getElementById(closeId);
    const backBtn = document.getElementById(backId);
    const photos = overlay ? overlay.querySelectorAll('.album-photo') : [];

    if (!card || !overlay || photos.length === 0) return;

    const images = [];
    photos.forEach(photo => {
      const img = photo.querySelector('img');
      if (img) images.push(img.src);
    });

    function openAlbum() {
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeAlbum() {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    card.addEventListener('click', openAlbum);
    closeBtn.addEventListener('click', closeAlbum);
    backBtn.addEventListener('click', closeAlbum);

    photos.forEach((photo, index) => {
      photo.addEventListener('click', () => openViewer(images, index));
    });

    // Return close function for keyboard handler
    return { overlay, closeAlbum };
  }

  // Setup all albums
  const albums = [
    setupAlbum('hatta-card', 'hatta-album-overlay', 'hatta-album-close', 'hatta-album-back'),
    setupAlbum('padel-cafe-card', 'album-overlay', 'album-close', 'album-back'),
    setupAlbum('tula-springs-card', 'tula-album-overlay', 'tula-album-close', 'tula-album-back'),
    setupAlbum('tula-jbr-card', 'tula-jbr-album-overlay', 'tula-jbr-album-close', 'tula-jbr-album-back')
  ].filter(Boolean);

  // Mobile Navigation Drawer Toggle Handler
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');

  if (mobileMenuToggle && mobileNavDrawer) {
    function toggleMobileMenu(open) {
      const isOpen = typeof open === 'boolean' ? open : !mobileNavDrawer.classList.contains('is-open');
      if (isOpen) {
        mobileMenuToggle.classList.add('is-active');
        mobileMenuToggle.setAttribute('aria-expanded', 'true');
        mobileNavDrawer.classList.add('is-open');
        mobileNavDrawer.setAttribute('aria-hidden', 'false');
      } else {
        mobileMenuToggle.classList.remove('is-active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileNavDrawer.classList.remove('is-open');
        mobileNavDrawer.setAttribute('aria-hidden', 'true');
      }
    }

    mobileMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });

    // Close mobile drawer when clicking any link inside it
    mobileNavDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggleMobileMenu(false);
      });
    });

    // Close mobile drawer on outside click
    document.addEventListener('click', (e) => {
      if (mobileNavDrawer.classList.contains('is-open')) {
        if (!mobileNavDrawer.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
          toggleMobileMenu(false);
        }
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNavDrawer.classList.contains('is-open')) {
        toggleMobileMenu(false);
      }
    });
  }
});



