(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const CART_KEY = 'yabaoCartV3';
  const WA_PHONE = '79995847290';

  const safeStorage = {
    get(key, fallback = '[]') {
      try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch {}
    }
  };

  const formatRub = (value) => `${new Intl.NumberFormat('ru-RU').format(Number(value) || 0)} ₽`;
  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[char]));

  let cart = [];
  try {
    const parsed = JSON.parse(safeStorage.get(CART_KEY));
    cart = Array.isArray(parsed) ? parsed : [];
  } catch {
    cart = [];
  }

  const saveCart = () => safeStorage.set(CART_KEY, JSON.stringify(cart));
  const cartCount = () => cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const cartTotal = () => cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);

  function updateCartBadges() {
    $$('[data-cart-count]').forEach((badge) => { badge.textContent = String(cartCount()); });
  }

  function renderCart() {
    updateCartBadges();

    const total = $('[data-cart-total]');
    if (total) total.textContent = formatRub(cartTotal());

    const list = $('[data-cart-list]');
    if (!list) return;

    if (!cart.length) {
      list.innerHTML = '<div class="cart-empty">Корзина пока пустая. Добавьте чай или аксессуар из каталога.</div>';
      return;
    }

    list.innerHTML = cart.map((item, index) => `
      <div class="cart-item">
        <div>
          <strong>${escapeHTML(item.name)}</strong>
          <span>${formatRub(item.price)} × ${item.qty}</span>
        </div>
        <div class="cart-controls" aria-label="Количество">
          <button type="button" data-cart-minus="${index}" aria-label="Уменьшить">−</button>
          <b>${item.qty}</b>
          <button type="button" data-cart-plus="${index}" aria-label="Увеличить">+</button>
        </div>
        <button class="cart-remove" type="button" data-cart-remove="${index}">Удалить</button>
      </div>
    `).join('');
  }

  function openCart() {
    const drawer = $('[data-cart]');
    if (!drawer) {
      window.location.href = 'catalog.html#catalog';
      return;
    }
    renderCart();
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lock');
  }

  function closeCart() {
    const drawer = $('[data-cart]');
    if (!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lock');
  }

  function addToCart(button) {
    const name = button.dataset.name || 'Товар';
    const price = Number(button.dataset.price || 0);
    const found = cart.find((item) => item.name === name);

    if (found) found.qty += 1;
    else cart.push({ name, price, qty: 1 });

    saveCart();
    renderCart();

    button.classList.add('is-added');
    const previousText = button.textContent;
    button.textContent = 'Добавлено';
    setTimeout(() => {
      button.textContent = previousText || 'В корзину';
      button.classList.remove('is-added');
    }, 900);
  }

  function setupHeader() {
    const header = $('[data-header]');
    const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

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
      burger.setAttribute('aria-expanded', burger.classList.contains('active') ? 'true' : 'false');
    });

    $$('[data-nav] a').forEach((link) => link.addEventListener('click', closeNav));

    document.addEventListener('click', (event) => {
      if (!nav || !burger || window.innerWidth > 820 || !nav.classList.contains('active')) return;
      if (!nav.contains(event.target) && !burger.contains(event.target)) closeNav();
    });
  }

  function setupReveal() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    items.forEach((item) => observer.observe(item));
  }

  function setupFilters() {
    const menuButtons = $$('.menu-tabs button');
    const menuCards = $$('[data-menu] article');

    menuButtons.forEach((button) => {
      button.addEventListener('click', () => {
        menuButtons.forEach((item) => item.classList.remove('active'));
        button.classList.add('active');
        const category = button.dataset.filter;
        menuCards.forEach((card) => {
          card.classList.toggle('hide', category !== 'all' && card.dataset.cat !== category);
        });
      });
    });

    const filterWrap = $('[data-catalog-filter]');
    const filterButtons = filterWrap ? $$('button', filterWrap) : [];
    const products = $$('.product-card');

    function applyProductFilter(category) {
      filterButtons.forEach((button) => button.classList.toggle('active', button.dataset.category === category));
      products.forEach((card) => {
        card.classList.toggle('hide', category !== 'all' && card.dataset.category !== category);
      });
      $('#catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => applyProductFilter(button.dataset.category || 'all'));
    });

    $$('[data-preview-filter]').forEach((button) => {
      button.addEventListener('click', () => applyProductFilter(button.dataset.previewFilter || 'all'));
    });
  }

  function setupMoods() {
    const result = $('[data-mood-result]');
    const moods = {
      calm: 'Подойдёт спокойная посадка за столом и мягкий чай вроде габы или улуна.',
      date: 'Хороший сценарий — чайная церемония для двоих: красиво, неспешно и с атмосферой.',
      company: 'Берите столик, настолки и чайник на компанию — это один из самых живых форматов.',
      work: 'Можно спокойно прийти днём, сесть с ноутбуком и взять мягкий чай без лишнего шума.'
    };

    $$('.mood-picker button').forEach((button) => {
      button.addEventListener('click', () => {
        $$('.mood-picker button').forEach((item) => item.classList.remove('active'));
        button.classList.add('active');
        if (result) result.textContent = moods[button.dataset.mood] || 'Выберите настроение — и подскажем подходящий сценарий.';
      });
    });
  }

  function setupLightbox() {
    const lightbox = $('[data-lightbox]');
    const image = $('.lightbox img');
    if (!lightbox || !image) return;

    $$('[data-gallery] .gallery-item').forEach((item) => {
      item.addEventListener('click', () => {
        image.src = item.dataset.src || '';
        image.alt = $('img', item)?.alt || '';
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('lock');
      });
    });

    const close = () => {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lock');
    };

    $('[data-close]', lightbox)?.addEventListener('click', close);
    lightbox.addEventListener('click', (event) => { if (event.target === lightbox) close(); });
  }

  function setupModals() {
    $$('[data-open-modal]').forEach((button) => {
      button.addEventListener('click', () => {
        const modal = $(`[data-modal="${button.dataset.openModal}"]`);
        if (!modal) return;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('lock');
        setTimeout(() => $('input', modal)?.focus(), 80);
      });
    });

    $$('[data-modal-close]').forEach((button) => {
      button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        modal?.classList.remove('open');
        modal?.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('lock');
      });
    });
  }

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
    copy.textContent = 'Скопировать';
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(message);
        copy.textContent = 'Скопировано';
        setTimeout(() => { copy.textContent = 'Скопировать'; }, 1400);
      } catch {
        copy.textContent = 'Скопируйте вручную';
      }
    });

    const whatsapp = document.createElement('a');
    whatsapp.className = 'copy-request wa-link';
    whatsapp.href = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`;
    whatsapp.target = '_blank';
    whatsapp.rel = 'noopener';
    whatsapp.textContent = 'Открыть WhatsApp';

    actions.append(copy, whatsapp);

    const status = form.querySelector('[data-request-status], [data-delivery-status]');
    if (status) status.textContent = statusText;
  }

  function setupForms() {
    $$('form').forEach((form) => {
      const consent = form.querySelector('[data-consent]');
      const submit = form.querySelector('button[type="submit"]');
      if (!consent || !submit) return;
      const sync = () => { submit.disabled = !consent.checked; };
      sync();
      consent.addEventListener('change', sync);
    });

    $$('[data-request-form]').forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const type = form.dataset.requestType || 'Заявка';
        const message = [
          'Здравствуйте! Хочу оставить заявку в «Я Бао Завари».',
          `Формат: ${type}`,
          `Имя: ${String(data.get('name') || '').trim()}`,
          `Контакт: ${String(data.get('contact') || '').trim()}`,
          `Дата/время: ${String(data.get('date') || 'не указано').trim()}`,
          `Гостей: ${String(data.get('guests') || 'не указано').trim()}`
        ].join('\n');
        showGeneratedMessage(form, message, 'Заявка сформирована. Её можно скопировать или открыть в WhatsApp.');
      });
    });

    $('[data-delivery-form]')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const form = event.currentTarget;

      if (!cart.length) {
        const status = form.querySelector('[data-delivery-status]');
        if (status) status.textContent = 'Сначала добавьте товары в корзину.';
        return;
      }

      const data = new FormData(form);
      const items = cart.map((item) => `— ${item.name}: ${item.qty} шт. × ${formatRub(item.price)} = ${formatRub(item.qty * item.price)}`).join('\n');
      const message = [
        'Здравствуйте! Хочу оформить доставку из «Я Бао Завари».',
        '',
        'Товары:',
        items,
        '',
        `Итого: ${formatRub(cartTotal())}`,
        '',
        `Имя: ${String(data.get('name') || '').trim()}`,
        `Контакт: ${String(data.get('contact') || '').trim()}`,
        `Адрес: ${String(data.get('address') || '').trim()}`,
        `Комментарий: ${String(data.get('comment') || 'нет').trim()}`
      ].join('\n');
      showGeneratedMessage(form, message, 'Заказ сформирован. Его можно скопировать или отправить через WhatsApp.');
    });
  }

  function setupGlobalClicks() {
    document.addEventListener('click', (event) => {
      const addButton = event.target.closest('[data-add-cart]');
      if (addButton) {
        event.preventDefault();
        addToCart(addButton);
        return;
      }

      if (event.target.closest('[data-cart-open]')) {
        event.preventDefault();
        openCart();
        return;
      }

      if (event.target.closest('[data-cart-close]')) {
        event.preventDefault();
        closeCart();
        return;
      }

      const plus = event.target.closest('[data-cart-plus]');
      if (plus) {
        const index = Number(plus.dataset.cartPlus);
        if (cart[index]) cart[index].qty += 1;
        saveCart();
        renderCart();
        return;
      }

      const minus = event.target.closest('[data-cart-minus]');
      if (minus) {
        const index = Number(minus.dataset.cartMinus);
        if (cart[index]) {
          cart[index].qty -= 1;
          if (cart[index].qty <= 0) cart.splice(index, 1);
        }
        saveCart();
        renderCart();
        return;
      }

      const remove = event.target.closest('[data-cart-remove]');
      if (remove) {
        const index = Number(remove.dataset.cartRemove);
        if (cart[index]) cart.splice(index, 1);
        saveCart();
        renderCart();
      }
    });
  }

  function setupPreloader() {
    const preloader = $('.preloader');
    window.addEventListener('load', () => setTimeout(() => preloader?.classList.add('hidden'), 220));
  }

  function setupCursorGlow() {
    const glow = $('.cursor-glow');
    if (!glow || !window.matchMedia('(pointer:fine)').matches) return;
    window.addEventListener('pointermove', (event) => {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    }, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupPreloader();
    setupCursorGlow();
    setupHeader();
    setupReveal();
    setupFilters();
    setupMoods();
    setupLightbox();
    setupModals();
    setupForms();
    setupGlobalClicks();
    renderCart();
    $$('[data-current-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  });
})();
