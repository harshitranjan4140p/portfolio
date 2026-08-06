document.addEventListener("DOMContentLoaded", async () => {
    "use strict";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const isCreatorHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    const fallbackProjects = typeof PROJECT_DATA === "undefined" ? [] : PROJECT_DATA;
    const fallbackSite = {
        profile: {
            name: "Harshit Ranjan",
            company: "Renvake",
            email: "harshitranjan4140p@gmail.com",
            greeting: "Hi there!",
            summary: "I build games, physics engines, and multiplayer systems from India.",
            roles: ["Founder", "Game Developer", "Software Developer", "3D Artist"],
            avatar: "assets/images/avatar.png",
            resume: "assets/docs/resume.pdf"
        },
        badges: ["MSME UDYAM-GJ-09-0069684", "5-yr MSc IT · Gujarat Uni"],
        socials: {},
        stats: [],
        copy: {},
        background: {
            desktopPerViewport: 22,
            tabletPerViewport: 14,
            mobilePerViewport: 9,
            maximum: 160
        }
    };

    const loadJson = async (path, fallback) => {
        try {
            const response = await fetch(path, { cache: isCreatorHost ? "no-store" : "default" });
            if (!response.ok) throw new Error("Content unavailable");
            return await response.json();
        } catch {
            return fallback;
        }
    };

    const [site, loadedProjects] = await Promise.all([
        loadJson("content/site.json", fallbackSite),
        loadJson("content/projects.json", fallbackProjects)
    ]);
    const projects = Array.isArray(loadedProjects) ? loadedProjects : fallbackProjects;
    let email = site.profile?.email || fallbackSite.profile.email;

    const safeHref = (value, fallback = "#") => {
        if (typeof value !== "string" || !value) return fallback;
        try {
            const url = new URL(value, window.location.href);
            if (["http:", "https:", "mailto:"].includes(url.protocol)) return value;
            if (url.origin === window.location.origin) return value;
        } catch {
            return fallback;
        }
        return fallback;
    };

    const applySiteContent = () => {
        const profile = site.profile || fallbackSite.profile;
        const setText = (selector, value) => {
            const element = document.querySelector(selector);
            if (element && typeof value === "string") element.textContent = value;
        };

        setText("#hero-greeting", profile.greeting);
        setText("#hero-name", profile.name);
        setText("#hero-company", profile.company);
        setText("#hero-summary", profile.summary);
        setText("#projects-title", site.copy?.projectsTitle);
        setText("#contact-title", site.copy?.contactTitle);
        setText("#contact-text", site.copy?.contactText);
        setText("#footer-title", site.copy?.footerTitle);
        setText("#footer-email", profile.email);
        setText("#footer-copyright", `© ${new Date().getFullYear()} ${profile.name}. ${profile.company}.`);

        const footerEmail = document.getElementById("footer-email");
        if (footerEmail) footerEmail.href = `mailto:${profile.email}`;

        const avatar = document.getElementById("hero-avatar");
        if (avatar) {
            avatar.src = safeHref(profile.avatar, fallbackSite.profile.avatar);
            avatar.alt = `${profile.name}, Founder of ${profile.company}`;
        }
        const resume = document.getElementById("resume-link");
        if (resume) resume.href = safeHref(profile.resume, fallbackSite.profile.resume);

        document.querySelectorAll("[data-site-badge]").forEach((badge, index) => {
            const value = site.badges?.[index];
            badge.closest(".msme-badge").hidden = !value;
            if (value) badge.textContent = value;
        });

        Object.entries(site.socials || {}).forEach(([label, href]) => {
            document.querySelectorAll(`.social-btn[title="${CSS.escape(label)}"]`).forEach((link) => {
                link.href = safeHref(href, link.href);
            });
        });

        if (document.title.includes("Harshit Ranjan") && profile.name !== "Harshit Ranjan") {
            document.title = document.title.replace("Harshit Ranjan", profile.name);
        }
    };

    const renderStats = () => {
        const container = document.getElementById("stats-strip");
        if (!container || !Array.isArray(site.stats) || !site.stats.length) return;
        container.replaceChildren();
        site.stats.forEach((stat, index) => {
            if (index) {
                const divider = document.createElement("div");
                divider.className = "stat-divider";
                container.append(divider);
            }
            const item = document.createElement("div");
            item.className = "stat-item";
            const numberWrap = document.createElement("div");
            numberWrap.className = "stat-number-wrap";
            const value = document.createElement("span");
            value.className = `stat-number${stat.animated ? "" : " stat-text"}`;
            if (stat.animated && Number.isFinite(Number(stat.value))) {
                value.dataset.target = String(Number(stat.value));
                value.textContent = "0";
            } else {
                value.textContent = stat.value;
            }
            numberWrap.append(value);
            if (stat.suffix) {
                const suffix = document.createElement("span");
                suffix.className = "stat-plus";
                suffix.textContent = stat.suffix;
                numberWrap.append(suffix);
            }
            const label = document.createElement("span");
            label.className = "stat-label";
            label.textContent = stat.label;
            item.append(numberWrap, label);
            container.append(item);
        });
    };

    const platformBadge = (link = "") => {
        if (link.includes("youtube.com") || link.includes("youtu.be")) return ["YouTube", "badge-youtube"];
        if (link.includes("play.google.com")) return ["Play Store", "badge-playstore"];
        if (link.includes("drive.google.com")) return ["Drive", "badge-drive"];
        if (link.includes("linkedin.com")) return ["LinkedIn", "badge-linkedin"];
        return null;
    };

    const externalLabel = (link = "") => {
        if (link.includes("youtube.com") || link.includes("youtu.be")) return "Watch on YouTube";
        if (link.includes("play.google.com")) return "View on Play Store";
        if (link.includes("drive.google.com")) return "Open Download";
        if (link.includes("linkedin.com")) return "View LinkedIn Post";
        return "Open Project";
    };

    const makeElement = (tag, className, text) => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    };

    const renderProjects = () => {
        const grid = document.getElementById("projects-grid");
        if (!grid) return;
        const mainPage = !document.body.classList.contains("projects-page");
        const visibleProjects = projects.filter((project) =>
            project.published !== false && (mainPage ? project.isHighlight : !project.isHighlight)
        );
        grid.replaceChildren();

        visibleProjects.forEach((project, index) => {
            const card = makeElement("article", `project-card reveal ${index % 2 ? "reverse" : ""}`);
            const media = makeElement("div", `project-media ${project.isPortrait ? "portrait" : ""}`);
            media.tabIndex = 0;
            media.setAttribute("role", "button");
            media.setAttribute("aria-label", `Play or pause ${project.title} preview`);

            const image = document.createElement("img");
            image.src = safeHref(project.thumbnail, "assets/images/game_cover.png");
            image.alt = project.title;
            image.className = "project-img";
            image.loading = "lazy";

            const video = document.createElement("video");
            video.className = "project-video";
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.preload = "none";
            video.poster = safeHref(project.thumbnail, "assets/images/game_cover.png");
            const source = document.createElement("source");
            source.src = safeHref(project.video, "");
            source.type = project.video?.toLowerCase().endsWith(".webm") ? "video/webm" : "video/mp4";
            video.append(source);

            const sound = makeElement("button", "video-sound", "🔇");
            sound.type = "button";
            sound.setAttribute("aria-label", `Unmute ${project.title} preview`);
            sound.title = "Unmute preview";

            const hint = makeElement("span", "preview-hint", supportsHover ? "Hover preview" : "Tap preview");
            media.append(image, video, sound, hint);

            const badge = platformBadge(project.link);
            if (badge) media.append(makeElement("div", `platform-badge ${badge[1]}`, badge[0]));

            const info = makeElement("div", "project-info");
            info.append(
                makeElement("h3", "glitch-text", project.title),
                makeElement("p", "project-desc", project.desc)
            );
            const proof = makeElement("p", "project-proof");
            proof.append(makeElement("strong", "", "Evidence:"), document.createTextNode(` ${project.proof}`));
            info.append(proof);

            const tags = makeElement("div", "project-tags");
            (project.tags || []).forEach((tag) => tags.append(makeElement("span", "", tag)));
            info.append(tags);

            const actions = makeElement("div", "project-actions");
            const external = makeElement("a", "btn project-link-button", externalLabel(project.link));
            external.href = safeHref(project.link);
            external.target = "_blank";
            external.rel = "noopener noreferrer";
            const documentation = makeElement("a", "btn btn-outline documentation-button", "Documentation");
            documentation.href = safeHref(project.documentation || `docs.html?id=${project.id}`);
            actions.append(external, documentation);
            info.append(actions);

            card.append(media, info);
            grid.append(card);
        });
    };

    const updateSoundButton = (video, button, title) => {
        button.textContent = video.muted ? "🔇" : "🔊";
        button.title = video.muted ? "Unmute preview" : "Mute preview";
        button.setAttribute("aria-label", `${video.muted ? "Unmute" : "Mute"} ${title} preview`);
        button.classList.toggle("is-audible", !video.muted);
    };

    const initializeProjectPreviews = () => {
        document.querySelectorAll(".project-card").forEach((card) => {
            const media = card.querySelector(".project-media");
            const video = card.querySelector(".project-video");
            const sound = card.querySelector(".video-sound");
            const title = card.querySelector("h3")?.textContent || "project";
            if (!media || !video || !sound) return;

            const startPreview = async () => {
                video.preload = "metadata";
                try {
                    await video.play();
                    card.classList.add("is-previewing");
                } catch {
                    card.classList.remove("is-previewing");
                }
            };
            const stopPreview = () => {
                card.classList.remove("is-previewing");
                video.pause();
                video.muted = true;
                updateSoundButton(video, sound, title);
            };

            media.addEventListener("pointerenter", () => {
                if (supportsHover && !reduceMotion) startPreview();
            });
            media.addEventListener("pointerleave", () => {
                if (supportsHover) stopPreview();
            });
            media.addEventListener("click", (event) => {
                if (event.target.closest(".video-sound")) return;
                if (video.paused) startPreview();
                else {
                    video.pause();
                    card.classList.remove("is-previewing");
                }
            });
            media.addEventListener("keydown", (event) => {
                if (!["Enter", " "].includes(event.key)) return;
                event.preventDefault();
                if (video.paused) startPreview();
                else {
                    video.pause();
                    card.classList.remove("is-previewing");
                }
            });
            sound.addEventListener("click", async (event) => {
                event.stopPropagation();
                document.querySelectorAll(".project-video").forEach((otherVideo) => {
                    if (otherVideo !== video) {
                        otherVideo.muted = true;
                        const otherCard = otherVideo.closest(".project-card");
                        const otherButton = otherCard?.querySelector(".video-sound");
                        if (otherButton) updateSoundButton(otherVideo, otherButton, otherCard.querySelector("h3")?.textContent || "project");
                    }
                });
                video.muted = !video.muted;
                updateSoundButton(video, sound, title);
                if (video.paused) await startPreview();
            });
            updateSoundButton(video, sound, title);
        });
    };

    const initializeArtifacts = () => {
        const container = document.querySelector(".bg-artifacts");
        if (!container) return;
        container.replaceChildren();
        const width = window.innerWidth;
        const viewportHeight = Math.max(window.innerHeight, 1);
        const documentHeight = Math.max(document.documentElement.scrollHeight, viewportHeight);
        const pageScreens = Math.max(1, documentHeight / viewportHeight);
        const config = site.background || fallbackSite.background;
        const perScreen = reduceMotion
            ? 4
            : width < 600
                ? Number(config.mobilePerViewport || 9)
                : width < 1024
                    ? Number(config.tabletPerViewport || 14)
                    : Number(config.desktopPerViewport || 22);
        const maximum = Math.max(20, Math.min(Number(config.maximum || 160), 240));
        const count = Math.min(maximum, Math.max(perScreen, Math.round(perScreen * pageScreens)));
        const shapes = [
            ["X", "shape-x"], ["Y", "shape-y"], ["A", "shape-a"], ["B", "shape-b"],
            ["▲", "shape-tri"], ["■", "shape-sq"], ["●", "shape-cir"],
            ["+", "shape-x"], ["◇", "shape-sq"], ["⌁", "shape-y"], ["[]", "shape-a"]
        ];
        const reactiveItems = [];

        for (let index = 0; index < count; index += 1) {
            const wrapper = makeElement("div", "artifact-wrapper");
            const reactive = makeElement("div", "mouse-reactive");
            const shape = shapes[index % shapes.length];
            const artifact = makeElement("div", `artifact ${shape[1]}`, shape[0]);
            const xRatio = Math.random();
            const yRatio = Math.random();
            const depth = index % 3;
            wrapper.style.top = `${yRatio * 100}%`;
            wrapper.style.left = `${xRatio * 100}%`;
            wrapper.style.animationDelay = `${Math.random() * -24}s`;
            wrapper.style.animationDuration = `${18 + depth * 6 + Math.random() * 14}s`;
            artifact.style.opacity = `${0.055 + depth * 0.025 + Math.random() * 0.09}`;
            artifact.style.fontSize = `${12 + depth * 7 + Math.random() * 10}px`;
            artifact.style.filter = `blur(${depth === 0 ? 0.4 : 0}px) drop-shadow(0 0 ${3 + depth * 2}px currentColor)`;
            reactive.append(artifact);
            wrapper.append(reactive);
            container.append(wrapper);
            reactiveItems.push({ element: reactive, xRatio, yRatio, active: false });
        }

        if (!supportsHover || reduceMotion) return;
        let pointerX = -1000;
        let pointerY = -1000;
        let pending = false;
        window.addEventListener("pointermove", (event) => {
            pointerX = event.clientX;
            pointerY = event.clientY + window.scrollY;
            if (pending) return;
            pending = true;
            requestAnimationFrame(() => {
                const currentHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight);
                reactiveItems.forEach((item) => {
                    const centerX = item.xRatio * window.innerWidth;
                    const centerY = item.yRatio * currentHeight;
                    const dx = pointerX - centerX;
                    const dy = pointerY - centerY;
                    const distance = Math.hypot(dx, dy);
                    const factor = Math.max(0, 1 - distance / 180);
                    if (factor) {
                        item.element.style.transform = `translate3d(${(-dx * factor * 0.22).toFixed(1)}px, ${(-dy * factor * 0.22).toFixed(1)}px, 0)`;
                        item.active = true;
                    } else if (item.active) {
                        item.element.style.transform = "";
                        item.active = false;
                    }
                });
                pending = false;
            });
        }, { passive: true });
    };

    const initializeRole = () => {
        const role = document.getElementById("dynamic-role");
        const roleContainer = document.querySelector(".dynamic-role-container");
        const roleMeasurer = document.getElementById("role-measurer");
        const roles = site.profile?.roles?.length ? site.profile.roles : fallbackSite.profile.roles;
        if (!role || !roleContainer || !roleMeasurer) return;
        let roleIndex = 0;
        const setRole = () => {
            const nextRole = roles[roleIndex];
            roleMeasurer.textContent = nextRole;
            roleContainer.style.width = `${roleMeasurer.offsetWidth}px`;
            role.textContent = nextRole;
        };
        setRole();
        if (reduceMotion || roles.length < 2) return;
        window.setInterval(() => {
            role.classList.add("swipe-up");
            window.setTimeout(() => {
                roleIndex = (roleIndex + 1) % roles.length;
                setRole();
                role.classList.remove("swipe-up");
            }, 250);
        }, 2800);
    };

    const initializeHeroRipple = () => {
        const frame = document.querySelector(".hero-image");
        const image = document.getElementById("hero-avatar");
        if (!frame || !image || reduceMotion) return;
        const canvas = document.createElement("canvas");
        canvas.className = "hero-ripple-canvas";
        canvas.setAttribute("aria-hidden", "true");
        frame.append(canvas);
        const context = canvas.getContext("2d", { alpha: true });
        if (!context) return;

        let width = 0;
        let height = 0;
        let dpr = 1;
        let x = 0;
        let y = 0;
        let targetX = 0;
        let targetY = 0;
        let strength = 0;
        let targetStrength = 0;
        let animationFrame = 0;

        const resize = () => {
            const rect = frame.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.max(1, Math.round(width * dpr));
            canvas.height = Math.max(1, Math.round(height * dpr));
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            context.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const drawCover = (offsetX, offsetY, scale) => {
            const naturalWidth = image.naturalWidth;
            const naturalHeight = image.naturalHeight;
            if (!naturalWidth || !naturalHeight) return;
            const imageRatio = naturalWidth / naturalHeight;
            const boxRatio = width / height;
            let sourceX = 0;
            let sourceY = 0;
            let sourceWidth = naturalWidth;
            let sourceHeight = naturalHeight;
            if (imageRatio > boxRatio) {
                sourceWidth = naturalHeight * boxRatio;
                sourceX = (naturalWidth - sourceWidth) / 2;
            } else {
                sourceHeight = naturalWidth / boxRatio;
                sourceY = (naturalHeight - sourceHeight) / 2;
            }
            try {
                context.drawImage(
                    image,
                    sourceX,
                    sourceY,
                    sourceWidth,
                    sourceHeight,
                    offsetX - scale / 2,
                    offsetY - scale / 2,
                    width + scale,
                    height + scale
                );
            } catch {
                targetStrength = 0;
            }
        };

        const render = (time) => {
            x += (targetX - x) * 0.22;
            y += (targetY - y) * 0.22;
            strength += (targetStrength - strength) * 0.1;
            context.clearRect(0, 0, width, height);
            if (strength > 0.008) {
                const baseRadius = Math.min(86, Math.max(52, width * 0.25));
                for (let layer = 0; layer < 9; layer += 1) {
                    const radius = baseRadius - layer * (baseRadius / 11);
                    const wave = Math.sin(time * 0.006 - layer * 0.9);
                    const offset = wave * strength * (5.5 - layer * 0.35);
                    context.save();
                    context.beginPath();
                    context.arc(x, y, radius, 0, Math.PI * 2);
                    context.clip();
                    drawCover(offset, -offset * 0.65, strength * (4 + layer * 0.8));
                    context.restore();
                }
                context.save();
                context.beginPath();
                context.arc(x, y, baseRadius * (0.78 + Math.sin(time * 0.005) * 0.03), 0, Math.PI * 2);
                context.strokeStyle = `rgba(255,255,255,${0.08 * strength})`;
                context.lineWidth = 1.2;
                context.stroke();
                context.restore();
            }
            if (strength > 0.008 || targetStrength > 0) {
                animationFrame = requestAnimationFrame(render);
            } else {
                animationFrame = 0;
                frame.classList.remove("is-rippling");
            }
        };

        const wake = () => {
            if (!animationFrame) animationFrame = requestAnimationFrame(render);
        };
        const updatePointer = (event) => {
            const rect = frame.getBoundingClientRect();
            targetX = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
            targetY = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
            if (!strength) {
                x = targetX;
                y = targetY;
            }
            targetStrength = event.pointerType === "touch" ? 0.8 : 1;
            frame.classList.add("is-rippling");
            wake();
        };
        frame.addEventListener("pointermove", updatePointer, { passive: true });
        frame.addEventListener("pointerenter", updatePointer, { passive: true });
        frame.addEventListener("pointerleave", () => {
            targetStrength = 0;
            wake();
        });
        frame.addEventListener("pointerdown", (event) => {
            updatePointer(event);
            strength = 1.35;
            wake();
        }, { passive: true });

        if (image.complete) resize();
        else image.addEventListener("load", resize, { once: true });
        if ("ResizeObserver" in window) new ResizeObserver(resize).observe(frame);
        else window.addEventListener("resize", resize);
    };

    const initializeReveals = () => {
        const reveals = document.querySelectorAll(".reveal");
        if ("IntersectionObserver" in window) {
            const observer = new IntersectionObserver((entries, revealObserver) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            reveals.forEach((element) => observer.observe(element));
        } else {
            reveals.forEach((element) => element.classList.add("visible"));
        }
    };

    const initializeStats = () => {
        const statNumbers = document.querySelectorAll(".stat-number[data-target]");
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
        if (!statNumbers.length) return;
        if ("IntersectionObserver" in window) {
            const observer = new IntersectionObserver((entries, statObserver) => entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateStat(entry.target);
                    statObserver.unobserve(entry.target);
                }
            }), { threshold: 0.4 });
            statNumbers.forEach((stat) => observer.observe(stat));
        } else statNumbers.forEach(animateStat);
    };

    const openCreatorPrompt = () => {
        if (!isCreatorHost) return;
        let dialog = document.getElementById("creator-unlock");
        if (!dialog) {
            dialog = makeElement("dialog", "creator-unlock");
            const form = document.createElement("form");
            form.method = "dialog";
            form.className = "creator-unlock-card";
            const close = makeElement("button", "creator-unlock-close", "×");
            close.type = "button";
            close.setAttribute("aria-label", "Close creator unlock");
            const eyebrow = makeElement("p", "creator-unlock-eyebrow", "LOCAL CREATOR MODE");
            const title = makeElement("h2", "", "Open dashboard");
            const description = makeElement("p", "", "Enter the code stored by this computer.");
            const code = document.createElement("input");
            code.type = "password";
            code.autocomplete = "current-password";
            code.placeholder = "Creator code";
            code.required = true;
            const submit = makeElement("button", "btn", "Unlock");
            submit.type = "submit";
            const status = makeElement("p", "creator-unlock-status", "");
            close.addEventListener("click", () => dialog.close());
            form.addEventListener("submit", async (event) => {
                event.preventDefault();
                submit.disabled = true;
                status.textContent = "Checking locally…";
                try {
                    const response = await fetch("/__creator/api/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "same-origin",
                        body: JSON.stringify({ code: code.value })
                    });
                    const result = await response.json();
                    if (!response.ok) throw new Error(result.error || "Unlock failed.");
                    window.location.assign("/__creator");
                } catch (error) {
                    status.textContent = error.message;
                    submit.disabled = false;
                    code.select();
                }
            });
            form.append(close, eyebrow, title, description, code, submit, status);
            dialog.append(form);
            document.body.append(dialog);
        }
        dialog.showModal();
        dialog.querySelector("input").focus();
    };

    const initializeContextMenu = () => {
        const menu = document.getElementById("custom-context-menu");
        if (!menu) return;
        if (isCreatorHost && !menu.querySelector('[data-action="creator"]')) {
            menu.append(makeElement("div", "context-menu-divider"));
            const creatorItem = makeElement("div", "context-menu-item creator-menu-item", "Creator Dashboard");
            creatorItem.dataset.action = "creator";
            menu.append(creatorItem);
        }
        menu.querySelectorAll(".context-menu-item").forEach((item) => {
            item.tabIndex = 0;
            item.setAttribute("role", "button");
        });
        const hide = () => { menu.style.display = "none"; };
        document.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            menu.style.display = "block";
            const rect = menu.getBoundingClientRect();
            menu.style.left = `${Math.min(event.clientX, window.innerWidth - rect.width - 8)}px`;
            menu.style.top = `${Math.min(event.clientY, window.innerHeight - rect.height - 8)}px`;
        });
        document.addEventListener("pointerdown", (event) => {
            if (!menu.contains(event.target)) hide();
        });
        window.addEventListener("blur", hide);
        menu.addEventListener("click", async (event) => {
            const item = event.target.closest(".context-menu-item");
            if (!item) return;
            const action = item.dataset.action;
            hide();
            if (action === "back") history.back();
            else if (action === "home") window.location.assign("index.html");
            else if (action === "reload") window.location.reload();
            else if (action === "top") window.scrollTo({ top: 0, behavior: "smooth" });
            else if (action === "resume") window.open(safeHref(site.profile?.resume, fallbackSite.profile.resume), "_blank", "noopener");
            else if (action === "copy-email") {
                try {
                    await navigator.clipboard.writeText(email);
                } catch {
                    window.location.href = `mailto:${email}`;
                }
            } else if (action === "creator") openCreatorPrompt();
        });
    };

    applySiteContent();
    renderStats();
    renderProjects();
    initializeProjectPreviews();
    initializeRole();
    initializeHeroRipple();
    initializeReveals();
    initializeStats();
    initializeContextMenu();
    requestAnimationFrame(() => requestAnimationFrame(initializeArtifacts));

    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
        link.rel = "noopener noreferrer";
    });

    const progress = document.getElementById("scrollProgress");
    const backToTop = document.getElementById("backToTop");
    const updateScrollUi = () => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
        if (progress) progress.style.width = `${scrollPercent}%`;
        if (backToTop) backToTop.classList.toggle("visible", window.scrollY > 400);
    };
    window.addEventListener("scroll", updateScrollUi, { passive: true });
    updateScrollUi();

    const visitorCount = document.getElementById("visitor-count");
    if (visitorCount && !isCreatorHost) {
        fetch("https://api.counterapi.dev/v1/harshitranjan/portfolio/up")
            .then((response) => response.ok ? response.json() : Promise.reject())
            .then((data) => { visitorCount.textContent = Number(data.count).toLocaleString(); })
            .catch(() => { visitorCount.textContent = "Available"; });
    } else if (visitorCount) {
        visitorCount.textContent = "Preview";
    }

    const pageOverlay = document.getElementById("pageOverlay");
    if (pageOverlay) requestAnimationFrame(() => pageOverlay.classList.add("loaded"));

    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const submitButton = document.getElementById("cf-submit");
            const status = document.getElementById("cf-status");
            const data = Object.fromEntries(new FormData(contactForm));
            submitButton.disabled = true;
            submitButton.textContent = "Sending…";
            status.textContent = "";
            status.className = "cf-status";
            try {
                const response = await fetch("https://formspree.io/f/mykoqkdj", {
                    method: "POST",
                    headers: { Accept: "application/json", "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });
                if (!response.ok) throw new Error("Form submission failed");
                contactForm.reset();
                status.textContent = "Message sent — I'll reply within 24 hours.";
                status.className = "cf-status success";
            } catch {
                status.replaceChildren(
                    document.createTextNode("Something went wrong. Please "),
                    Object.assign(document.createElement("a"), { href: `mailto:${email}`, textContent: "email me directly" }),
                    document.createTextNode(".")
                );
                status.className = "cf-status error";
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = "Send Message ↗";
            }
        });
    }

    document.querySelectorAll(".social-btn, #resume-link, .project-link-button, .documentation-button").forEach((link) => {
        link.addEventListener("click", () => {
            if (typeof gtag === "function") {
                gtag("event", "portfolio_link_click", {
                    label: link.title || link.textContent.trim(),
                    destination: link.href
                });
            }
        });
    });
});
