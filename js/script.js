window.addEventListener('load', () => {
    const header        = document.querySelector('.header');
    const header_top    = document.querySelector('.header__top');
    const header_mid    = document.querySelector('.header__mid');
    let header_sticked  = false;
    if (header) {
        const header_top_height = header_top.clientHeight;

        document.body.style.setProperty('--header-height', header.clientHeight + 'px');
        document.body.style.setProperty('--sticky-header-height', header_mid.clientHeight + 'px');

        window.addEventListener('scroll', () => {
            if (!header_sticked && window.scrollY > header_top_height) {
                header_mid.classList.add('header__mid--sticked');
                document.body.style.setProperty('padding-top', header_mid.clientHeight + 'px');
                header_sticked = true;
                return;
            }
            if (header_sticked && window.scrollY <= header_top_height) {
                header_mid.classList.remove('header__mid--sticked');
                document.body.style.setProperty('padding-top', '0px');
                header_sticked = false;
                return;
            }
        });

        // мобилка: скролл вниз — шапка прячется, скролл вверх — показывается
        let last_scroll = window.scrollY;
        window.addEventListener('scroll', () => {
            if (!window.matchMedia('(max-width: 991px)').matches) {
                header_mid.classList.remove('header__mid--hidden');
                last_scroll = window.scrollY;
                return;
            }
            const y = window.scrollY;
            if (header_sticked && y > last_scroll && y > header_mid.clientHeight) {
                header_mid.classList.add('header__mid--hidden');
            } else {
                header_mid.classList.remove('header__mid--hidden');
            }
            last_scroll = y;
        }, { passive: true });
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
    if (brands_swiper && window.matchMedia('(min-width: 992px)').matches) {
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
        const watched = new Swiper(watched_swiper, {
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

        const watched_next = watched_swiper.querySelector('.watched-swiper__next');
        if (watched_next) watched_next.addEventListener('click', () => watched.slideNext());

        const PEEK_ZONE = 0.25;
        watched_swiper.addEventListener('mousemove', (e) => {
            const rect = watched_swiper.getBoundingClientRect();
            const inRight = e.clientX >= rect.right - rect.width * PEEK_ZONE;
            watched_swiper.classList.toggle('is-peek', inRight);
        });
        watched_swiper.addEventListener('mouseleave', () => watched_swiper.classList.remove('is-peek'));
    }

    const profi_accordion = document.querySelector('[data-profi-accordion]');
    if (profi_accordion) {
        const profi_items = profi_accordion.querySelectorAll('[data-profi-item]');

        const set_panel_width = () => {
            const w = profi_accordion.clientWidth - 950;
            profi_accordion.style.setProperty('--profi-panel-w', w + 'px');
        };
        set_panel_width();
        window.addEventListener('resize', set_panel_width);

        profi_items.forEach(item => {
            const card = item.querySelector('[data-profi-card]') || item;
            card.addEventListener('click', () => {
                profi_items.forEach(i => i.classList.remove('profi__item--active'));
                item.classList.add('profi__item--active');
            });
        });
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
            trigger.addEventListener('click', () => {
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

    const product_desktop_mq = window.matchMedia('(min-width: 992px)');
    document.querySelectorAll('[data-product-slider]').forEach(el => {
        const slider = new Swiper(el, {
            slidesPerView: 1,
            allowTouchMove: !product_desktop_mq.matches,
            pagination: {
                el: el.querySelector('.swiper-pagination'),
                clickable: true,
            },
        });

        product_desktop_mq.addEventListener('change', (e) => {
            slider.allowTouchMove = !e.matches;
        });

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
    });

    const catalog_btn  = document.querySelector('.header__catalog');
    const catalog      = document.querySelector('[data-catalog]');
    const mobile_menu  = document.querySelector('[data-mobile-menu]');
    const desktop_mq   = window.matchMedia('(min-width: 992px)');

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
    };
    const close_catalog = () => {
        document.body.style.setProperty('overflow', 'unset');
        document.querySelector('html').style.setProperty('overflow', 'unset');

        if (catalog) catalog.classList.remove('catalog--open');
    };

    if (catalog) {
        catalog.querySelectorAll('[data-catalog-tab]').forEach(tab => {
            tab.addEventListener('mouseenter', () => set_catalog_tab(tab.dataset.catalogTab));
        });

        document.addEventListener('click', (e) => {
            if (catalog.classList.contains('catalog--open') &&
                !catalog.contains(e.target) &&
                !(catalog_btn && catalog_btn.contains(e.target))) {
                close_catalog();
            }
        });
        window.addEventListener('scroll', () => catalog.classList.contains('catalog--open') && position_catalog());
        window.addEventListener('resize', () => catalog.classList.contains('catalog--open') && position_catalog());
    }

    const open_mobile  = () => { if (mobile_menu) { mobile_menu.classList.add('mobile-menu--open'); lock_scroll(); } };
    const close_mobile = () => {
        if (!mobile_menu) return;
        mobile_menu.classList.remove('mobile-menu--open');
        mobile_menu.querySelectorAll('.mobile-menu__sub--active').forEach(s => s.classList.remove('mobile-menu__sub--active'));
        unlock_scroll();
    };

    if (mobile_menu) {
        mobile_menu.querySelectorAll('[data-mobile-close]').forEach(b => b.addEventListener('click', close_mobile));
        mobile_menu.querySelectorAll('[data-mobile-open]').forEach(b => b.addEventListener('click', () => {
            const sub = mobile_menu.querySelector(`[data-mobile-sub="${b.dataset.mobileOpen}"]`);
            if (sub) sub.classList.add('mobile-menu__sub--active');
        }));
        mobile_menu.querySelectorAll('[data-mobile-back]').forEach(b => b.addEventListener('click', () => {
            b.closest('[data-mobile-sub]').classList.remove('mobile-menu__sub--active');
        }));
        const m_tabs = mobile_menu.querySelectorAll('.mobile-menu__tab');
        m_tabs.forEach(t => t.addEventListener('click', () => {
            m_tabs.forEach(x => x.classList.remove('mobile-menu__tab--active'));
            t.classList.add('mobile-menu__tab--active');
        }));
    }

    document.querySelectorAll('[data-mobile-menu-open]').forEach(b => b.addEventListener('click', open_mobile));

    const search_overlay = document.querySelector('[data-search]');
    const open_search  = () => {
        if (!search_overlay) return;
        search_overlay.classList.add('m-search--open');
        lock_scroll();
        const inp = search_overlay.querySelector('input');
        if (inp) setTimeout(() => inp.focus(), 50);
    };
    const close_search = () => {
        if (!search_overlay) return;
        search_overlay.classList.remove('m-search--open');
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

    if (catalog_btn) {
        catalog_btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (desktop_mq.matches) {
                catalog.classList.contains('catalog--open') ? close_catalog() : open_catalog();
            } else {
                open_mobile();
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

    let copyToastTimer = null;
    const showCopyToast = (text = 'Скопировано') => {
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

    const copyText = (val) => {
        if (!val) return;
        writeClipboard(val);
        showCopyToast();
    };

    document.querySelectorAll('[data-copy]').forEach(btn => {
        btn.addEventListener('click', () => copyText(btn.dataset.copy));
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

    document.querySelectorAll('.contact-card__copy').forEach(btn => {
        const getValue = () => {
            const pill = btn.closest('.contact-card__pill');
            return pill ? pill.textContent.trim() : '';
        };
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            copyText(getValue());
        });
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                copyText(getValue());
            }
        });
    });

    const buyboxFull   = document.querySelector('[data-buybox-full]');
    const buyboxSticky = document.querySelector('[data-buybox-sticky]');
    if (buyboxFull && buyboxSticky) {
        const updateBuyboxSticky = () => {
            const stickyHeader = parseInt(getComputedStyle(document.body).getPropertyValue('--sticky-header-height'), 10) || 0;
            const offset = stickyHeader + 20;
            const passed = buyboxFull.getBoundingClientRect().bottom < offset;
            buyboxSticky.classList.toggle('is-visible', passed);
            buyboxSticky.setAttribute('aria-hidden', passed ? 'false' : 'true');
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

    const patterns_grid = document.querySelector('[data-patterns-grid]');
    if (patterns_grid) {
        const more       = patterns_grid.querySelector('[data-patterns-more]');
        const first_cell = patterns_grid.querySelector('a.patterns__cell');
        if (more && first_cell) more.addEventListener('click', () => first_cell.click());
    }

    document.querySelectorAll('[data-carousel]').forEach(el => {
        const slider = el.closest('.prod-carousel__slider') || el;
        const section = el.closest('.prod-carousel') || slider;
        const nextBtn = slider.querySelector('[data-carousel-next]');
        const actions = section.querySelector('.slider-actions');
        const desktopSpv = parseFloat(el.dataset.carousel) || 4;

        const sync_scrollable = (s) => slider.classList.toggle('is-scrollable', !s.isLocked);

        const swiper = new Swiper(el, {
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
            breakpoints: {
                576:  { slidesPerView: 2 },
                768:  { slidesPerView: 3 },
                1200: { slidesPerView: desktopSpv },
            },
            on: {
                init: sync_scrollable,
                resize: sync_scrollable,
                breakpoint: sync_scrollable,
                slideChange: function() {
                    const product_desktop_mq = window.matchMedia('(min-width: 992px)');
                    el.querySelectorAll('[data-product-slider]').forEach(el => {
                        const slider = new Swiper(el, {
                            slidesPerView: 1,
                            allowTouchMove: !product_desktop_mq.matches,
                            pagination: {
                                el: el.querySelector('.swiper-pagination'),
                                clickable: true,
                            },
                        });

                        product_desktop_mq.addEventListener('change', (e) => {
                            slider.allowTouchMove = !e.matches;
                        });

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
                    });
                }
            }
        });

        if (actions && nextBtn) nextBtn.addEventListener('click', () => swiper.slideNext());

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

        document.querySelectorAll('[data-open-questions]').forEach(q =>
            q.addEventListener('click', () => setReviewsTab('questions')));
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
});
