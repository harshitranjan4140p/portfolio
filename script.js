document.addEventListener('DOMContentLoaded', () => {
    /* 
    ==========================================================================
    CORE CONFIGURATION
    ==========================================================================
    */
    const CONFIG = {
        roles: ["Wizard", "Software Developer", "Game Developer", "3D Artist", "Founder", "Chess Player"],
        email: "harshitranjan4140p@gmail.com",
        // _0x4140: Secure trigger resolution
        _0x4140: (() => {
            const _0x1a2b = [100, 122, 99, 55, 55, 79, 68, 115, 61]; 
            const _0x3e4f = String.fromCharCode(100, 122, 99, 55, 79, 68, 115, 61);
            return atob(_0x3e4f).split('').reverse().map(c => String.fromCharCode(c.charCodeAt(0) - (0x10 - 0x9))).join('');
        })(),
        repulsionRadius: 150,
        repulsionStrength: 40
    };

    /* 
    ==========================================================================
    DYNAMIC PROJECT RENDERING
    ==========================================================================
    */
    const _0x5b3c = [
        {
            id: 0x1,
            _t: "Online FPS Multiplayer Shooter",
            _d: "A competitive multiplayer experience powered by Photon Pun 2, featuring fast-paced combat and robust network synchronization.",
            _ts: ["Photon Pun 2", "FPS", "Networking"],
            _th: "assets/project1.png",
            _v: "assets/game1.mp4",
            _l: "https://www.youtube.com/watch?v=MAhPNKZ_MHE",
            _h: true,
            _p: false
        },
        {
            id: 0x2,
            _t: "Thief Long Hand Puzzle",
            _d: "A clever physics-based puzzle game challenging your spatial logic. Available on Play Store.",
            _ts: ["Puzzle", "Play Store", "Logic"],
            _th: "assets/project2.png",
            _v: "assets/game2.mp4",
            _l: "https://play.google.com/store/apps/details?id=com.thief.puzzle.escape.game&pli=1",
            _h: true,
            _p: true
        },
        {
            id: 0x3,
            _t: "Ashes: RPG Adventure",
            _d: "A story-driven medieval action game featuring deep lore, character progression, and immersive environments.",
            _ts: ["Action RPG", "Medieval", "Story-driven"],
            _th: "assets/project3.png",
            _v: "assets/game3.mp4",
            _l: "https://www.youtube.com/watch?v=qu9_ICrAAc8",
            _h: true,
            _p: false
        },
        {
            id: 0x4,
            _t: "Ragdoll Ball Game",
            _d: "Physics-based chaotic fun exploring ragdoll mechanics and dynamic object interactions.",
            _ts: ["Physics", "Casual"],
            _th: "assets/project4.png",
            _v: "assets/game4.mp4",
            _l: "https://drive.google.com/file/d/1GfCZ3f_H86bOCknX3-3AgwR3Nx9ybrqs/view?usp=sharing",
            _h: false,
            _p: true
        },
        {
            id: 0x5,
            _t: "Cube Runner",
            _d: "A fast-paced infinite runner testing your reflexes and spatial awareness.",
            _ts: ["Arcade", "Runner"],
            _th: "assets/project5.png",
            _v: "assets/game5.mp4",
            _l: "https://www.youtube.com/watch?v=omsdky5n_2Q",
            _h: false,
            _p: false
        },
        {
            id: 0x6,
            _t: "Wannabe GTA 6",
            _d: "An ambitious open-world sandbox project exploring complex AI, vehicle physics, and large-scale environments.",
            _ts: ["Open World", "Sandbox"],
            _th: "assets/project6.png",
            _v: "assets/game6.mp4",
            _l: "https://www.youtube.com/watch?v=NeQqgua8t_c",
            _h: false,
            _p: false
        }
    ];

    const PROJECT_DATA = _0x5b3c.map(p => ({
        id: p.id,
        title: p._t,
        desc: p._d,
        tags: p._ts,
        thumbnail: p._th,
        video: p._v,
        link: p._l,
        isHighlight: p._h,
        isPortrait: p._p
    }));

    const renderProjects = () => {
        const grid = document.getElementById('projects-grid');
        if (!grid || typeof PROJECT_DATA === 'undefined') return;

        const isMainPage = !document.body.classList.contains('projects-page');
        const projectsToRender = isMainPage 
            ? PROJECT_DATA.filter(p => p.isHighlight) 
            : PROJECT_DATA.filter(p => !p.isHighlight);

        grid.innerHTML = projectsToRender.map((project, index) => `
            <article class="project-card reveal ${index % 2 !== 0 ? 'reverse' : ''}">
                <div class="project-media ${project.isPortrait ? 'portrait' : ''}">
                    <img src="${project.thumbnail}" alt="${project.title}" class="project-img" 
                         data-thumbnail="${project.thumbnail}" 
                         data-video="${project.video}" 
                         loading="lazy">
                </div>
                <div class="project-info">
                    <h3 class="glitch-text">${project.title}</h3>
                    <p class="project-desc">${project.desc}</p>
                    <div class="project-tags">
                        ${project.tags.map(tag => `<span>${tag}</span>`).join('')}
                    </div>
                    <a href="${project.link}" class="btn btn-outline" target="_blank">View Details ↗</a>
                </div>
            </article>
        `).join('');
    };

    // Render projects immediately before other initializations
    renderProjects();
    // Global trackers for new features
    const konamiCode = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
    let konamiIdx = 0;
    const palettes = [
        { accent: '#ea9a97', name: '#f6c177' }, // Default Peach/Gold
        { accent: '#31748f', name: '#9ccfd8' }, // Pine/Foam (Blue)
        { accent: '#eb6f92', name: '#c4a7e7' }, // Love/Iris (Pink/Purple)
        { accent: '#f6c177', name: '#ebbcba' }, // Gold/Rose
        { accent: '#9ccfd8', name: '#31748f' }  // Foam/Pine
    ];
    let currentPaletteIdx = 0;

    /* Performance detection removed as requested */

    /* 
    ==========================================================================
    DYNAMIC ROLE SWIPER
    ==========================================================================
    */
    const roleElement = document.getElementById('dynamic-role');
    const roleContainer = document.querySelector('.dynamic-role-container');
    const measurer = document.getElementById('role-measurer');

    if (roleElement && roleContainer && measurer) {
        let roleIndex = 0;
        const updateWidth = (text) => {
            measurer.textContent = text;
            roleContainer.style.width = `${measurer.offsetWidth}px`; 
        };

        const initRoles = () => {
            updateWidth(CONFIG.roles[0]);
            roleElement.textContent = CONFIG.roles[0];
            
            setInterval(() => {
                roleElement.classList.add('swipe-up');
                setTimeout(() => {
                    roleIndex = (roleIndex + 1) % CONFIG.roles.length;
                    const nextText = CONFIG.roles[roleIndex];
                    updateWidth(nextText);
                    roleElement.textContent = nextText;
                    roleElement.style.transition = 'none';
                    roleElement.classList.remove('swipe-up');
                    roleElement.classList.add('swipe-down');
                    void roleElement.offsetWidth;
                    roleElement.style.transition = 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out';
                    roleElement.classList.remove('swipe-down');
                }, 300);
            }, 2500);
        };

        if (document.fonts) document.fonts.ready.then(initRoles);
        else setTimeout(initRoles, 500);
    }

    /* Native Hardware Cursor Active */


    /* 
    ==========================================================================
    REVEAL OBSERVER
    ==========================================================================
    */
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    const initReveal = () => {
        document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
    };
    initReveal();

    /* 
    ==========================================================================
    CUSTOM CONTEXT MENU
    ==========================================================================
    */
    const contextMenu = document.getElementById('custom-context-menu');
    if (contextMenu) {
        window.addEventListener('contextmenu', (e) => {
            if (_0x2c1a) return;
            e.preventDefault();
            const { clientX: mouseX, clientY: mouseY } = e;
            const { innerWidth: winW, innerHeight: winH } = window;
            const { offsetWidth: menuW, offsetHeight: menuH } = contextMenu;

            let x = mouseX;
            let y = mouseY;
            if (x + menuW > winW) x -= menuW;
            if (y + menuH > winH) y -= menuH;

            contextMenu.style.left = `${x}px`;
            contextMenu.style.top = `${y}px`;
            contextMenu.style.display = 'block';
        });

        window.addEventListener('click', () => contextMenu.style.display = 'none');

        contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                switch(action) {
                    case 'back': window.history.back(); break;
                    case 'reload': window.location.reload(); break;
                    case 'top': window.scrollTo({ top: 0, behavior: 'smooth' }); break;
                    case 'resume': window.open('assets/resume.pdf', '_blank'); break;
                    case 'home': window.location.href = 'index.html'; break;
                    case 'copy-email': 
                        navigator.clipboard.writeText(CONFIG.email);
                        const originalText = item.innerHTML;
                        item.innerHTML = 'Email Copied!';
                        setTimeout(() => { item.innerHTML = originalText; }, 2000);
                        break;
                }
            });
        });

        /* Middle Click Toggle Removed */
    }

    /* 
    ==========================================================================
    SCROLL LOGIC
    ==========================================================================
    */
    const scrollProgress = document.getElementById('scrollProgress');
    const backToTop = document.getElementById('backToTop');
    let scrollTicking = false;

    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(() => {
                const scrollTop = window.scrollY;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
                if (scrollProgress) scrollProgress.style.width = `${progress}%`;
                if (backToTop) backToTop.classList.toggle('visible', scrollTop > 400);
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    });

    /* 
    ==========================================================================
    PAGE TRANSITIONS
    ==========================================================================
    */
    const pageOverlay = document.getElementById('pageOverlay');
    if (pageOverlay) {
        requestAnimationFrame(() => requestAnimationFrame(() => pageOverlay.classList.add('loaded')));
        document.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('http') ||
                href.startsWith('mailto') || href.startsWith('tel') || href.endsWith('.pdf')) return;
            link.addEventListener('click', (e) => {
                if (e.metaKey || e.ctrlKey) return;
                e.preventDefault();
                pageOverlay.classList.remove('loaded');
                setTimeout(() => { window.location.href = href; }, 520);
            });
        });
    }

    /* 
    ==========================================================================
    MAGNETIC BUTTONS
    ==========================================================================
    */
    const initMagnetic = (selector, strength, hoverTransform) => {
        document.querySelectorAll(selector).forEach(el => {
            el.addEventListener('mousemove', (e) => {
                if (destructionActive) return;
                const rect = el.getBoundingClientRect();
                const x = ((e.clientX - (rect.left + rect.width / 2)) * strength).toFixed(2);
                const y = ((e.clientY - (rect.top + rect.height / 2)) * strength).toFixed(2);
                el.style.transform = `translate(${x}px, ${y}px) ${hoverTransform}`;
            });
            el.addEventListener('mouseleave', () => el.style.transform = '');
        });
    };
    initMagnetic('.btn', 0.18, 'translateY(-2px) scale(1.02)');
    initMagnetic('.social-btn', 0.28, 'translateY(-5px)');
    initMagnetic('.back-to-top', 0.22, 'translateY(-4px)');

    /* 
    ==========================================================================
    SKILLS ANIMATION
    ==========================================================================
    */
    const skillItems = document.querySelectorAll('.skill-item');
    if (skillItems.length > 0) {
        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const bar = entry.target.querySelector('.skill-progress, .skill-bar-fill');
                const label = entry.target.querySelector('.skill-info span:last-child, .skill-label span:last-child');
                if (bar && label) {
                    const targetWidth = bar.style.width || '0%';
                    const targetNum = parseInt(targetWidth);
                    bar.style.width = '0%';
                    bar.style.transition = 'none';
                    const startTime = performance.now();
                    const duration = 2000; // Slightly slower for better look
                    const tick = (now) => {
                        const progress = Math.min((now - startTime) / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 4); // Smoother quartic ease-out
                        const current = eased * targetNum;
                        label.textContent = Math.round(current) + '%';
                        bar.style.width = current + '%';
                        if (progress < 1) requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                }
                skillObserver.unobserve(entry.target);
            });
        }, { threshold: 0.2 });
        skillItems.forEach(item => skillObserver.observe(item));
    }

    /* 
    ==========================================================================
    BACKGROUND ARTIFACTS
    ==========================================================================
    */
    const initArtifacts = (count) => {
        const container = document.querySelector('.bg-artifacts');
        if (!container) return;
        const shapes = [
            { char: 'X', class: 'shape-x' }, { char: 'Y', class: 'shape-y' },
            { char: 'A', class: 'shape-a' }, { char: 'B', class: 'shape-b' },
            { char: '▲', class: 'shape-tri' }, { char: '■', class: 'shape-sq' },
            { char: '●', class: 'shape-cir' }
        ];
        for (let i = 0; i < count; i++) {
            const wrapper = document.createElement('div');
            wrapper.className = 'artifact-wrapper';
            wrapper.style.top = `${Math.random() * 100}%`;
            wrapper.style.left = `${Math.random() * 100}%`;
            wrapper.style.animationDelay = `${Math.random() * -20}s`;
            wrapper.style.animationDuration = `${15 + Math.random() * 10}s`;
            const reactive = document.createElement('div');
            reactive.className = 'mouse-reactive';
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            const artifact = document.createElement('div');
            artifact.className = `artifact ${shape.class}`;
            artifact.textContent = shape.char;
            artifact.style.animationDuration = `${8 + Math.random() * 12}s`;
            artifact.style.opacity = 0.05 + Math.random() * 0.15;
            reactive.appendChild(artifact);
            wrapper.appendChild(reactive);
            container.appendChild(wrapper);
        }
    };
    initArtifacts(window.innerWidth <= 900 ? 50 : 300);

    let mX = -1000, mY = -1000, ticking = false;
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (!isAndroid) {
        window.addEventListener('mousemove', (e) => {
            mX = e.clientX; mY = e.clientY;
            if (!ticking) { requestAnimationFrame(updateArtifacts); ticking = true; }
        });
    }

    function updateArtifacts() {
        if (!ticking) return;
        const vh = window.innerHeight;
        const vw = window.innerWidth;
        const reactives = document.querySelectorAll('.mouse-reactive');
        const radiusSq = CONFIG.repulsionRadius * CONFIG.repulsionRadius;

        for (let i = 0; i < reactives.length; i++) {
            const el = reactives[i];
            const rect = el.getBoundingClientRect();
            
            // Skip if off-screen (with buffer)
            if (rect.bottom < -100 || rect.top > vh + 100 || rect.right < -100 || rect.left > vw + 100) continue;
            
            const dx = mX - (rect.left + rect.width / 2);
            const dy = mY - (rect.top + rect.height / 2);
            const distSq = dx * dx + dy * dy;

            if (distSq < radiusSq) {
                const distance = Math.sqrt(distSq);
                const angle = Math.atan2(dy, dx);
                const force = (CONFIG.repulsionRadius - distance) / CONFIG.repulsionRadius;
                const tx = (-Math.cos(angle) * force * CONFIG.repulsionStrength).toFixed(1);
                const ty = (-Math.sin(angle) * force * CONFIG.repulsionStrength).toFixed(1);
                el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
            } else if (el.style.transform !== '' && el.style.transform !== 'translate3d(0px, 0px, 0px)') {
                el.style.transform = 'translate3d(0, 0, 0)';
            }
        }
        ticking = false;
    }

    /* 
    ==========================================================================
    PROJECT MEDIA SWAPPER (IDLE-SEQUENTIAL WITH PRIORITY)
    ==========================================================================
    Optimized for production: Prioritizes hovered content and loads the rest 
    sequentially when the browser is idle to ensure a lag-free experience.
    */
    let userMutedPreference = true;
    
    const initProjectMedia = () => {
        const projectCards = document.querySelectorAll('.project-card');
        const loadQueue = [];
        
        if (projectCards.length === 0) return;

        // Reset state for dynamic re-init if needed
        document.querySelectorAll('.mute-btn').forEach(btn => btn.remove());
        document.querySelectorAll('video').forEach(v => v.remove());

    const initVideo = (card, priority = false) => {
        if (card.dataset.videoInited) {
            if (priority && card.videoElement) card.videoElement.preload = "auto";
            return;
        }
        
        const img = card.querySelector('.project-img');
        if (!img) return;
        
        const videoSrc = img.dataset.video;
        const thumbSrc = img.dataset.thumbnail || img.src;
        if (!videoSrc) return;

        card.dataset.videoInited = "true";
        const video = document.createElement('video');
        video.src = videoSrc;
        video.preload = priority ? "auto" : "metadata"; // High priority gets full preload
        video.loop = true;
        video.muted = userMutedPreference;
        video.playsInline = true;
        video.poster = thumbSrc;
        
        Object.assign(video.style, {
            position: 'absolute', inset: '0', width: '100%', height: '100%',
            objectFit: 'cover', opacity: '0', zIndex: '1', pointerEvents: 'none',
            transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
        });
        
        const muteBtn = document.createElement('button');
        muteBtn.className = 'mute-btn';
        const muteIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;
        const unmuteIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
        muteBtn.innerHTML = userMutedPreference ? muteIcon : unmuteIcon;
        
        muteBtn.onclick = (e) => {
            e.stopPropagation(); e.preventDefault();
            userMutedPreference = !userMutedPreference;
            document.querySelectorAll('video').forEach(v => v.muted = userMutedPreference);
            document.querySelectorAll('.mute-btn').forEach(btn => btn.innerHTML = userMutedPreference ? muteIcon : unmuteIcon);
        };
        
        img.parentElement.appendChild(video);
        img.parentElement.appendChild(muteBtn);
        card.videoElement = video;
    };

    // Sequential Idle Loader
    const processQueue = () => {
        if (loadQueue.length === 0) return;
        const nextCard = loadQueue.shift();
        if (!nextCard.dataset.videoInited) {
            initVideo(nextCard, false);
            // Wait for some data to be buffered before next one
            nextCard.videoElement.onloadedmetadata = () => {
                setTimeout(() => {
                    if (window.requestIdleCallback) requestIdleCallback(processQueue);
                    else setTimeout(processQueue, 1000);
                }, 500);
            };
        } else processQueue();
    };

    if (projectCards.length > 0) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.videoInited) {
                    loadQueue.push(entry.target);
                    if (loadQueue.length === 1) {
                        if (window.requestIdleCallback) requestIdleCallback(processQueue);
                        else setTimeout(processQueue, 1000);
                    }
                }
            });
        }, { rootMargin: '200px 0px' });

        projectCards.forEach(card => {
            videoObserver.observe(card);
            const img = card.querySelector('.project-img');

            card.addEventListener('mouseenter', () => {
                card.isHovering = true;
                if (!card.dataset.videoInited) initVideo(card, true);
                else if (card.videoElement) card.videoElement.preload = "auto";

                if (card.videoElement) {
                    const playPromise = card.videoElement.play();
                    if (playPromise !== undefined) {
                        playPromise.then(() => { if (card.isHovering) card.videoElement.style.opacity = '1'; }).catch(() => {});
                    }
                }
            });

            card.addEventListener('mouseleave', () => {
                card.isHovering = false;
                if (card.videoElement) {
                    card.videoElement.style.opacity = '0';
                    card.videoElement.pause();
                }
            });
        });
    }
    };
    initProjectMedia();

    /* 
    ==========================================================================
    _0xMODULE: RESTRICTED ACCESS
    ==========================================================================
    */
    let _0x5f3e = "", _0x2c1a = false, _0x11b2 = [], _0x4d3c = null;
    const _0x9e2a = document.querySelector('.destruction-popup'), _0x7f1b = document.querySelector('.btn-yes'), _0x3a2c = document.querySelector('.btn-no');

    if (_0x9e2a && _0x7f1b && _0x3a2c) {
        window.addEventListener('keydown', (e) => {
            _0x5f3e += e.key;
            const _target = CONFIG._0x4140;
            if (_0x5f3e.length > _target.length) _0x5f3e = _0x5f3e.substring(1);
            if (_0x5f3e === _target) _0x9e2a.classList.add('active');
        });
        _0x3a2c.onclick = () => _0x9e2a.classList.remove('active');
        _0x7f1b.onclick = () => { _0x9e2a.classList.remove('active'); _0x11b2_init(); };
    }

    function _0x11b2_init() {
        _0x2c1a = true;
        document.body.classList.add('destruction-active');
        const _0x8e2b = document.querySelectorAll('h1, h2, h3, p, img, .btn, .project-card, .skill-item');
        let _0xcount = _0x8e2b.length, _0xinitial = _0xcount, _0xguilt = false;

        window.addEventListener('dragstart', (e) => e.preventDefault());
        window.addEventListener('contextmenu', (e) => { if (_0x2c1a) e.preventDefault(); });
        document.querySelectorAll('a, button').forEach(el => {
            if (!el.classList.contains('btn-yes') && !el.classList.contains('btn-no')) {
                el.style.pointerEvents = 'none'; el.style.cursor = 'crosshair';
            }
        });

        window.addEventListener('mousedown', (e) => {
            if (!_0x2c1a) return;
            const target = e.target;
            if (target === document.body || target === document.documentElement || target.closest('.destruction-popup')) return;
            if (e.button === 2) {
                const proximitySq = 2500; let closest = null, minDistSq = proximitySq;
                _0x11b2.forEach(d => {
                    const distSq = (e.clientX - d.x)**2 + (e.clientY - d.y)**2;
                    if (distSq < minDistSq) { minDistSq = distSq; closest = d; }
                });
                if (closest) { _0x4d3c = closest; _0x4d3c.settled = false; _0x4d3c.el.classList.add('held'); }
            } else if (e.button === 0 && !target.classList.contains('debris')) {
                _0xbreak(target);
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (_0x4d3c) {
                _0x4d3c.x = e.clientX - (_0x4d3c.w || 20)/2;
                _0x4d3c.y = e.clientY - (_0x4d3c.h || 20)/2;
                _0x4d3c.vx = _0x4d3c.vy = 0;
            }
        });

        window.addEventListener('mouseup', () => { if (_0x4d3c) { _0x4d3c.el.classList.remove('held'); _0x4d3c = null; } });

        function _0xbreak(el) {
            if (el.dataset.broken) return;
            const isTarget = el.matches('h1, h2, h3, p, img, .btn, .project-card, .skill-item');
            if (isTarget) {
                el.dataset.broken = "true"; _0xcount--;
                if (_0xcount <= _0xinitial * 0.6 && !_0xguilt) {
                    _0xguilt = true;
                    setTimeout(() => {
                        const gp = document.querySelector('.guilt-popup');
                        if (gp) { gp.classList.add('active'); _0xstop_seq(); }
                    }, 1500);
                }
            } else if (el.children.length === 0) el.dataset.broken = "true"; else return;

            const rect = el.getBoundingClientRect(), styles = window.getComputedStyle(el);
            el.style.visibility = 'hidden';
            if (el.innerText?.trim() && el.tagName !== 'IMG') {
                el.innerText.split(/\s+/).forEach((word, i) => {
                    const dEl = document.createElement('span');
                    dEl.className = 'debris'; dEl.textContent = word;
                    Object.assign(dEl.style, { color: styles.color, fontSize: styles.fontSize, position: 'fixed', left: '0', top: '0' });
                    document.body.appendChild(dEl);
                    _0x11b2.push({ el: dEl, x: rect.left + (i * 20), y: rect.top, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10, rv: (Math.random()-0.5)*0.2, rot: 0, w: 40, h: 20 });
                });
            } else {
                const shards = ["0% 0%, 50% 50%, 0% 50%", "0% 0%, 50% 0%, 50% 50%", "50% 0%, 100% 0%, 50% 50%", "100% 0%, 100% 50%, 50% 50%", "100% 50%, 100% 100%, 50% 50%", "100% 100%, 50% 100%, 50% 50%", "50% 100%, 0% 100%, 50% 50%", "0% 100%, 0% 50%, 50% 50%"];
                shards.forEach(path => {
                    const dEl = el.cloneNode(true);
                    dEl.classList.add('debris');
                    Object.assign(dEl.style, { position: 'fixed', left: '0', top: '0', width: rect.width+'px', height: rect.height+'px', visibility: 'visible', margin: '0', clipPath: `polygon(${path})`, transition: 'none' });
                    document.body.appendChild(dEl);
                    _0x11b2.push({ el: dEl, x: rect.left, y: rect.top, vx: (Math.random()-0.5)*15, vy: (Math.random()-0.5)*15-5, rv: (Math.random()-0.5)*0.3, rot: 0, isImage: true, w: rect.width, h: rect.height });
                });
            }
        }

        const _0xphys = () => {
            if (!_0x2c1a) return;
            const gravity = 0.4, friction = 0.99, ground = window.innerHeight, width = window.innerWidth;
            _0x11b2.forEach(d => {
                d.el.style.transform = `translate3d(${d.x}px, ${d.y}px, 0) rotate(${d.rot}rad)`;
                if (d === _0x4d3c || d.settled) return;
                d.vy += gravity; d.vx *= friction; d.vy *= friction; d.x += d.vx; d.y += d.vy; d.rot += d.rv;
                if (d.y > ground - 20) { d.y = ground - 20; d.vy *= -0.5; d.vx *= 0.8; d.rv *= 0.8; if (Math.abs(d.vy) < 0.5) d.settled = true; }
                if (d.x < 0 || d.x > width) { d.vx *= -0.8; d.x = d.x < 0 ? 0 : width; }
            });
            requestAnimationFrame(_0xphys);
        };
        requestAnimationFrame(_0xphys);
    }

    function _0xstop_seq() {
        let timeLeft = 15;
        const countdownEl = document.getElementById('shutdown-countdown');
        const timer = setInterval(() => {
            timeLeft--; if (countdownEl) countdownEl.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer);
                const gp = document.querySelector('.guilt-popup'); if (gp) gp.classList.remove('active');
                document.body.style.transition = 'background-color 2s ease, opacity 2s ease';
                document.body.style.backgroundColor = '#000';
                setTimeout(() => _0xblood(() => {
                    document.body.style.opacity = '0';
                    setTimeout(_0xeye_seq, 2000);
                }), 1000);
            }
        }, 1000);
    }

    function _0xblood(callback) {
        const container = document.createElement('div'); container.className = 'blood-container'; document.body.appendChild(container);
        for (let i = 0; i < 45; i++) {
            setTimeout(() => {
                const drop = document.createElement('div'); drop.className = 'blood-drop splat';
                const size = Math.random() * 30 + 10, x = Math.random() * 100, y = Math.random() * 100;
                Object.assign(drop.style, { width: size+'px', height: size+'px', left: x+'%', top: y+'%' });
                container.appendChild(drop);
                if (i % 2 === 0) {
                    setTimeout(() => {
                        const trail = document.createElement('div'); trail.className = 'blood-trail seep';
                        Object.assign(trail.style, { left: `calc(${x}% + ${size/2 - 2}px)`, top: `${y + size/2}%` });
                        container.appendChild(trail);
                    }, 200);
                }
            }, i * 40);
        }
        setTimeout(() => {
            container.style.transition = 'opacity 2.5s ease'; container.style.opacity = '0';
            setTimeout(() => { container.remove(); callback?.(); }, 2500);
        }, 4500);
    }

    function _0xeye_seq() {
        const finalSeq = document.querySelector('.final-sequence'); if (!finalSeq) return;
        finalSeq.classList.remove('eye-open', 'text-anim', 'eye-blink', 'eye-blinking');
        document.body.style.opacity = '1'; finalSeq.classList.add('active');
        setTimeout(() => {
            finalSeq.classList.add('eye-open');
            const blink = (callback) => { finalSeq.classList.add('eye-blink'); setTimeout(() => { finalSeq.classList.remove('eye-blink'); callback?.(); }, 200); };
            setTimeout(() => blink(() => setTimeout(() => blink(() => setTimeout(() => blink(() => {
                setTimeout(() => {
                    finalSeq.classList.add('text-anim', 'eye-blinking');
                    setTimeout(() => {
                        finalSeq.classList.remove('eye-blinking'); finalSeq.classList.add('eye-blink');
                        setTimeout(() => {
                            finalSeq.classList.remove('eye-open');
                            setTimeout(() => { window.close(); document.body.innerHTML = ''; document.body.style.backgroundColor = '#000'; }, 2000);
                        }, 1000);
                    }, 8000);
                }, 1000);
            })), 400))), 1000);
        }, 1000);
    }

    /* 
    ==========================================================================
    ANALYTICS EVENT TRACKING
    ==========================================================================
    */
    const trackEvent = (name, params = {}) => {
        if (typeof gtag === 'function') {
            gtag('event', name, params);
        }
    };

    // Track Resume Clicks
    document.querySelectorAll('a[href="assets/resume.pdf"], .context-menu-item[data-action="resume"]').forEach(el => {
        el.addEventListener('click', () => {
            trackEvent('view_resume', {
                location: el.tagName === 'A' ? 'nav/hero' : 'context_menu'
            });
        });
    });

    // Track Social Link Clicks
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const platform = btn.getAttribute('title') || 'Unknown';
            trackEvent('social_click', {
                platform: platform,
                url: btn.getAttribute('href')
            });
        });
    });

    // Track _0xMODULE Trigger
    const _0xyes = document.querySelector('.btn-yes');
    if (_0xyes) {
        const _0xorig = _0xyes.onclick;
        _0xyes.onclick = (e) => {
            trackEvent('_0xstart');
            if (_0xorig) _0xorig(e);
        };
    }

    /* 
    ==========================================================================
    CUSTOM FIND INTERFACE (F3)
    ==========================================================================
    */
    let findOverlay = null, findInput = null, findStats = null, matches = [], currentMatchIndex = -1;

    const createFindUI = () => {
        findOverlay = document.createElement('div');
        findOverlay.className = 'custom-find';
        findOverlay.innerHTML = `
            <input type="text" class="find-input" placeholder="Find in page...">
            <div class="find-stats">0/0</div>
            <div class="find-btns">
                <button class="find-btn prev">↑</button>
                <button class="find-btn next">↓</button>
            </div>
            <div class="find-close">&times;</div>
        `;
        document.body.appendChild(findOverlay);
        findInput = findOverlay.querySelector('.find-input');
        findStats = findOverlay.querySelector('.find-stats');

        findOverlay.querySelector('.find-close').onclick = hideFind;
        findOverlay.querySelector('.prev').onclick = (e) => { e.stopPropagation(); navigateFind(-1); };
        findOverlay.querySelector('.next').onclick = (e) => { e.stopPropagation(); navigateFind(1); };
        
        findInput.oninput = (e) => performSearch(e.target.value);
        findInput.onkeydown = (e) => {
            if (e.key === 'Enter') navigateFind(e.shiftKey ? -1 : 1);
            if (e.key === 'Escape') hideFind();
        };
    };

    const showFind = () => {
        if (!findOverlay) createFindUI();
        findOverlay.classList.add('active');
        setTimeout(() => findInput.focus(), 100);
    };

    const hideFind = () => {
        if (findOverlay) {
            findOverlay.classList.remove('active');
            clearHighlights();
        }
    };

    const clearHighlights = () => {
        document.querySelectorAll('mark.find-highlight').forEach(mark => {
            const parent = mark.parentNode;
            if (parent) {
                parent.replaceChild(document.createTextNode(mark.textContent), mark);
                parent.normalize();
            }
        });
        matches = [];
        currentMatchIndex = -1;
    };

    const performSearch = (query) => {
        clearHighlights();
        if (!query || query.length < 2) { findStats.textContent = '0/0'; return; }

        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode: (node) => {
                if (node.parentElement.closest('.custom-find, script, style, .bg-artifacts, .context-menu')) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });

        const nodes = [];
        let node;
        while (node = walker.nextNode()) nodes.push(node);

        nodes.forEach(textNode => {
            const text = textNode.textContent;
            const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            if (regex.test(text)) {
                const fragment = document.createDocumentFragment();
                let lastIndex = 0;
                text.replace(regex, (match, p1, offset) => {
                    fragment.appendChild(document.createTextNode(text.substring(lastIndex, offset)));
                    const mark = document.createElement('mark');
                    mark.className = 'find-highlight';
                    mark.textContent = match;
                    fragment.appendChild(mark);
                    matches.push(mark);
                    lastIndex = offset + match.length;
                });
                fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
                if (textNode.parentNode) textNode.parentNode.replaceChild(fragment, textNode);
            }
        });

        currentMatchIndex = matches.length > 0 ? 0 : -1;
        updateFindStats();
        if (matches.length > 0) highlightCurrent();
    };

    const highlightCurrent = () => {
        matches.forEach(m => m.classList.remove('find-active'));
        const current = matches[currentMatchIndex];
        if (current) {
            current.classList.add('find-active');
            current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const navigateFind = (direction) => {
        if (matches.length === 0) return;
        currentMatchIndex = (currentMatchIndex + direction + matches.length) % matches.length;
        updateFindStats();
        highlightCurrent();
    };

    const updateFindStats = () => {
        findStats.textContent = matches.length > 0 ? `${currentMatchIndex + 1}/${matches.length}` : '0/0';
    };

    window.addEventListener('keydown', (e) => {
        if (e.key === 'F3') {
            e.preventDefault();
            showFind();
        }
        if (e.key === '`') {
            toggleStats();
        }
        
        // Command Palette (Ctrl+K)
        if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            toggleCommandPalette();
        }

        // Accent Cycler (Alt+T)
        if (e.key === 't' && e.altKey) {
            e.preventDefault();
            cycleAccent();
        }

        // Screenshot Mode (Alt+S)
        if (e.key === 's' && e.altKey) {
            e.preventDefault();
            toggleScreenshotMode();
        }

        // Konami Code Tracker (Case Insensitive)
        const key = e.key.toLowerCase();
        if (key === konamiCode[konamiIdx]) {
            konamiIdx++;
            if (konamiIdx === konamiCode.length) {
                toggleCRTMode();
                konamiIdx = 0;
            }
        } else {
            konamiIdx = (key === konamiCode[0]) ? 1 : 0;
        }
    });

    /* 
    ==========================================================================
    PREMIUM FEATURES LOGIC
    ==========================================================================
    */
    
    // 1. Accent Cycler
    const cycleAccent = () => {
        currentPaletteIdx = (currentPaletteIdx + 1) % palettes.length;
        const p = palettes[currentPaletteIdx];
        document.documentElement.style.setProperty('--accent-color', p.accent);
        document.documentElement.style.setProperty('--name-color', p.name);
        trackEvent('palette_cycle', { palette: p.accent });
    };

    // 2. Command Palette
    let cpOverlay = null, cpSearch = null, cpList = null, cpActiveIdx = 0;
    const commands = [
        { label: 'Go to Resume', action: () => window.location.href = 'resume.html', hint: 'Nav' },
        { label: 'Destruction Mode', action: () => document.querySelector('.btn-yes')?.click(), hint: 'Secret' },
        { label: 'Cycle Accent Color', action: cycleAccent, hint: 'Alt+T' },
        { label: 'Toggle Retro CRT Mode', action: () => toggleCRTMode(), hint: 'Konami' },
        { label: 'Screenshot Mode', action: () => toggleScreenshotMode(), hint: 'Alt+S' },
        { label: 'Find in Page', action: () => showFind(), hint: 'F3' },
        { label: 'Performance Stats', action: () => toggleStats(), hint: '`' }
    ];

    const createCPUI = () => {
        cpOverlay = document.createElement('div');
        cpOverlay.className = 'command-palette';
        cpOverlay.innerHTML = `
            <input type="text" class="cp-search" placeholder="Type a command...">
            <div class="cp-list"></div>
        `;
        document.body.appendChild(cpOverlay);
        cpSearch = cpOverlay.querySelector('.cp-search');
        cpList = cpOverlay.querySelector('.cp-list');

        cpSearch.oninput = (e) => renderCP(e.target.value);
        cpSearch.onkeydown = (e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); cpActiveIdx = (cpActiveIdx + 1) % cpFiltered.length; updateCPSelection(); }
            if (e.key === 'ArrowUp') { e.preventDefault(); cpActiveIdx = (cpActiveIdx - 1 + cpFiltered.length) % cpFiltered.length; updateCPSelection(); }
            if (e.key === 'Enter') { e.preventDefault(); cpFiltered[cpActiveIdx]?.action(); hideCP(); }
            if (e.key === 'Escape') hideCP();
        };
    };

    let cpFiltered = [];
    const renderCP = (query = '') => {
        cpFiltered = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));
        cpList.innerHTML = cpFiltered.map((c, i) => `
            <div class="cp-item ${i === cpActiveIdx ? 'selected' : ''}" data-index="${i}">
                <span class="cp-label">${c.label}</span>
                <span class="cp-hint">${c.hint}</span>
            </div>
        `).join('');
        
        cpList.querySelectorAll('.cp-item').forEach(item => {
            item.onmouseenter = () => { cpActiveIdx = parseInt(item.dataset.index); updateCPSelection(); };
            item.onclick = () => { cpFiltered[cpActiveIdx].action(); hideCP(); };
        });
    };

    const updateCPSelection = () => {
        cpList.querySelectorAll('.cp-item').forEach((item, i) => item.classList.toggle('selected', i === cpActiveIdx));
    };

    const toggleCommandPalette = () => {
        if (!cpOverlay) createCPUI();
        const isActive = cpOverlay.classList.toggle('active');
        if (isActive) {
            cpSearch.value = '';
            cpActiveIdx = 0;
            renderCP();
            setTimeout(() => cpSearch.focus(), 100);
        }
    };
    const hideCP = () => cpOverlay?.classList.remove('active');

    // 3. CRT Mode
    const toggleCRTMode = () => {
        if (!document.querySelector('.crt-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'crt-overlay';
            document.body.appendChild(overlay);
        }
        document.body.classList.toggle('crt-mode');
        trackEvent('crt_mode_toggle');
    };

    // 4. Screenshot Mode
    const toggleScreenshotMode = () => {
        document.body.classList.toggle('screenshot-mode');
    };

    /* Konami definitions moved to top for scoping */

    /* 
    ==========================================================================
    STATS OVERLAY (BACKTICK)
    ==========================================================================
    */
    let statsOverlay = null, fps = 0, lastTime = performance.now(), frames = 0, statsActive = false;

    const createStatsUI = () => {
        statsOverlay = document.createElement('div');
        statsOverlay.className = 'stats-overlay';
        statsOverlay.innerHTML = `
            <div class="stats-item">FPS: <span class="stats-value" id="stats-fps">0</span></div>
            <div class="stats-item">Objects: <span class="stats-value" id="stats-objects">0</span></div>
            <div class="stats-item">Memory: <span class="stats-value" id="stats-mem">N/A</span></div>
        `;
        document.body.appendChild(statsOverlay);
    };

    const toggleStats = () => {
        if (!statsOverlay) createStatsUI();
        statsActive = !statsActive;
        statsOverlay.classList.toggle('active', statsActive);
        if (statsActive) requestAnimationFrame(updateStats);
    };

    const updateStats = () => {
        if (!statsActive) return;
        
        frames++;
        const now = performance.now();
        if (now >= lastTime + 1000) {
            fps = Math.round((frames * 1000) / (now - lastTime));
            document.getElementById('stats-fps').textContent = fps;
            frames = 0;
            lastTime = now;
            
            // Update objects count
            const objects = document.querySelectorAll('.artifact-wrapper, .debris').length;
            document.getElementById('stats-objects').textContent = objects;
            
            // Update memory if available
            if (window.performance && window.performance.memory) {
                const mem = Math.round(window.performance.memory.usedJSHeapSize / 1048576);
                document.getElementById('stats-mem').textContent = mem + ' MB';
            }
        }
        requestAnimationFrame(updateStats);
    };

    /* 
    ==========================================================================
    VISITOR COUNTER (PRODUCTION)
    ==========================================================================
    */
    const updateVisitorCount = async () => {
        const countEl = document.getElementById('visitor-count');
        if (!countEl) return;

        try {
            // Using a stable visitor counter API
            const response = await fetch('https://api.counterapi.dev/v1/harshitranjan/portfolio/up');
            const data = await response.json();
            if (data && data.count) {
                const count = data.count.toLocaleString();
                countEl.textContent = count.padStart(6, '0');
                trackEvent('visitor_count_updated', { count: data.count });
            }
        } catch (error) {
            countEl.textContent = "CONNECTED";
        }
    };
    updateVisitorCount();
});

/* 
==========================================================================
ADVANCED SECURITY & INTEGRITY LAYER
==========================================================================
*/
(function() {
    // Console Hijacking: Prevent logging and inspection
    const _0x31a2 = console;
    const _0x1b2e = _0x31a2.log;
    const _0x5c4d = _0x31a2.clear;
    
    // Disable all console methods except the warning
    const _0xmethods = ['log', 'warn', 'error', 'info', 'debug', 'table', 'trace', 'dir'];
    _0xmethods.forEach(m => {
        _0x31a2[m] = function() {
            if (arguments[0] && typeof arguments[0] === 'string' && arguments[0].includes('%cSTOP')) {
                _0x1b2e.apply(_0x31a2, arguments);
            }
        };
    });

    // Integrity Check: Prevent function string conversion
    const _0xproto = Function.prototype.toString;
    Function.prototype.toString = function() {
        if (this === _0xproto) return _0xproto.call(this);
        return "function " + (this.name || "") + "() { [protected code] }";
    };

    // Aggressive Anti-Debugging
    const _0x4f22 = function() {
        try {
            (function(_0x5d21) {
                (function(_0x3e1a) {
                    if (_0x3e1a) return _0x3e1a;
                    else _0x4f22();
                }(_0x5d21));
            }(function() {
                let _0x1b2c;
                try {
                    _0x1b2c = Function('return (function() {}.constructor("debugger")())')();
                } catch (_0x5a2e) {
                    _0x1b2c = false;
                }
                return _0x1b2c;
            }()));
        } catch (_0x2d1c) {}
    };
    setInterval(_0x4f22, 500);

    // Block Interaction
    window.addEventListener('keydown', (e) => {
        const _0xfbk = ['F12', 'I', 'J', 'C', 'U', 'S', 'P', 'H'];
        if (_0xfbk.includes(e.key.toUpperCase()) && (e.ctrlKey || e.shiftKey || e.key === 'F12')) {
            e.preventDefault();
            return false;
        }
    }, true);

    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // DevTools Detection & Redirection
    setInterval(() => {
        const _0xthreshold = 160;
        const _0xwidth = window.outerWidth - window.innerWidth > _0xthreshold;
        const _0xheight = window.outerHeight - window.innerHeight > _0xthreshold;
        if (_0xwidth || _0xheight) {
            _0x5c4d.call(_0x31a2);
            document.body.innerHTML = '<div style="background:#000;color:#f00;height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:2rem;">ACCESS RESTRICTED</div>';
            location.reload();
        }
    }, 1000);

    const _0x3a2b = "color: #ff0000; font-size: 3rem; font-weight: bold; text-shadow: 2px 2px 0 #000;";
    _0x1b2e.call(_0x31a2, "%cSTOP!", _0x3a2b);
})();





