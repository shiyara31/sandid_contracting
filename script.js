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
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });

        // Toggle two-column row wrapper if all cards inside it are hidden
        document.querySelectorAll('.projects-row-two-col').forEach(row => {
          const visibleChildren = Array.from(row.querySelectorAll('.project-card')).filter(c => c.style.display !== 'none');
          row.style.display = visibleChildren.length > 0 ? '' : 'none';
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

  // ======================================================================
  // Studio-Grade 60fps Scroll-Based Frame Canvas Sequence (Desktop: 264 Frames | Mobile: 251 Frames)
  // ======================================================================
  const heroCanvas = document.getElementById('hero-scroll-canvas');
  const heroTrack = document.getElementById('hero-scroll-track');
  const scrollCue = document.getElementById('scroll-cue');

  if (heroCanvas && heroTrack) {
    const DESKTOP_TOTAL_FRAMES = 264;
    const MOBILE_TOTAL_FRAMES = 251;

    const desktopImages = new Array(DESKTOP_TOTAL_FRAMES);
    const mobileImages = new Array(MOBILE_TOTAL_FRAMES);
    const pendingCallbacks = {};

    let isMobile = checkIsMobile();
    let currentFrame = 0;
    let targetFrame = 0;
    let lastRenderedFrame = -1;
    let lastSuccessfullyDrawnFrame = -1;
    const ctx = heroCanvas.getContext('2d', { alpha: false, desynchronized: true }) || heroCanvas.getContext('2d');

    function checkIsMobile() {
      // Use portrait 1080x1920 frames for mobile or any portrait viewport
      return window.innerWidth <= 768 || window.innerHeight > window.innerWidth;
    }

    function getTotalFrames() {
      return isMobile ? MOBILE_TOTAL_FRAMES : DESKTOP_TOTAL_FRAMES;
    }

    function getActiveImages() {
      return isMobile ? mobileImages : desktopImages;
    }

    // Helper to format frame filename with URL encoding (handles spaces)
    function getHeroFrameUrl(index, mobileMode = isMobile) {
      const padded = String(index + 1).padStart(3, '0');
      if (mobileMode) {
        return encodeURI(`mobile view/images/ezgif-frame-${padded}.png`);
      }
      return `public/images/ezgif-frame-${padded}.png`;
    }

    // Ensure Canvas Backing Store Matches Native Display Hardware DPI
    function updateCanvasDimensions() {
      if (!heroCanvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const rect = heroCanvas.getBoundingClientRect();
      const displayWidth = rect.width || window.innerWidth || 390;
      const displayHeight = rect.height || window.innerHeight || 844;

      const physicalWidth = Math.round(displayWidth * dpr);
      const physicalHeight = Math.round(displayHeight * dpr);

      if (heroCanvas.width !== physicalWidth || heroCanvas.height !== physicalHeight) {
        heroCanvas.width = physicalWidth;
        heroCanvas.height = physicalHeight;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }

    updateCanvasDimensions();

    // High-Definition Direct Hardware Cover Drawing Algorithm
    function renderHeroFrame(index) {
      if (!ctx || !heroCanvas) return;

      const totalFrames = getTotalFrames();
      const images = getActiveImages();
      const frameIdx = Math.max(0, Math.min(totalFrames - 1, Math.round(index)));
      const img = images[frameIdx];

      if (img && img.complete && img.naturalWidth > 0) {
        drawCoverImage(img);
        lastSuccessfullyDrawnFrame = frameIdx;
        return;
      }

      // If requested frame isn't loaded yet, request it immediately
      loadSingleFrame(frameIdx, isMobile, (loadedImg) => {
        if (Math.round(currentFrame) === frameIdx) {
          drawCoverImage(loadedImg);
          lastSuccessfullyDrawnFrame = frameIdx;
        }
      });

      // Nearest loaded frame fallback
      let bestImg = null;
      let minDistance = Infinity;

      for (let i = 0; i < totalFrames; i++) {
        const candidate = images[i];
        if (candidate && candidate.complete && candidate.naturalWidth > 0) {
          const dist = Math.abs(i - frameIdx);
          if (dist < minDistance) {
            minDistance = dist;
            bestImg = candidate;
            if (dist === 1) break;
          }
        }
      }

      if (bestImg) {
        drawCoverImage(bestImg);
      }
    }

    function drawCoverImage(img) {
      if (!ctx || !heroCanvas || !img || !img.naturalWidth) return;

      const canvasWidth = heroCanvas.width;
      const canvasHeight = heroCanvas.height;
      if (canvasWidth === 0 || canvasHeight === 0) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;

      // 1:1 hardware pixel cover scaling
      const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
      const drawWidth = imgWidth * scale;
      const drawHeight = imgHeight * scale;
      const offsetX = (canvasWidth - drawWidth) * 0.5;
      const offsetY = (canvasHeight - drawHeight) * 0.5;

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }

    // High-performance image loader with GPU decode
    function loadSingleFrame(index, mobileMode = isMobile, callback) {
      const images = mobileMode ? mobileImages : desktopImages;
      const key = `${mobileMode ? 'm' : 'd'}_${index}`;

      if (images[index] && images[index].complete && images[index].naturalWidth > 0) {
        if (callback) callback(images[index]);
        return images[index];
      }

      if (callback) {
        if (!pendingCallbacks[key]) pendingCallbacks[key] = [];
        pendingCallbacks[key].push(callback);
      }

      if (images[index]) {
        return images[index];
      }

      const img = new Image();
      const url = getHeroFrameUrl(index, mobileMode);
      img.src = url;

      function onFrameLoaded(loadedImg) {
        images[index] = loadedImg;
        const cbs = pendingCallbacks[key];
        if (cbs && cbs.length > 0) {
          delete pendingCallbacks[key];
          cbs.forEach(cb => cb(loadedImg));
        }
        if (Math.round(currentFrame) === index || lastSuccessfullyDrawnFrame === -1) {
          renderHeroFrame(Math.round(currentFrame));
        }
      }

      img.onload = () => {
        if (typeof img.decode === 'function') {
          img.decode().then(() => onFrameLoaded(img)).catch(() => onFrameLoaded(img));
        } else {
          onFrameLoaded(img);
        }
      };

      img.onerror = () => {
        if (mobileMode) {
          const fallbackImg = new Image();
          fallbackImg.src = `public/images/ezgif-frame-${String(index + 1).padStart(3, '0')}.png`;
          fallbackImg.onload = () => onFrameLoaded(fallbackImg);
        }
      };

      images[index] = img;
      return img;
    }

    // 1. Immediately load initial keyframes for instant crystal-clear rendering
    loadSingleFrame(0, isMobile, () => renderHeroFrame(0));
    loadSingleFrame(1, isMobile);

    // 2. High-performance prioritized frame preloading
    function preloadFrames(mobileMode = isMobile) {
      const total = mobileMode ? MOBILE_TOTAL_FRAMES : DESKTOP_TOTAL_FRAMES;
      const images = mobileMode ? mobileImages : desktopImages;

      // Priority A: Load first 25 frames immediately for crisp initial scroll
      for (let i = 0; i < Math.min(25, total); i++) {
        loadSingleFrame(i, mobileMode);
      }

      // Priority B: Load keyframes across entire sequence (every 2nd frame)
      for (let i = 26; i < total; i += 2) {
        loadSingleFrame(i, mobileMode);
      }

      // Priority C: Stream all remaining frames progressively
      let remainingIdx = 0;
      function streamBatch() {
        const batchEnd = Math.min(remainingIdx + 10, total);
        for (; remainingIdx < batchEnd; remainingIdx++) {
          if (!images[remainingIdx]) {
            loadSingleFrame(remainingIdx, mobileMode);
          }
        }
        if (remainingIdx < total) {
          if (typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(streamBatch, { timeout: 80 });
          } else {
            setTimeout(streamBatch, 25);
          }
        }
      }

      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(streamBatch, { timeout: 80 });
      } else {
        setTimeout(streamBatch, 40);
      }
    }

    preloadFrames(isMobile);

    // Responsive Canvas Resize & Mode Switch Handling
    function handleResizeOrOrientation() {
      const newIsMobile = checkIsMobile();
      if (newIsMobile !== isMobile) {
        isMobile = newIsMobile;
        preloadFrames(isMobile);
      }
      updateCanvasDimensions();
      renderHeroFrame(Math.round(currentFrame));
    }

    window.addEventListener('resize', handleResizeOrOrientation, { passive: true });
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResizeOrOrientation, 100);
    }, { passive: true });

    // Calculate current scroll progress and target frame
    function updateScrollProgress() {
      const rect = heroTrack.getBoundingClientRect();
      const maxScroll = heroTrack.offsetHeight - window.innerHeight;

      if (maxScroll > 0) {
        const progress = Math.max(0, Math.min(1, -rect.top / maxScroll));
        const totalFrames = getTotalFrames();
        targetFrame = progress * (totalFrames - 1);

        // Hide or show scroll cue based on scroll progress
        if (scrollCue) {
          if (progress > 0.02) {
            scrollCue.classList.add('is-hidden');
          } else {
            scrollCue.classList.remove('is-hidden');
          }
        }

        // Reveal luxury brand text and overlay elements towards end of scroll
        const endScrollOverlay = document.getElementById('end-scroll-overlay');
        if (endScrollOverlay) {
          if (progress >= 0.72) {
            endScrollOverlay.classList.add('is-visible');
          } else {
            endScrollOverlay.classList.remove('is-visible');
          }
        }
      }
    }

    // Direct scroll and touch listener for instant mobile responsiveness
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('touchmove', updateScrollProgress, { passive: true });

    // Smooth Continuous Scrubbing Animation Loop
    function scrubLoop() {
      updateScrollProgress();

      // Silky smooth inertia interpolation (18% per frame)
      const diff = targetFrame - currentFrame;
      if (Math.abs(diff) > 0.005) {
        currentFrame += diff * 0.18;
        const rounded = Math.round(currentFrame);
        if (rounded !== lastRenderedFrame) {
          renderHeroFrame(rounded);
          lastRenderedFrame = rounded;
        }
      } else if (Math.round(targetFrame) !== lastRenderedFrame) {
        currentFrame = targetFrame;
        renderHeroFrame(Math.round(currentFrame));
        lastRenderedFrame = Math.round(currentFrame);
      }

      requestAnimationFrame(scrubLoop);
    }

    requestAnimationFrame(scrubLoop);
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
    setupAlbum('tula-jbr-card', 'tula-jbr-album-overlay', 'tula-jbr-album-close', 'tula-jbr-album-back'),
    setupAlbum('tula-motor-card', 'tula-motor-album-overlay', 'tula-motor-album-close', 'tula-motor-album-back')
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



