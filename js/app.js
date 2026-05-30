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

// ===== v4: reusable modals, catalog cart and delivery form =====
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const formatPhone = '+7 999 584-72-90';

  function makeRequestMessage(type, form) {
    const data = new FormData(form);
    return `Здравствуйте! Хочу оставить заявку в «Я Бао Завари».\nФормат: ${type}\nИмя: ${String(data.get('name') || '').trim()}\nКонтакт: ${String(data.get('contact') || '').trim()}\nДата/время: ${String(data.get('date') || 'не указано').trim()}\nГостей: ${String(data.get('guests') || 'не указано').trim()}`;
  }

  function showGeneratedMessage(form, message, statusText = 'Заявка сформирована. Скопируйте текст и отправьте администратору.') {
    let box = form.querySelector('.form-message');
    if (!box) {
      box = document.createElement('div');
      box.className = 'form-message';
      form.appendChild(box);
    }
    box.textContent = message;

    let actions = form.querySelector('.request-actions');
    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'request-actions';
      form.appendChild(actions);
    }
    actions.innerHTML = '';

    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'copy-request';
    copy.textContent = 'Скопировать заявку';
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(message);
        copy.textContent = 'Скопировано';
        setTimeout(() => copy.textContent = 'Скопировать заявку', 1600);
      } catch (e) {
        copy.textContent = 'Скопируйте текст вручную';
      }
    });
    actions.appendChild(copy);

    const wa = document.createElement('a');
    wa.className = 'copy-request wa-link';
    wa.href = `https://wa.me/79995847290?text=${encodeURIComponent(message)}`;
    wa.target = '_blank';
    wa.rel = 'noopener';
    wa.textContent = 'Открыть WhatsApp';
    actions.appendChild(wa);

    const status = form.querySelector('[data-request-status], [data-delivery-status]');
    if (status) status.textContent = statusText;
  }

  $$('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = $(`[data-modal="${btn.dataset.openModal}"]`);
      if (!modal) return;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lock');
      setTimeout(() => modal.querySelector('input')?.focus(), 80);
    });
  });

  $$('[data-modal-close]').forEach(el => {
    el.addEventListener('click', () => {
      const modal = el.closest('.modal');
      modal?.classList.remove('open');
      modal?.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lock');
    });
  });

  $$('[data-request-form]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const msg = makeRequestMessage(form.dataset.requestType || 'Заявка', form);
      showGeneratedMessage(form, msg);
    });
  });

  // Product filtering
  const filterWrap = $('[data-catalog-filter]');
  if (filterWrap) {
    const buttons = $$('button', filterWrap);
    const cards = $$('.product-card');
    buttons.forEach(btn => btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.category;
      cards.forEach(card => card.classList.toggle('hide', cat !== 'all' && card.dataset.category !== cat));
    }));
  }

  const CART_KEY = 'yabaoCartV1';
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch (e) { cart = []; }
  const save = () => localStorage.setItem(CART_KEY, JSON.stringify(cart));
  const total = () => cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const formatRub = n => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';

  function renderCart() {
    $$('[data-cart-count]').forEach(el => el.textContent = String(cart.reduce((s, i) => s + i.qty, 0)));
    $$('[data-cart-total]').forEach(el => el.textContent = formatRub(total()));
    const list = $('[data-cart-list]');
    if (!list) return;
    if (!cart.length) {
      list.innerHTML = '<div class="cart-empty">Корзина пустая. Добавьте чай или аксессуар из каталога.</div>';
      return;
    }
    list.innerHTML = cart.map((item, idx) => `
      <div class="cart-item">
        <div><strong>${item.name}</strong><span>${formatRub(item.price)} × ${item.qty}</span></div>
        <div class="cart-controls">
          <button type="button" data-cart-minus="${idx}">−</button>
          <b>${item.qty}</b>
          <button type="button" data-cart-plus="${idx}">+</button>
        </div>
        <button class="cart-remove" type="button" data-cart-remove="${idx}">Удалить</button>
      </div>`).join('');
  }

  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add-cart]');
    if (add) {
      const name = add.dataset.name;
      const price = Number(add.dataset.price || 0);
      const found = cart.find(i => i.name === name);
      if (found) found.qty += 1; else cart.push({ name, price, qty: 1 });
      save(); renderCart();
      add.textContent = 'Добавлено';
      setTimeout(() => add.textContent = 'В корзину', 900);
    }

    if (e.target.closest('[data-cart-open]')) {
      const drawer = $('[data-cart]');
      drawer?.classList.add('open');
      drawer?.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lock');
    }
    if (e.target.closest('[data-cart-close]')) {
      const drawer = $('[data-cart]');
      drawer?.classList.remove('open');
      drawer?.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lock');
    }
    const plus = e.target.closest('[data-cart-plus]');
    if (plus) { cart[Number(plus.dataset.cartPlus)].qty += 1; save(); renderCart(); }
    const minus = e.target.closest('[data-cart-minus]');
    if (minus) {
      const item = cart[Number(minus.dataset.cartMinus)];
      item.qty -= 1;
      if (item.qty <= 0) cart.splice(Number(minus.dataset.cartMinus), 1);
      save(); renderCart();
    }
    const rem = e.target.closest('[data-cart-remove]');
    if (rem) { cart.splice(Number(rem.dataset.cartRemove), 1); save(); renderCart(); }
  });

  $('[data-delivery-form]')?.addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!cart.length) {
      const status = form.querySelector('[data-delivery-status]');
      if (status) status.textContent = 'Добавьте товары в корзину перед оформлением.';
      return;
    }
    const data = new FormData(form);
    const items = cart.map(i => `— ${i.name}: ${i.qty} шт. × ${formatRub(i.price)} = ${formatRub(i.qty * i.price)}`).join('\n');
    const message = `Здравствуйте! Хочу оформить доставку из «Я Бао Завари».\n\nТовары:\n${items}\n\nИтого: ${formatRub(total())}\n\nИмя: ${String(data.get('name') || '').trim()}\nКонтакт: ${String(data.get('contact') || '').trim()}\nАдрес: ${String(data.get('address') || '').trim()}\nКомментарий: ${String(data.get('comment') || 'нет').trim()}`;
    showGeneratedMessage(form, message, 'Заказ сформирован. Скопируйте или отправьте администратору в WhatsApp.');
  });

  renderCart();
})();

window.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('.modal.open').forEach(m => { m.classList.remove('open'); m.setAttribute('aria-hidden','true'); });
  const cart = document.querySelector('[data-cart].open');
  if (cart) { cart.classList.remove('open'); cart.setAttribute('aria-hidden','true'); }
  if (!document.querySelector('.modal.open') && !document.querySelector('[data-cart].open') && !document.querySelector('.lightbox.open')) {
    document.body.classList.remove('lock');
  }
});
