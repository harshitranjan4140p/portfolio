document.addEventListener('DOMContentLoaded', () => {
    /* 
    ==========================================================================
    CORE CONFIGURATION
    ==========================================================================
    */
    const CONFIG = {
        roles: ["Wizard", "Software Developer", "Game Developer", "3D Artist", "Founder", "Chess Player"],
        email: "harshitranjan4140p@gmail.com",
        destructionTrigger: atob('NDE0MHA='), // Code: 4140p
        repulsionRadius: 150,
        repulsionStrength: 40
    };

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

    /* 
    ==========================================================================
    CUSTOM CURSOR
    ==========================================================================
    */
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    if (cursorDot && cursorOutline) {
        window.addEventListener('mousemove', (e) => {
            const transformStr = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
            cursorDot.style.transform = transformStr;
            cursorOutline.style.transform = transformStr;
        });

        const updateHovers = () => {
            document.querySelectorAll('a, button, .project-card, .btn, .back-to-top, .context-menu-item, .social-btn, .social-link, .btn-nav').forEach(el => {
                if (el.dataset.hasCursorListener) return;
                el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
                el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
                el.dataset.hasCursorListener = "true";
            });
        };
        updateHovers();
        const hoverObserver = new MutationObserver(updateHovers);
        hoverObserver.observe(document.body, { childList: true, subtree: true });
    }

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

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    /* 
    ==========================================================================
    CUSTOM CONTEXT MENU
    ==========================================================================
    */
    const contextMenu = document.getElementById('custom-context-menu');
    if (contextMenu) {
        window.addEventListener('contextmenu', (e) => {
            if (destructionActive) return;
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
                    case 'resume': window.location.href = 'resume.html'; break;
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

        // Middle Click Toggle
        window.addEventListener('mousedown', (e) => { if (e.button === 1) cursorDot?.classList.add('middle-scroll'); });
        window.addEventListener('mouseup', () => { cursorDot?.classList.remove('middle-scroll'); });
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
                href.startsWith('mailto') || href.startsWith('tel')) return;
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
    const isResume = document.querySelector('.resume-page') !== null;
    initArtifacts(window.innerWidth <= 900 ? 200 : (isResume ? 300 : 600));

    let mX = -1000, mY = -1000, ticking = false;
    window.addEventListener('mousemove', (e) => {
        mX = e.clientX; mY = e.clientY;
        if (!ticking) { requestAnimationFrame(updateArtifacts); ticking = true; }
    });

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
    const projectCards = document.querySelectorAll('.project-card');
    const loadQueue = [];

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
            const thumbSrc = img?.dataset.thumbnail || img?.src;

            card.addEventListener('mouseenter', () => {
                card.isHovering = true;
                // High Priority Initialization
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

    /* 
    ==========================================================================
    SECRET DESTRUCTION MODE
    ==========================================================================
    */
    let secretCode = "", destructionActive = false, debrisList = [], heldDebris = null;
    const destructionPopup = document.querySelector('.destruction-popup'), btnYes = document.querySelector('.btn-yes'), btnNo = document.querySelector('.btn-no');

    if (destructionPopup && btnYes && btnNo) {
        window.addEventListener('keydown', (e) => {
            secretCode += e.key;
            if (secretCode.length > CONFIG.destructionTrigger.length) secretCode = secretCode.substring(1);
            if (secretCode === CONFIG.destructionTrigger) destructionPopup.classList.add('active');
        });
        btnNo.onclick = () => destructionPopup.classList.remove('active');
        btnYes.onclick = () => { destructionPopup.classList.remove('active'); startDestruction(); };
    }

    function startDestruction() {
        destructionActive = true;
        document.body.classList.add('destruction-active');
        const breakables = document.querySelectorAll('h1, h2, h3, p, img, .btn, .project-card, .skill-item');
        let breakableCount = breakables.length, initialBreakableCount = breakableCount, guiltTriggered = false;

        window.addEventListener('dragstart', (e) => e.preventDefault());
        window.addEventListener('contextmenu', (e) => { if (destructionActive) e.preventDefault(); });
        document.querySelectorAll('a, button').forEach(el => {
            if (!el.classList.contains('btn-yes') && !el.classList.contains('btn-no')) {
                el.style.pointerEvents = 'none'; el.style.cursor = 'crosshair';
            }
        });

        window.addEventListener('mousedown', (e) => {
            if (!destructionActive) return;
            const target = e.target;
            if (target === document.body || target === document.documentElement || target.closest('.destruction-popup')) return;
            if (e.button === 2) {
                const proximitySq = 2500; let closest = null, minDistSq = proximitySq;
                debrisList.forEach(d => {
                    const distSq = (e.clientX - d.x)**2 + (e.clientY - d.y)**2;
                    if (distSq < minDistSq) { minDistSq = distSq; closest = d; }
                });
                if (closest) { heldDebris = closest; heldDebris.settled = false; heldDebris.el.classList.add('held'); }
            } else if (e.button === 0 && !target.classList.contains('debris')) {
                breakElement(target);
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (heldDebris) {
                heldDebris.x = e.clientX - (heldDebris.w || 20)/2;
                heldDebris.y = e.clientY - (heldDebris.h || 20)/2;
                heldDebris.vx = heldDebris.vy = 0;
            }
        });

        window.addEventListener('mouseup', () => { if (heldDebris) { heldDebris.el.classList.remove('held'); heldDebris = null; } });

        function breakElement(el) {
            if (el.dataset.broken) return;
            const isTarget = el.matches('h1, h2, h3, p, img, .btn, .project-card, .skill-item');
            if (isTarget) {
                el.dataset.broken = "true"; breakableCount--;
                if (breakableCount <= initialBreakableCount * 0.6 && !guiltTriggered) {
                    guiltTriggered = true;
                    setTimeout(() => {
                        const gp = document.querySelector('.guilt-popup');
                        if (gp) { gp.classList.add('active'); startShutdownSequence(); }
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
                    debrisList.push({ el: dEl, x: rect.left + (i * 20), y: rect.top, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10, rv: (Math.random()-0.5)*0.2, rot: 0, w: 40, h: 20 });
                });
            } else {
                const shards = ["0% 0%, 50% 50%, 0% 50%", "0% 0%, 50% 0%, 50% 50%", "50% 0%, 100% 0%, 50% 50%", "100% 0%, 100% 50%, 50% 50%", "100% 50%, 100% 100%, 50% 50%", "100% 100%, 50% 100%, 50% 50%", "50% 100%, 0% 100%, 50% 50%", "0% 100%, 0% 50%, 50% 50%"];
                shards.forEach(path => {
                    const dEl = el.cloneNode(true);
                    dEl.classList.add('debris');
                    Object.assign(dEl.style, { position: 'fixed', left: '0', top: '0', width: rect.width+'px', height: rect.height+'px', visibility: 'visible', margin: '0', clipPath: `polygon(${path})`, transition: 'none' });
                    document.body.appendChild(dEl);
                    debrisList.push({ el: dEl, x: rect.left, y: rect.top, vx: (Math.random()-0.5)*15, vy: (Math.random()-0.5)*15-5, rv: (Math.random()-0.5)*0.3, rot: 0, isImage: true, w: rect.width, h: rect.height });
                });
            }
        }

        const physicsLoop = () => {
            if (!destructionActive) return;
            const gravity = 0.4, friction = 0.99, ground = window.innerHeight, width = window.innerWidth;
            debrisList.forEach(d => {
                d.el.style.transform = `translate3d(${d.x}px, ${d.y}px, 0) rotate(${d.rot}rad)`;
                if (d === heldDebris || d.settled) return;
                d.vy += gravity; d.vx *= friction; d.vy *= friction; d.x += d.vx; d.y += d.vy; d.rot += d.rv;
                if (d.y > ground - 20) { d.y = ground - 20; d.vy *= -0.5; d.vx *= 0.8; d.rv *= 0.8; if (Math.abs(d.vy) < 0.5) d.settled = true; }
                if (d.x < 0 || d.x > width) { d.vx *= -0.8; d.x = d.x < 0 ? 0 : width; }
            });
            requestAnimationFrame(physicsLoop);
        };
        requestAnimationFrame(physicsLoop);
    }

    function startShutdownSequence() {
        let timeLeft = 15;
        const countdownEl = document.getElementById('shutdown-countdown');
        const timer = setInterval(() => {
            timeLeft--; if (countdownEl) countdownEl.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer);
                const gp = document.querySelector('.guilt-popup'); if (gp) gp.classList.remove('active');
                document.body.style.transition = 'background-color 2s ease, opacity 2s ease';
                document.body.style.backgroundColor = '#000';
                setTimeout(() => runBloodEffect(() => {
                    document.body.style.opacity = '0';
                    setTimeout(runFinalEyeSequence, 2000);
                }), 1000);
            }
        }, 1000);
    }

    function runBloodEffect(callback) {
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

    function runFinalEyeSequence() {
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
    document.querySelectorAll('a[href="resume.html"], .context-menu-item[data-action="resume"]').forEach(el => {
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

    // Track Destruction Mode Trigger
    const destructionYesBtn = document.querySelector('.btn-yes');
    if (destructionYesBtn) {
        const originalBtnYes = destructionYesBtn.onclick;
        destructionYesBtn.onclick = (e) => {
            trackEvent('destruction_mode_start');
            if (originalBtnYes) originalBtnYes(e);
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

// ── DevTools Protection ──────────────────────────────────────────────
window.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key)) || (e.ctrlKey && e.key === 'u')) e.preventDefault();
}, false);




