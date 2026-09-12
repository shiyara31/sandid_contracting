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
  // High-Performance Scroll-Driven Frame Animation Engine (Desktop & Mobile)
  // ======================================================================
  const heroTrack = document.getElementById('hero-scroll-track');
  const heroCanvas = document.getElementById('hero-scroll-canvas');
  const scrollCue = document.getElementById('scroll-cue');
  const endScrollOverlay = document.getElementById('end-scroll-overlay');

  if (heroTrack && heroCanvas) {
    class ScrollFramePlayer {
      constructor(options) {
        this.track = options.track;
        this.canvas = options.canvas;
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.scrollCue = options.scrollCue;
        this.endScrollOverlay = options.endScrollOverlay;

        // Desktop Configuration (264 frames, 3840x2160)
        this.desktopConfig = {
          folder: 'public/images/',
          prefix: 'frame-',
          ext: '.jpg',
          digits: 4,
          totalFrames: 264,
          nativeWidth: 3840,
          nativeHeight: 2160
        };

        // Mobile Configuration (201 frames, 1080x1920)
        this.mobileConfig = {
          folder: 'mobile%20view/images/',
          prefix: 'frame-',
          ext: '.jpg',
          digits: 4,
          totalFrames: 201,
          nativeWidth: 1080,
          nativeHeight: 1920
        };

        this.hasMobileFrames = true; // Mobile frames verified in mobile view/images/
        this.isMobile = this.checkIsMobile();
        this.activeConfig = this.isMobile ? this.mobileConfig : this.desktopConfig;

        this.frames = [];
        this.lastRenderedIndex = -1;
        this.currentProgress = 0;
        this.targetIndex = 0;
        this.ticking = false;
        this.bgPreloadTimer = null;
        this.bgPreloadIndex = 0;

        this.init();
      }

      checkIsMobile() {
        return window.innerWidth <= 768 || window.matchMedia('(max-width: 768px)').matches;
      }

      init() {
        this.selectActiveConfiguration();
        this.setupCanvasDimensions();
        this.initFrameCache();
        this.bindEvents();

        // Immediately load Frame 1 and render
        this.loadFrame(0, true, () => {
          this.drawFrame(0);
          this.updateScroll();
          this.startBackgroundPreload();
        });

        // Trigger initial scroll update
        this.updateScroll();
      }

      selectActiveConfiguration() {
        this.isMobile = this.checkIsMobile();
        this.activeConfig = (this.isMobile && this.hasMobileFrames) ? this.mobileConfig : this.desktopConfig;
      }

      getFrameUrl(index) {
        const frameNumber = String(index + 1).padStart(this.activeConfig.digits, '0');
        return `${this.activeConfig.folder}${this.activeConfig.prefix}${frameNumber}${this.activeConfig.ext}`;
      }

      initFrameCache() {
        this.frames = new Array(this.activeConfig.totalFrames);
        for (let i = 0; i < this.activeConfig.totalFrames; i++) {
          this.frames[i] = {
            img: null,
            loaded: false,
            loading: false
          };
        }
        this.bgPreloadIndex = 0;
      }

      setupCanvasDimensions() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = rect.width || window.innerWidth;
        const height = rect.height || window.innerHeight;

        this.canvas.width = Math.round(width * dpr);
        this.canvas.height = Math.round(height * dpr);

        if (this.ctx) {
          this.ctx.imageSmoothingEnabled = true;
          this.ctx.imageSmoothingQuality = 'high';
        }
      }

      loadFrame(index, highPriority = false, callback = null) {
        if (index < 0 || index >= this.activeConfig.totalFrames) return;
        const item = this.frames[index];
        if (!item) return;

        if (item.loaded) {
          if (callback) callback(item.img);
          return;
        }

        if (item.loading) {
          if (callback) {
            const prevOnload = item.img.onload;
            item.img.onload = () => {
              if (prevOnload) prevOnload();
              callback(item.img);
            };
          }
          return;
        }

        item.loading = true;
        const img = new Image();
        img.decoding = 'async';

        img.onload = () => {
          item.loaded = true;
          item.loading = false;
          item.img = img;

          if (callback) callback(img);

          // If this is the current target frame or closer to target than what was rendered, redraw
          if (index === this.targetIndex || Math.abs(index - this.targetIndex) <= Math.abs(this.lastRenderedIndex - this.targetIndex)) {
            this.requestRender();
          }
        };

        img.onerror = () => {
          item.loading = false;
          // Retry with unencoded space if needed
          if (this.activeConfig.folder.includes('%20')) {
            const fallbackImg = new Image();
            fallbackImg.decoding = 'async';
            fallbackImg.onload = () => {
              this.activeConfig.folder = 'mobile view/images/';
              item.loaded = true;
              item.loading = false;
              item.img = fallbackImg;
              if (callback) callback(fallbackImg);
              this.requestRender();
            };
            fallbackImg.onerror = () => { item.loading = false; };
            fallbackImg.src = `mobile view/images/${this.activeConfig.prefix}${String(index + 1).padStart(this.activeConfig.digits, '0')}${this.activeConfig.ext}`;
          }
        };

        img.src = this.getFrameUrl(index);
        item.img = img;
      }

      // Preload a sliding buffer around the active frame
      preloadBuffer(centerIndex) {
        const bufferRadius = this.isMobile ? 10 : 15;
        const total = this.activeConfig.totalFrames;

        for (let offset = 0; offset <= bufferRadius; offset++) {
          const next = centerIndex + offset;
          const prev = centerIndex - offset;
          if (next < total) this.loadFrame(next);
          if (prev >= 0) this.loadFrame(prev);
        }
      }

      // Progressive background preloader
      startBackgroundPreload() {
        if (this.bgPreloadTimer) clearInterval(this.bgPreloadTimer);

        this.bgPreloadTimer = setInterval(() => {
          let count = 0;
          const batchSize = this.isMobile ? 2 : 3;
          while (this.bgPreloadIndex < this.activeConfig.totalFrames && count < batchSize) {
            if (!this.frames[this.bgPreloadIndex].loaded && !this.frames[this.bgPreloadIndex].loading) {
              this.loadFrame(this.bgPreloadIndex);
              count++;
            }
            this.bgPreloadIndex++;
          }

          if (this.bgPreloadIndex >= this.activeConfig.totalFrames) {
            clearInterval(this.bgPreloadTimer);
            this.bgPreloadTimer = null;
          }
        }, 50);
      }

      drawFrame(index) {
        if (!this.ctx || index < 0 || index >= this.activeConfig.totalFrames) return;

        let frameToDraw = this.frames[index];

        // If target frame not ready, find closest loaded frame bidirectionally
        if (!frameToDraw || !frameToDraw.loaded) {
          const total = this.activeConfig.totalFrames;
          for (let offset = 1; offset < total; offset++) {
            const prev = index - offset;
            const next = index + offset;
            if (prev >= 0 && this.frames[prev] && this.frames[prev].loaded) {
              frameToDraw = this.frames[prev];
              break;
            }
            if (next < total && this.frames[next] && this.frames[next].loaded) {
              frameToDraw = this.frames[next];
              break;
            }
          }
        }

        if (!frameToDraw || !frameToDraw.loaded || !frameToDraw.img) return;

        const img = frameToDraw.img;
        const cw = this.canvas.width;
        const ch = this.canvas.height;
        const iw = img.naturalWidth || this.activeConfig.nativeWidth;
        const ih = img.naturalHeight || this.activeConfig.nativeHeight;

        // Proportional cover-fit centered without distortion
        const scale = Math.max(cw / iw, ch / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        const dx = (cw - dw) * 0.5;
        const dy = (ch - dh) * 0.5;

        this.ctx.clearRect(0, 0, cw, ch);
        this.ctx.drawImage(img, dx, dy, dw, dh);
        this.lastRenderedIndex = index;
      }

      requestRender() {
        if (!this.ticking) {
          requestAnimationFrame(() => {
            this.drawFrame(this.targetIndex);
            this.ticking = false;
          });
          this.ticking = true;
        }
      }

      updateScroll() {
        const rect = this.track.getBoundingClientRect();
        const maxScroll = this.track.offsetHeight - window.innerHeight;

        if (maxScroll > 0) {
          const rawProgress = -rect.top / maxScroll;
          this.currentProgress = Math.max(0, Math.min(1, rawProgress));

          // Compute target frame index (0 to totalFrames - 1)
          this.targetIndex = Math.min(
            this.activeConfig.totalFrames - 1,
            Math.max(0, Math.floor(this.currentProgress * (this.activeConfig.totalFrames - 1)))
          );

          // Priority load active frame and sliding window
          this.loadFrame(this.targetIndex, true);
          this.preloadBuffer(this.targetIndex);
          this.requestRender();

          // Coordinate Scroll Cue visibility
          if (this.scrollCue) {
            if (this.currentProgress > 0.02) {
              this.scrollCue.classList.add('is-hidden');
            } else {
              this.scrollCue.classList.remove('is-hidden');
            }
          }

          // Coordinate End Overlay luxury reveal
          if (this.endScrollOverlay) {
            if (this.currentProgress >= 0.72) {
              this.endScrollOverlay.classList.add('is-visible');
            } else {
              this.endScrollOverlay.classList.remove('is-visible');
            }
          }
        }
      }

      handleResize() {
        this.setupCanvasDimensions();
        const wasMobile = this.isMobile;
        this.selectActiveConfiguration();

        // If switched breakpoint between desktop and mobile
        if (wasMobile !== this.isMobile) {
          if (this.bgPreloadTimer) clearInterval(this.bgPreloadTimer);
          this.initFrameCache();
          this.loadFrame(0, true, () => {
            this.drawFrame(this.targetIndex);
            this.startBackgroundPreload();
          });
        } else {
          this.drawFrame(this.targetIndex);
        }
      }

      bindEvents() {
        const onScroll = () => this.updateScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        let resizeTimeout;
        window.addEventListener('resize', () => {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => this.handleResize(), 100);
        }, { passive: true });

        window.addEventListener('orientationchange', () => {
          setTimeout(() => this.handleResize(), 150);
        }, { passive: true });
      }
    }

    // Instantiate hero scroll frame animation engine
    window.heroScrollPlayer = new ScrollFramePlayer({
      track: heroTrack,
      canvas: heroCanvas,
      scrollCue: scrollCue,
      endScrollOverlay: endScrollOverlay
    });
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



