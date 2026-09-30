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
      let singleSetWidth = container.scrollWidth / 3;

      window.addEventListener('resize', () => {
        singleSetWidth = container.scrollWidth / 3;
      }, { passive: true });

      function stepScroll() {
        if (!isPaused && singleSetWidth > 0) {
          container.scrollLeft += speed;
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
        this.ctx = this.canvas.getContext('2d', { alpha: false, desynchronized: true });
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
        this.activeConfig = this.desktopConfig;

        this.frames = [];
        this.actuallyRenderedIndex = -1;
        this.targetProgress = 0;
        this.smoothProgress = 0;
        this.needsCanvasResizeRedraw = false;

        // Maximum concurrency for rapid streaming
        this.maxConcurrency = 20;
        this.activeRequests = 0;

        this.init();
      }

      checkIsMobile() {
        const isSmallWidth = window.innerWidth <= 820;
        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        const isPortrait = window.innerHeight > window.innerWidth;
        return (isSmallWidth && isPortrait) || (isTouch && isPortrait) || window.innerWidth <= 768;
      }

      async init() {
        this.setupCanvasDimensions();
        this.selectActiveConfiguration();
        this.initFrameCache();
        this.bindEvents();
        
        // 1. Load and paint first frame immediately in crystal-clear quality
        this.loadFrame(0, () => {
          this.drawFrame(0);
          this.updateScroll();
        });

        // 2. Aggressively preload initial buffer and background streaming
        this.preloadInitialBurst();

        // 3. Start high-precision smooth render loop (60fps / 120fps / 144Hz)
        this.startSmoothRenderLoop();

        // 4. Verify candidate mobile folder in background
        this.detectMobileAvailability();
      }

      detectMobileAvailability() {
        const tryFolder = (folder) => {
          return new Promise((resolve) => {
            const testImg = new Image();
            const testUrl = `${folder}${this.mobileConfig.prefix}0001${this.mobileConfig.ext}`;
            testImg.onload = () => {
              this.mobileConfig.folder = folder;
              this.hasMobileFrames = true;
              if (this.checkIsMobile()) {
                this.selectActiveConfiguration();
              }
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
              resolve(true);
              return;
            }
          }
          resolve(false);
        });
      }

      selectActiveConfiguration() {
        this.isMobile = this.checkIsMobile();
        const prevConfig = this.activeConfig;
        
        if (this.isMobile && this.hasMobileFrames) {
          this.activeConfig = this.mobileConfig;
        } else {
          this.activeConfig = this.desktopConfig;
        }

        if (prevConfig && prevConfig.name !== this.activeConfig.name) {
          this.initFrameCache();
          this.preloadInitialBurst();
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
        this.activeRequests = 0;
        this.actuallyRenderedIndex = -1;
      }

      setupCanvasDimensions() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
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

      canLoad(index) {
        if (index < 0 || index >= this.activeConfig.totalFrames) return false;
        const item = this.frames[index];
        return !!(item && !item.loaded && !item.loading);
      }

      getNextFrameToLoad() {
        const total = this.activeConfig.totalFrames;
        const currentTarget = Math.min(
          total - 1,
          Math.max(0, Math.round(this.smoothProgress * (total - 1)))
        );
        const direction = this.targetProgress >= this.smoothProgress ? 1 : -1;

        // 1. Current target frame
        if (this.canLoad(currentTarget)) return currentTarget;

        // 2. High-priority forward & backward buffer
        const aheadCount = 50;
        const behindCount = 20;

        if (direction >= 0) {
          for (let i = 1; i <= aheadCount; i++) {
            const idx = currentTarget + i;
            if (idx < total && this.canLoad(idx)) return idx;
          }
          for (let i = 1; i <= behindCount; i++) {
            const idx = currentTarget - i;
            if (idx >= 0 && this.canLoad(idx)) return idx;
          }
        } else {
          for (let i = 1; i <= aheadCount; i++) {
            const idx = currentTarget - i;
            if (idx >= 0 && this.canLoad(idx)) return idx;
          }
          for (let i = 1; i <= behindCount; i++) {
            const idx = currentTarget + i;
            if (idx < total && this.canLoad(idx)) return idx;
          }
        }

        // 3. Keyframe mesh scaffold (every 3rd frame)
        const meshStep = 3;
        for (let dist = meshStep; dist < total; dist += meshStep) {
          const ahead = currentTarget + dist;
          if (ahead < total && this.canLoad(ahead)) return ahead;
          const behind = currentTarget - dist;
          if (behind >= 0 && this.canLoad(behind)) return behind;
        }

        // 4. Infill all remaining frames
        for (let dist = 1; dist < total; dist++) {
          const ahead = currentTarget + dist;
          if (ahead < total && this.canLoad(ahead)) return ahead;
          const behind = currentTarget - dist;
          if (behind >= 0 && this.canLoad(behind)) return behind;
        }

        return -1;
      }

      preloadInitialBurst() {
        // Load first 30 frames immediately for instantaneous scrub ready
        const burstCount = Math.min(30, this.activeConfig.totalFrames);
        for (let i = 0; i < burstCount; i++) {
          if (this.canLoad(i)) {
            this.loadFrame(i);
          }
        }

        // Continue background stream
        this.startBackgroundPreload();
      }

      pumpQueue() {
        while (this.activeRequests < this.maxConcurrency) {
          const nextIndex = this.getNextFrameToLoad();
          if (nextIndex === -1) break;
          this.loadFrame(nextIndex);
        }
      }

      startBackgroundPreload() {
        let preloadIndex = 0;
        const total = this.activeConfig.totalFrames;
        
        const preloadNextBatch = () => {
          if (preloadIndex >= total) return;
          while (this.activeRequests < this.maxConcurrency && preloadIndex < total) {
            if (this.canLoad(preloadIndex)) {
              this.loadFrame(preloadIndex);
            }
            preloadIndex++;
          }
          if (preloadIndex < total) {
            setTimeout(preloadNextBatch, 35);
          }
        };

        setTimeout(preloadNextBatch, 100);
      }

      loadFrame(index, callback = null) {
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
        this.activeRequests++;

        const img = new Image();
        img.decoding = 'async';

        const onDecoded = () => {
          item.loaded = true;
          item.loading = false;
          item.img = img;
          this.activeRequests = Math.max(0, this.activeRequests - 1);
          this.pumpQueue();

          if (callback) callback(img);

          // If this frame is closer to active scrub position, redraw instantly
          const currentTarget = Math.min(
            this.activeConfig.totalFrames - 1,
            Math.max(0, Math.round(this.smoothProgress * (this.activeConfig.totalFrames - 1)))
          );

          if (this.actuallyRenderedIndex !== currentTarget) {
            const currentDist = this.actuallyRenderedIndex >= 0 ? Math.abs(this.actuallyRenderedIndex - currentTarget) : Infinity;
            const newDist = Math.abs(index - currentTarget);
            if (newDist < currentDist) {
              this.drawFrame(currentTarget);
            }
          }
        };

        img.onload = () => {
          if ('decode' in img) {
            img.decode().then(onDecoded).catch(onDecoded);
          } else {
            onDecoded();
          }
        };

        img.onerror = () => {
          item.loading = false;
          item.loaded = false;
          this.activeRequests = Math.max(0, this.activeRequests - 1);
          this.pumpQueue();
        };

        img.src = this.getFrameUrl(index);
        item.img = img;
      }

      drawFrame(targetIndex) {
        if (!this.ctx || targetIndex < 0 || targetIndex >= this.activeConfig.totalFrames) return;

        let frameToDraw = this.frames[targetIndex];
        let frameIndexToDraw = targetIndex;

        // If target frame is not yet fully loaded, find the closest loaded frame to keep animation flowing smoothly
        if (!frameToDraw || !frameToDraw.loaded || !frameToDraw.img) {
          let nearestIndex = -1;
          let minDistance = Infinity;

          for (let i = 0; i < this.activeConfig.totalFrames; i++) {
            if (this.frames[i] && this.frames[i].loaded && this.frames[i].img) {
              const dist = Math.abs(i - targetIndex);
              if (dist < minDistance) {
                minDistance = dist;
                nearestIndex = i;
              }
            }
          }

          if (nearestIndex !== -1) {
            frameToDraw = this.frames[nearestIndex];
            frameIndexToDraw = nearestIndex;
          }
        }

        if (!frameToDraw || !frameToDraw.loaded || !frameToDraw.img) return;

        // Skip redraw if this exact frame is already drawn and canvas dimensions haven't changed
        if (this.actuallyRenderedIndex === frameIndexToDraw && !this.needsCanvasResizeRedraw) {
          return;
        }
        this.needsCanvasResizeRedraw = false;

        const img = frameToDraw.img;
        if (!img.complete || img.naturalWidth === 0) return;

        const cw = this.canvas.width;
        const ch = this.canvas.height;
        const iw = img.naturalWidth || this.activeConfig.defaultWidth;
        const ih = img.naturalHeight || this.activeConfig.defaultHeight;

        // High-precision proportional cover-fit centered without distortion
        const scale = Math.max(cw / iw, ch / ih);
        const dw = Math.ceil(iw * scale);
        const dh = Math.ceil(ih * scale);
        const dx = Math.round((cw - dw) * 0.5);
        const dy = Math.round((ch - dh) * 0.5);

        this.ctx.drawImage(img, dx, dy, dw, dh);
        this.actuallyRenderedIndex = frameIndexToDraw;
      }

      startSmoothRenderLoop() {
        let lastTime = performance.now();

        const tick = (now) => {
          const elapsed = now - lastTime;
          lastTime = now;
          const dt = Math.min(3.0, Math.max(0.1, elapsed / 16.67));

          // Check if viewport dimensions shifted
          const curW = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0);
          const curH = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0);

          if (Math.abs(curW - this.lastMeasuredW) > 1 || Math.abs(curH - this.lastMeasuredH) > 1) {
            this.setupCanvasDimensions();
            this.needsCanvasResizeRedraw = true;
          }

          const diff = this.targetProgress - this.smoothProgress;
          const absDiff = Math.abs(diff);

          if (absDiff > 0.00002) {
            // Silky frame-rate independent fluid interpolation
            const baseFactor = 0.26;
            const velocityBoost = Math.min(0.28, absDiff * 0.85);
            const lerpRate = Math.min(1.0, (baseFactor + velocityBoost) * dt);

            this.smoothProgress += diff * lerpRate;
          } else {
            this.smoothProgress = this.targetProgress;
          }

          const currentTarget = Math.min(
            this.activeConfig.totalFrames - 1,
            Math.max(0, Math.round(this.smoothProgress * (this.activeConfig.totalFrames - 1)))
          );

          // Draw the current target frame or best fallback
          this.drawFrame(currentTarget);

          // Continuously stream frames
          this.pumpQueue();

          requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      }

      updateScroll() {
        const rect = this.track.getBoundingClientRect();
        const maxScroll = this.track.offsetHeight - window.innerHeight;
        const scrollY = -rect.top;

        if (maxScroll > 0) {
          const rawProgress = scrollY / maxScroll;
          this.targetProgress = Math.max(0, Math.min(1, rawProgress));

          // Immediately pump queue on scroll input to start downloading forward buffer
          this.pumpQueue();

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
            if (this.targetProgress >= 0.76) {
              this.endScrollOverlay.classList.add('is-visible');
            } else {
              this.endScrollOverlay.classList.remove('is-visible');
            }
          }
        }
      }

      handleResize() {
        this.setupCanvasDimensions();
        this.selectActiveConfiguration();
        this.needsCanvasResizeRedraw = true;
        const currentTarget = Math.min(
          this.activeConfig.totalFrames - 1,
          Math.max(0, Math.round(this.smoothProgress * (this.activeConfig.totalFrames - 1)))
        );
        this.drawFrame(currentTarget);
      }

      bindEvents() {
        const onScroll = () => this.updateScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('touchmove', onScroll, { passive: true });

        const onTouchStart = () => {
          this.pumpQueue();
        };
        window.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('pointerdown', onTouchStart, { passive: true });

        let resizeTimeout;
        window.addEventListener('resize', () => {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => this.handleResize(), 120);
        }, { passive: true });

        window.addEventListener('orientationchange', () => {
          setTimeout(() => this.handleResize(), 180);
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

  // Header Dynamic Glassmorphism on Scroll
  const siteHeader = document.querySelector('header.site-header');
  if (siteHeader) {
    const handleHeaderScroll = () => {
      if (window.scrollY > 40) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();
  }
});



