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

  // Initialize Dubai Aerial-to-Villa Scroll Experience
  initScrollExperience();

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

// Scroll Experience Animation Controller (Dubai Top View -> Skyscrapers -> Villa Landing)
function initScrollExperience() {
  const section = document.getElementById('scroll-experience');
  if (!section) return;

  const track = section.querySelector('.scroll-track');
  const layerSky = document.getElementById('layer-sky');
  const layerSkyline = document.getElementById('layer-skyline');
  const layerVilla = document.getElementById('layer-villa');
  const hudAltitude = document.getElementById('hud-altitude');
  const hudFill = document.getElementById('hud-progress-fill');
  
  const cap1 = document.getElementById('caption-1');
  const cap2 = document.getElementById('caption-2');
  const cap3 = document.getElementById('caption-3');

  let targetProgress = 0;
  let currentProgress = 0;

  function updateScroll() {
    const rect = track.getBoundingClientRect();
    const totalHeight = track.offsetHeight - window.innerHeight;
    if (totalHeight <= 0) return;

    const scrolled = -rect.top;
    let progress = scrolled / totalHeight;
    progress = Math.max(0, Math.min(1, progress));
    targetProgress = progress;
  }

  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('resize', updateScroll);
  updateScroll();

  function animate() {
    // Lerp smooth scroll for silky 60fps movement
    currentProgress += (targetProgress - currentProgress) * 0.12;
    const p = currentProgress;

    // Update HUD Progress Fill
    if (hudFill) {
      hudFill.style.width = (p * 100).toFixed(1) + '%';
    }

    // Layer 1: High Sky & Palm Jumeirah View (0 to 0.45)
    if (p <= 0.45) {
      const skyScale = 1 + p * 1.5;
      const skyOpacity = p < 0.25 ? 1 : 1 - ((p - 0.25) / 0.2);
      if (layerSky) {
        layerSky.style.transform = `scale(${skyScale})`;
        layerSky.style.opacity = Math.max(0, skyOpacity);
      }
    } else {
      if (layerSky) layerSky.style.opacity = 0;
    }

    // Layer 2: Skyscrapers Skyline Descent (0.2 to 0.8)
    if (p >= 0.2 && p <= 0.8) {
      const skylineProgress = (p - 0.2) / 0.6;
      const skylineScale = 1.05 + skylineProgress * 0.45;
      const skylineY = -skylineProgress * 6;
      
      let skylineOpacity = 0;
      if (p < 0.35) {
        skylineOpacity = (p - 0.2) / 0.15;
      } else if (p > 0.65) {
        skylineOpacity = 1 - ((p - 0.65) / 0.15);
      } else {
        skylineOpacity = 1;
      }

      if (layerSkyline) {
        layerSkyline.style.transform = `scale(${skylineScale}) translateY(${skylineY}%)`;
        layerSkyline.style.opacity = Math.max(0, Math.min(1, skylineOpacity));
      }
    } else {
      if (layerSkyline) layerSkyline.style.opacity = 0;
    }

    // Layer 3: Landed at Sandid Villa (0.6 to 1.0)
    if (p >= 0.6) {
      const villaProgress = (p - 0.6) / 0.4;
      const villaScale = 1.25 - villaProgress * 0.25;
      const villaOpacity = Math.min(1, (p - 0.6) / 0.2);

      if (layerVilla) {
        layerVilla.style.transform = `scale(${villaScale})`;
        layerVilla.style.opacity = Math.max(0, villaOpacity);
      }
    } else {
      if (layerVilla) layerVilla.style.opacity = 0;
    }

    // Telemetry Altitude & Text Update
    let altText = "ALTITUDE: 3,500M • SKY VIEW";
    if (p > 0.3 && p <= 0.65) {
      const altM = Math.round(3500 - ((p - 0.3) / 0.35) * 3000);
      altText = `ALTITUDE: ${Math.max(500, altM)}M • DESCENT`;
    } else if (p > 0.65) {
      altText = "ALTITUDE: 15M • LANDED AT SANDID VILLA";
    }

    if (hudAltitude) {
      hudAltitude.textContent = altText;
    }

    // Captions activation per phase
    if (p < 0.33) {
      cap1?.classList.add('active');
      cap2?.classList.remove('active');
      cap3?.classList.remove('active');
    } else if (p >= 0.33 && p < 0.66) {
      cap1?.classList.remove('active');
      cap2?.classList.add('active');
      cap3?.classList.remove('active');
    } else {
      cap1?.classList.remove('active');
      cap2?.classList.remove('active');
      cap3?.classList.add('active');
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}
