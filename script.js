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

    /* 
    ==========================================================================
    PERFORMANCE DETECTION
    ==========================================================================
    Detects if the user's device is struggling with background artifacts.
    */
    let frameTimes = [];
    let lastFrameTime = performance.now();
    let performanceCheckActive = true;

    function checkPerformance() {
        if (!performanceCheckActive) return;
        const now = performance.now();
        const delta = now - lastFrameTime;
        lastFrameTime = now;
        if (delta > 0) frameTimes.push(delta);
        
        if (frameTimes.length > 100) {
            const avgFrameTime = frameTimes.reduce((a, b) => a + b) / frameTimes.length;
            if (avgFrameTime > 33) { // < 30 FPS
                console.warn("Performance drop detected. Optimizing background.");
                const container = document.querySelector('.bg-artifacts');
                if (container) container.innerHTML = '';
            }
            performanceCheckActive = false;
        } else {
            requestAnimationFrame(checkPerformance);
        }
    }
    requestAnimationFrame(checkPerformance);

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
            document.querySelectorAll('a, button, .project-card, .btn, .back-to-top, .context-menu-item').forEach(el => {
                if (el.dataset.hasCursorListener) return;
                el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
                el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
                el.dataset.hasCursorListener = "true";
            });
        };
        updateHovers();
        // Re-run for dynamic elements
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
                const bar = entry.target.querySelector('.skill-progress');
                const label = entry.target.querySelector('.skill-info span:last-child');
                if (bar && label) {
                    const targetWidth = bar.style.width || '0%';
                    const targetNum = parseInt(targetWidth);
                    bar.style.width = '0%';
                    bar.style.transition = 'none';
                    const startTime = performance.now();
                    const duration = 1500;
                    const tick = (now) => {
                        const progress = Math.min((now - startTime) / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3); 
                        const current = eased * targetNum;
                        label.textContent = Math.round(current) + '%';
                        bar.style.width = current + '%';
                        if (progress < 1) requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                }
                skillObserver.unobserve(entry.target);
            });
        }, { threshold: 0.3 });
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
    initArtifacts(window.innerWidth <= 900 ? 60 : (isResume ? 350 : 500));

    let mX = -1000, mY = -1000, ticking = false;
    window.addEventListener('mousemove', (e) => {
        mX = e.clientX; mY = e.clientY;
        if (!ticking) { requestAnimationFrame(updateArtifacts); ticking = true; }
    });

    function updateArtifacts() {
        const vh = window.innerHeight;
        document.querySelectorAll('.mouse-reactive').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.bottom < -50 || rect.top > vh + 50) return;
            const dx = mX - (rect.left + rect.width / 2);
            const dy = mY - (rect.top + rect.height / 2);
            const distSq = dx * dx + dy * dy;
            if (distSq < CONFIG.repulsionRadius * CONFIG.repulsionRadius) {
                const distance = Math.sqrt(distSq);
                const angle = Math.atan2(dy, dx);
                const force = (CONFIG.repulsionRadius - distance) / CONFIG.repulsionRadius;
                el.style.transform = `translate(${(-Math.cos(angle) * force * CONFIG.repulsionStrength).toFixed(1)}px, ${(-Math.sin(angle) * force * CONFIG.repulsionStrength).toFixed(1)}px)`;
            } else if (el.style.transform !== '') el.style.transform = 'translate(0, 0)';
        });
        ticking = false;
    }

    /* 
    ==========================================================================
    PROJECT MEDIA SWAPPER (OPTIMIZED)
    ==========================================================================
    Loads videos in the background as they approach the viewport to ensure 
    instant playback on hover without causing performance lag.
    */
    let userMutedPreference = true;
    const projectCards = document.querySelectorAll('.project-card');
    
    if (projectCards.length > 0) {
        const videoLoader = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    const img = card.querySelector('.project-img');
                    if (!img) return;
                    
                    const videoSrc = img.dataset.video;
                    if (videoSrc && !card.dataset.videoInited) {
                        // Mark as inited to prevent duplicate work
                        card.dataset.videoInited = "true";
                        
                        // Create video element in background
                        const video = document.createElement('video');
                        video.src = videoSrc;
                        video.preload = "auto";
                        video.loop = true;
                        video.muted = userMutedPreference;
                        video.playsInline = true;
                        Object.assign(video.style, {
                            position: 'absolute',
                            inset: '0',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: '0',
                            transition: 'opacity 0.4s ease',
                            zIndex: '1',
                            pointerEvents: 'none'
                        });
                        
                        // Create mute button
                        const muteBtn = document.createElement('button');
                        muteBtn.className = 'mute-btn';
                        const muteIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;
                        const unmuteIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
                        muteBtn.innerHTML = userMutedPreference ? muteIcon : unmuteIcon;
                        
                        muteBtn.onclick = (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            userMutedPreference = !userMutedPreference;
                            // Update all videos' mute state
                            document.querySelectorAll('video').forEach(v => v.muted = userMutedPreference);
                            document.querySelectorAll('.mute-btn').forEach(btn => {
                                btn.innerHTML = userMutedPreference ? muteIcon : unmuteIcon;
                            });
                        };
                        
                        img.parentElement.appendChild(video);
                        img.parentElement.appendChild(muteBtn);
                        
                        // Reference for hover logic
                        card.videoElement = video;
                        card.muteBtn = muteBtn;
                        
                        video.oncanplay = () => {
                            // Video is ready to be shown
                            if (card.isHovering) {
                                video.style.opacity = '1';
                                video.play().catch(() => {});
                            }
                        };
                    }
                }
            });
        }, { rootMargin: '200px 0px', threshold: 0.01 });

        projectCards.forEach(card => {
            const img = card.querySelector('.project-img');
            const videoSrc = img?.dataset.video;
            const gifSrc = img?.dataset.gif;
            const thumbSrc = img?.dataset.thumbnail || img?.src;

            // Start observing for background load
            videoLoader.observe(card);

            card.addEventListener('mouseenter', () => {
                card.isHovering = true;
                if (card.videoElement) {
                    card.videoElement.style.opacity = '1';
                    card.videoElement.play().catch(() => {});
                } else if (gifSrc && img) {
                    img.src = gifSrc;
                }
            });

            card.addEventListener('mouseleave', () => {
                card.isHovering = false;
                if (card.videoElement) {
                    card.videoElement.style.opacity = '0';
                    card.videoElement.pause();
                } else if (gifSrc && img) {
                    img.src = thumbSrc;
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
});

// ── DevTools Protection ──────────────────────────────────────────────
window.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key)) || (e.ctrlKey && e.key === 'u')) e.preventDefault();
}, false);




