document.addEventListener('DOMContentLoaded', () => {
  // Client Logos Infinite Automatic Side Scrolling (Ticker / Marquee)
  const logoContainers = document.querySelectorAll('.clients-logos-container, #logos-container');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  logoContainers.forEach(container => {
    // Clone children twice to guarantee seamless infinite scrolling on all screens
    const originalChildren = Array.from(container.children);
    if (originalChildren.length > 0) {
      originalChildren.forEach(child => {
        container.appendChild(child.cloneNode(true));
      });
      originalChildren.forEach(child => {
        container.appendChild(child.cloneNode(true));
      });

      // Float position accumulator prevents mobile browser integer truncation bug on scrollLeft
      let scrollPos = container.scrollLeft || 0;
      let speed = 1.0; // Smooth px per 60fps frame
      let isPaused = false;
      let resumeTimeout = null;
      let singleSetWidth = container.scrollWidth / 3;

      const updateWidth = () => {
        if (container.scrollWidth > 0) {
          singleSetWidth = container.scrollWidth / 3;
        }
      };

      // Recalculate as logos load and when viewport resizes
      window.addEventListener('load', updateWidth, { passive: true });
      window.addEventListener('resize', updateWidth, { passive: true });
      window.addEventListener('orientationchange', () => setTimeout(updateWidth, 200), { passive: true });
      setTimeout(updateWidth, 500);
      setTimeout(updateWidth, 1500);

      container.querySelectorAll('img').forEach(img => {
        if (!img.complete) {
          img.addEventListener('load', updateWidth, { passive: true, once: true });
        }
      });

      let lastTimestamp = performance.now();

      function stepScroll(timestamp) {
        const elapsed = timestamp - lastTimestamp;
        lastTimestamp = timestamp;
        const dt = Math.min(2.5, Math.max(0.2, elapsed / 16.67));

        if (!isPaused && singleSetWidth > 10) {
          scrollPos += speed * dt;
          if (scrollPos >= singleSetWidth * 2) {
            scrollPos -= singleSetWidth;
          } else if (scrollPos <= 0) {
            scrollPos += singleSetWidth;
          }
          container.scrollLeft = scrollPos;
        }

        requestAnimationFrame(stepScroll);
      }

      requestAnimationFrame(stepScroll);

      // Pause on mouse hover for easy viewing on desktop
      container.addEventListener('mouseenter', () => { isPaused = true; });
      container.addEventListener('mouseleave', () => {
        scrollPos = container.scrollLeft;
        isPaused = false;
      });

      // Touch handling on mobile: sync scroll position and resume automatically
      const onTouchStart = () => {
        isPaused = true;
        clearTimeout(resumeTimeout);
      };

      const onTouchEnd = () => {
        scrollPos = container.scrollLeft;
        clearTimeout(resumeTimeout);
        resumeTimeout = setTimeout(() => {
          scrollPos = container.scrollLeft;
          isPaused = false;
        }, 1200);
      };

      container.addEventListener('touchstart', onTouchStart, { passive: true });
      container.addEventListener('touchend', onTouchEnd, { passive: true });
      container.addEventListener('touchcancel', onTouchEnd, { passive: true });

      // Manual navigation buttons
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          isPaused = true;
          scrollPos = Math.max(0, container.scrollLeft - 280);
          container.scrollBy({ left: -280, behavior: 'smooth' });
          clearTimeout(resumeTimeout);
          resumeTimeout = setTimeout(() => {
            scrollPos = container.scrollLeft;
            isPaused = false;
          }, 1800);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          isPaused = true;
          scrollPos = container.scrollLeft + 280;
          container.scrollBy({ left: 280, behavior: 'smooth' });
          clearTimeout(resumeTimeout);
          resumeTimeout = setTimeout(() => {
            scrollPos = container.scrollLeft;
            isPaused = false;
          }, 1800);
        });
      }
    }
  });

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
  // High-Performance Scroll-Driven Frame Animation Engine (Ultra-Smooth)
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
        this.loadedCount = 0;
        this.actuallyRenderedIndex = -1;
        this.targetProgress = 0;
        this.smoothProgress = 0;
        this.needsCanvasResizeRedraw = false;

        // Cached track metrics to eliminate layout thrashing during scroll
        this.trackTop = 0;
        this.maxScroll = 1;

        // Maximum concurrency for rapid streaming
        this.maxConcurrency = 24;
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
        this.cacheTrackMetrics();
        this.selectActiveConfiguration();
        this.initFrameCache();
        this.bindEvents();
        
        // 1. Load and paint first frame immediately in crystal-clear quality
        this.loadFrame(0, () => {
          this.drawFrame(0);
          this.updateScroll();
        });

        // 2. Preload initial burst for immediate scrubbing response
        this.preloadInitialBurst();

        // 3. Start high-precision smooth render loop (60fps / 120fps / 144Hz)
        this.startSmoothRenderLoop();

        // 4. Verify candidate mobile folder in background
        this.detectMobileAvailability();
      }

      cacheTrackMetrics() {
        if (!this.track) return;
        const rect = this.track.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
        this.trackTop = rect.top + scrollTop;
        this.maxScroll = Math.max(1, this.track.offsetHeight - window.innerHeight);
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
        this.loadedCount = 0;
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
        if (this.loadedCount >= total) return -1;

        const currentTarget = Math.min(
          total - 1,
          Math.max(0, Math.round(this.smoothProgress * (total - 1)))
        );
        const direction = this.targetProgress >= this.smoothProgress ? 1 : -1;

        // 1. Current target frame
        if (this.canLoad(currentTarget)) return currentTarget;

        // 2. High-priority forward & backward buffer
        const aheadCount = 45;
        const behindCount = 15;

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
        // Load first 35 frames immediately for instant scrub readiness
        const burstCount = Math.min(35, this.activeConfig.totalFrames);
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
            setTimeout(preloadNextBatch, 30);
          }
        };

        setTimeout(preloadNextBatch, 80);
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

        let timeoutId = null;

        const onDecoded = () => {
          if (timeoutId) clearTimeout(timeoutId);
          if (!item.loaded) {
            item.loaded = true;
            this.loadedCount++;
          }
          item.loading = false;
          item.img = img;
          this.activeRequests = Math.max(0, this.activeRequests - 1);
          this.pumpQueue();

          if (callback) callback(img);

          // If this newly loaded frame is closer to the scrub position, update display
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

        // Safety timeout in case network drops or stalls
        timeoutId = setTimeout(() => {
          if (item.loading && !item.loaded) {
            item.loading = false;
            this.activeRequests = Math.max(0, this.activeRequests - 1);
            this.pumpQueue();
          }
        }, 3500);

        img.onload = () => {
          if ('decode' in img) {
            img.decode().then(onDecoded).catch(onDecoded);
          } else {
            onDecoded();
          }
        };

        img.onerror = () => {
          if (timeoutId) clearTimeout(timeoutId);
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

        // If target frame is not yet fully loaded, find the closest loaded frame outward in O(k)
        if (!frameToDraw || !frameToDraw.loaded || !frameToDraw.img) {
          const total = this.activeConfig.totalFrames;
          for (let offset = 1; offset < total; offset++) {
            const prev = targetIndex - offset;
            if (prev >= 0 && this.frames[prev] && this.frames[prev].loaded && this.frames[prev].img) {
              frameToDraw = this.frames[prev];
              frameIndexToDraw = prev;
              break;
            }
            const next = targetIndex + offset;
            if (next < total && this.frames[next] && this.frames[next].loaded && this.frames[next].img) {
              frameToDraw = this.frames[next];
              frameIndexToDraw = next;
              break;
            }
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

        // Proportional cover-fit centered without any aspect ratio distortion
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

          if (Math.abs(curW - this.lastMeasuredW) > 2 || Math.abs(curH - this.lastMeasuredH) > 2) {
            this.setupCanvasDimensions();
            this.cacheTrackMetrics();
            this.needsCanvasResizeRedraw = true;
          }

          const diff = this.targetProgress - this.smoothProgress;
          const absDiff = Math.abs(diff);

          if (absDiff > 0.00002) {
            // Silky frame-rate independent fluid interpolation (no overshoot, zero micro-stutter)
            const baseFactor = 0.28;
            const velocityBoost = Math.min(0.36, absDiff * 1.1);
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
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
        const scrollY = scrollTop - this.trackTop;

        if (this.maxScroll > 0) {
          const rawProgress = scrollY / this.maxScroll;
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
        this.cacheTrackMetrics();
        this.selectActiveConfiguration();
        this.updateScroll();
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
          this.cacheTrackMetrics();
          this.pumpQueue();
        };
        window.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('pointerdown', onTouchStart, { passive: true });

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



