/* ═══════════════════════════════════════════════════════════
   ARTWORLD ROSE & PAYAL — Main JavaScript
   Antigravity animations, paint splashes, and interactions
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Custom Cursor ────────────────────────────────────
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');

  if (cursorDot && cursorRing) {
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover states
    const hoverables = document.querySelectorAll('a, button, .product-card, .event-card, input, select, textarea');
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  // ── Navigation ───────────────────────────────────────
  const nav = document.getElementById('mainNav');
  const hamburger = document.getElementById('navHamburger');
  const navLinks = document.getElementById('navLinks');

  // Nav scroll state
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  });

  // Mobile menu
  if (hamburger && navLinks) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

    const toggleMenu = () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
      overlay.classList.toggle('active');
    };

    hamburger.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (navLinks.classList.contains('open')) {
          toggleMenu();
        }
      });
    });
  }

  // ── Hero Canvas — Paint Splash Animation ─────────────
  const heroCanvas = document.getElementById('heroCanvas');
  if (heroCanvas) {
    const ctx = heroCanvas.getContext('2d');
    let width, height;
    let particles = [];
    let isHovering = false;
    let lastSpawnTime = 0;

    const colors = [
      { r: 247, g: 184, b: 200, a: 0.12 },  // misty pink
      { r: 197, g: 179, b: 230, a: 0.10 },  // light lavender
      { r: 247, g: 227, b: 154, a: 0.10 },  // sunny yellow
      { r: 139, g: 224, b: 232, a: 0.08 },  // sky blue
      { r: 245, g: 199, b: 158, a: 0.10 },  // warm peach
    ];

    function resizeCanvas() {
      width = heroCanvas.width = heroCanvas.offsetWidth;
      height = heroCanvas.height = heroCanvas.offsetHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class SplashParticle {
      constructor(fromBottom) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        this.x = Math.random() * width;
        this.y = fromBottom ? height + 20 : Math.random() * height;
        this.targetY = Math.random() * height * 0.6 + height * 0.1;
        this.size = Math.random() * 60 + 20;
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        this.alpha = 0;
        this.maxAlpha = color.a + Math.random() * 0.05;
        this.vy = fromBottom ? -(Math.random() * 0.8 + 0.3) : 0;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.life = 1;
        this.decay = Math.random() * 0.001 + 0.0005;
        this.settling = false;
        this.phase = Math.random() * Math.PI * 2;
      }

      update() {
        if (!this.settling) {
          this.y += this.vy;
          this.x += this.vx;

          // Float upward (antigravity)
          this.x += Math.sin(this.phase + performance.now() * 0.001) * 0.2;

          if (this.alpha < this.maxAlpha) {
            this.alpha += 0.003;
          }

          if (this.y <= this.targetY) {
            this.settling = true;
          }
        } else {
          // Settle: slow down and fade
          this.vy *= 0.95;
          this.y += this.vy;
          this.life -= this.decay;
          this.alpha = this.maxAlpha * this.life;
        }

        return this.life > 0 && this.alpha > 0;
      }

      draw(ctx) {
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size
        );
        gradient.addColorStop(0, `rgba(${this.r},${this.g},${this.b},${this.alpha})`);
        gradient.addColorStop(1, `rgba(${this.r},${this.g},${this.b},0)`);
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Ambient particles
    for (let i = 0; i < 8; i++) {
      particles.push(new SplashParticle(false));
      particles[i].alpha = particles[i].maxAlpha;
      particles[i].settling = true;
      particles[i].life = 0.8;
    }

    // Hover spawn
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      heroSection.addEventListener('mouseenter', () => { isHovering = true; });
      heroSection.addEventListener('mouseleave', () => { isHovering = false; });
    }

    function animateCanvas() {
      ctx.clearRect(0, 0, width, height);

      const now = performance.now();
      if (isHovering && now - lastSpawnTime > 400) {
        particles.push(new SplashParticle(true));
        lastSpawnTime = now;
      }

      particles = particles.filter(p => {
        const alive = p.update();
        if (alive) p.draw(ctx);
        return alive;
      });

      // Keep some ambient particles
      if (particles.length < 5) {
        const p = new SplashParticle(false);
        p.alpha = 0;
        particles.push(p);
      }

      requestAnimationFrame(animateCanvas);
    }

    animateCanvas();
  }

  // ── Scroll Reveal ────────────────────────────────────
  const revealElements = document.querySelectorAll(
    '.section-header, .product-card, .service-card, .event-card, .event-full-card, ' +
    '.about-inner, .artists-inner, .testimonials-inner, .strip-item, ' +
    '.cta-banner-inner, .contact-inner, .styling-cta-wrapper'
  );

  revealElements.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  // Stagger product cards
  const productCards = document.querySelectorAll('.product-card');
  productCards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.12}s`;
  });

  const eventCards = document.querySelectorAll('.event-card, .event-full-card');
  eventCards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.15}s`;
  });

  // ── Testimonials Carousel ────────────────────────────
  const carousel = document.getElementById('testimonialsCarousel');
  const dots = document.querySelectorAll('.t-dot');
  if (carousel && dots.length) {
    const slides = carousel.querySelectorAll('.testimonial-slide');
    let currentSlide = 0;

    function goToSlide(index) {
      slides[currentSlide].classList.remove('active');
      dots[currentSlide].classList.remove('active');
      currentSlide = index;
      slides[currentSlide].classList.add('active');
      dots[currentSlide].classList.add('active');
    }

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        goToSlide(parseInt(dot.dataset.index));
      });
    });

    // Auto-advance
    setInterval(() => {
      goToSlide((currentSlide + 1) % slides.length);
    }, 6000);
  }

  // ── Smooth scroll for anchor links ───────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'));
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── Parallax on scroll (subtle) ──────────────────────
  const heroContent = document.querySelector('.hero-content');
  const stylingRoom = document.getElementById('stylingRoomImg');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (heroContent && scrollY < window.innerHeight) {
      const progress = scrollY / window.innerHeight;
      heroContent.style.transform = `translateY(${progress * 40}px)`;
      heroContent.style.opacity = 1 - progress * 0.8;
    }

    // Parallax on styling room image
    if (stylingRoom) {
      const rect = stylingRoom.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        stylingRoom.style.transform = `translateY(${(progress - 0.5) * -30}px) scale(1.05)`;
      }
    }

    // Parallax on background splashes
    const splashes = document.querySelectorAll('.bg-splash');
    splashes.forEach((splash, i) => {
      const speed = 0.05 + (i * 0.02);
      const yOffset = scrollY * speed;
      splash.style.transform = `translateY(${yOffset}px)`;
    });
  });

  // ── Nav link paint drip colors ───────────────────────
  const navLinkItems = document.querySelectorAll('.nav-links li');
  const dripColors = [
    'var(--misty-pink)',
    'var(--light-lavender)',
    'var(--sunny-yellow)',
    'var(--sky-blue)',
    'var(--warm-peach)',
    'var(--pink-bright)'
  ];
  navLinkItems.forEach((item, i) => {
    const drip = item.querySelector('.nav-drip');
    if (drip) {
      drip.style.background = dripColors[i % dripColors.length];
    }
  });

  // ── Contact Form Submission ──────────────────────────
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('.btn-primary');
      const btnText = btn.querySelector('.btn-text');
      const originalText = btnText.textContent;

      btnText.textContent = 'SENDING...';
      btn.style.pointerEvents = 'none';

      setTimeout(() => {
        btnText.textContent = 'MESSAGE SENT ✓';
        btn.style.background = 'var(--misty-pink)';
        btn.style.borderColor = 'var(--misty-pink)';
        btn.style.color = 'var(--white)';

        setTimeout(() => {
          btnText.textContent = originalText;
          btn.style.pointerEvents = '';
          btn.style.background = '';
          btn.style.borderColor = '';
          btn.style.color = '';
          contactForm.reset();
        }, 3000);
      }, 1500);
    });
  }

  // ── Intersection observer for counter animation ──────
  const stripNumbers = document.querySelectorAll('.strip-number');
  if (stripNumbers.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    stripNumbers.forEach(num => counterObserver.observe(num));
  }

  function animateCounter(el) {
    const finalText = el.textContent;
    const finalNum = parseInt(finalText);
    const suffix = finalText.replace(/[0-9]/g, '');
    let current = 0;
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      current = Math.round(finalNum * eased);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

});
