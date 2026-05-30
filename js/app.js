(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  window.addEventListener('load', () => setTimeout(() => $('.preloader')?.classList.add('hidden'), 420));

  const currentYear = document.querySelector('[data-current-year]');
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());


  const header = $('[data-header]');
  const burger = $('.burger');
  const nav = $('[data-nav]');
  window.addEventListener('scroll', () => header?.classList.toggle('scrolled', scrollY > 30), { passive: true });
  burger?.addEventListener('click', () => {
    const active = nav.classList.toggle('active');
    burger.classList.toggle('active', active);
    burger.setAttribute('aria-expanded', String(active));
  });
  $$('.nav a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('active'); burger?.classList.remove('active'); burger?.setAttribute('aria-expanded','false');
  }));

  const glow = $('.cursor-glow');
  window.addEventListener('pointermove', (e) => {
    if (!glow) return;
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  }, { passive: true });

  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('show'); });
  }, { threshold: .12 });
  $$('.reveal').forEach(el => reveal.observe(el));

  $$('[data-tilt]').forEach(card => {
    card.addEventListener('pointermove', e => {
      if (matchMedia('(max-width: 820px)').matches) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(900px) rotateX(${-y * 8}deg) rotateY(${x * 10}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => card.style.transform = '');
  });

  const filterButtons = $$('.menu-tabs button');
  const menuItems = $$('.tea-menu article');
  filterButtons.forEach(btn => btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    menuItems.forEach(item => item.classList.toggle('hide', f !== 'all' && item.dataset.cat !== f));
  }));

  const moodResult = $('[data-mood-result]');
  const moodTexts = {
    calm: 'Тебе подойдёт мягкая габа или белый чай за столом. Задача — выдохнуть, а не бодриться.',
    date: 'Лучший выбор — чайная церемония на двоих: красиво, необычно и без суеты.',
    company: 'Берите стол, настолки и чайник проливами. Формат для долгого разговора.',
    work: 'Днём можно зайти с ноутбуком: чай с собой или спокойная посадка у стены.'
  };
  $$('[data-moods] button').forEach(btn => btn.addEventListener('click', () => {
    $$('[data-moods] button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    moodResult.textContent = moodTexts[btn.dataset.mood];
  }));

  const lightbox = $('[data-lightbox]');
  const lightboxImg = $('.lightbox img');
  $$('[data-gallery] button').forEach(btn => btn.addEventListener('click', () => {
    lightboxImg.src = btn.dataset.src;
    lightboxImg.alt = btn.querySelector('img')?.alt || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden','false');
    document.body.classList.add('lock');
  }));
  $('[data-close]')?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  window.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
  function closeLightbox(){ lightbox?.classList.remove('open'); lightbox?.setAttribute('aria-hidden','true'); document.body.classList.remove('lock'); }

  $('[data-form]')?.addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget;
    const status = $('[data-form-status]');
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const contact = String(data.get('contact') || '').trim();
    const format = String(data.get('format') || '').trim();
    const message = `Здравствуйте! Хочу оставить заявку в «Я Бао Завари».\nИмя: ${name}\nКонтакт: ${contact}\nФормат: ${format}`;

    let box = form.querySelector('.form-message');
    if (!box) {
      box = document.createElement('div');
      box.className = 'form-message';
      form.appendChild(box);
    }
    box.textContent = message;

    let copy = form.querySelector('.copy-request');
    if (!copy) {
      copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'copy-request';
      copy.textContent = 'Скопировать заявку';
      form.appendChild(copy);
    }
    copy.onclick = async () => {
      try {
        await navigator.clipboard.writeText(message);
        copy.textContent = 'Заявка скопирована';
        setTimeout(() => copy.textContent = 'Скопировать заявку', 1800);
      } catch (err) {
        copy.textContent = 'Скопируйте текст вручную';
      }
    };

    if (status) status.textContent = 'Заявка сформирована. Скопируйте текст и отправьте администратору в удобный мессенджер.';
  });

  const canvas = $('[data-steam]');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];
    const resize = () => { w = canvas.width = innerWidth; h = canvas.height = innerHeight; particles = Array.from({length: Math.min(70, Math.floor(w/18))}, makeParticle); };
    const rand = (a,b) => a + Math.random()*(b-a);
    function makeParticle(){ return { x: rand(0,w), y: rand(h*.25,h), r: rand(1,4), vy: rand(.15,.75), vx: rand(-.18,.18), a: rand(.06,.18) }; }
    function draw(){
      ctx.clearRect(0,0,w,h);
      particles.forEach((p,i)=>{
        p.y -= p.vy; p.x += Math.sin(p.y*.01)*.22 + p.vx;
        if (p.y < -20 || p.x < -20 || p.x > w+20) particles[i]=makeParticle(), particles[i].y=h+20;
        const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*7);
        g.addColorStop(0,`rgba(242,220,176,${p.a})`); g.addColorStop(1,'rgba(242,220,176,0)');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*7,0,Math.PI*2); ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    resize(); draw(); addEventListener('resize', resize, {passive:true});
  }
})();
