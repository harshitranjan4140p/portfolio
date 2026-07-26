document.addEventListener('DOMContentLoaded', () => {
    const email = 'harshitranjan4140p@gmail.com';
    const projects = typeof PROJECT_DATA === 'undefined' ? [] : PROJECT_DATA;

    const platformBadge = (link) => {
        if (link.includes('youtube.com')) return ['YouTube', 'badge-youtube'];
        if (link.includes('play.google.com')) return ['Play Store', 'badge-playstore'];
        if (link.includes('drive.google.com')) return ['Drive', 'badge-drive'];
        return null;
    };

    const renderProjects = () => {
        const grid = document.getElementById('projects-grid');
        if (!grid) return;

        const mainPage = !document.body.classList.contains('projects-page');
        const visibleProjects = projects.filter((project) => project.isHighlight === mainPage);

        grid.innerHTML = visibleProjects.map((project, index) => {
            const badge = platformBadge(project.link);
            const badgeMarkup = badge
                ? `<div class="platform-badge ${badge[1]}">${badge[0]}</div>`
                : '';

            return `
                <article class="project-card reveal ${index % 2 ? 'reverse' : ''}">
                    <a class="project-media ${project.isPortrait ? 'portrait' : ''}" href="${project.link}" target="_blank" rel="noopener noreferrer" aria-label="Open ${project.title} project link">
                        <img src="${project.thumbnail}" alt="${project.title}" class="project-img" loading="lazy">
                        <video class="project-video" muted loop playsinline preload="none" poster="${project.thumbnail}">
                            <source src="${project.video}" type="video/mp4">
                        </video>
                        ${badgeMarkup}
                    </a>
                    <div class="project-info">
                        <h3 class="glitch-text">${project.title}</h3>
                        <p class="project-desc">${project.desc}</p>
                        <p class="project-proof"><strong>Evidence:</strong> ${project.proof}</p>
                        <div class="project-tags">
                            ${project.tags.map((tag) => `<span>${tag}</span>`).join('')}
                        </div>
                        <div class="project-actions">
                            <a href="docs.html?id=${project.id}" class="btn btn-outline">View Project</a>
                        </div>
                    </div>
                </article>`;
        }).join('');
    };

    renderProjects();

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const initializeProjectPreviews = () => {
        document.querySelectorAll('.project-card').forEach((card) => {
            const video = card.querySelector('.project-video');
            if (!video) return;

            card.addEventListener('pointerenter', () => {
                if (!supportsHover || reduceMotion) return;
                video.preload = 'metadata';
                const play = video.play();
                if (play) play.then(() => card.classList.add('is-previewing')).catch(() => {});
            });
            card.addEventListener('pointerleave', () => {
                card.classList.remove('is-previewing');
                video.pause();
                video.currentTime = 0;
            });
        });
    };
    initializeProjectPreviews();

    const initializeArtifacts = () => {
        const container = document.querySelector('.bg-artifacts');
        if (!container) return;
        const width = window.innerWidth;
        const count = reduceMotion ? 10 : width < 600 ? 16 : width < 1024 ? 30 : width > 1800 ? 90 : 60;
        const shapes = [
            ['X', 'shape-x'], ['Y', 'shape-y'], ['A', 'shape-a'], ['B', 'shape-b'],
            ['▲', 'shape-tri'], ['■', 'shape-sq'], ['●', 'shape-cir']
        ];

        for (let index = 0; index < count; index += 1) {
            const wrapper = document.createElement('div');
            const reactive = document.createElement('div');
            const artifact = document.createElement('div');
            wrapper.className = 'artifact-wrapper';
            reactive.className = 'mouse-reactive';
            const shape = shapes[index % shapes.length];
            artifact.className = `artifact ${shape[1]}`;
            artifact.textContent = shape[0];
            wrapper.style.top = `${Math.random() * 100}%`;
            wrapper.style.left = `${Math.random() * 100}%`;
            wrapper.style.animationDelay = `${Math.random() * -18}s`;
            wrapper.style.animationDuration = `${16 + Math.random() * 12}s`;
            artifact.style.opacity = `${0.05 + Math.random() * 0.12}`;
            reactive.appendChild(artifact);
            wrapper.appendChild(reactive);
            container.appendChild(wrapper);
        }

        if (!supportsHover || reduceMotion) return;
        let mouseX = -1000;
        let mouseY = -1000;
        let pending = false;
        window.addEventListener('pointermove', (event) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
            if (pending) return;
            pending = true;
            requestAnimationFrame(() => {
                container.querySelectorAll('.mouse-reactive').forEach((artifact) => {
                    const rect = artifact.getBoundingClientRect();
                    const dx = mouseX - (rect.left + rect.width / 2);
                    const dy = mouseY - (rect.top + rect.height / 2);
                    const distance = Math.hypot(dx, dy);
                    const factor = Math.max(0, 1 - distance / 150);
                    artifact.style.transform = factor ? `translate3d(${(-dx * factor * 0.25).toFixed(1)}px, ${(-dy * factor * 0.25).toFixed(1)}px, 0)` : '';
                });
                pending = false;
            });
        }, { passive: true });
    };
    initializeArtifacts();

    const role = document.getElementById('dynamic-role');
    const roleContainer = document.querySelector('.dynamic-role-container');
    const roleMeasurer = document.getElementById('role-measurer');
    const roles = ['Founder', 'Game Developer', 'Software Developer', '3D Artist'];

    if (role && roleContainer && roleMeasurer && !reduceMotion) {
        let roleIndex = 0;
        const setRole = () => {
            const nextRole = roles[roleIndex];
            roleMeasurer.textContent = nextRole;
            roleContainer.style.width = `${roleMeasurer.offsetWidth}px`;
            role.textContent = nextRole;
        };
        setRole();
        window.setInterval(() => {
            role.classList.add('swipe-up');
            window.setTimeout(() => {
                roleIndex = (roleIndex + 1) % roles.length;
                setRole();
                role.classList.remove('swipe-up');
            }, 250);
        }, 2800);
    }

    const reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        reveals.forEach((element) => revealObserver.observe(element));
    } else {
        reveals.forEach((element) => element.classList.add('visible'));
    }

    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
        link.rel = 'noopener noreferrer';
    });

    const progress = document.getElementById('scrollProgress');
    const backToTop = document.getElementById('backToTop');
    const updateScrollUi = () => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
        if (progress) progress.style.width = `${scrollPercent}%`;
        if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 400);
    };
    window.addEventListener('scroll', updateScrollUi, { passive: true });
    updateScrollUi();

    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    if (statNumbers.length) {
        const animateStat = (element) => {
            const target = Number(element.dataset.target);
            const start = performance.now();
            const duration = 1000;
            const tick = (time) => {
                const progress = Math.min((time - start) / duration, 1);
                element.textContent = Math.round(target * (1 - (1 - progress) ** 3));
                if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        };
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, statObserver) => entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateStat(entry.target);
                    statObserver.unobserve(entry.target);
                }
            }), { threshold: 0.4 });
            statNumbers.forEach((stat) => observer.observe(stat));
        } else statNumbers.forEach(animateStat);
    }

    const heroImage = document.querySelector('.hero-image');
    if (heroImage && supportsHover && !reduceMotion) {
        heroImage.addEventListener('pointermove', (event) => {
            const rect = heroImage.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            heroImage.style.setProperty('--hero-rotate-x', `${(-y * 5).toFixed(2)}deg`);
            heroImage.style.setProperty('--hero-rotate-y', `${(x * 5).toFixed(2)}deg`);
            heroImage.classList.add('is-hovered');
        });
        heroImage.addEventListener('pointerleave', () => {
            heroImage.classList.remove('is-hovered');
            heroImage.style.removeProperty('--hero-rotate-x');
            heroImage.style.removeProperty('--hero-rotate-y');
        });
    }

    const visitorCount = document.getElementById('visitor-count');
    if (visitorCount) {
        fetch('https://api.counterapi.dev/v1/harshitranjan/portfolio/up')
            .then((response) => response.ok ? response.json() : Promise.reject())
            .then((data) => { visitorCount.textContent = Number(data.count).toLocaleString(); })
            .catch(() => { visitorCount.textContent = 'Available'; });
    }

    const pageOverlay = document.getElementById('pageOverlay');
    if (pageOverlay) requestAnimationFrame(() => pageOverlay.classList.add('loaded'));

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const submitButton = document.getElementById('cf-submit');
            const status = document.getElementById('cf-status');
            const data = Object.fromEntries(new FormData(contactForm));

            submitButton.disabled = true;
            submitButton.textContent = 'Sending…';
            status.textContent = '';
            status.className = 'cf-status';

            try {
                const response = await fetch('https://formspree.io/f/mykoqkdj', {
                    method: 'POST',
                    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (!response.ok) throw new Error('Form submission failed');
                contactForm.reset();
                status.textContent = "Message sent — I'll reply within 24 hours.";
                status.className = 'cf-status success';
            } catch {
                status.innerHTML = `Something went wrong. Please <a href="mailto:${email}">email me directly</a>.`;
                status.className = 'cf-status error';
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Send Message ↗';
            }
        });
    }

    document.querySelectorAll('.social-btn, a[href="assets/docs/resume.pdf"]').forEach((link) => {
        link.addEventListener('click', () => {
            if (typeof gtag === 'function') {
                gtag('event', 'portfolio_link_click', {
                    label: link.title || link.textContent.trim(),
                    destination: link.href
                });
            }
        });
    });
});

/*
 * Advanced security and anti-debugging are intentionally retained at the
 * owner's request.
 */
(function () {
    const consoleRef = console;
    const originalLog = consoleRef.log;
    const clearConsole = consoleRef.clear;
    const methods = ['log', 'warn', 'error', 'info', 'debug', 'table', 'trace', 'dir'];

    methods.forEach((method) => {
        consoleRef[method] = function () {
            if (typeof arguments[0] === 'string' && arguments[0].includes('%cSTOP')) {
                originalLog.apply(consoleRef, arguments);
            }
        };
    });

    const originalToString = Function.prototype.toString;
    Function.prototype.toString = function () {
        if (this === originalToString) return originalToString.call(this);
        return `function ${this.name || ''}() { [protected code] }`;
    };

    const antiDebug = function () {
        try {
            Function('debugger')();
        } catch {
            // Ignore environments that block dynamic functions.
        }
    };
    window.setInterval(antiDebug, 500);

    window.addEventListener('keydown', (event) => {
        const blockedKeys = ['F12', 'I', 'J', 'C', 'U', 'S', 'P', 'H'];
        if (blockedKeys.includes(event.key.toUpperCase()) && (event.ctrlKey || event.shiftKey || event.key === 'F12')) {
            event.preventDefault();
        }
    }, true);

    document.addEventListener('contextmenu', (event) => event.preventDefault());

    window.setInterval(() => {
        const threshold = 160;
        const devToolsOpen = window.outerWidth - window.innerWidth > threshold
            || window.outerHeight - window.innerHeight > threshold;
        if (devToolsOpen) {
            clearConsole.call(consoleRef);
            document.body.innerHTML = '<div style="background:#000;color:#f00;height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:2rem;">ACCESS RESTRICTED</div>';
            location.reload();
        }
    }, 1000);

    originalLog.call(consoleRef, '%cSTOP!', 'color: #ff0000; font-size: 3rem; font-weight: bold; text-shadow: 2px 2px 0 #000;');
})();
