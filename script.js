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
  // High-Performance Scroll-Driven Frame Animation Engine
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

        // Desktop Configuration (3840x2160, 264 frames)
        this.desktopConfig = {
          name: 'desktop',
          folder: 'public/images/',
          prefix: 'frame-',
          ext: '.jpg',
          digits: 4,
          totalFrames: 264,
          defaultWidth: 3840,
          defaultHeight: 2160
        };

        // Mobile Configuration (1080x1920, 201 frames)
        this.mobileConfig = {
          name: 'mobile',
          folder: 'public/images/mobile/',
          candidateFolders: ['public/images/mobile/', 'mobile view/images/', 'mobile%20view/images/'],
          prefix: 'frame-',
          ext: '.jpg',
          digits: 4,
          totalFrames: 201,
          defaultWidth: 1080,
          defaultHeight: 1920
        };

        this.hasMobileFrames = true;
        this.isMobile = this.checkIsMobile();
        this.activeConfig = this.isMobile ? this.mobileConfig : this.desktopConfig;

        this.frames = [];
        this.lastRenderedIndex = -1;
        this.targetProgress = 0;
        this.smoothProgress = 0;
        this.bgPreloadTimer = null;
        this.bgPreloadIndex = 0;

        this.init();
      }

      checkIsMobile() {
        const isSmallWidth = window.innerWidth <= 820;
        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        const isPortraitTablet = window.innerWidth <= 1024 && window.innerHeight > window.innerWidth && isTouch;
        return isSmallWidth || isPortraitTablet;
      }

      async init() {
        this.setupCanvasDimensions();
        this.selectActiveConfiguration();
        this.initFrameCache();
        this.bindEvents();
        
        // Load and paint first frame immediately
        this.loadFrame(0, true, () => {
          this.drawFrame(0);
          this.updateScroll();
          this.startBackgroundPreload();
        });

        // Start 60fps smooth animation interpolation loop
        this.startSmoothRenderLoop();

        // Verify mobile folder in background to confirm candidate
        this.detectMobileAvailability();
      }

      // Check candidate folders for mobile frames
      detectMobileAvailability() {
        const tryFolder = (folder) => {
          return new Promise((resolve) => {
            const testImg = new Image();
            const testUrl = `${folder}${this.mobileConfig.prefix}0001${this.mobileConfig.ext}`;
            testImg.onload = () => {
              this.mobileConfig.folder = folder;
              resolve(true);
            };
            testImg.onerror = () => {
              resolve(false);
            };
            testImg.src = testUrl;
          });
        };

        return new Promise(async (resolve) => {
          for (const folder of this.mobileConfig.candidateFolders) {
            const found = await tryFolder(folder);
            if (found) {
              this.hasMobileFrames = true;
              resolve(true);
              return;
            }
          }
          resolve(false);
        });
      }

      selectActiveConfiguration() {
        this.isMobile = this.checkIsMobile();
        if (this.isMobile && this.hasMobileFrames) {
          this.activeConfig = this.mobileConfig;
        } else {
          this.activeConfig = this.desktopConfig;
        }
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
        this.lastRenderedIndex = -1;
      }

      setupCanvasDimensions() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for retina crispness without memory bloat
        const width = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0);
        const height = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0);

        this.lastMeasuredW = width;
        this.lastMeasuredH = height;

        const targetW = Math.round(width * dpr);
        const targetH = Math.round(height * dpr);

        if (this.canvas.width !== targetW || this.canvas.height !== targetH) {
          this.canvas.width = targetW;
          this.canvas.height = targetH;
          if (this.ctx) {
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';
          }
          return true;
        }
        return false;
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

          // If this frame was just loaded, draw it if needed
          const currentTarget = Math.min(
            this.activeConfig.totalFrames - 1,
            Math.max(0, Math.round(this.smoothProgress * (this.activeConfig.totalFrames - 1)))
          );
          if (index === currentTarget) {
            this.drawFrame(currentTarget);
          }
        };

        img.onerror = () => {
          item.loading = false;
        };

        img.src = this.getFrameUrl(index);
        item.img = img;
      }

      // Preload a sliding buffer with directional priority around the current frame
      preloadBuffer(centerIndex, direction = 1) {
        const forwardRadius = this.isMobile ? 18 : 22;
        const backwardRadius = this.isMobile ? 8 : 10;
        
        const ahead = direction >= 0 ? forwardRadius : backwardRadius;
        const behind = direction >= 0 ? backwardRadius : forwardRadius;

        const start = Math.max(0, centerIndex - behind);
        const end = Math.min(this.activeConfig.totalFrames - 1, centerIndex + ahead);

        // Preload in forward direction first
        if (direction >= 0) {
          for (let offset = 0; offset <= ahead; offset++) {
            if (centerIndex + offset <= end) this.loadFrame(centerIndex + offset);
          }
          for (let offset = 1; offset <= behind; offset++) {
            if (centerIndex - offset >= start) this.loadFrame(centerIndex - offset);
          }
        } else {
          for (let offset = 0; offset <= ahead; offset++) {
            if (centerIndex - offset >= start) this.loadFrame(centerIndex - offset);
          }
          for (let offset = 1; offset <= behind; offset++) {
            if (centerIndex + offset <= end) this.loadFrame(centerIndex + offset);
          }
        }

        // On mobile, gently manage memory if buffer grows too large
        if (this.isMobile) {
          const maxDistance = 50;
          for (let i = 1; i < this.activeConfig.totalFrames; i++) {
            if (Math.abs(i - centerIndex) > maxDistance && this.frames[i] && this.frames[i].loaded) {
              this.frames[i].img = null;
              this.frames[i].loaded = false;
              this.frames[i].loading = false;
            }
          }
        }
      }

      // Background progressive preloader for remaining frames
      startBackgroundPreload() {
        if (this.bgPreloadTimer) clearInterval(this.bgPreloadTimer);

        this.bgPreloadTimer = setInterval(() => {
          let count = 0;
          const batchSize = this.isMobile ? 1 : 2;
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
        }, 60);
      }

      drawFrame(index) {
        if (!this.ctx || index < 0 || index >= this.activeConfig.totalFrames) return;

        let frameToDraw = this.frames[index];

        // If target frame is not loaded yet, find nearest loaded frame to eliminate flicker
        if (!frameToDraw || !frameToDraw.loaded) {
          let nearestIndex = -1;
          let minDistance = Infinity;

          for (let i = 0; i < this.activeConfig.totalFrames; i++) {
            if (this.frames[i] && this.frames[i].loaded) {
              const dist = Math.abs(i - index);
              if (dist < minDistance) {
                minDistance = dist;
                nearestIndex = i;
              }
            }
          }

          if (nearestIndex !== -1) {
            frameToDraw = this.frames[nearestIndex];
          }
        }

        if (!frameToDraw || !frameToDraw.loaded || !frameToDraw.img) return;

        const img = frameToDraw.img;
        const cw = this.canvas.width;
        const ch = this.canvas.height;
        const iw = img.naturalWidth || this.activeConfig.defaultWidth;
        const ih = img.naturalHeight || this.activeConfig.defaultHeight;

        // Proportional cover-fit centered without distortion (covers 100% of canvas)
        const scale = Math.max(cw / iw, ch / ih);
        const dw = Math.ceil(iw * scale);
        const dh = Math.ceil(ih * scale);
        const dx = Math.floor((cw - dw) * 0.5);
        const dy = Math.floor((ch - dh) * 0.5);

        // Direct draw over canvas prevents any black/blank micro-flicker on mobile GPUs
        this.ctx.drawImage(img, dx, dy, dw, dh);
        this.lastRenderedIndex = index;
      }

      startSmoothRenderLoop() {
        let lastFrameDrawn = -1;

        const tick = () => {
          // Check if mobile viewport height changed (address bar show/hide)
          const curW = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0);
          const curH = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0);

          if (Math.abs(curW - this.lastMeasuredW) > 1 || Math.abs(curH - this.lastMeasuredH) > 1) {
            this.setupCanvasDimensions();
            lastFrameDrawn = -1;
          }

          const diff = this.targetProgress - this.smoothProgress;
          const absDiff = Math.abs(diff);

          if (absDiff > 0.00005) {
            // Adaptive velocity-damped easing: silky smooth on gentle drag, responsive on fast fling
            const baseRate = this.isMobile ? 0.18 : 0.26;
            const velocityBoost = Math.min(0.20, absDiff * 0.5);
            const lerpFactor = baseRate + velocityBoost;

            this.smoothProgress += diff * lerpFactor;
          } else {
            this.smoothProgress = this.targetProgress;
          }

          const currentTarget = Math.min(
            this.activeConfig.totalFrames - 1,
            Math.max(0, Math.round(this.smoothProgress * (this.activeConfig.totalFrames - 1)))
          );

          if (currentTarget !== lastFrameDrawn) {
            const scrollDir = diff >= 0 ? 1 : -1;
            this.loadFrame(currentTarget, true);
            this.preloadBuffer(currentTarget, scrollDir);
            this.drawFrame(currentTarget);
            lastFrameDrawn = currentTarget;
          }

          requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      }

      updateScroll() {
        const maxScroll = this.track.offsetHeight - window.innerHeight;
        const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

        if (maxScroll > 0) {
          const rawProgress = scrollY / maxScroll;
          this.targetProgress = Math.max(0, Math.min(1, rawProgress));

          // Coordinate Scroll Cue visibility
          if (this.scrollCue) {
            if (this.targetProgress > 0.02) {
              this.scrollCue.classList.add('is-hidden');
            } else {
              this.scrollCue.classList.remove('is-hidden');
            }
          }

          // Coordinate End Overlay luxury reveal
          if (this.endScrollOverlay) {
            if (this.targetProgress >= 0.72) {
              this.endScrollOverlay.classList.add('is-visible');
            } else {
              this.endScrollOverlay.classList.remove('is-visible');
            }
          }
        }
      }

      handleResize() {
        const prevWidth = this.canvas.width;
        this.setupCanvasDimensions();
        const prevConfigName = this.activeConfig.name;
        this.selectActiveConfiguration();

        // If switched between desktop and mobile sequence
        if (prevConfigName !== this.activeConfig.name) {
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
        window.addEventListener('touchmove', onScroll, { passive: true });

        let resizeTimeout;
        window.addEventListener('resize', () => {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => this.handleResize(), 150);
        }, { passive: true });

        window.addEventListener('orientationchange', () => {
          setTimeout(() => this.handleResize(), 200);
        }, { passive: true });

        // Bridge touch and wheel on End Overlay to Window Scroll for seamless backward scrubbing
        if (this.endScrollOverlay) {
          let lastTouchY = 0;

          this.endScrollOverlay.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
              lastTouchY = e.touches[0].clientY;
            }
          }, { passive: true });

          this.endScrollOverlay.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) {
              const currentY = e.touches[0].clientY;
              const deltaY = currentY - lastTouchY;
              lastTouchY = currentY;

              if (deltaY > 0 && this.endScrollOverlay.scrollTop <= 1) {
                window.scrollBy({ top: -deltaY * 1.6, behavior: 'auto' });
                this.updateScroll();
              }
            }
          }, { passive: true });

          this.endScrollOverlay.addEventListener('wheel', (e) => {
            if (e.deltaY < 0 && this.endScrollOverlay.scrollTop <= 1) {
              window.scrollBy({ top: e.deltaY, behavior: 'auto' });
              this.updateScroll();
            }
          }, { passive: true });
        }
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



