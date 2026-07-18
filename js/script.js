window.addEventListener('load', () => {
    document.body.style.setProperty('--wrapper-width', document.querySelector('.wrapper').clientWidth + "px");

    // высота нижнего меню (мобилка) в CSS-переменную — чтобы меню/попапы не перекрывали его
    const botnav_el = document.querySelector('.botnav');
    const set_botnav_h = () => document.documentElement.style.setProperty('--botnav-h', (botnav_el ? botnav_el.offsetHeight : 0) + 'px');
    set_botnav_h();
    window.addEventListener('resize', set_botnav_h);

    const header        = document.querySelector('.header');
    const header_top    = document.querySelector('.header__top');
    const header_mid    = document.querySelector('.header__mid');
    const header_bottom = document.querySelector('.header__bottom');
    let header_sticked  = false;
    if (header) {
        const header_mid_center = header.querySelector('.header__mid_center');
        const mobile_mq = window.matchMedia('(max-width: 750px)');
        const tablet_mq = window.matchMedia('(max-width: 1200px)');

        document.body.style.setProperty('--header-height', header.clientHeight + 'px');
        document.body.style.setProperty('--sticky-header-height', header_mid.clientHeight + 'px');

        /* Аналогично ПК: фиксируем прилипающий элемент и резервируем РОВНО его высоту
           (высота не меняется → нет прыжка), верхняя часть просто уезжает вверх.
           - мобилка: прилипает только строка поиска (.header__mid_center); порог = её позиция,
             резерв = её высота в потоке; ряд лого/города уезжает.
           - десктоп/планшет: прилипает вся .header__mid; порог = высота верхних рядов. */
        let sticky_offset = 0;
        let sticky_pad = 0;
        const measure_sticky_offset = () => {
            const was = header_sticked;
            if (was) {
                header_mid.classList.remove('header__mid--sticked');
                document.body.style.removeProperty('padding-top');
            }
            if (mobile_mq.matches && header_mid_center) {
                sticky_offset = header_mid_center.offsetTop;
                sticky_pad = header_mid_center.offsetHeight;
            } else {
                sticky_offset = tablet_mq.matches
                    ? header_top.clientHeight + header_bottom.clientHeight
                    : header_top.clientHeight;
                sticky_pad = header_mid.clientHeight;
            }
            if (was) {
                header_mid.classList.add('header__mid--sticked');
                document.body.style.setProperty('padding-top', sticky_pad + 'px');
            }
        };
        measure_sticky_offset();

        let last_scroll = window.scrollY;
        const update_sticky = () => {
            const y = window.scrollY;

            if (!header_sticked && y > sticky_offset) {
                header_mid.classList.add('header__mid--sticked');
                document.body.style.setProperty('padding-top', sticky_pad + 'px');
                header_sticked = true;
            } else if (header_sticked && y <= sticky_offset) {
                header_mid.classList.remove('header__mid--sticked');
                header_mid.classList.remove('header__mid--hidden');
                document.body.style.removeProperty('padding-top');
                header_sticked = false;
            }

            // мобилка: скролл вниз — прячем прилипшую строку, скролл вверх — показываем (ТЗ)
            if (header_sticked && mobile_mq.matches) {
                if (y > last_scroll && y > sticky_offset) {
                    header_mid.classList.add('header__mid--hidden');
                } else if (y < last_scroll) {
                    header_mid.classList.remove('header__mid--hidden');
                }
            }
            last_scroll = y;
        };
        window.addEventListener('scroll', update_sticky, { passive: true });
        window.addEventListener('resize', () => { measure_sticky_offset(); update_sticky(); });
    }

    const hero_swiper = document.querySelector('.hero-swiper');
    if (hero_swiper) {
        new Swiper(hero_swiper, {
            slidesPerView: 1,
            loop: true,
            autoplay: {
                delay: 4000,
                pauseOnMouseEnter: true,
                disableOnInteraction: false
            },
            navigation: {
                prevEl: '.hero .slider-actions__prev',
                nextEl: '.hero .slider-actions__next',
            },
            pagination: {
                el: '.hero .slider-actions__pagination',
                type: 'fraction'
            }
        });
    }

    const brands_swiper = document.querySelector('.brands-swiper');
    if (brands_swiper && window.matchMedia('(min-width: 601px)').matches) {
        new Swiper(brands_swiper, {
            slidesPerView: 5,
            spaceBetween: 58,
            loop: true,
            navigation: {
                prevEl: '.brands .slider-actions__prev',
                nextEl: '.brands .slider-actions__next',
            },
            pagination: {
                el: '.brands .slider-actions__pagination',
                type: 'fraction'
            },
            breakpoints: {
                1200: {
                    slidesPerView: 5
                },
                601: {
                    slidesPerView: 'auto'
                }
            }
        });
    }

    const brands_more = document.querySelector('[data-brands-more]');
    if (brands_more) {
        const brands_section = brands_more.closest('.brands');
        brands_more.addEventListener('click', () => brands_section.classList.add('brands--expanded'));
    }

    const watched_swiper = document.querySelector('.watched-swiper');
    if (watched_swiper) {
        // на мобилке (≤750) — не карусель, а сетка 2 колонки со «Смотреть ещё»
        const watched_mq = window.matchMedia('(min-width: 751px)');
        let watched = null;

        const init_watched = () => {
            watched = new Swiper(watched_swiper, {
                slidesPerView: 2,
                spaceBetween: 20,
                loop: true,
                navigation: {
                    prevEl: '.watched .slider-actions__prev',
                    nextEl: '.watched .slider-actions__next',
                },
                pagination: {
                    el: '.watched .slider-actions__pagination',
                    type: 'fraction'
                },
                breakpoints: {
                    576:  { slidesPerView: 3 },
                    768:  { slidesPerView: 4 },
                    1200: { slidesPerView: 5 },
                }
            });
        };

        const sync_watched = () => {
            if (watched_mq.matches) {
                if (!watched) init_watched();
            } else if (watched) {
                watched.destroy(true, true);
                watched = null;
            }
        };

        sync_watched();
        watched_mq.addEventListener('change', sync_watched);

        const watched_next = watched_swiper.querySelector('.watched-swiper__next');
        if (watched_next) watched_next.addEventListener('click', () => { if (watched) watched.slideNext(); });
        const watched_prev = watched_swiper.querySelector('.watched-swiper__prev');
        if (watched_prev) watched_prev.addEventListener('click', () => { if (watched) watched.slidePrev(); });

        const PEEK_ZONE = 0.25;
        watched_swiper.addEventListener('mousemove', (e) => {
            const rect = watched_swiper.getBoundingClientRect();
            const inRight = e.clientX >= rect.right - rect.width * PEEK_ZONE;
            const inLeft  = e.clientX <= rect.left  + rect.width * PEEK_ZONE;
            watched_swiper.classList.toggle('is-peek', inRight);
            watched_swiper.classList.toggle('is-peek-left', inLeft);
        });
        watched_swiper.addEventListener('mouseleave', () => {
            watched_swiper.classList.remove('is-peek');
            watched_swiper.classList.remove('is-peek-left');
        });

        const watched_section = watched_swiper.closest('.watched');
        const watched_more = watched_section && watched_section.querySelector('[data-watched-more]');
        if (watched_more) {
            watched_more.addEventListener('click', () => watched_section.classList.add('watched--expanded'));
        }
    }

    // «Почему выбирают нас?» (about): слайдер только на планшете (751–1200);
    // на десктопе — свой грид, на мобилке — вертикальный стек (Swiper уничтожается)
    const about_why_swiper = document.querySelector('.about-why-swiper');
    if (about_why_swiper) {
        const about_why_mq = window.matchMedia('(min-width: 751px) and (max-width: 1200px)');
        let about_why = null;

        const sync_about_why = () => {
            if (about_why_mq.matches) {
                if (!about_why) {
                    about_why = new Swiper(about_why_swiper, {
                        slidesPerView: 'auto',
                        spaceBetween: 10,
                        navigation: {
                            prevEl: '.about-why .slider-actions__prev',
                            nextEl: '.about-why .slider-actions__next',
                        },
                        pagination: {
                            el: '.about-why .slider-actions__pagination',
                            type: 'fraction',
                        },
                    });
                }
            } else if (about_why) {
                about_why.destroy(true, true);
                about_why = null;
            }
        };

        sync_about_why();
        about_why_mq.addEventListener('change', sync_about_why);
    }

    // «Приглашаем к сотрудничеству» (about): слайдер на планшете и мобилке (≤1200);
    // Десктоп — грид на .swiper-wrapper: head/btn переносим внутрь него (грид-ячейки).
    // Планшет/мобилка — head/btn возвращаем в .about-coop__grid и включаем Swiper.
    const about_coop_swiper = document.querySelector('.about-coop-swiper');
    if (about_coop_swiper) {
        const about_coop_mq = window.matchMedia('(max-width: 1200px)');
        const coop_grid    = about_coop_swiper.closest('.about-coop').querySelector('.about-coop__grid');
        const coop_wrapper = about_coop_swiper.querySelector('.swiper-wrapper');
        const coop_slider  = coop_grid.querySelector('.about-coop__slider');
        const coop_head    = coop_grid.parentElement.querySelector('.about-coop__head');
        const coop_btn     = coop_grid.parentElement.querySelector('.about-coop__btn');
        let about_coop = null;

        const sync_about_coop = () => {
            if (about_coop_mq.matches) {
                // head/btn — в грид (перед слайдером / после), затем Swiper
                if (coop_head) coop_grid.insertBefore(coop_head, coop_slider);
                if (coop_btn)  coop_grid.appendChild(coop_btn);
                if (!about_coop) {
                    about_coop = new Swiper(about_coop_swiper, {
                        slidesPerView: 'auto',
                        spaceBetween: 10,
                        navigation: {
                            prevEl: '.about-coop .slider-actions__prev',
                            nextEl: '.about-coop .slider-actions__next',
                        },
                        pagination: {
                            el: '.about-coop .slider-actions__pagination',
                            type: 'fraction',
                            // всего — число карточек (5), а не число позиций прокрутки:
                            // spv:'auto' схлопывает последние снапы (у края видно 2 карточки
                            // сразу) и дефолтный total показывал бы 4
                            formatFractionTotal: () => coop_wrapper.querySelectorAll('.swiper-slide').length,
                        },
                        breakpoints: {
                            751: { spaceBetween: 22 },
                        },
                    });
                }
            } else {
                // десктоп: уничтожаем Swiper и кладём head/btn внутрь .swiper-wrapper (грид-ячейки)
                if (about_coop) { about_coop.destroy(true, true); about_coop = null; }
                if (coop_head) coop_wrapper.appendChild(coop_head);
                if (coop_btn)  coop_wrapper.appendChild(coop_btn);
            }
        };

        sync_about_coop();
        about_coop_mq.addEventListener('change', sync_about_coop);
    }

    // ui-select: кастомный дропдаун поверх нативного <select>.
    // Разметка: <div class="ui-select"><select>…</select></div> — остальное генерируется тут.
    // Нативный select прячется (атрибут hidden) и остаётся для отправки формы.
    document.querySelectorAll('.ui-select').forEach(root => {
        const select = root.querySelector('select');
        if (!select || root.dataset.uiReady) return;
        root.dataset.uiReady = '1';

        // убрать «ручной» svg-шеврон из исходной разметки, если он был
        root.querySelectorAll(':scope > svg').forEach(s => s.remove());
        select.setAttribute('hidden', '');

        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'ui-select__trigger';
        trigger.innerHTML =
            '<span class="ui-select__value"></span>' +
            '<svg class="ui-select__chevron" width="14" height="8" viewBox="0 0 16 9" fill="none">' +
            '<path d="M2 1.25L8.2 7.25L14.41 1.25" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        const value = trigger.querySelector('.ui-select__value');

        const menu = document.createElement('div');
        menu.className = 'ui-select__menu';
        Array.from(select.options).forEach((opt, i) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'ui-select__option';
            item.textContent = opt.textContent;
            item.dataset.index = i;
            menu.appendChild(item);
        });

        const sync = () => {
            const opt = select.options[select.selectedIndex];
            value.textContent = opt ? opt.textContent : '';
            menu.querySelectorAll('.ui-select__option').forEach((el, i) =>
                el.classList.toggle('is-selected', i === select.selectedIndex));
        };

        const close = () => root.classList.remove('ui-select--open');

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const willOpen = !root.classList.contains('ui-select--open');
            document.querySelectorAll('.ui-select--open').forEach(o => o.classList.remove('ui-select--open'));
            root.classList.toggle('ui-select--open', willOpen);
        });
        menu.addEventListener('click', (e) => {
            const item = e.target.closest('.ui-select__option');
            if (!item) return;
            select.selectedIndex = +item.dataset.index;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            sync();
            close();
        });
        select.addEventListener('change', sync);
        document.addEventListener('click', (e) => { if (!root.contains(e.target)) close(); });

        root.appendChild(trigger);
        root.appendChild(menu);
        sync();
    });

    // хлебные крошки: выпадающее меню по клику (на мобилке; на ПК — ховер)
    const breadcrumbs_drops = document.querySelectorAll('.breadcrumbs__drop');
    if (breadcrumbs_drops.length) {
        const breadcrumbs_mq = window.matchMedia('(max-width: 750px)');

        breadcrumbs_drops.forEach(drop => {
            const link = drop.querySelector('.breadcrumbs__link--drop');
            if (!link) return;

            link.addEventListener('click', (e) => {
                if (!breadcrumbs_mq.matches) return;
                e.preventDefault();
                const open = drop.classList.contains('is-open');
                breadcrumbs_drops.forEach(d => d.classList.remove('is-open'));
                if (!open) drop.classList.add('is-open');
            });
        });

        document.addEventListener('click', (e) => {
            if (e.target.closest('.breadcrumbs__drop')) return;
            breadcrumbs_drops.forEach(d => d.classList.remove('is-open'));
        });
    }

    const profi_accordion = document.querySelector('[data-profi-accordion]');
    if (profi_accordion) {
        const profi_items = profi_accordion.querySelectorAll('[data-profi-item]');
        const profi_tabs  = document.querySelectorAll('[data-profi-tab]');

        const set_panel_width = () => {
            const w = profi_accordion.clientWidth - 950;
            profi_accordion.style.setProperty('--profi-panel-w', w + 'px');
        };
        set_panel_width();
        window.addEventListener('resize', set_panel_width);

        const profi_activate = idx => {
            profi_items.forEach((i, n) => i.classList.toggle('profi__item--active', n === idx));
            profi_tabs .forEach((t, n) => t.classList.toggle('profi__tab--active', n === idx));
        };

        profi_items.forEach((item, idx) => {
            const card = item.querySelector('[data-profi-card]') || item;
            card.addEventListener('click', () => profi_activate(idx));
        });

        profi_tabs.forEach((tab, idx) => tab.addEventListener('click', () => profi_activate(idx)));
    }

    const tabs = document.querySelectorAll('[data-tabs]');
    tabs.forEach(tab => {
        const heads    = tab.querySelectorAll('[data-tabs-head]');
        const contents = tab.querySelectorAll('[data-tabs-content]');

        heads.forEach((head, idx) => {
            head.addEventListener('pointerdown', () => {
                heads   .forEach(h=>h.setAttribute('data-tabs-head',    ''));
                contents.forEach(c=>c.setAttribute('data-tabs-content', ''));

                head         .setAttribute('data-tabs-head',    'active');
                contents[idx].setAttribute('data-tabs-content', 'active');
            });
        });
    });

    document.querySelectorAll('[data-accordion]').forEach(accordion => {
        const allow_multiple = accordion.hasAttribute('data-accordion-multiple');

        accordion.querySelectorAll('[data-accordion-trigger]').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                // клик по иконке-подсказке фильтра не раскрывает аккордеон
                if (e.target.closest('.cat-filters__info')) return;

                const item = trigger.closest('[data-accordion-item]');
                if (!item || item.closest('[data-accordion]') !== accordion) return;

                const is_open = item.dataset.accordionItem === 'open';

                if (!allow_multiple) {
                    accordion.querySelectorAll('[data-accordion-item]').forEach(i => {
                        if (i.closest('[data-accordion]') === accordion) i.dataset.accordionItem = '';
                    });
                }

                item.dataset.accordionItem = is_open ? '' : 'open';
            });
        });
    });

    // FAQ (designers): плавная анимация высоты раскрытия — max-height по фактической
    // высоте контента (иначе фиксированный max-height даёт «залипание» при закрытии)
    document.querySelectorAll('.des-faq[data-accordion]').forEach(faq => {
        const sync = () => {
            faq.querySelectorAll('[data-accordion-item]').forEach(item => {
                const drop = item.querySelector('[data-accordion-dropdown]');
                if (drop) drop.style.maxHeight = item.dataset.accordionItem === 'open'
                    ? drop.scrollHeight + 'px'
                    : '0px';
            });
        };

        sync(); // стартовое состояние (открытый пункт)

        // общий обработчик [data-accordion] уже переключил data-accordion-item
        // (срабатывает на триггере раньше, чем всплытие сюда) — пересчитываем высоты
        faq.addEventListener('click', (e) => {
            if (e.target.closest('[data-accordion-trigger]')) sync();
        });

        window.addEventListener('resize', sync);
    });

    document.querySelectorAll('[data-expand]').forEach(group => {
        const list = group.querySelector('[data-expand-list]');
        const btn  = group.querySelector('[data-expand-btn]');
        if (!list || !btn) return;

        const is_open = () => group.dataset.expand === 'open';

        const apply = () => {
            if (is_open()) {
                list.style.maxHeight = list.scrollHeight + 'px';
            } else {
                const first = list.firstElementChild;
                list.style.maxHeight = (first ? first.offsetHeight : 0) + 'px';
            }
        };

        apply();
        btn.addEventListener('click', () => {
            group.dataset.expand = is_open() ? '' : 'open';
            apply();
        });
        window.addEventListener('resize', apply);
    });

    // раскрытие свёрнутого SEO-текста (моб. секция «Плитка… в Сочи»)
    document.querySelectorAll('[data-mozaika-toggle]').forEach(btn => {
        const section = btn.closest('.mozaika');
        if (!section) return;

        btn.addEventListener('click', () => {
            const expanded = section.classList.toggle('mozaika--expanded');
            btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        });
    });

    // Слайдер картинок внутри карточки товара.
    // Ориентируемся на тип указателя, а не на ширину: на устройстве с мышью (десктоп) —
    // перелистывание наведением (mousemove по зонам), свайп выключен; на тач-устройствах
    // (моб/планшет, в т.ч. 992–1200) — свайп пальцем, наведение не вешаем.
    const product_pointer_mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const initProductSlider = (el) => {
        if (el.swiper) return el.swiper;                 // не инициализируем повторно
        const slider = new Swiper(el, {
            slidesPerView: 1,
            allowTouchMove: !product_pointer_mq.matches, // тач-устройства — свайп включён
            pagination: {
                el: el.querySelector('.swiper-pagination'),
                clickable: true,
            },
        });

        product_pointer_mq.addEventListener('change', (e) => {
            slider.allowTouchMove = !e.matches;
        });

        // перелистывание наведением — только на устройствах с мышью (иначе мешает свайпу)
        if (product_pointer_mq.matches) {
            let zone = 0;
            el.addEventListener('mousemove', (e) => {
                const rect  = el.getBoundingClientRect();
                const count = slider.slides.length;
                let idx = Math.floor(((e.clientX - rect.left) / rect.width) * count);
                idx = Math.max(0, Math.min(count - 1, idx));
                if (idx === zone) return;
                zone = idx;
                slider.slideTo(idx, 0);
            });
            el.addEventListener('mouseleave', () => {
                zone = 0;
                slider.slideTo(0, 0);
            });
        }
        return slider;
    };
    document.querySelectorAll('[data-product-slider]').forEach(initProductSlider);

    const catalog_btn  = document.querySelector('.header__catalog');
    const catalog      = document.querySelector('[data-catalog]');
    const mobile_menu  = document.querySelector('[data-mobile-menu]');
    const desktop_mq   = window.matchMedia('(min-width: 751px)');

    const lock_scroll   = () => document.body.style.setProperty('overflow', 'hidden');
    const unlock_scroll = () => document.body.style.removeProperty('overflow');

    const set_catalog_tab = (key) => {
        catalog.querySelectorAll('[data-catalog-tab]').forEach(i =>
            i.classList.toggle('catalog__nav-item--active', i.dataset.catalogTab === key));
        catalog.querySelectorAll('[data-catalog-panel]').forEach(p =>
            p.classList.toggle('catalog__panel--active', p.dataset.catalogPanel === key));
    };

    const position_catalog = () => {
        const sticked = document.querySelector('.header__mid--sticked');
        if (sticked) {
            catalog.style.position = 'fixed';
            catalog.style.top = sticked.getBoundingClientRect().bottom + 'px';
            catalog.style.height = 'calc(100dvh - ' + sticked.getBoundingClientRect().height + 'px)';
        } else {
            const header_el = document.querySelector('.header');
            catalog.style.position = 'absolute';
            catalog.style.top = (header_el.offsetTop + header_el.offsetHeight) + 'px';
            catalog.style.height = 'calc(100dvh - ' + header_el.getBoundingClientRect().height + 'px)';
        }
    };

    const open_catalog  = () => {
        if (!header_sticked) window.scrollTo(0,0);

        document.body.style.setProperty('overflow', 'hidden');
        document.querySelector('html').style.setProperty('overflow', 'hidden');

        set_catalog_tab('tile');
        position_catalog();
        catalog.classList.add('catalog--open');
        if (catalog_btn) catalog_btn.classList.add('header__catalog--active');
    };
    const close_catalog = () => {
        document.body.style.setProperty('overflow', 'unset');
        document.querySelector('html').style.setProperty('overflow', 'unset');

        if (catalog) catalog.classList.remove('catalog--open');
        if (catalog_btn) catalog_btn.classList.remove('header__catalog--active');
    };

    if (catalog) {
        // десктоп: наведение переключает панель (мега-меню)
        catalog.querySelectorAll('[data-catalog-tab]').forEach(tab => {
            tab.addEventListener('mouseenter', () => { if (desktop_mq.matches) set_catalog_tab(tab.dataset.catalogTab); });
        });

        // клик вне — закрыть (только десктоп: на моб дровер во весь экран)
        document.addEventListener('click', (e) => {
            if (desktop_mq.matches &&
                catalog.classList.contains('catalog--open') &&
                !catalog.contains(e.target) &&
                !(catalog_btn && catalog_btn.contains(e.target))) {
                close_catalog();
            }
        });
        window.addEventListener('scroll', () => desktop_mq.matches && catalog.classList.contains('catalog--open') && position_catalog());
        window.addEventListener('resize', () => desktop_mq.matches && catalog.classList.contains('catalog--open') && position_catalog());
    }

    /* меню открывается ПОД шапкой (как каталог на пк): шапка остаётся на виду,
       меню растягивается на оставшуюся высоту экрана */
    // ЕДИНЫЙ каталог-меню: mobile_menu === тот же .catalog. На моб открывается как дровер.
    const reset_drill = () => catalog &&
        catalog.querySelectorAll('.catalog__panel--active').forEach(p => p.classList.remove('catalog__panel--active'));
    const position_mobile = () => {
        if (!mobile_menu) return;
        const mid = document.querySelector('.header__mid');
        mobile_menu.style.position = 'fixed';
        mobile_menu.style.height = '';
        mobile_menu.style.top = (mid ? mid.getBoundingClientRect().bottom : 0) + 'px';
    };
    const botnav_catalog = document.querySelector('.botnav [data-mobile-menu-open]');
    const open_mobile  = () => {
        if (!mobile_menu) return;
        window.scrollTo(0, 0);
        document.body.classList.add('mobile-menu-open');
        // подсвечиваем пункт «Каталог» в нижнем меню
        if (botnav_catalog) {
            document.querySelectorAll('.botnav__item--active').forEach(i => i.classList.remove('botnav__item--active'));
            botnav_catalog.classList.add('botnav__item--active');
        }
        reset_drill();                 // открываем на списке категорий, не в подкатегории
        position_mobile();
        mobile_menu.classList.add('catalog--open');
        lock_scroll();
    };
    const close_mobile = () => {
        if (!mobile_menu) return;
        mobile_menu.classList.remove('catalog--open');
        reset_drill();
        document.body.classList.remove('mobile-menu-open');
        // после закрытия каталога активным становится «Главная»
        if (botnav_catalog) {
            document.querySelectorAll('.botnav__item--active').forEach(i => i.classList.remove('botnav__item--active'));
            const botnav_home = document.querySelector('.botnav__item');
            if (botnav_home) botnav_home.classList.add('botnav__item--active');
        }
        unlock_scroll();
    };
    window.addEventListener('resize', () => {
        if (mobile_menu && !desktop_mq.matches && mobile_menu.classList.contains('catalog--open')) position_mobile();
    });

    if (mobile_menu) {
        mobile_menu.querySelectorAll('[data-mobile-close]').forEach(b => b.addEventListener('click', close_mobile));
        // дрилдаун (моб): клик по категории открывает её панель поверх списка
        mobile_menu.querySelectorAll('[data-catalog-tab]').forEach(b => b.addEventListener('click', () => {
            if (desktop_mq.matches) return;
            set_catalog_tab(b.dataset.catalogTab);   // ставит .catalog__panel--active + подсветку
            const nav = mobile_menu.querySelector('.catalog__nav');
            if (nav) nav.scrollTop = 0;
        }));
        mobile_menu.querySelectorAll('[data-catalog-back]').forEach(b => b.addEventListener('click', reset_drill));
        const m_tabs = mobile_menu.querySelectorAll('.catalog__tab');
        m_tabs.forEach(t => t.addEventListener('click', () => {
            m_tabs.forEach(x => x.classList.remove('catalog__tab--active'));
            t.classList.add('catalog__tab--active');
        }));
    }

    document.querySelectorAll('[data-mobile-menu-open]').forEach(b => b.addEventListener('click', (e) => {
        // не даём этому клику всплыть до document-обработчика «клик вне каталога»,
        // иначе на ≥751 он сразу же закроет только что открытое меню
        e.stopPropagation();
        // ≥751 — каталог открывается как мега-меню (open_catalog), ≤750 — как дровер (open_mobile)
        desktop_mq.matches ? open_catalog() : open_mobile();
        // если у триггера указана категория (напр. кнопка «Все» на странице категории) —
        // открываем то же каталог-меню сразу с раскрытой этой категорией (дрилдаун на моб / панель на пк)
        const tab = b.dataset.mobileMenuOpen;
        if (tab) {
            set_catalog_tab(tab);
            const nav = mobile_menu && mobile_menu.querySelector('.catalog__nav');
            if (nav) nav.scrollTop = 0;
        }
    }));

    const search_overlay = document.querySelector('[data-search]');
    const search_backdrop = document.querySelector('.m-search-overlay');
    const botnav_search = document.querySelector('.botnav [data-search-open]');
    let botnav_prev_active = null;
    const open_search  = () => {
        if (!search_overlay) return;
        search_overlay.classList.add('m-search--open');
        if (search_backdrop) search_backdrop.classList.add('m-search-overlay--show');
        // подсвечиваем пункт «Поиск» в нижнем меню, прежний активный запоминаем
        if (botnav_search) {
            botnav_prev_active = document.querySelector('.botnav__item--active');
            if (botnav_prev_active) botnav_prev_active.classList.remove('botnav__item--active');
            botnav_search.classList.add('botnav__item--active');
        }
        lock_scroll();
        const inp = search_overlay.querySelector('input');
        if (inp) setTimeout(() => inp.focus(), 50);
    };
    const close_search = () => {
        if (!search_overlay) return;
        search_overlay.classList.remove('m-search--open');
        if (search_backdrop) search_backdrop.classList.remove('m-search-overlay--show');
        if (botnav_search) {
            botnav_search.classList.remove('botnav__item--active');
            if (botnav_prev_active) botnav_prev_active.classList.add('botnav__item--active');
            botnav_prev_active = null;
        }
        unlock_scroll();
    };
    document.querySelectorAll('[data-search-open]').forEach(b => b.addEventListener('click', open_search));
    document.querySelectorAll('[data-search-close]').forEach(b => b.addEventListener('click', close_search));

    const filters_aside   = document.querySelector('[data-filters]');
    const filters_overlay = document.querySelector('.cat-filters__overlay');
    const open_filters  = () => {
        if (!filters_aside) return;
        filters_aside.classList.add('category__filters--open');
        if (filters_overlay) filters_overlay.classList.add('cat-filters__overlay--show');
        lock_scroll();
    };
    const close_filters = () => {
        if (!filters_aside) return;
        filters_aside.classList.remove('category__filters--open');
        if (filters_overlay) filters_overlay.classList.remove('cat-filters__overlay--show');
        unlock_scroll();
    };
    document.querySelectorAll('[data-filters-open]').forEach(b => b.addEventListener('click', open_filters));
    document.querySelectorAll('[data-filters-close]').forEach(b => b.addEventListener('click', close_filters));

    // подсказки-tip в фильтрах: показ по клику + сдвиг, чтобы не выходили за экран
    const info_tips = document.querySelectorAll('.cat-filters__info');
    if (info_tips.length) {
        const TIP_PAD = 12;

        const drawer_mq = window.matchMedia('(max-width: 1200px)');

        const clamp_tip = (info) => {
            const tip = info.querySelector('.cat-filters__info_tip');
            if (!tip) return;
            tip.style.setProperty('--tip-shift', '0px');
            const rect = tip.getBoundingClientRect();
            /* на ≤1200 фильтры — дровер со скроллом: зажимаем в его границы
               (overflow панели обрезает всё, что торчит наружу), иначе — в экран */
            const drawer = drawer_mq.matches && info.closest('[data-filters]');
            const bounds = drawer ? drawer.getBoundingClientRect() : { left: 0, right: window.innerWidth };
            let shift = 0;
            if (rect.left < bounds.left + TIP_PAD) shift = bounds.left + TIP_PAD - rect.left;
            else if (rect.right > bounds.right - TIP_PAD) shift = bounds.right - TIP_PAD - rect.right;
            tip.style.setProperty('--tip-shift', Math.round(shift) + 'px');
        };

        const close_tips = () => info_tips.forEach(i => i.classList.remove('is-open'));

        info_tips.forEach(info => {
            info.addEventListener('mouseenter', () => clamp_tip(info));
            info.addEventListener('click', (e) => {
                // клик по самой подсказке не закрывает её
                if (e.target.closest('.cat-filters__info_tip')) return;
                e.preventDefault();
                e.stopPropagation();          // не переключать аккордеон строки фильтра
                const was_open = info.classList.contains('is-open');
                close_tips();
                if (!was_open) {
                    info.classList.add('is-open');
                    clamp_tip(info);
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.cat-filters__info')) close_tips();
        });
        window.addEventListener('resize', () => {
            info_tips.forEach(i => i.classList.contains('is-open') && clamp_tip(i));
        });
    }

    if (catalog_btn) {
        catalog_btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (desktop_mq.matches) {
                catalog.classList.contains('catalog--open') ? close_catalog() : open_catalog();
            } else {
                mobile_menu && mobile_menu.classList.contains('catalog--open') ? close_mobile() : open_mobile();
            }
        });
    }

    window.open_popup = (name) => {
        const win = document.querySelector(`[data-popup-window="${name}"]`);
        if (win) { win.classList.add('popup--open'); lock_scroll(); }
    };
    window.close_popup = () => {
        document.querySelectorAll('.popup--open').forEach(w => w.classList.remove('popup--open'));
        unlock_scroll();
    };

    document.querySelectorAll('[data-popup]').forEach(t => t.addEventListener('click', (e) => {
        e.preventDefault();
        close_catalog();
        close_mobile();
        window.open_popup(t.dataset.popup);
    }));
    document.querySelectorAll('[data-popup-close]').forEach(b => b.addEventListener('click', window.close_popup));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { close_catalog(); close_mobile(); close_search(); close_filters(); window.close_popup(); }
    });

    document.querySelectorAll('[data-dynamic-phone]').forEach(root => {
        const trigger = root.querySelector('[data-phone-trigger]');
        const flagBox = root.querySelector('[data-phone-flag]');
        const options = root.querySelectorAll('[data-phone-option]');
        const input   = root.querySelector('[data-phone-input]');
        if (!trigger || !flagBox || !input || !options.length) return;

        let dial = '';
        let mask = '';

        const slotsCount = () => (mask.match(/0/g) || []).length;

        const format = (digits) => {
            let res = '', di = 0;
            for (const ch of mask) {
                if (di >= digits.length) break;
                if (ch === '0') res += digits[di++];
                else res += ch;
            }
            return res;
        };

        const typedDigits = () => {
            const dialDigits = dial.replace(/\D/g, '');
            let all = input.value.replace(/\D/g, '');
            if (all.startsWith(dialDigits)) all = all.slice(dialDigits.length);
            return all.slice(0, slotsCount());
        };

        const render = (digits) => {
            input.value = digits ? `${dial} ${format(digits)}` : '';
        };

        const setCountry = (option, focusInput) => {
            dial = option.dataset.dial || '';
            mask = option.dataset.mask || '';
            const flag = option.querySelector('.phone__flag');
            if (flag) flagBox.innerHTML = flag.innerHTML;
            input.placeholder = `${dial} ${mask}`.trim();
            render(typedDigits());
            if (focusInput) input.focus();
        };

        const close = () => {
            root.classList.remove('phone--open');
            trigger.setAttribute('aria-expanded', 'false');
        };

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const open = root.classList.toggle('phone--open');
            trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
        });

        options.forEach(option => option.addEventListener('click', () => {
            setCountry(option, true);
            close();
        }));

        input.addEventListener('input', () => render(typedDigits()));
        input.addEventListener('focus', () => { if (!input.value) input.value = dial + ' '; });
        input.addEventListener('blur',  () => { if (!typedDigits()) input.value = ''; });

        document.addEventListener('click', (e) => { if (!root.contains(e.target)) close(); });

        setCountry(root.querySelector('[data-phone-option].is-active') || options[0], false);
    });

    const price_filters = document.querySelectorAll('.price-filter');
    price_filters.forEach(price_filter => {
        const slider   = price_filter.querySelector('.price-filter__slider');
        const inp_from = price_filter.querySelector('.price-filter__inp--from');
        const inp_to   = price_filter.querySelector('.price-filter__inp--to');
        const inps     = [inp_from, inp_to];

        noUiSlider.create(slider, {
            start  : [price_filter.dataset.priceRangeFrom, price_filter.dataset.priceRangeTo],
            connect: true,
            range  : {
                'min': +price_filter.dataset.priceRangeFrom,
                'max': +price_filter.dataset.priceRangeTo,
            }
        });

        slider.noUiSlider.on('update', function(values, handle) {
            inps[handle].value = Math.round(values[handle]);
        });

        const setRangeSlider = (i, value) => {
            let arr = [null, null];
            arr[i] = value;

            slider.noUiSlider.set(arr);
        };

        inps.forEach((el, index) => {
            el.addEventListener('change', (e) => {
                setRangeSlider(index, e.currentTarget.value);
            });
        });
    });

    const seo_btn = document.querySelector('[data-seo-btn]');
    const seo     = document.querySelector('[data-seo]');
    if (seo_btn && seo) {
        seo_btn.addEventListener('click', () => {
            seo.hidden = false;
            requestAnimationFrame(() => {
                seo.style.maxHeight = seo.scrollHeight + 'px';
            });
            seo.addEventListener('transitionend', () => {
                seo.style.maxHeight = 'none';
            }, { once: true });

            const bottom = seo_btn.closest('.house__bottom') || seo_btn;
            bottom.classList.add('house__bottom--hidden');
        });
    }

    // характеристики товара (моб): «Все характеристики» раскрывает свёрнутую таблицу
    document.querySelectorAll('[data-specs-more]').forEach(btn => {
        btn.addEventListener('click', () => {
            const specs = btn.closest('[data-specs]');
            if (specs) specs.classList.add('pspecs--open');
        });
    });

    const product_tabs = document.querySelectorAll('.ptabs__tab');
    document.querySelectorAll('[data-scroll-to]').forEach(el => {
        el.addEventListener('click', (e) => {
            const id = el.dataset.scrollTo;
            const target = document.getElementById(id);
            if (target) {
                e.preventDefault();
                const top = target.getBoundingClientRect().top + window.scrollY - 110;
                window.scrollTo({ top, behavior: 'smooth' });
            }
            if (el.classList.contains('ptabs__tab')) {
                product_tabs.forEach(t => t.classList.remove('ptabs__tab--active'));
                el.classList.add('ptabs__tab--active');
            }
        });
    });

    // ptabs как дропдаун (моб): триггер открывает список, выбор таба обновляет текст и закрывает
    const ptabs = document.querySelector('[data-ptabs]');
    if (ptabs) {
        const ptabs_toggle = ptabs.querySelector('[data-ptabs-toggle]');
        if (ptabs_toggle) {
            ptabs_toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                ptabs.classList.toggle('ptabs--open');
            });
            document.addEventListener('click', (e) => {
                if (!ptabs.contains(e.target)) ptabs.classList.remove('ptabs--open');
            });
        }
        // выбор таба только закрывает дропдаун (текст триггера не меняем)
        ptabs.querySelectorAll('.ptabs__tab').forEach(tab => {
            tab.addEventListener('click', () => ptabs.classList.remove('ptabs--open'));
        });
    }

    let copyToastTimer = null;
    const showCopyToast = (text = 'Скопировано', anchor = null) => {
        let toast = document.querySelector('.copy-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'copy-toast';
            toast.innerHTML =
                '<svg class="copy-toast__ic" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" stroke-width="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2"/></svg>' +
                '<span class="copy-toast__text"></span>';
            document.body.appendChild(toast);
        }
        toast.querySelector('.copy-toast__text').textContent = text;

        /* показываем сообщение над элементом, на который кликнули */
        const rect = anchor && anchor.getBoundingClientRect();
        if (rect) {
            /* зажимаем центр по X, чтобы тост не вышел за края экрана */
            const PAD = 8;
            const half = toast.offsetWidth / 2;
            let cx = rect.left + rect.width / 2;
            cx = Math.max(PAD + half, Math.min(cx, window.innerWidth - PAD - half));
            toast.style.left = cx + 'px';
            toast.style.top = rect.top + 'px';
        } else {
            toast.style.left = '50%';
            toast.style.top = (window.innerHeight - 40) + 'px';
        }

        void toast.offsetWidth;
        toast.classList.add('copy-toast--visible');
        clearTimeout(copyToastTimer);
        copyToastTimer = setTimeout(() => toast.classList.remove('copy-toast--visible'), 1800);
    };

    const writeClipboard = (val) => {
        if (!val) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(val).catch(() => {});
        } else {
            const ta = document.createElement('textarea');
            ta.value = val;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); } catch (e) {}
            document.body.removeChild(ta);
        }
    };

    const copyText = (val, anchor) => {
        if (!val) return;
        writeClipboard(val);
        showCopyToast('Скопировано', anchor);
    };

    document.querySelectorAll('[data-copy]').forEach(btn => {
        btn.addEventListener('click', () => copyText(btn.dataset.copy, btn));
    });

    document.querySelectorAll('[data-copy-tip]').forEach(el => {
        const label = el.querySelector('[data-copy-tip-label]');
        const reset = () => {
            if (label) label.textContent = 'Скопировать';
            el.classList.remove('is-copied');
        };
        el.addEventListener('click', (e) => {
            e.preventDefault();
            writeClipboard(el.dataset.copyTip);
            if (label) label.textContent = 'Скопировано';
            el.classList.add('is-copied');
        });
        el.addEventListener('mouseleave', reset);
    });

    document.querySelectorAll('.contact-card__copy, .addresses__phone-copy').forEach(btn => {
        const getValue = () => {
            const pill = btn.closest('.contact-card__pill, .addresses__phone');
            return pill ? pill.textContent.trim() : '';
        };
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            copyText(getValue(), btn);
        });
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                copyText(getValue(), btn);
            }
        });
    });

    const buyboxFull    = document.querySelector('[data-buybox-full]');
    const buyboxStickies = document.querySelectorAll('[data-buybox-sticky]'); // моб-плашка
    if (buyboxFull) {
        const buyboxAside = buyboxFull.closest('.buybox');
        // компакт-режим — пока панель является правой колонкой (десктоп и планшет
        // ≥951); на ≤950 она уезжает вниз на всю ширину («разворот») — там не нужен
        const compactMq   = window.matchMedia('(min-width: 951px)');
        // высота полной панели: порог компакт-режима считаем от неё, а не от
        // текущего rect панели — иначе схлопывание меняло бы сам порог (цикл)
        let buyboxFullH = 0;

        const updateBuyboxSticky = () => {
            const stickyHeader = parseInt(getComputedStyle(document.body).getPropertyValue('--sticky-header-height'), 10) || 0;
            const offset = stickyHeader + 20;

            if (compactMq.matches && buyboxAside) {
                if (!buyboxFull.classList.contains('buybox__inner--compact')) buyboxFullH = buyboxFull.offsetHeight;
                const passed = buyboxAside.getBoundingClientRect().top + buyboxFullH < offset;
                buyboxFull.classList.toggle('buybox__inner--compact', passed);
            } else {
                buyboxFull.classList.remove('buybox__inner--compact');
            }

            const passedBar = buyboxFull.getBoundingClientRect().bottom < offset;
            buyboxStickies.forEach(el => {
                el.classList.toggle('is-visible', passedBar);
                el.setAttribute('aria-hidden', passedBar ? 'false' : 'true');
            });
        };
        window.addEventListener('scroll', updateBuyboxSticky, { passive: true });
        window.addEventListener('resize', updateBuyboxSticky);
        updateBuyboxSticky();
    }

    const gallery = document.querySelector('[data-gallery]');
    if (gallery) {
        const stageEl  = gallery.querySelector('[data-gallery-stage]');
        const thumbsEl = gallery.querySelector('[data-thumbs-swiper]');

        const thumbsSwiper = new Swiper(thumbsEl, {
            slidesPerView: 'auto',
            spaceBetween: 10,
            watchOverflow: true,
            watchSlidesProgress: true,
            navigation: {
                prevEl: gallery.querySelector('[data-thumbs-prev]'),
                nextEl: gallery.querySelector('[data-thumbs-next]'),
                disabledClass: 'is-disabled',
                lockClass: 'is-hidden',
            },
        });

        const mainSwiper = new Swiper(stageEl, {
            slidesPerView: 1,
            navigation: {
                prevEl: gallery.querySelector('[data-gallery-prev]'),
                nextEl: gallery.querySelector('[data-gallery-next]'),
            },
            pagination: {
                el: '[data-gallery-pag]'
            },
            thumbs: {
                swiper: thumbsSwiper,
                slideThumbActiveClass: 'gallery__thumb--active',
            },
        });

    }

    document.querySelectorAll('[data-download-textures]').forEach(btn => {
        btn.addEventListener('click', () => {
            const win = document.querySelector('[data-popup-window="textures"]');
            if (win) { win.classList.add('popup--open'); document.body.style.overflow = 'hidden'; }
        });
    });

    // «Варианты рисунка» — карусель со стрелками/фракцией на планшете+,
    // на мобилке (≤750) Swiper уничтожается → слайды идут вертикальным стеком (CSS)
    const patterns_carousel = document.querySelector('[data-patterns-carousel]');
    if (patterns_carousel) {
        const section = patterns_carousel.closest('.patterns');
        const actions = section ? section.querySelector('.slider-actions') : null;
        const patterns_mq = window.matchMedia('(min-width: 751px)');
        let patterns_swiper = null;

        const build_patterns = () => {
            if (patterns_swiper) return;
            patterns_swiper = new Swiper(patterns_carousel, {
                slidesPerView: 2,
                spaceBetween: 10,
                watchOverflow: true,
                navigation: actions ? {
                    prevEl: actions.querySelector('.slider-actions__prev'),
                    nextEl: actions.querySelector('.slider-actions__next'),
                } : false,
                pagination: actions ? {
                    el: actions.querySelector('.slider-actions__pagination'),
                    type: 'fraction',
                } : false,
                breakpoints: {
                    768:  { slidesPerView: 3 },
                    1200: { slidesPerView: 4 },
                },
            });
        };
        const destroy_patterns = () => {
            if (patterns_swiper) { patterns_swiper.destroy(true, true); patterns_swiper = null; }
        };
        const sync_patterns = () => patterns_mq.matches ? build_patterns() : destroy_patterns();
        sync_patterns();
        patterns_mq.addEventListener('change', sync_patterns);

        // плитка «Смотреть все» открывает галерею PhotoSwipe с первого изображения
        const more       = patterns_carousel.querySelector('[data-patterns-more]');
        const first_cell = patterns_carousel.querySelector('a.patterns__cell');
        if (more && first_cell) more.addEventListener('click', () => first_cell.click());
    }

    document.querySelectorAll('[data-carousel]').forEach(el => {
        const slider = el.closest('.prod-carousel__slider') || el;
        const section = el.closest('.prod-carousel') || slider;
        const nextBtn = slider.querySelector('[data-carousel-next]');
        const actions = section.querySelector('.slider-actions');
        const desktopSpv = parseFloat(el.dataset.carousel) || 4;

        const sync_scrollable = (s) => slider.classList.toggle('is-scrollable', !s.isLocked);

        // секции товаров (.prod-carousel) на мобилке — не карусель, а сетка 2 кол. (как «Ранее вы смотрели»)
        const is_prod = !!el.closest('.prod-carousel');
        let swiper = null;

        const build = () => {
            if (swiper) return;
            swiper = new Swiper(el, {
                slidesPerView: 1.2,
                spaceBetween: 20,
                loop: true,
                watchOverflow: true,
                navigation: actions ? {
                    prevEl: actions.querySelector('.slider-actions__prev'),
                    nextEl: actions.querySelector('.slider-actions__next'),
                } : (nextBtn ? { nextEl: nextBtn } : false),
                pagination: actions ? {
                    el: actions.querySelector('.slider-actions__pagination'),
                    type: 'fraction',
                } : false,
                // секции товаров (.prod-carousel) на планшете (751–1200) — по 2 карточки
                // (без промежуточного 768:3); остальные карусели — общая шкала 2→3→desktop
                breakpoints: is_prod ? {
                    576:  { slidesPerView: 2 },
                    1200: { slidesPerView: desktopSpv },
                } : {
                    576:  { slidesPerView: 2 },
                    768:  { slidesPerView: 3 },
                    1200: { slidesPerView: desktopSpv },
                },
                on: {
                    init: sync_scrollable,
                    resize: sync_scrollable,
                    breakpoint: sync_scrollable,
                    slideChange: function() {
                        // клоны слайдов (loop) — доинициализируем их внутренние слайдеры (гвард el.swiper внутри)
                        el.querySelectorAll('[data-product-slider]').forEach(initProductSlider);
                    }
                }
            });
        };
        const destroy = () => { if (swiper) { swiper.destroy(true, true); swiper = null; } };

        if (is_prod) {
            const mq = window.matchMedia('(min-width: 751px)');
            const sync = () => mq.matches ? build() : destroy();
            sync();
            mq.addEventListener('change', sync);
        } else {
            build();
        }

        if (actions && nextBtn) nextBtn.addEventListener('click', () => swiper && swiper.slideNext());

        const PEEK_ZONE = 0.25;
        slider.addEventListener('mousemove', (e) => {
            const rect = slider.getBoundingClientRect();
            slider.classList.toggle('is-peek', e.clientX >= rect.right - rect.width * PEEK_ZONE);
        });
        slider.addEventListener('mouseleave', () => slider.classList.remove('is-peek'));
    });

    const reviews = document.querySelector('[data-reviews]');
    if (reviews) {
        const tabs   = reviews.querySelectorAll('[data-reviews-tab]');
        const panels = reviews.querySelectorAll('[data-reviews-panel]');
        const conds  = reviews.querySelectorAll('[data-tab-panel]');

        const setReviewsTab = (key) => {
            tabs.forEach(t => t.classList.toggle('reviews__tab--active', t.dataset.reviewsTab === key));
            panels.forEach(p => { p.hidden = p.dataset.reviewsPanel !== key; });
            conds.forEach(c => { c.hidden = c.dataset.tabPanel !== key; });
        };
        tabs.forEach(t => t.addEventListener('click', () => setReviewsTab(t.dataset.reviewsTab)));

        // «6 отзывов» / «3 вопроса» из шапки товара открывают нужную вкладку
        document.querySelectorAll('[data-open-tab]').forEach(el =>
            el.addEventListener('click', () => setReviewsTab(el.dataset.openTab)));
    }

    const checkout = document.querySelector('[data-checkout]');
    if (checkout) {
        const receive_radios = checkout.querySelectorAll('[data-receive] input[type="radio"]');
        const receive_panels = checkout.querySelectorAll('[data-receive-panel]');
        const set_receive = (value) => {
            receive_panels.forEach(p => { p.hidden = p.dataset.receivePanel !== value; });
        };
        receive_radios.forEach(r => r.addEventListener('change', () => set_receive(r.value)));
        const checked_receive = checkout.querySelector('[data-receive] input:checked');
        if (checked_receive) set_receive(checked_receive.value);

        const count_btn = checkout.querySelector('[data-count]');
        if (count_btn) {
            const n = parseInt(count_btn.dataset.count, 10) || 0;
            const forms = ['товар', 'товара', 'товаров'];
            const mod100 = n % 100, mod10 = n % 10;
            const word = (mod100 >= 11 && mod100 <= 14) ? forms[2]
                       : mod10 === 1 ? forms[0]
                       : (mod10 >= 2 && mod10 <= 4) ? forms[1]
                       : forms[2];
            count_btn.textContent = `${n} ${word} в заказе`;
        }
    }

    const map_popup = document.querySelector('[data-map-popup]');
    if (map_popup) {
        const views = map_popup.querySelectorAll('[data-map-view]');
        const show_view = (name) => views.forEach(v => { v.hidden = v.dataset.mapView !== name; });

        const set_mode = (mode) => {
            const radio = map_popup.querySelector(`[data-map-mode][value="${mode}"]`);
            if (radio) radio.checked = true;
            show_view(mode === 'delivery' ? 'delivery' : 'pickup-list');
        };

        map_popup.querySelectorAll('[data-map-mode]').forEach(r =>
            r.addEventListener('change', () => set_mode(r.value)));

        map_popup.querySelectorAll('[data-map-point]').forEach(p =>
            p.addEventListener('click', () => show_view('pickup-detail')));

        const back = map_popup.querySelector('[data-map-back]');
        if (back) back.addEventListener('click', () => show_view('pickup-list'));

        document.querySelectorAll('[data-popup="map"][data-map-mode]').forEach(btn =>
            btn.addEventListener('click', () => set_mode(btn.dataset.mapMode)));
    }

    /* ---- Переиспользуемая интерактивная Яндекс-карта (data-driven) ----
       Разметка:
         [data-map-group]                         — обёртка (карта + пункты)
           [data-map]                             — контейнер карты (Ymap рендерится сюда)
           [data-map-point="lng,lat"] ...         — пункты (адреса/ПВЗ), значение = координаты
       Клик по пункту или метке активирует пункт: метка красная + центрирование; первый активен.
       Опции на группе:
         data-map-zoom="12"                       — базовый зум
         data-map-active="css-класс"              — класс активного пункта (по умолчанию is-active)
         data-map-select="confirm"                — нет предвыбора первого пункта; клик по карточке
                                                    фокусирует адрес на карте с маркером («предпросмотр»),
                                                    а финальный выбор — кликом по [data-map-confirm]
       Табы: если внутри группы есть [data-tabs-head]/[data-tabs-content] — смена вкладки
             выбирает первый пункт активной вкладки. */
    if (typeof ymaps3 !== 'undefined' && (document.querySelector('[data-map-group]') || document.querySelector('[data-store-map-popup]'))) {
        ymaps3.ready.then(async () => {
            const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer } = ymaps3;
            ymaps3.import.registerCdn('https://cdn.jsdelivr.net/npm/{package}', '@yandex/ymaps3-default-ui-theme@latest');
            const { YMapDefaultMarker } = await ymaps3.import('@yandex/ymaps3-default-ui-theme');

            const COLOR_ACTIVE = { day: '#E43D30', night: '#E43D30' };
            const COLOR_IDLE   = { day: '#1D1D1D', night: '#1D1D1D' };

            // все метки — стандартный пин-маркер с иконкой (size:'normal'), а не кружок (это и на ПК, и на моб);
            // активная — красная, остальные — тёмные, чтобы среди множества меток сразу было видно выбранную
            const markerProps = (active) => ({
                color: active ? COLOR_ACTIVE : COLOR_IDLE,
                size:  'normal',
                iconName: 'fallback',
            });

            const buildMapGroup = (group) => {
                const mapEl  = group.querySelector('[data-map]');
                const points = [...group.querySelectorAll('[data-map-point]')]
                    .filter(p => (p.getAttribute('data-map-point') || '').includes(','));
                if (!mapEl || !points.length) return;

                const activeClass = group.dataset.mapActive || 'is-active';
                const baseZoom    = parseFloat(group.dataset.mapZoom) || 12;
                const confirmMode = group.dataset.mapSelect === 'confirm';
                // data-map-balloon — по клику на метку показывать дефолтную яндекс-подсказку (адрес+телефон).
                // Нужно на моб (там список адресов скрыт, метка — единственный источник инфо). Включено только на главной.
                const balloonMode = group.dataset.mapBalloon !== undefined;
                const coordsOf    = p => p.getAttribute('data-map-point').split(',').map(Number); // [lng, lat]

                // содержимое балуна берём из разметки пункта: .addresses__addr + .addresses__phone
                const balloonContent = (point) => {
                    const box = document.createElement('div');
                    box.className = 'ymap-balloon';
                    const addr = point.querySelector('.addresses__addr');
                    if (addr) {
                        const a = document.createElement('p');
                        a.className = 'ymap-balloon__addr';
                        a.textContent = addr.textContent.trim();
                        box.appendChild(a);
                    }
                    const phone = point.querySelector('.addresses__phone');
                    if (phone) {
                        const a = document.createElement('a');
                        a.className = 'ymap-balloon__phone';
                        a.href = phone.getAttribute('href') || '#';
                        a.textContent = phone.textContent.trim();
                        box.appendChild(a);
                    }
                    return box;
                };
                const popupCfg = (point, show) => ({
                    content: () => balloonContent(point), position: 'top', offset: 14, show,
                });

                // Смещение центра влево на ширину перекрывающей панели, чтобы активная точка
                // визуально была по центру ВИДИМОЙ (не закрытой карточкой) части карты.
                // data-map-offset-el="селектор" — мерить правый край элемента (адаптивно);
                // либо data-map-offset-left="35%" | "400" — явный процент/пиксели. Через margin карты.
                const offsetEl = group.dataset.mapOffsetEl ? group.querySelector(group.dataset.mapOffsetEl) : null;
                const leftMargin = () => {
                    // на моб карточка адресов не перекрывает карту (она под картой) — центр = точка, без смещения
                    if (window.matchMedia('(max-width: 750px)').matches) return 0;
                    const v = group.dataset.mapOffsetLeft;
                    if (v) return v.trim().endsWith('%') ? mapEl.clientWidth * parseFloat(v) / 100 : (parseFloat(v) || 0);
                    if (offsetEl) {
                        const mapRect = mapEl.getBoundingClientRect();
                        const elRect  = offsetEl.getBoundingClientRect();
                        return Math.max(0, elRect.right - mapRect.left + 20); // +20 — зазор от карточки
                    }
                    return 0;
                };
                const mapMargin = () => [0, 0, 0, Math.round(leftMargin())];

                const map = new YMap(mapEl, { location: { center: coordsOf(points[0]), zoom: baseZoom }, margin: mapMargin() });
                map.addChild(new YMapDefaultSchemeLayer());
                map.addChild(new YMapDefaultFeaturesLayer());

                const markers = new Map();
                let current = points[0];
                const mobile_mq = window.matchMedia('(max-width: 750px)');

                // на моб показать дефолтную яндекс-подсказку (адрес+телефон) у выбранной точки, у остальных — скрыть
                const openBalloon = (point) => {
                    if (!balloonMode || !mobile_mq.matches) return;
                    markers.forEach((m, p) => m.update({ popup: popupCfg(p, p === point) }));
                };

                const select = (point, fly = true) => {
                    if (!point) return;
                    current = point;
                    points.forEach(p => p.classList.toggle(activeClass, p === point));
                    markers.forEach((m, p) => m.update(markerProps(p === point)));
                    if (fly) {
                        map.update({ margin: mapMargin() }); // пересчёт под текущий размер/панель
                        map.setLocation({ center: coordsOf(point), zoom: baseZoom + 3, duration: 400 });
                        // на моб — сразу показать инфо выбранной точки (клик по метке И смена города)
                        openBalloon(point);
                    }
                };

                points.forEach(point => {
                    const marker = new YMapDefaultMarker({
                        coordinates: coordsOf(point),
                        ...markerProps(false),
                        ...(balloonMode ? { popup: popupCfg(point, false) } : {}),
                        onClick: () => select(point)
                    });
                    map.addChild(marker);
                    markers.set(point, marker);
                    // клик по карточке — фокус адреса на карте с маркером (в обоих режимах);
                    // в confirm-режиме это «предпросмотр», финальный выбор — по [data-map-confirm]
                    point.addEventListener('click', () => select(point));
                });

                if (confirmMode) {
                    group.querySelectorAll('[data-map-confirm]').forEach(btn =>
                        btn.addEventListener('click', () => select(current)));
                }

                // табы: смена вкладки — первый пункт активной вкладки
                group.querySelectorAll('[data-tabs-head]').forEach(head =>
                    head.addEventListener('click', () => requestAnimationFrame(() => {
                        const panel = group.querySelector('[data-tabs-content="active"]');
                        if (panel) select(panel.querySelector('[data-map-point]'));
                    })));

                // первый пункт активен по умолчанию (в confirm-режиме — без предвыбора)
                if (!confirmMode) {
                    select(points[0], false);
                    openBalloon(points[0]); // на моб — сразу показать инфо выбранной по умолчанию точки
                }
            };

            document.querySelectorAll('[data-map-group]').forEach(group => {
                const mapEl = group.querySelector('[data-map]');
                if (!mapEl) return;
                // карта может быть в скрытом попапе — строим, когда контейнер получит размер
                if (mapEl.clientWidth && mapEl.clientHeight) { buildMapGroup(group); return; }
                const ro = new ResizeObserver(() => {
                    if (mapEl.clientWidth && mapEl.clientHeight) { ro.disconnect(); buildMapGroup(group); }
                });
                ro.observe(mapEl);
            });

            /* ---- Контакты (моб): попап с ОДНОЙ картой, сфокусированной на точке адреса.
                 Отдельный вариант адаптива (не data-map-group): список карточек адресов, клик
                 по кнопке карточки → открыть попап [data-popup-window="store-map"] + фокус карты.
                 Карта строится один раз (лениво), при повторных открытиях — переносим маркер. */
            const storeMapPopup = document.querySelector('[data-store-map-popup]');
            if (storeMapPopup) {
                const mapEl = storeMapPopup.querySelector('[data-map]');
                let smap = null, smarker = null;
                const STORE_ZOOM = 15;

                const focusStore = (coords) => {
                    const render = () => {
                        if (!smap) {
                            smap = new YMap(mapEl, { location: { center: coords, zoom: STORE_ZOOM } });
                            smap.addChild(new YMapDefaultSchemeLayer());
                            smap.addChild(new YMapDefaultFeaturesLayer());
                            smarker = new YMapDefaultMarker({ coordinates: coords, ...markerProps(true) });
                            smap.addChild(smarker);
                        } else {
                            smarker.update({ coordinates: coords });
                            smap.setLocation({ center: coords, zoom: STORE_ZOOM, duration: 300 });
                        }
                    };
                    if (mapEl && mapEl.clientWidth && mapEl.clientHeight) { render(); return; }
                    const ro = new ResizeObserver(() => {
                        if (mapEl.clientWidth && mapEl.clientHeight) { ro.disconnect(); render(); }
                    });
                    ro.observe(mapEl);
                };

                const store_mobile_mq = window.matchMedia('(max-width: 750px)');
                document.querySelectorAll('[data-store-map]').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const coords = (btn.dataset.storeMap || '').split(',').map(Number);
                        if (coords.length !== 2 || coords.some(Number.isNaN)) return;
                        e.preventDefault();                 // href="#" — не прыгать вверх
                        if (!store_mobile_mq.matches) return; // попап-карта — только на моб
                        window.open_popup('store-map');
                        focusStore(coords);
                    });
                });
            }
        }).catch(() => {});
    }

    document.querySelectorAll('[data-search-filter]').forEach(container => {
        const input = container.querySelector('[data-search-input]');

        input?.addEventListener('input', () => {
            const value = input.value.trim().toLowerCase();

            container.querySelectorAll('[data-search-item]').forEach(item => {
                item.hidden = !item.dataset.searchItem
                    .toLowerCase()
                    .includes(value);
            });
        });
    });
});