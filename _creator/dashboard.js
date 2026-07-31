(() => {
  "use strict";

  const state = {
    csrf: "",
    site: null,
    projects: [],
    media: [],
    gitStatus: "",
  };

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const loginShell = $("#login-shell");
  const dashboard = $("#dashboard");
  const toastElement = $("#toast");
  let toastTimer;

  const toast = (message, isError = false) => {
    clearTimeout(toastTimer);
    toastElement.textContent = message;
    toastElement.classList.toggle("error", isError);
    toastElement.classList.add("visible");
    toastTimer = window.setTimeout(() => toastElement.classList.remove("visible"), 3500);
  };

  const request = async (path, options = {}) => {
    const headers = new Headers(options.headers || {});
    if (state.csrf && options.method && options.method !== "GET") {
      headers.set("X-Creator-CSRF", state.csrf);
    }
    if (options.body && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }
    const response = await fetch(path, { ...options, headers, credentials: "same-origin" });
    let payload;
    try {
      payload = await response.json();
    } catch {
      payload = { ok: false, error: "The local dashboard returned an unreadable response." };
    }
    if (!response.ok) {
      if (response.status === 401 && path !== "/__creator/api/login") showLogin();
      throw new Error(payload.error || "The request failed.");
    }
    return payload;
  };

  const showLogin = () => {
    state.csrf = "";
    dashboard.hidden = true;
    loginShell.hidden = false;
    window.setTimeout(() => $("#creator-code").focus(), 50);
  };

  const showDashboard = () => {
    loginShell.hidden = true;
    dashboard.hidden = false;
  };

  const setTab = (name) => {
    $$(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.tab === name));
    $$(".panel").forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === name));
    if (name === "history") loadBackups();
    if (name === "publish") refreshStatus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const input = (value, attributes = {}) => {
    const element = document.createElement("input");
    element.value = value ?? "";
    Object.entries(attributes).forEach(([key, val]) => {
      if (key === "className") element.className = val;
      else element.setAttribute(key, val);
    });
    return element;
  };

  const labelWrap = (title, control) => {
    const label = document.createElement("label");
    label.append(document.createTextNode(title), control);
    return label;
  };

  const iconButton = (text, label, action, index, danger = false) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `icon-button${danger ? " danger" : ""}`;
    button.textContent = text;
    button.title = label;
    button.setAttribute("aria-label", label);
    button.dataset.action = action;
    if (index !== undefined) button.dataset.index = String(index);
    return button;
  };

  const fillSiteForm = () => {
    const site = state.site;
    if (!site) return;
    $("#site-name").value = site.profile.name;
    $("#site-company").value = site.profile.company;
    $("#site-email").value = site.profile.email;
    $("#site-greeting").value = site.profile.greeting;
    $("#site-summary").value = site.profile.summary;
    $("#site-roles").value = site.profile.roles.join("\n");
    $("#site-avatar").value = site.profile.avatar;
    $("#site-resume").value = site.profile.resume;
    $("#site-badges").value = site.badges.join("\n");
    $("#copy-projects-title").value = site.copy.projectsTitle;
    $("#copy-contact-title").value = site.copy.contactTitle;
    $("#copy-contact-text").value = site.copy.contactText;
    $("#copy-footer-title").value = site.copy.footerTitle;
    $("#bg-desktop").value = site.background.desktopPerViewport;
    $("#bg-tablet").value = site.background.tabletPerViewport;
    $("#bg-mobile").value = site.background.mobilePerViewport;
    $("#bg-maximum").value = site.background.maximum;
    renderSocials();
    renderStats();
  };

  const renderSocials = () => {
    const container = $("#social-editor");
    container.replaceChildren();
    Object.entries(state.site.socials).forEach(([name, href], index) => {
      const row = document.createElement("div");
      row.className = "repeat-row";
      const nameInput = input(name, { "data-social-name": index, "aria-label": "Social network name" });
      const hrefInput = input(href, { "data-social-link": index, "aria-label": "Social network link" });
      row.append(nameInput, hrefInput, iconButton("×", "Remove social link", "remove-social", index, true));
      container.append(row);
    });
  };

  const syncSocialsFromEditor = () => {
    const next = {};
    $$(".repeat-row", $("#social-editor")).forEach((row) => {
      const inputs = $$("input", row);
      const name = inputs[0].value.trim();
      const href = inputs[1].value.trim();
      if (name && href) next[name] = href;
    });
    state.site.socials = next;
  };

  const renderStats = () => {
    const container = $("#stats-editor");
    container.replaceChildren();
    state.site.stats.forEach((stat, index) => {
      const row = document.createElement("div");
      row.className = "repeat-row stat-row";
      const value = input(stat.value, { "aria-label": "Statistic value" });
      const suffix = input(stat.suffix, { "aria-label": "Statistic suffix" });
      const label = input(stat.label, { "aria-label": "Statistic label" });
      [value, suffix, label].forEach((element, fieldIndex) => {
        element.addEventListener("input", () => {
          const keys = ["value", "suffix", "label"];
          state.site.stats[index][keys[fieldIndex]] = element.value;
        });
      });
      const animatedLabel = document.createElement("label");
      animatedLabel.className = "check-label";
      const animated = input("", { type: "checkbox" });
      animated.checked = Boolean(stat.animated);
      animated.addEventListener("change", () => { state.site.stats[index].animated = animated.checked; });
      animatedLabel.append(animated, document.createTextNode("Count"));
      row.append(value, suffix, label, animatedLabel, iconButton("×", "Remove statistic", "remove-stat", index, true));
      container.append(row);
    });
  };

  const collectSiteForm = () => {
    syncSocialsFromEditor();
    return {
      profile: {
        name: $("#site-name").value,
        company: $("#site-company").value,
        email: $("#site-email").value,
        greeting: $("#site-greeting").value,
        summary: $("#site-summary").value,
        roles: $("#site-roles").value.split("\n").map((value) => value.trim()).filter(Boolean),
        avatar: $("#site-avatar").value,
        resume: $("#site-resume").value,
      },
      badges: $("#site-badges").value.split("\n").map((value) => value.trim()).filter(Boolean),
      socials: state.site.socials,
      stats: state.site.stats,
      copy: {
        projectsTitle: $("#copy-projects-title").value,
        contactTitle: $("#copy-contact-title").value,
        contactText: $("#copy-contact-text").value,
        footerTitle: $("#copy-footer-title").value,
      },
      background: {
        desktopPerViewport: Number($("#bg-desktop").value),
        tabletPerViewport: Number($("#bg-tablet").value),
        mobilePerViewport: Number($("#bg-mobile").value),
        maximum: Number($("#bg-maximum").value),
      },
    };
  };

  const projectField = (project, index, field, title, options = {}) => {
    const control = options.textarea ? document.createElement("textarea") : document.createElement("input");
    if (options.textarea) control.rows = options.rows || 3;
    control.value = field === "tags" ? project.tags.join(", ") : project[field] ?? "";
    control.dataset.projectIndex = String(index);
    control.dataset.projectField = field;
    if (options.type) control.type = options.type;
    const wrapper = labelWrap(title, control);
    if (options.full) wrapper.classList.add("full");
    return wrapper;
  };

  const projectCheck = (project, index, field, labelText) => {
    const label = document.createElement("label");
    label.className = "check-label";
    const checkbox = input("", { type: "checkbox", "data-project-index": index, "data-project-field": field });
    checkbox.checked = Boolean(project[field]);
    label.append(checkbox, document.createTextNode(labelText));
    return label;
  };

  const renderProjects = () => {
    const container = $("#project-editor");
    container.replaceChildren();
    state.projects.forEach((project, index) => {
      const card = document.createElement("article");
      card.className = "project-edit-card";
      card.dataset.index = String(index);

      const heading = document.createElement("div");
      heading.className = "project-card-heading";
      const title = document.createElement("h2");
      title.textContent = `${index + 1}. ${project.title || "Untitled project"}`;
      const actions = document.createElement("div");
      actions.className = "project-order-actions";
      actions.append(
        iconButton("↑", "Move project up", "move-up", index),
        iconButton("↓", "Move project down", "move-down", index),
        iconButton("⧉", "Duplicate project", "duplicate", index),
        iconButton("×", "Delete project", "delete-project", index, true),
      );
      heading.append(title, actions);

      const fields = document.createElement("div");
      fields.className = "project-fields";
      fields.append(
        projectField(project, index, "id", "Project ID", { type: "number" }),
        projectField(project, index, "title", "Title"),
        projectField(project, index, "desc", "Description", { textarea: true, full: true }),
        projectField(project, index, "proof", "Evidence"),
        projectField(project, index, "tags", "Tags, separated by commas"),
        projectField(project, index, "thumbnail", "Thumbnail path"),
        projectField(project, index, "video", "Preview video path"),
        projectField(project, index, "link", "External project link", { full: true }),
        projectField(project, index, "documentation", "Documentation link", { full: true }),
      );
      const toggles = document.createElement("div");
      toggles.className = "toggle-row";
      toggles.append(
        projectCheck(project, index, "isHighlight", "Featured on home page"),
        projectCheck(project, index, "isPortrait", "Portrait media"),
        projectCheck(project, index, "published", "Visible publicly"),
      );
      fields.append(toggles);
      card.append(heading, fields);
      container.append(card);
    });
    updateMetrics();
  };

  const syncProjectControl = (control) => {
    const index = Number(control.dataset.projectIndex);
    const field = control.dataset.projectField;
    if (!Number.isInteger(index) || !field || !state.projects[index]) return;
    if (control.type === "checkbox") state.projects[index][field] = control.checked;
    else if (field === "id") state.projects[index][field] = Number(control.value);
    else if (field === "tags") {
      state.projects[index][field] = control.value.split(",").map((value) => value.trim()).filter(Boolean);
    } else state.projects[index][field] = control.value;
    if (field === "title") {
      const heading = control.closest(".project-edit-card").querySelector("h2");
      heading.textContent = `${index + 1}. ${control.value || "Untitled project"}`;
    }
  };

  const updateMetrics = () => {
    $("#project-count").textContent = String(state.projects.filter((project) => project.published).length);
    $("#featured-count").textContent = String(state.projects.filter((project) => project.published && project.isHighlight).length);
    $("#media-count").textContent = String(state.media.length);
  };

  const formatBytes = (size) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  };

  const renderMedia = () => {
    const container = $("#media-library");
    container.replaceChildren();
    if (!state.media.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "No dashboard uploads yet. Existing portfolio assets remain available through their current paths.";
      container.append(empty);
      return;
    }
    state.media.forEach((media) => {
      const card = document.createElement("article");
      card.className = "media-card";
      const preview = document.createElement("div");
      preview.className = "media-preview";
      if (media.kind === "images") {
        const image = document.createElement("img");
        image.src = `/${media.path}`;
        image.alt = "";
        image.loading = "lazy";
        preview.append(image);
      } else if (media.kind === "videos") {
        const video = document.createElement("video");
        video.src = `/${media.path}`;
        video.muted = true;
        video.controls = true;
        video.preload = "metadata";
        preview.append(video);
      } else {
        const icon = document.createElement("span");
        icon.className = "document-icon";
        icon.textContent = "PDF";
        preview.append(icon);
      }
      const body = document.createElement("div");
      body.className = "media-card-body";
      const heading = document.createElement("div");
      heading.className = "media-card-heading";
      const name = document.createElement("strong");
      name.textContent = media.name;
      const copy = document.createElement("button");
      copy.type = "button";
      copy.className = "small-button";
      copy.textContent = "Copy path";
      copy.addEventListener("click", async () => {
        await navigator.clipboard.writeText(media.path);
        toast("Media path copied.");
      });
      heading.append(name, copy);
      const path = document.createElement("code");
      path.className = "media-path";
      path.textContent = media.path;
      const size = document.createElement("small");
      size.className = "muted";
      size.textContent = formatBytes(media.size);
      body.append(heading, path, size);
      card.append(preview, body);
      container.append(card);
    });
    updateMetrics();
  };

  const renderGitStatus = () => {
    const text = state.gitStatus || "No unpublished content changes.";
    $("#overview-git-status").textContent = text;
    $("#publish-git-status").textContent = text;
  };

  const refreshStatus = async () => {
    try {
      const payload = await request("/__creator/api/content");
      state.gitStatus = payload.gitStatus;
      state.media = payload.media;
      renderGitStatus();
      renderMedia();
    } catch (error) {
      toast(error.message, true);
    }
  };

  const loadBackups = async () => {
    const container = $("#backup-list");
    container.textContent = "Loading backups…";
    try {
      const payload = await request("/__creator/api/backups");
      container.replaceChildren();
      if (!payload.backups.length) {
        const empty = document.createElement("p");
        empty.className = "muted";
        empty.textContent = "No backups yet. Your first save will create one.";
        container.append(empty);
        return;
      }
      payload.backups.forEach((backup) => {
        const row = document.createElement("article");
        row.className = "backup-item";
        const info = document.createElement("div");
        const name = document.createElement("strong");
        name.textContent = backup.name;
        const detail = document.createElement("small");
        detail.textContent = `${new Date(backup.modified).toLocaleString()} · ${formatBytes(backup.size)}`;
        info.append(name, document.createElement("br"), detail);
        const restore = document.createElement("button");
        restore.className = "small-button";
        restore.type = "button";
        restore.textContent = "Restore";
        restore.addEventListener("click", async () => {
          if (!window.confirm(`Restore ${backup.name}? The current data will be backed up first.`)) return;
          try {
            const result = await request("/__creator/api/restore", {
              method: "POST",
              body: JSON.stringify({ name: backup.name }),
            });
            toast(result.message);
            await loadContent();
            await loadBackups();
          } catch (error) {
            toast(error.message, true);
          }
        });
        row.append(info, restore);
        container.append(row);
      });
    } catch (error) {
      container.textContent = error.message;
    }
  };

  const loadContent = async () => {
    const payload = await request("/__creator/api/content");
    state.site = payload.site;
    state.projects = payload.projects;
    state.media = payload.media;
    state.gitStatus = payload.gitStatus;
    fillSiteForm();
    renderProjects();
    renderMedia();
    renderGitStatus();
    updateMetrics();
  };

  $("#login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = $("#login-message");
    message.textContent = "Checking locally…";
    try {
      const payload = await request("/__creator/api/login", {
        method: "POST",
        body: JSON.stringify({ code: $("#creator-code").value }),
      });
      state.csrf = payload.csrf;
      $("#creator-code").value = "";
      showDashboard();
      await loadContent();
      message.textContent = "";
    } catch (error) {
      message.textContent = error.message;
    }
  });

  $("#logout-button").addEventListener("click", async () => {
    try {
      await request("/__creator/api/logout", { method: "POST", body: JSON.stringify({}) });
    } finally {
      showLogin();
    }
  });

  $$(".nav-item").forEach((button) => button.addEventListener("click", () => setTab(button.dataset.tab)));

  $("#add-social").addEventListener("click", () => {
    syncSocialsFromEditor();
    state.site.socials[`Link ${Object.keys(state.site.socials).length + 1}`] = "https://";
    renderSocials();
  });

  $("#social-editor").addEventListener("click", (event) => {
    const button = event.target.closest("[data-action='remove-social']");
    if (!button) return;
    const rows = $$(".repeat-row", $("#social-editor"));
    rows[Number(button.dataset.index)]?.remove();
    syncSocialsFromEditor();
  });

  $("#add-stat").addEventListener("click", () => {
    state.site.stats.push({ value: "1", suffix: "+", label: "New statistic", animated: true });
    renderStats();
  });

  $("#stats-editor").addEventListener("click", (event) => {
    const button = event.target.closest("[data-action='remove-stat']");
    if (!button) return;
    state.site.stats.splice(Number(button.dataset.index), 1);
    renderStats();
  });

  $("#save-site").addEventListener("click", async () => {
    try {
      state.site = collectSiteForm();
      const result = await request("/__creator/api/site", {
        method: "PUT",
        body: JSON.stringify(state.site),
      });
      toast(result.message);
      await refreshStatus();
    } catch (error) {
      toast(error.message, true);
    }
  });

  $("#project-editor").addEventListener("input", (event) => {
    if (event.target.matches("[data-project-field]")) syncProjectControl(event.target);
  });
  $("#project-editor").addEventListener("change", (event) => {
    if (event.target.matches("[data-project-field]")) syncProjectControl(event.target);
  });

  $("#project-editor").addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const index = Number(button.dataset.index);
    const action = button.dataset.action;
    if (action === "move-up" && index > 0) {
      [state.projects[index - 1], state.projects[index]] = [state.projects[index], state.projects[index - 1]];
    } else if (action === "move-down" && index < state.projects.length - 1) {
      [state.projects[index + 1], state.projects[index]] = [state.projects[index], state.projects[index + 1]];
    } else if (action === "duplicate") {
      const clone = structuredClone(state.projects[index]);
      clone.id = Math.max(0, ...state.projects.map((project) => Number(project.id) || 0)) + 1;
      clone.title = `${clone.title} Copy`;
      state.projects.splice(index + 1, 0, clone);
    } else if (action === "delete-project") {
      if (!window.confirm(`Remove “${state.projects[index].title}” from the local project list?`)) return;
      state.projects.splice(index, 1);
    } else return;
    renderProjects();
  });

  $("#add-project").addEventListener("click", () => {
    const nextId = Math.max(0, ...state.projects.map((project) => Number(project.id) || 0)) + 1;
    state.projects.push({
      id: nextId,
      title: "New Project",
      desc: "Describe what makes this project interesting.",
      proof: "Add evidence or availability",
      tags: ["Unity"],
      thumbnail: "assets/images/game_cover.png",
      video: "assets/videos/game1.mp4",
      link: "https://",
      documentation: `docs.html?id=${nextId}`,
      isHighlight: false,
      isPortrait: false,
      published: false,
    });
    renderProjects();
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  });

  $("#save-projects").addEventListener("click", async () => {
    try {
      const result = await request("/__creator/api/projects", {
        method: "PUT",
        body: JSON.stringify(state.projects),
      });
      toast(result.message);
      await refreshStatus();
    } catch (error) {
      toast(error.message, true);
    }
  });

  $("#upload-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const file = $("#upload-file").files[0];
    if (!file) return;
    const form = new FormData();
    form.append("kind", $("#upload-kind").value);
    form.append("file", file, file.name);
    try {
      const result = await request("/__creator/api/upload", { method: "POST", body: form });
      toast(`${result.message} Path: ${result.media.path}`);
      $("#upload-form").reset();
      try {
        await navigator.clipboard.writeText(result.media.path);
      } catch {
        // Upload succeeded; clipboard permission is optional.
      }
      await refreshStatus();
    } catch (error) {
      toast(error.message, true);
    }
  });

  $("#refresh-backups").addEventListener("click", loadBackups);

  $("#publish-button").addEventListener("click", async () => {
    if (!window.confirm("Publish the current saved content and media to GitHub now?")) return;
    const button = $("#publish-button");
    const resultText = $("#publish-result");
    button.disabled = true;
    button.textContent = "Publishing…";
    resultText.textContent = "Creating and uploading the update…";
    try {
      const result = await request("/__creator/api/publish", {
        method: "POST",
        body: JSON.stringify({ message: $("#publish-message").value }),
      });
      resultText.textContent = result.message;
      toast(result.message);
      await refreshStatus();
    } catch (error) {
      resultText.textContent = error.message;
      toast(error.message, true);
    } finally {
      button.disabled = false;
      button.textContent = "Publish now";
    }
  });

  $("#change-code-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const resultText = $("#security-result");
    const newCode = $("#new-code").value;
    if (newCode !== $("#confirm-code").value) {
      resultText.textContent = "The new codes do not match.";
      return;
    }
    try {
      const result = await request("/__creator/api/change-code", {
        method: "POST",
        body: JSON.stringify({ current: $("#current-code").value, new: newCode }),
      });
      resultText.textContent = result.message;
      window.setTimeout(showLogin, 900);
    } catch (error) {
      resultText.textContent = error.message;
    }
  });

  const initialize = async () => {
    try {
      const session = await request("/__creator/api/session");
      if (!session.authenticated) {
        showLogin();
        return;
      }
      state.csrf = session.csrf;
      showDashboard();
      await loadContent();
    } catch (error) {
      showLogin();
      $("#login-message").textContent = error.message;
    }
  };

  initialize();
})();
