/* ==========================================
   GARAGE DETAILING - MAIN JAVASCRIPT
   ========================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ---- NAVIGATION SCROLL ---- */
  const nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  /* ---- MOBILE MENU ---- */
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const menuOverlay = document.querySelector('.menu-overlay');
  const mobileClose = document.querySelector('.mobile-menu-close');

  function openMenu() {
    mobileMenu && mobileMenu.classList.add('open');
    menuOverlay && menuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    mobileMenu && mobileMenu.classList.remove('open');
    menuOverlay && menuOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburger && hamburger.addEventListener('click', openMenu);
  mobileClose && mobileClose.addEventListener('click', closeMenu);
  menuOverlay && menuOverlay.addEventListener('click', closeMenu);

  /* Close menu when any real nav link is clicked (anchor links stay on page) */
  document.querySelectorAll('.mobile-menu-links a[href]:not([href="#"])').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
  document.querySelectorAll('.mobile-sub a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* ---- LEAD FORM MODAL ---- */
  const modalOverlay = document.querySelector('.modal-overlay');
  const modalClose = document.querySelector('.modal-close');
  const openFormBtns = document.querySelectorAll('[data-form]');

  let currentStep = 1;
  const totalSteps = 4;
  let selections = { service: '', timeline: '', referral: '' };

  function openModal(preselect) {
    if (!modalOverlay) return;
    resetForm();
    if (preselect) {
      const btn = modalOverlay.querySelector(`.opt-btn[data-val="${preselect}"]`);
      if (btn) {
        btn.classList.add('sel');
        selections.service = preselect;
      }
    }
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay && modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  openFormBtns.forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.service || ''));
  });

  modalClose && modalClose.addEventListener('click', closeModal);
  modalOverlay && modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
  });

  /* Escape key */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); closeMenu(); }
  });

  /* ---- MULTI-STEP FORM LOGIC ---- */
  function showStep(n) {
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    const step = document.querySelector(`.form-step[data-step="${n}"]`);
    if (step) step.classList.add('active');

    document.querySelectorAll('.step-ind').forEach((ind, i) => {
      ind.classList.remove('active', 'done');
      if (i + 1 === n) ind.classList.add('active');
      else if (i + 1 < n) ind.classList.add('done');
    });
  }

  function resetForm() {
    currentStep = 1;
    selections = { service: '', timeline: '', referral: '' };
    document.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('sel'));
    document.querySelectorAll('#contact-name, #contact-phone, #contact-email, #contact-vehicle').forEach(inp => {
      if (inp) inp.value = '';
    });
    const successEl = document.querySelector('.form-success');
    const bodyEl = document.querySelector('.modal-body');
    const progressEl = document.querySelector('.modal-progress');
    if (successEl) successEl.classList.remove('active');
    if (bodyEl) bodyEl.style.display = 'block';
    if (progressEl) progressEl.style.display = 'flex';
    showStep(1);
  }

  /* Option buttons (service / timeline / referral) */
  document.querySelectorAll('.opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.opt-grid');
      if (group) group.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('sel'));
      btn.classList.add('sel');
      const key = btn.dataset.group;
      if (key) selections[key] = btn.dataset.val;
    });
  });

  /* Next buttons */
  document.querySelectorAll('.btn-next').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep === 1 && !selections.service) {
        showError('Please select a service to continue.'); return;
      }
      if (currentStep === 2 && !selections.timeline) {
        showError('Please select a timeline to continue.'); return;
      }
      if (currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);
      }
    });
  });

  /* Prev buttons */
  document.querySelectorAll('.btn-prev').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 1) { currentStep--; showStep(currentStep); }
    });
  });

  /* ---- FIELD VALIDATION HELPERS ---- */
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

  function setFieldState(input, valid, msg) {
    if (!input) return;
    const group = input.closest('.form-group');
    if (!group) return;
    let errEl = group.querySelector('.field-error');
    if (!errEl) {
      errEl = document.createElement('span');
      errEl.className = 'field-error';
      input.after(errEl);
    }
    if (valid) {
      input.style.borderColor = '#4caf50';
      errEl.textContent = '';
      errEl.style.display = 'none';
    } else {
      input.style.borderColor = '#ff4444';
      errEl.textContent = msg;
      errEl.style.cssText = 'display:block;color:#ff6b6b;font-size:11px;margin-top:5px;letter-spacing:0.5px;';
    }
    return valid;
  }

  function validateField(input) {
    const id = input.id;
    const val = input.value.trim();
    if (id === 'contact-name') {
      return setFieldState(input, val.length >= 2, 'Please enter your full name.');
    }
    if (id === 'contact-phone') {
      const digits = val.replace(/\D/g, '');
      return setFieldState(input, digits.length === 10, 'Enter a 10-digit phone number (e.g. 913-278-8869).');
    }
    if (id === 'contact-email') {
      return setFieldState(input, emailRegex.test(val), 'Enter a valid email (e.g. john@example.com).');
    }
    return true;
  }

  /* Live validation on blur */
  ['contact-name','contact-phone','contact-email'].forEach(id => {
    const el = document.querySelector('#' + id);
    if (el) el.addEventListener('blur', () => validateField(el));
  });

  /* Submit */
  const submitBtn = document.querySelector('.btn-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const nameEl  = document.querySelector('#contact-name');
      const phoneEl = document.querySelector('#contact-phone');
      const emailEl = document.querySelector('#contact-email');

      const v1 = validateField(nameEl);
      const v2 = validateField(phoneEl);
      const v3 = validateField(emailEl);

      if (!v1 || !v2 || !v3) return; /* errors shown inline per field */

      const nameEl2  = document.querySelector('#contact-name');
      const phoneEl2 = document.querySelector('#contact-phone');
      const emailEl2 = document.querySelector('#contact-email');
      const vehicleEl = document.querySelector('#contact-vehicle');

      /* Submit to Netlify Forms */
      const formData = new FormData();
      formData.append('form-name', 'lead-form');
      formData.append('name',     nameEl2?.value.trim() || '');
      formData.append('phone',    phoneEl2?.value.trim() || '');
      formData.append('email',    emailEl2?.value.trim() || '');
      formData.append('vehicle',  vehicleEl?.value.trim() || '');
      formData.append('service',  selections.service || '');
      formData.append('timeline', selections.timeline || '');
      formData.append('referral', selections.referral || '');

      fetch('/', { method: 'POST', body: formData })
        .catch(() => {}); /* fail silently — still show success */

      /* Show success */
      const bodyEl = document.querySelector('.modal-body');
      const progressEl = document.querySelector('.modal-progress');
      const successEl = document.querySelector('.form-success');
      if (bodyEl) bodyEl.style.display = 'none';
      if (progressEl) progressEl.style.display = 'none';
      if (successEl) successEl.classList.add('active');
    });
  }

  function showError(msg) {
    const existing = document.querySelector('.form-error-msg');
    if (existing) existing.remove();
    const el = document.createElement('p');
    el.className = 'form-error-msg';
    el.style.cssText = 'color:#ff6b6b;font-size:12px;margin-top:10px;letter-spacing:0.5px;';
    el.textContent = msg;
    const activeStep = document.querySelector('.form-step.active');
    if (activeStep) {
      const footer = activeStep.querySelector('.form-footer');
      if (footer) footer.before(el);
      else activeStep.appendChild(el);
    }
    setTimeout(() => el.remove(), 5000);
  }

  /* ---- CONTACT PAGE INLINE FORM ---- */
  const inlineForm = document.querySelector('.inline-form form');
  if (inlineForm) {
    inlineForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const btn = this.querySelector('button[type="submit"]');
      const origText = btn.textContent;
      btn.textContent = 'Message Sent!';
      btn.style.background = '#61CE70';
      btn.disabled = true;
      this.reset();
      setTimeout(() => { btn.textContent = origText; btn.style.background = ''; btn.disabled = false; }, 4000);
    });
  }

  /* ---- SCROLL ANIMATIONS (AOS-like) ---- */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('aos-animate');
        }, parseInt(delay));
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));

  /* ---- COUNTER ANIMATION ---- */
  function animateCount(el) {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 2200;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let count = 0;
    const timer = setInterval(() => {
      count++;
      current = Math.min(Math.round(increment * count), target);
      el.textContent = current.toLocaleString() + suffix;
      if (count >= steps) clearInterval(timer);
    }, duration / steps);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.done) {
        entry.target.dataset.done = '1';
        animateCount(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.count-up').forEach(el => counterObserver.observe(el));

  /* ---- ACTIVE NAV LINK ---- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu-links a').forEach(a => {
    if (a.getAttribute('href') === currentPage) a.classList.add('active');
  });

});
