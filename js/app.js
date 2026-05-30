(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // preloader
  const preloader = $('.preloader');
  window.addEventListener('load', () => {
    setTimeout(() => preloader?.classList.add('hidden'), 260);
  });

  // cursor glow
  const glow = $('.cursor-glow');
  if (glow && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('pointermove', (e) => {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
    }, { passive: true });
  }

  // header scroll state
  const header = $('[data-header]');
  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 16);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // mobile menu
  const burger = $('.burger');
  const nav = $('[data-nav]');
  const closeNav = () => {
    nav?.classList.remove('active');
    burger?.classList.remove('active');
    burger?.setAttribute('aria-expanded', 'false');
  };
  burger?.addEventListener('click', () => {
    nav?.classList.toggle('active');
    burger.classList.toggle('active');
    const expanded = burger.classList.contains('active');
    burger.setAttribute('aria-expanded', String(expanded));
  });
  $$('[data-nav] a').forEach(link => link.addEventListener('click', closeNav));
  document.addEventListener('click', (e) => {
    if (!nav || !burger || window.innerWidth > 820) return;
    if (!nav.classList.contains('active')) return;
    if (!nav.contains(e.target) && !burger.contains(e.target)) closeNav();
  });

  // reveal on scroll
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });
  $$('.reveal').forEach(el => revealObserver.observe(el));

  // tea menu filter
  const menuButtons = $$('.menu-tabs button');
  const menuCards = $$('[data-menu] article');
  menuButtons.forEach(btn => btn.addEventListener('click', () => {
    menuButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.filter;
    menuCards.forEach(card => {
      card.classList.toggle('hide', cat !== 'all' && card.dataset.cat !== cat);
    });
  }));

  // mood picker
  const moodMap = {
    calm: 'Подойдёт спокойная посадка за столом и мягкий чай вроде габы или улуна.',
    date: 'Хороший сценарий — чайная церемония для двоих: красиво, неспешно и с атмосферой.',
    company: 'Берите столик, настолки и чайник на компанию — это один из самых живых форматов.',
    work: 'Можно спокойно прийти днём, сесть с ноутбуком и взять мягкий чай без лишнего шума.'
  };
  const moodResult = $('[data-mood-result]');
  $$('.mood-picker button').forEach(btn => btn.addEventListener('click', () => {
    $$('.mood-picker button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (moodResult) moodResult.textContent = moodMap[btn.dataset.mood] || 'Выберите настроение — и подскажем подходящий сценарий.';
  }));

  // lightbox
  const lightbox = $('[data-lightbox]');
  const lightboxImg = $('.lightbox img');
  $$('[data-gallery] .gallery-item').forEach(item => item.addEventListener('click', () => {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = item.dataset.src;
    lightboxImg.alt = $('img', item)?.alt || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lock');
  }));
  $('[data-close]', lightbox)?.addEventListener('click', () => {
    lightbox?.classList.remove('open');
    lightbox?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lock');
  });
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lock');
    }
  });

  // modals
  $$('[data-open-modal]').forEach(btn => btn.addEventListener('click', () => {
    const modal = $(`[data-modal="${btn.dataset.openModal}"]`);
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lock');
    setTimeout(() => $('input', modal)?.focus(), 80);
  }));
  $$('[data-modal-close]').forEach(el => el.addEventListener('click', () => {
    const modal = el.closest('.modal');
    modal?.classList.remove('open');
    modal?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lock');
  }));

  // shared form helper
  function showGeneratedMessage(form, message, statusText) {
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
        setTimeout(() => copy.textContent = 'Скопировать заявку', 1500);
      } catch {
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

  $$('[data-request-form]').forEach(form => form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const type = form.dataset.requestType || 'Заявка';
    const message = `Здравствуйте! Хочу оставить заявку в «Я Бао Завари».\nФормат: ${type}\nИмя: ${String(data.get('name') || '').trim()}\nКонтакт: ${String(data.get('contact') || '').trim()}\nДата/время: ${String(data.get('date') || 'не указано').trim()}\nГостей: ${String(data.get('guests') || 'не указано').trim()}`;
    showGeneratedMessage(form, message, 'Заявка сформирована. Её можно скопировать или сразу открыть в WhatsApp.');
  }));

  // catalog filters
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

  // cart
  const CART_KEY = 'yabaoCartV2';
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { cart = []; }

  const saveCart = () => localStorage.setItem(CART_KEY, JSON.stringify(cart));
  const totalPrice = () => cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const countItems = () => cart.reduce((sum, item) => sum + item.qty, 0);
  const formatRub = n => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';

  function updateCartBadge() {
    $$('[data-cart-count]').forEach(el => el.textContent = String(countItems()));
  }

  function renderCart() {
    updateCartBadge();
    const totalEl = $('[data-cart-total]');
    if (totalEl) totalEl.textContent = formatRub(totalPrice());
    const list = $('[data-cart-list]');
    if (!list) return;
    if (!cart.length) {
      list.innerHTML = '<div class="cart-empty">Корзина пока пустая. Добавьте чай или аксессуар из каталога.</div>';
      return;
    }
    list.innerHTML = cart.map((item, index) => `
      <div class="cart-item">
        <div>
          <strong>${item.name}</strong>
          <span>${formatRub(item.price)} × ${item.qty}</span>
        </div>
        <div class="cart-controls">
          <button type="button" data-cart-minus="${index}">−</button>
          <b>${item.qty}</b>
          <button type="button" data-cart-plus="${index}">+</button>
        </div>
        <button class="cart-remove" type="button" data-cart-remove="${index}">Удалить</button>
      </div>
    `).join('');
  }

  renderCart();

  document.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add-cart]');
    if (add) {
      const name = add.dataset.name;
      const price = Number(add.dataset.price || 0);
      const found = cart.find(item => item.name === name);
      if (found) found.qty += 1; else cart.push({ name, price, qty: 1 });
      saveCart();
      renderCart();
      add.textContent = 'Добавлено';
      setTimeout(() => add.textContent = 'В корзину', 900);
    }

    if (e.target.closest('[data-cart-open]')) {
      const drawer = $('[data-cart]');
      if (drawer) {
        drawer.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');
        document.body.classList.add('lock');
      }
    }
    if (e.target.closest('[data-cart-close]')) {
      const drawer = $('[data-cart]');
      drawer?.classList.remove('open');
      drawer?.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lock');
    }

    const plus = e.target.closest('[data-cart-plus]');
    if (plus) {
      cart[Number(plus.dataset.cartPlus)].qty += 1;
      saveCart(); renderCart();
    }
    const minus = e.target.closest('[data-cart-minus]');
    if (minus) {
      const index = Number(minus.dataset.cartMinus);
      cart[index].qty -= 1;
      if (cart[index].qty <= 0) cart.splice(index, 1);
      saveCart(); renderCart();
    }
    const remove = e.target.closest('[data-cart-remove]');
    if (remove) {
      cart.splice(Number(remove.dataset.cartRemove), 1);
      saveCart(); renderCart();
    }
  });

  $('[data-delivery-form]')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!cart.length) {
      const status = form.querySelector('[data-delivery-status]');
      if (status) status.textContent = 'Сначала добавьте товары в корзину.';
      return;
    }
    const data = new FormData(form);
    const items = cart.map(i => `— ${i.name}: ${i.qty} шт. × ${formatRub(i.price)} = ${formatRub(i.qty * i.price)}`).join('\n');
    const message = `Здравствуйте! Хочу оформить доставку из «Я Бао Завари».\n\nТовары:\n${items}\n\nИтого: ${formatRub(totalPrice())}\n\nИмя: ${String(data.get('name') || '').trim()}\nКонтакт: ${String(data.get('contact') || '').trim()}\nАдрес: ${String(data.get('address') || '').trim()}\nКомментарий: ${String(data.get('comment') || 'нет').trim()}`;
    showGeneratedMessage(form, message, 'Заказ сформирован. Его можно скопировать или отправить через WhatsApp.');
  });

  // years
  $$('[data-current-year]').forEach(el => el.textContent = String(new Date().getFullYear()));
})();
