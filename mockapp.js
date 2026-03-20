const THEME = window.COGNIGY_MOCK_THEME || {};

const STORAGE_KEY = "cognigyMockBrandSettings.v1";

const DEFAULT_THEME = {
  appName: "Policy Hub",
  productSubtitle: "Insurance dashboard",
  displayName: "David",
  lang: "en",
  insuranceType: "kranken",
  aiAgentName: "Ally",

  brandPrimary: "#0A84FF",
  brandPrimaryDark: "#065EC0",
  brandAccent: "#22C55E",

  brandBg: "#F6F8FC",
  brandSurface: "#FFFFFF",
  brandText: "#0B1220",
  brandMuted: "#5B667A",
  brandBorder: "rgba(15, 23, 42, 0.12)",

  successBg: "rgba(34, 197, 94, 0.10)",
  successText: "#15803D",
  warningBg: "rgba(245, 158, 11, 0.12)",
  warningText: "#B45309",

  logoSrc: "",
  agentAvatarUrl: "",
  showIphoneFrame: false,
  // Optional WebRTC Click-to-Call config (can be provided via customer theme JSON)
  webrtcEndpointUrl: "",
  webrtcUserId: "",
};

function safeJsonParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function loadSavedTheme() {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const parsed = safeJsonParse(raw);
  return parsed && typeof parsed === "object" ? parsed : null;
}

function saveTheme(next) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage issues in demo environments.
  }
}

function hexToRgb(hex) {
  const m = String(hex).trim().match(/^#?([a-f0-9]{6})$/i);
  if (!m) return null;
  const int = parseInt(m[1], 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function rgbToHex({ r, g, b }) {
  const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((n) => n.toString(16).padStart(2, "0"))
      .join("")
  );
}

function darkenHex(hex, amount = 0.18) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex({
    r: rgb.r * (1 - amount),
    g: rgb.g * (1 - amount),
    b: rgb.b * (1 - amount),
  });
}

function normalizeTheme(t) {
  const next = { ...DEFAULT_THEME, ...t };
  if (!next.brandPrimaryDark && next.brandPrimary) next.brandPrimaryDark = darkenHex(next.brandPrimary, 0.18);
  if (!next.agentAvatarUrl) next.agentAvatarUrl = "";
  if (!next.logoSrc) next.logoSrc = "";
  if (typeof next.showIphoneFrame !== "boolean") next.showIphoneFrame = false;
  if (!next.webrtcEndpointUrl) next.webrtcEndpointUrl = "";
  if (!next.webrtcUserId) next.webrtcUserId = "";
  if (!next.displayName) next.displayName = DEFAULT_THEME.displayName;
  if (!next.lang) next.lang = DEFAULT_THEME.lang;
  if (!next.insuranceType) next.insuranceType = DEFAULT_THEME.insuranceType;
  if (!next.aiAgentName) next.aiAgentName = DEFAULT_THEME.aiAgentName;
  return next;
}

function applyTheme(theme) {
  const map = {
    brandPrimary: "--brand-primary",
    brandPrimaryDark: "--brand-primary-dark",
    brandAccent: "--brand-accent",
    brandBg: "--brand-bg",
    brandSurface: "--brand-surface",
    brandText: "--brand-text",
    brandMuted: "--brand-muted",
    brandBorder: "--brand-border",
    successBg: "--success-bg",
    successText: "--success-text",
    warningBg: "--warning-bg",
    warningText: "--warning-text",
  };

  for (const [key, cssVar] of Object.entries(map)) {
    if (theme[key]) document.documentElement.style.setProperty(cssVar, theme[key]);
  }
}

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "className") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("data-")) node.setAttribute(k, v);
    else if (k === "style") Object.assign(node.style, v);
    else node.setAttribute(k, v);
  }
  for (const child of children) node.appendChild(child);
  return node;
}

function svgIcon(name) {
  const common = { fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" };
  switch (name) {
    case "shield":
      return el(
        "svg",
        common,
        [
          el("path", { d: "M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4z", stroke: "currentColor", fill: "none" }),
          el("path", { d: "M9 12l2 2 4-5", stroke: "currentColor", fill: "none" }),
        ],
      );
    default:
      return el("svg", common, [el("circle", { cx: "12", cy: "12", r: "9" })]);
  }
}

function render() {
  let state = normalizeTheme({ ...THEME, ...(loadSavedTheme() || {}) });
  applyTheme(state);

  function getContentModel(lang, insuranceType) {
    const l = lang === "de" ? "de" : "en";
    const t = insuranceType === "lebens" ? "lebens" : insuranceType === "sach" ? "sach" : "kranken";

    const models = {
      en: {
        kranken: {
          heroKicker: "Welcome back",
          heroTag: "Active policy • All set",
          heroMeta: "Last updated moments ago",
          galleryTitle: "Quick options",
          galleryItems: [
            { title: "File a claim", sub: "Start in minutes" },
            { title: "View coverage", sub: "Know your limits" },
            { title: "Documents", sub: "Receipts & forms" },
            { title: "Talk to Ally", sub: "Voice assistant", action: "ai" },
          ],
          insurancesTitle: "My insurances",
          insurancesRows: [
            { name: "Health Plan", status: "Active", pct: "62%" },
            { name: "Auto Insurance", status: "Renewal due", pct: "34%" },
            { name: "Home Coverage", status: "Active", pct: "71%" },
          ],
          dashboardTitle: "Dashboard",
          dashboardMetrics: [
            { label: "Claims", value: "1 pending" },
            { label: "Payments", value: "$3200 due" },
            { label: "Support", value: "24h response" },
          ],
          dashboardFoot: "Ask Ally for next steps, status, and documents.",
          ai: {
            title: "Hello, I’m Ally",
            sub: "How can I assist you today?",
            chat: "Chat with Ally",
            speak: "Speak to Ally",
            ready: "Ready to call",
          },
        },
        lebens: {
          heroKicker: "Welcome back",
          heroTag: "Protection active • Flexible",
          heroMeta: "Last updated moments ago",
          galleryTitle: "Quick options",
          galleryItems: [
            { title: "Plan an payout", sub: "In a few steps" },
            { title: "Review contracts", sub: "Your full overview" },
            { title: "Documents", sub: "Policy & proof" },
            { title: "Talk to Ally", sub: "Questions & support", action: "ai" },
          ],
          insurancesTitle: "My insurances",
          insurancesRows: [
            { name: "LifeCare Plus", status: "Active", pct: "58%" },
            { name: "Retirement Builder", status: "Decision open", pct: "26%" },
            { name: "Savings Plan", status: "Active", pct: "72%" },
          ],
          dashboardTitle: "Dashboard",
          dashboardMetrics: [
            { label: "Account", value: "$12,400 growing" },
            { label: "Payout options", value: "2 available" },
            { label: "Support", value: "24h response" },
          ],
          dashboardFoot: "Ask Ally about payouts, documents, and next steps.",
          ai: {
            title: "Hello, I’m Ally",
            sub: "Let’s manage your life insurance together.",
            chat: "Chat with Ally",
            speak: "Speak to Ally",
            ready: "Ready to call",
          },
        },
        sach: {
          heroKicker: "Welcome back",
          heroTag: "Protection active • Home & more",
          heroMeta: "Last updated moments ago",
          galleryTitle: "Quick options",
          galleryItems: [
            { title: "Report a damage", sub: "Upload a photo" },
            { title: "Check coverage", sub: "Your insured sum" },
            { title: "Documents", sub: "Receipts & proof" },
            { title: "Talk to Ally", sub: "Fast damage help", action: "ai" },
          ],
          insurancesTitle: "My insurances",
          insurancesRows: [
            { name: "Home & Apartment", status: "Active", pct: "66%" },
            { name: "Auto Protection", status: "Renewal due", pct: "38%" },
            { name: "Household Contents", status: "Active", pct: "71%" },
          ],
          dashboardTitle: "Dashboard",
          dashboardMetrics: [
            { label: "Claims", value: "2 in review" },
            { label: "Payments", value: "$1120 due" },
            { label: "Support", value: "Immediate help" },
          ],
          dashboardFoot: "Ask Ally for claim status and next steps.",
          ai: {
            title: "Hello, I’m Ally",
            sub: "Tell me what happened and I’ll guide you.",
            chat: "Chat with Ally",
            speak: "Speak to Ally",
            ready: "Ready to call",
          },
        },
      },
      de: {
        kranken: {
          heroKicker: "Willkommen zurück",
          heroTag: "Aktive Police • Alles bereit",
          heroMeta: "Zuletzt aktualisiert vor wenigen Momenten",
          galleryTitle: "Schnelle Optionen",
          galleryItems: [
            { title: "Schaden melden", sub: "Start in Minuten" },
            { title: "Leistungen ansehen", sub: "Ihre Grenzen kennen" },
            { title: "Dokumente", sub: "Nachweise & Formulare" },
            { title: "Mit Ally sprechen", sub: "Sprachassistent", action: "ai" },
          ],
          insurancesTitle: "Meine Versicherungen",
          insurancesRows: [
            { name: "Health Plan", status: "Aktiv", pct: "62%" },
            { name: "Auto Versicherung", status: "Erneuerung fällig", pct: "34%" },
            { name: "Haushalts-Schutz", status: "Aktiv", pct: "71%" },
          ],
          dashboardTitle: "Übersicht",
          dashboardMetrics: [
            { label: "Anträge", value: "1 offen" },
            { label: "Beiträge", value: "3.200 € fällig" },
            { label: "Support", value: "Antwort in 24h" },
          ],
          dashboardFoot: "Fragen Sie Ally nach nächsten Schritten, Status und Dokumenten.",
          ai: {
            title: "Hallo, ich bin Ally",
            sub: "Wie kann ich dir heute helfen?",
            chat: "Chat mit Ally",
            speak: "Mit Ally sprechen",
            ready: "Bereit zum Anrufen",
          },
        },
        lebens: {
          heroKicker: "Willkommen zurück",
          heroTag: "Schutz aktiv • Flexibel",
          heroMeta: "Zuletzt aktualisiert vor wenigen Momenten",
          galleryTitle: "Schnelle Optionen",
          galleryItems: [
            { title: "Auszahlung planen", sub: "In wenigen Schritten" },
            { title: "Verträge prüfen", sub: "Ihre Übersicht" },
            { title: "Dokumente", sub: "Police & Nachweise" },
            { title: "Mit Ally sprechen", sub: "Fragen & Support", action: "ai" },
          ],
          insurancesTitle: "Meine Versicherungen",
          insurancesRows: [
            { name: "LifeCare Plus", status: "Aktiv", pct: "58%" },
            { name: "Rentenbaustein", status: "Entscheidung offen", pct: "26%" },
            { name: "Sparplan", status: "Aktiv", pct: "72%" },
          ],
          dashboardTitle: "Übersicht",
          dashboardMetrics: [
            { label: "Konto", value: "12.400 € wächst" },
            { label: "Auszahlungsoptionen", value: "2 verfügbar" },
            { label: "Support", value: "Antwort in 24h" },
          ],
          dashboardFoot: "Fragen Sie Ally nach Auszahlungen, Dokumenten und nächsten Schritten.",
          ai: {
            title: "Hallo, ich bin Ally",
            sub: "Lass uns deine Lebensversicherung gemeinsam verwalten.",
            chat: "Chat mit Ally",
            speak: "Mit Ally sprechen",
            ready: "Bereit zum Anrufen",
          },
        },
        sach: {
          heroKicker: "Willkommen zurück",
          heroTag: "Schutz aktiv • Zuhause & mehr",
          heroMeta: "Zuletzt aktualisiert vor wenigen Momenten",
          galleryTitle: "Schnelle Optionen",
          galleryItems: [
            { title: "Schaden melden", sub: "Foto hochladen" },
            { title: "Schutz prüfen", sub: "Ihre Versicherungssumme" },
            { title: "Dokumente", sub: "Nachweise & Belege" },
            { title: "Mit Ally sprechen", sub: "Schnelle Schadenhilfe", action: "ai" },
          ],
          insurancesTitle: "Meine Versicherungen",
          insurancesRows: [
            { name: "Haus & Wohnung", status: "Aktiv", pct: "66%" },
            { name: "Auto-Schutz", status: "Erneuerung fällig", pct: "38%" },
            { name: "Hausrat", status: "Aktiv", pct: "71%" },
          ],
          dashboardTitle: "Übersicht",
          dashboardMetrics: [
            { label: "Anträge", value: "2 in Prüfung" },
            { label: "Beiträge", value: "1.120 € fällig" },
            { label: "Support", value: "Soforthilfe" },
          ],
          dashboardFoot: "Fragen Sie Ally nach Status und nächsten Schritten.",
          ai: {
            title: "Hallo, ich bin Ally",
            sub: "Sag mir kurz, was passiert ist – ich leite dich.",
            chat: "Chat mit Ally",
            speak: "Mit Ally sprechen",
            ready: "Bereit zum Anrufen",
          },
        },
      },
    };

    return models[l][t];
  }

  const initialModel = getContentModel(state.lang, state.insuranceType);

  function agentNamePersonalize(text) {
    const name = state.aiAgentName || DEFAULT_THEME.aiAgentName || "Ally";
    return String(text || "").replace(/Ally/gi, name);
  }

  const root = document.getElementById("root");
  if (!root) throw new Error("Missing #root element");
  root.innerHTML = "";

  const app = el("div", { className: "app" });

  const topbar = el("header", { className: "topbar" }, []);
  const topbarInner = el("div", { className: "topbar-inner" });

  const brand = el("div", { className: "brand" });
  const brandTitle = el("div", { className: "brand-title" });
  const brandLogoPlaceholder = el("div", { className: "brand-logo-placeholder", text: "LOGO" });
  brandTitle.appendChild(brandLogoPlaceholder);

  // Optional logo image: user can swap via THEME.logoSrc
  const logoWrap = el("div", { style: { marginLeft: "auto" } });
  const logoImg = el("img", {
    className: "brand-logo-img",
    alt: "Brand logo",
    src: state.logoSrc || "",
  });
  logoWrap.appendChild(logoImg);
  const hasLogoInitially = !!(state.logoSrc && String(state.logoSrc).trim());
  brandLogoPlaceholder.style.display = hasLogoInitially ? "none" : "block";
  logoImg.style.display = hasLogoInitially ? "block" : "none";

  brand.appendChild(brandTitle);
  brand.appendChild(logoWrap);

  const spacer = el("div", { className: "topbar-spacer" });
  const topActions = el("div", { className: "top-actions" });

  const settingsBtn = el("button", { className: "icon-btn", type: "button", "aria-label": "Settings" });
  settingsBtn.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 21V14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M4 10V3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M12 21V12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M12 8V3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M20 21V16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M20 12V3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M2 14H6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M10 12H14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M18 16H22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  `;

  const phoneFrameBtn = el("button", { className: "icon-btn", type: "button", "aria-label": "Toggle phone frame" });
  phoneFrameBtn.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="8" y="2.5" width="8" height="19" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect>
      <path d="M10 19h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
    </svg>
  `;

  topActions.appendChild(settingsBtn);
  topActions.appendChild(phoneFrameBtn);

  topbarInner.appendChild(brand);
  topbarInner.appendChild(spacer);
  topbarInner.appendChild(topActions);
  topbar.appendChild(topbarInner);
  app.appendChild(topbar);

  // Mobile-first greeting header
  const mobileGreeting = el("div", { className: "mobile-greeting" });
  const greetTitle = el("div", { className: "greet-title", text: agentNamePersonalize(initialModel.heroKicker) });
  const greetName = el("div", { className: "greet-name", text: state.displayName || "Customer" });
  mobileGreeting.appendChild(greetTitle);
  mobileGreeting.appendChild(greetName);
  app.appendChild(mobileGreeting);

  const layout = el("main", { className: "layout" });

  // Side nav
  const sideNav = el("aside", { className: "side-nav" });
  sideNav.appendChild(el("div", { className: "nav-title", text: "Quick access" }));

  const navItems = [
    { label: "Policies", icon: "shield" },
    { label: "Claims", icon: "shield" },
    { label: "Payments", icon: "shield" },
    { label: "Documents", icon: "shield" },
    { label: "Support", icon: "shield" },
  ];

  navItems.forEach((it, idx) => {
    const btn = el("button", { className: `nav-item${idx === 0 ? " is-active" : ""}`, type: "button" });
    btn.appendChild(svgIcon("shield"));
    btn.appendChild(el("span", { text: it.label }));
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach((x) => x.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
    sideNav.appendChild(btn);
  });

  layout.appendChild(sideNav);

  // Content area
  const content = el("section", { className: "content" });

  function syncMainContent() {
    content.innerHTML = "";
    const model = getContentModel(state.lang, state.insuranceType);

    // Hero section
    const heroCard = el("section", { className: "card hero hero-section" });
    const heroTitle = el("div", { className: "hero-title" });
    heroTitle.appendChild(el("div", { className: "hero-kicker", text: agentNamePersonalize(model.heroKicker) }));
    heroTitle.appendChild(el("div", { className: "hero-h1", text: state.displayName || "Customer" }));
    heroCard.appendChild(heroTitle);

    const heroMetaRow = el("div", { className: "hero-meta-row" });
    const heroTag = el("div", { className: "tag" });
    heroTag.appendChild(el("div", { className: "tag-dot" }));
    heroTag.appendChild(el("span", { text: model.heroTag }));
    heroMetaRow.appendChild(heroTag);
    heroMetaRow.appendChild(el("div", { className: "hero-meta", text: model.heroMeta }));
    heroCard.appendChild(heroMetaRow);
    content.appendChild(heroCard);

    // Gallery sliders
    const gallery = el("section", { className: "card gallery-card" });
    gallery.appendChild(el("div", { className: "section-head", text: model.galleryTitle }));
    const galleryTrack = el("div", { className: "gallery-track" });

    model.galleryItems.forEach((it) => {
      const c = el("button", { type: "button", className: "gallery-item" });
      const icon = el("div", { className: "gallery-icon" });
      icon.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `;
      c.appendChild(icon);
      c.appendChild(el("div", { className: "gallery-txt" }));
      c.querySelector(".gallery-txt").appendChild(
        el("div", { className: "gallery-title", text: agentNamePersonalize(it.title) })
      );
      c.querySelector(".gallery-txt").appendChild(el("div", { className: "gallery-sub", text: agentNamePersonalize(it.sub) }));
      if (it.action === "ai") c.addEventListener("click", () => openAIPopup());
      galleryTrack.appendChild(c);
    });

    gallery.appendChild(galleryTrack);
    content.appendChild(gallery);

    // Brand ad box (fully in customer's primary color)
    const getAdCopy = (lang, insuranceType) => {
      const name = state.aiAgentName || DEFAULT_THEME.aiAgentName || "Ally";
      if (lang === "de") {
        switch (insuranceType) {
          case "lebens":
            return { headline: "Lebensvorteil-Update", body: "Erhalte schnelle Hilfe zu Leistungen und nächsten Schritten.", cta: `Mit ${name} sprechen` };
          case "sach":
            return { headline: "Schutz für Zuhause", body: "Checke Optionen für deinen Haushalt und Hol dir Empfehlungen.", cta: `Mit ${name} sprechen` };
          case "kranken":
          default:
            return { headline: "Kostenloser Gesundheits-Check", body: "Frag unseren Assistenten und wir leiten dich schnell weiter.", cta: `Mit ${name} sprechen` };
        }
      }
      switch (insuranceType) {
        case "lebens":
          return { headline: "Life benefit update", body: "Get quick help on benefits and next steps.", cta: `Chat with ${name}` };
        case "sach":
          return { headline: "Home protection upgrade", body: "Check options for your household and get recommendations.", cta: `Chat with ${name}` };
        case "kranken":
        default:
          return { headline: "Special health offer", body: "Ask your assistant and get help with your next step.", cta: `Chat with ${name}` };
      }
    };

    const adCopy = getAdCopy(state.lang, state.insuranceType);
    const ad = el("section", { className: "brand-ad", "aria-label": "Promotion" });
    ad.appendChild(el("div", { className: "brand-ad-head", text: adCopy.headline }));
    ad.appendChild(el("div", { className: "brand-ad-body", text: adCopy.body }));
    const adBtn = el("button", { className: "brand-ad-cta", type: "button", text: adCopy.cta });
    adBtn.addEventListener("click", () => openAIPopup());
    ad.appendChild(adBtn);
    content.appendChild(ad);

    // Insurances section
    const insCard = el("section", { className: "card insurances" });
    insCard.appendChild(el("div", { className: "section-head", text: model.insurancesTitle }));

    const insList = el("div", { className: "ins-list" });
    const mkInsRow = (row) => {
      const r = el("div", { className: "ins-row" });
      const avatar = el("div", { className: "ins-ico" });
      avatar.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
      r.appendChild(avatar);
      const txt = el("div", { className: "ins-txt" });
      txt.appendChild(el("div", { className: "ins-name", text: row.name }));
      txt.appendChild(el("div", { className: "ins-status", text: row.status }));
      r.appendChild(txt);
      const prog = el("div", { className: "ins-prog" });
      prog.appendChild(el("div", { className: "ins-bar" }));
      prog.querySelector(".ins-bar").style.width = row.pct;
      r.appendChild(prog);
      return r;
    };

    model.insurancesRows.forEach((row) => insList.appendChild(mkInsRow(row)));
    insCard.appendChild(insList);
    content.appendChild(insCard);

    // Small dashboard section
    const dash = el("section", { className: "card dashboard" });
    dash.appendChild(el("div", { className: "section-head", text: model.dashboardTitle }));
    const dashGrid = el("div", { className: "dash-grid" });
    const mkMetric = (metric) => {
      const m = el("div", { className: "dash-metric" });
      m.appendChild(el("div", { className: "dash-value", text: metric.value }));
      m.appendChild(el("div", { className: "dash-label", text: metric.label }));
      return m;
    };
    model.dashboardMetrics.forEach((metric) => dashGrid.appendChild(mkMetric(metric)));
    dash.appendChild(dashGrid);
    dash.appendChild(el("div", { className: "dash-foot", text: agentNamePersonalize(model.dashboardFoot) }));
    content.appendChild(dash);
  }

  syncMainContent();

  layout.appendChild(content);

  // Cognigy assistant panel (mock)
  const assistant = el("aside", { className: "assistant" });

  const header = el("div", { className: "assistant-header" });
  const assistantBrand = el("div", { className: "assistant-brand" });
  const assistantLogo = el("div", { className: "assistant-logo" });
  assistantLogo.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M12 3c4.9 0 9 3.1 9 7s-4.1 7-9 7-9-3.1-9-7 4.1-7 9-7Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M10 10h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path>
      <path d="M14 10h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path>
      <path d="M9.5 15c1.8 1.2 3.2 1.2 5 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
    </svg>
  `;
  assistantBrand.appendChild(assistantLogo);
  assistantBrand.appendChild(el("div", { html: `<strong>Cognigy Assistant</strong><span>In-app support</span>` }));

  const toolbar = el("div", { className: "assistant-toolbar" });
  const restartBtn = el("button", { type: "button", "aria-label": "Restart chat" });
  restartBtn.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M21 12a9 9 0 1 1-3-6.7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M21 3v6h-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  `;
  const minimizeBtn = el("button", { type: "button", "aria-label": "Minimize (mock)" });
  minimizeBtn.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M8 10h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
      <path d="M5 4h14v16H5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  `;
  toolbar.appendChild(restartBtn);
  toolbar.appendChild(minimizeBtn);
  header.appendChild(assistantBrand);
  header.appendChild(toolbar);
  assistant.appendChild(header);

  const bodyPanel = el("div", { className: "assistant-body", id: "assistantBody" });

  const widgetContainer = el("div", { id: "cognigyWebRTCWidget", className: "webrtc-widget" });
  const chatContainer = el("div", { id: "cognigyChatContainer" });
  bodyPanel.appendChild(widgetContainer);
  bodyPanel.appendChild(chatContainer);

  assistant.appendChild(bodyPanel);

  const footer = el("div", { className: "assistant-footer" });
  const inputWrap = el("div", { className: "input-wrap" });
  const input = el("input", { type: "text", placeholder: "Ask about your policy or claim..." });
  inputWrap.appendChild(input);

  const send = el("button", { className: "send", type: "button", disabled: "true" });
  send.textContent = "Send";
  footer.appendChild(inputWrap);
  footer.appendChild(send);
  assistant.appendChild(footer);

  layout.appendChild(assistant);
  app.appendChild(layout);

  // When enabled, constrain the app into a "phone" format container.
  // (We no longer render the PNG outline; the button still toggles phone mode.)
  if (state.showIphoneFrame) app.classList.add("is-phone-frame");

  phoneFrameBtn.addEventListener("click", () => {
    state.showIphoneFrame = !state.showIphoneFrame;
    app.classList.toggle("is-phone-frame", state.showIphoneFrame);
    saveTheme(state);
  });

  // Bottom homebar with center AI button
  const homebar = el("nav", { className: "homebar", role: "navigation", "aria-label": "Home navigation" });

  const homeLeftBtn = el("button", { className: "homebar-ico", type: "button", "aria-label": "Home" });
  homeLeftBtn.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  const homeRightBtn = el("button", { className: "homebar-ico", type: "button", "aria-label": "Settings" });
  homeRightBtn.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 21V14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M4 10V3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M12 21V12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M12 8V3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M20 21V16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M20 12V3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M2 14H6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M10 12H14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M18 16H22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  `;

  const aiCallBtn = el("button", { className: "homebar-ai-btn", type: "button", "aria-label": "Open AI agent" });
  const homebarAvatar = el("div", { className: "homebar-ai-avatar" });
  const homebarAvatarImg = el("img", {
    className: "homebar-ai-avatar-img",
    alt: "AI avatar",
    src: state.agentAvatarUrl || "",
  });
  const homebarAvatarFallback = el("div", { className: "homebar-ai-avatar-fallback", text: "AI" });
  homebarAvatar.appendChild(homebarAvatarImg);
  homebarAvatar.appendChild(homebarAvatarFallback);
  aiCallBtn.appendChild(homebarAvatar);

  homebar.appendChild(homeLeftBtn);
  homebar.appendChild(aiCallBtn);
  homebar.appendChild(homeRightBtn);
  app.appendChild(homebar);

  // AI popup widget overlay
  const aiPopupOverlay = el("div", { className: "ai-popup-overlay", "aria-hidden": "true" });
  const aiPopupCard = el("div", { className: "ai-popup-card", role: "dialog", "aria-modal": "true" });

  const aiPopupHeader = el("div", { className: "ai-popup-header" });
  const aiPopupClose = el("button", { className: "ai-popup-close", type: "button", "aria-label": "Close" });
  aiPopupClose.textContent = "×";

  const aiPopupAvatar = el("div", { className: "ai-popup-avatar" });
  const aiPopupAvatarImg = el("img", { className: "ai-popup-avatar-img", alt: "AI avatar", src: state.agentAvatarUrl || "" });
  const aiPopupAvatarFallback = el("div", { className: "ai-popup-avatar-fallback", text: "AI" });
  aiPopupAvatar.appendChild(aiPopupAvatarImg);
  aiPopupAvatar.appendChild(aiPopupAvatarFallback);

  const aiPopupTitle = el("div", { className: "ai-popup-title", text: agentNamePersonalize(initialModel.ai.title) });
  const aiPopupSub = el("div", { className: "ai-popup-sub", text: agentNamePersonalize(initialModel.ai.sub) });

  aiPopupHeader.appendChild(aiPopupClose);
  aiPopupHeader.appendChild(aiPopupAvatar);
  aiPopupHeader.appendChild(aiPopupTitle);
  aiPopupHeader.appendChild(aiPopupSub);

  const aiPopupActions = el("div", { className: "ai-popup-actions" });
  const aiChatBtn = el("button", { className: "ai-popup-action", type: "button" });
  aiChatBtn.innerHTML = `
    <span class="ai-popup-action-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.2-4.6A4 4 0 0 1 3 15V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
    <span class="ai-popup-action-text">${agentNamePersonalize(initialModel.ai.chat)}</span>
  `;

  const aiSpeakBtn = el("button", { className: "ai-popup-action", type: "button" });
  aiSpeakBtn.innerHTML = `
    <span class="ai-popup-action-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M19 11a7 7 0 0 1-14 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 18v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
    <span class="ai-popup-action-text">${agentNamePersonalize(initialModel.ai.speak)}</span>
  `;
  aiPopupActions.appendChild(aiChatBtn);
  aiPopupActions.appendChild(aiSpeakBtn);

  const aiPopupBrand = el("div", { className: "ai-popup-brand", text: "Powered by Cognigy AI" });

  const aiPopupStatus = el("div", { className: "ai-popup-status", text: initialModel.ai.ready });
  const aiPopupAudio = el("audio", { id: "remote-audio", autoplay: "true", playsinline: "true" });

  aiPopupCard.appendChild(aiPopupHeader);
  aiPopupCard.appendChild(aiPopupActions);
  aiPopupCard.appendChild(aiPopupBrand);
  aiPopupCard.appendChild(aiPopupStatus);
  aiPopupCard.appendChild(aiPopupAudio);
  aiPopupOverlay.appendChild(aiPopupCard);
  app.appendChild(aiPopupOverlay);

  let webrtcClient = null;
  let webrtcCallActive = false;
  let webrtcSdkLoadingPromise = null;

  function setAIPopupStatus(text) {
    aiPopupStatus.textContent = text;
  }

  function syncAIPopupTexts() {
    const model = getContentModel(state.lang, state.insuranceType);
    aiPopupTitle.textContent = agentNamePersonalize(model.ai.title);
    aiPopupSub.textContent = agentNamePersonalize(model.ai.sub);

    const chatText = aiChatBtn.querySelector(".ai-popup-action-text");
    if (chatText) chatText.textContent = agentNamePersonalize(model.ai.chat);
    const speakText = aiSpeakBtn.querySelector(".ai-popup-action-text");
    if (speakText) speakText.textContent = agentNamePersonalize(model.ai.speak);

    setAIPopupStatus(model.ai.ready);
  }

  async function ensureWebRTCSdkLoaded() {
    if (window.WebRTCSDK && window.WebRTCSDK.createWebRTCClient) return true;
    if (webrtcSdkLoadingPromise) return webrtcSdkLoadingPromise;

    webrtcSdkLoadingPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src="./webRTCSDK.js"]');
      if (existing) {
        // If a previous load is already in flight, resolve after a short delay.
        window.setTimeout(() => resolve(!!(window.WebRTCSDK && window.WebRTCSDK.createWebRTCClient)), 300);
        return;
      }

      const s = document.createElement("script");
      s.src = "./webRTCSDK.js";
      s.async = true;
      s.onload = () => resolve(true);
      s.onerror = () => reject(new Error("Failed to load webRTCSDK.js"));
      document.head.appendChild(s);
    });

    return webrtcSdkLoadingPromise;
  }

  async function startWebRTCCall() {
    if (webrtcCallActive) return;
    const endpointUrl = state.webrtcEndpointUrl;
    const userId = state.webrtcUserId;

    if (!endpointUrl) {
      setAIPopupStatus("WebRTC not configured (endpointUrl missing).");
      return;
    }

    try {
      await ensureWebRTCSdkLoaded();
      if (!window.WebRTCSDK || !window.WebRTCSDK.createWebRTCClient) {
        setAIPopupStatus("WebRTC SDK failed to load.");
        return;
      }

      setAIPopupStatus("Connecting…");

      const config = { endpointUrl };
      if (userId) config.userId = userId;

      webrtcClient = await window.WebRTCSDK.createWebRTCClient(config);
      webrtcCallActive = true;

      webrtcClient.on("connecting", () => setAIPopupStatus("Connecting…"));
      webrtcClient.on("connected", () => setAIPopupStatus("Connected. Starting call…"));
      webrtcClient.on("answered", () => setAIPopupStatus("Call answered"));
      webrtcClient.on("ended", () => {
        setAIPopupStatus("Call ended");
        webrtcCallActive = false;
      });
      webrtcClient.on("failed", () => {
        setAIPopupStatus("Call failed");
        webrtcCallActive = false;
      });
      webrtcClient.on("error", (err) => {
        const msg = err && err.message ? err.message : "Unknown error";
        setAIPopupStatus(`Call error: ${msg}`);
        webrtcCallActive = false;
      });

      webrtcClient.on("audioRequired", (stream) => {
        try {
          if (aiPopupAudio) {
            aiPopupAudio.srcObject = stream;
            aiPopupAudio.play().catch(() => {});
          }
        } catch (e) {
          // Ignore audio playback issues in demo environments.
        }
      });
      webrtcClient.on("audioEnded", () => {
        try {
          if (aiPopupAudio) aiPopupAudio.srcObject = null;
        } catch {
          // Ignore
        }
      });

      // Start voice call immediately for this demo.
      await webrtcClient.connectAndCall();
    } catch (e) {
      const msg = e && e.message ? e.message : "Unknown error";
      setAIPopupStatus(`Could not start call: ${msg}`);
      webrtcCallActive = false;
      try {
        if (webrtcClient && webrtcClient.disconnect) await webrtcClient.disconnect();
      } catch {
        // ignore
      }
      webrtcClient = null;
    }
  }

  async function teardownWebRTCCall() {
    if (!webrtcClient) return;
    try {
      setAIPopupStatus("Ending call…");
      if (webrtcClient.endCall) {
        await webrtcClient.endCall();
      }
    } catch {
      // ignore end errors
    }

    try {
      if (webrtcClient.disconnect) await webrtcClient.disconnect();
    } catch {
      // ignore
    }

    try {
      if (webrtcClient.destroy) await webrtcClient.destroy();
    } catch {
      // ignore
    }

    webrtcClient = null;
    webrtcCallActive = false;
    syncAIPopupTexts();
  }

  function setAIAvatarUI() {
    const url = state.agentAvatarUrl;
    const hasAvatar = url && String(url).trim().length > 0;

    if (hasAvatar) {
      homebarAvatarImg.style.display = "block";
      homebarAvatarImg.src = url;
      homebarAvatarFallback.style.display = "none";

      aiPopupAvatarImg.style.display = "block";
      aiPopupAvatarImg.src = url;
      aiPopupAvatarFallback.style.display = "none";
    } else {
      homebarAvatarImg.style.display = "none";
      homebarAvatarImg.removeAttribute("src");
      homebarAvatarFallback.style.display = "grid";

      aiPopupAvatarImg.style.display = "none";
      aiPopupAvatarImg.removeAttribute("src");
      aiPopupAvatarFallback.style.display = "grid";
    }
  }

  function openAIPopup() {
    setAIAvatarUI();
    aiPopupOverlay.classList.add("is-open");
    aiPopupOverlay.setAttribute("aria-hidden", "false");
    syncAIPopupTexts();
    // Load SDK up-front so the "Speak to Ally" action feels instant.
    void ensureWebRTCSdkLoaded();
    // Start the click-to-call flow from the center AI button gesture.
    void startWebRTCCall();
  }

  function closeAIPopup() {
    aiPopupOverlay.classList.remove("is-open");
    aiPopupOverlay.setAttribute("aria-hidden", "true");
    void teardownWebRTCCall();
  }

  aiCallBtn.addEventListener("click", openAIPopup);
  aiPopupClose.addEventListener("click", closeAIPopup);
  aiPopupOverlay.addEventListener("click", (e) => {
    if (e.target === aiPopupOverlay) closeAIPopup();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAIPopup();
  });

  aiChatBtn.addEventListener("click", () => {
    // Demo-only: close the widget; integration hook can be added later.
    closeAIPopup();
  });
  aiSpeakBtn.addEventListener("click", () => {
    void startWebRTCCall();
  });

  setAIAvatarUI();

  root.appendChild(app);

  // Mock conversation UI
  const messages = [
    {
      by: "bot",
      text: "Hi! I can help you with policy questions, claims, and documents. What do you want to do?",
      meta: "Cognigy • Demo mode",
    },
    { by: "bot", text: "For example: “What’s next for my claim?”", meta: "Try a suggestion below" },
  ];

  const suggestions = [
    "What’s next for my claim?",
    "Download my policy documents",
    "How much is my deductible?",
    "Talk to a human agent",
  ];

  function renderMessage({ by, text, meta }) {
    const bubble = el("div", { className: `bubble ${by}` });
    bubble.appendChild(el("div", { text }));
    bubble.appendChild(el("small", { text: meta || "" }));
    chatContainer.appendChild(bubble);
  }

  function renderSuggestions() {
    const wrap = el("div", { className: "suggestions" });
    suggestions.forEach((s) => {
      const chip = el("button", { className: "chip", type: "button", text: s });
      chip.addEventListener("click", () => {
        input.value = s;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
      wrap.appendChild(chip);
    });
    chatContainer.appendChild(wrap);
  }

  function botReply(userText) {
    const t = userText.toLowerCase();
    if (t.includes("what") && t.includes("next")) {
      return "Next step: your claim is in the payment queue. You’ll receive a confirmation once the transfer is complete. Want the estimated payment date?";
    }
    if (t.includes("download") || t.includes("document")) {
      return "I found 3 documents: Coverage Summary, Claim Receipts, and Renewal Notice. Which one should I open for you?";
    }
    if (t.includes("deductible")) {
      return "Your current deductible is $250. If you submit a new claim, we’ll apply it before coverage kicks in.";
    }
    if (t.includes("human") || t.includes("agent")) {
      return "Sure. I can schedule a support callback. Do you prefer email or phone?";
    }
    return "Thanks. I can help—ask me about claim status, payments, or documents.";
  }

  function setScrollToBottom() {
    bodyPanel.scrollTop = bodyPanel.scrollHeight;
  }

  function resetChat() {
    chatContainer.innerHTML = "";
    messages.forEach(renderMessage);
    renderSuggestions();
    setScrollToBottom();
    input.value = "";
    send.disabled = true;
  }

  restartBtn.addEventListener("click", resetChat);

  // Wire input
  input.addEventListener("input", () => {
    send.disabled = !input.value.trim();
  });

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    send.disabled = true;

    renderMessage({ by: "user", text, meta: "You" });
    setScrollToBottom();

    const typing = el("div", { className: "bubble bot" });
    typing.appendChild(el("div", { html: "<strong>Thinking…</strong>" }));
    typing.appendChild(el("small", { text: "Cognigy • Demo mode" }));
    bodyPanel.appendChild(typing);
    setScrollToBottom();

    window.setTimeout(() => {
      typing.remove();
      renderMessage({ by: "bot", text: botReply(text), meta: "Cognigy • Demo mode" });
      setScrollToBottom();
    }, 650);
  }

  send.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // Optional: if you later integrate real Cognigy Webchat,
  // replace the contents of #assistantBody and footer wiring with your widget.
  function renderWebRTCMock() {
    widgetContainer.innerHTML = "";
    const avatar = state.agentAvatarUrl;

    // Optional integration hook:
    // If you expose a global widget mount function, it can render inside this container.
    // e.g. window.COGNIGY_WEBRTC_WIDGET.mount(container, { avatarUrl: avatar })
    const maybeMount =
      (window.COGNIGY_WEBRTC_WIDGET && window.COGNIGY_WEBRTC_WIDGET.mount && window.COGNIGY_WEBRTC_WIDGET.mount) ||
      (window.COGNIGY_WEBRTC && window.COGNIGY_WEBRTC.mount && window.COGNIGY_WEBRTC.mount);

    if (typeof maybeMount === "function") {
      try {
        maybeMount(widgetContainer, { avatarUrl: avatar, brandPrimary: state.brandPrimary });
        return;
      } catch (e) {
        // Fall back to the mock UI.
      }
    }

    widgetContainer.innerHTML = `
      <div class="webrtc-top">
        <div class="webrtc-avatar">
          ${
            avatar
              ? `<img class="webrtc-avatar-img" alt="AI avatar" src="${avatar}">`
              : `<div class="webrtc-avatar-fallback" aria-hidden="true">AI</div>`
          }
        </div>
        <div class="webrtc-title">Agent call preview</div>
      </div>

      <div class="webrtc-bubble">
        Hello! I can help you with policy questions and claims. How can I assist you today?
      </div>

      <div class="webrtc-controls">
        <button class="webrtc-ctl" type="button" aria-label="Audio waveform">
          <span class="webrtc-ctl-wave" aria-hidden="true"></span>
        </button>
        <div class="webrtc-ctl-group">
          <button class="webrtc-ctl webrtc-mic" type="button" aria-label="Toggle microphone">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M19 11a7 7 0 0 1-14 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 18v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="webrtc-ctl webrtc-video" type="button" aria-label="Toggle video">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 10l6-3v10l-6-3v-4Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="3" y="7" width="12" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="webrtc-ctl webrtc-hangup" type="button" aria-label="End call">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 4l16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20 4L4 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="webrtc-powered">Powered by Cognigy AI</div>
    `;
  }

  function syncLogoAndAvatars() {
    // Brand logo
    const logo = state.logoSrc;
    if (logo && String(logo).trim()) {
      logoImg.style.display = "block";
      logoImg.src = logo;
      brandLogoPlaceholder.style.display = "none";
    } else {
      logoImg.style.display = "none";
      logoImg.removeAttribute("src");
      brandLogoPlaceholder.style.display = "block";
    }

    // Avatar used by the homebar button + popup widget.
    if (typeof setAIAvatarUI === "function") setAIAvatarUI();
  }

  function applyDraft(next) {
    state = normalizeTheme(next);
    applyTheme(state);
    greetName.textContent = state.displayName || "Customer";
    if (typeof greetTitle !== "undefined" && greetTitle) {
      greetTitle.textContent = agentNamePersonalize(getContentModel(state.lang, state.insuranceType).heroKicker);
    }
    if (typeof syncMainContent === "function") syncMainContent();
    if (typeof syncAIPopupTexts === "function") syncAIPopupTexts();
    syncLogoAndAvatars();
    renderWebRTCMock();
  }

  // Modal UI
  const modalOverlay = el("div", { className: "modal-overlay", "aria-hidden": "true" });
  const modal = el("div", { className: "modal", role: "dialog", "aria-modal": "true" });
  modalOverlay.appendChild(modal);

  const modalHeader = el("div", { className: "modal-header" });
  modalHeader.appendChild(el("div", { className: "modal-title", text: "Brand settings" }));
  const modalClose = el("button", { className: "modal-close", type: "button", "aria-label": "Close settings" });
  modalClose.textContent = "×";
  modalHeader.appendChild(modalClose);

  const modalBody = el("div", { className: "modal-body" });
  const modalHint = el("div", { className: "modal-hint", html: "Customize colors + logo. Then we’ll update the mock insurance app instantly." });
  modalBody.appendChild(modalHint);

  // Name
  const fieldName = el("div", { className: "field" });
  fieldName.appendChild(el("label", { className: "label", for: "displayName", text: "Name" }));
  const displayNameInput = el("input", {
    id: "displayName",
    className: "text-input",
    type: "text",
    placeholder: "David",
  });
  displayNameInput.value = state.displayName || "";
  fieldName.appendChild(displayNameInput);
  modalBody.appendChild(fieldName);

  // Language choice
  const fieldLang = el("div", { className: "field" });
  fieldLang.appendChild(el("div", { className: "label", text: "Language" }));

  const langRow = el("div", { className: "seg-row" });
  const langENBtn = el("button", { className: "seg-btn", type: "button", text: "English" });
  const langDEBtn = el("button", { className: "seg-btn", type: "button", text: "Deutsch" });
  langRow.appendChild(langENBtn);
  langRow.appendChild(langDEBtn);
  fieldLang.appendChild(langRow);
  modalBody.appendChild(fieldLang);

  // Insurance type choice
  const fieldInsuranceType = el("div", { className: "field" });
  fieldInsuranceType.appendChild(el("div", { className: "label", text: "Insurance type" }));

  const insTypeRow = el("div", { className: "seg-row" });
  const insKrankenBtn = el("button", { className: "seg-btn", type: "button", text: "Krankenversicherung" });
  const insLebensBtn = el("button", { className: "seg-btn", type: "button", text: "Lebensversicherung" });
  const insSachBtn = el("button", { className: "seg-btn", type: "button", text: "Sachversicherung" });
  insTypeRow.appendChild(insKrankenBtn);
  insTypeRow.appendChild(insLebensBtn);
  insTypeRow.appendChild(insSachBtn);
  fieldInsuranceType.appendChild(insTypeRow);
  modalBody.appendChild(fieldInsuranceType);

  // AI agent name (personalization)
  const fieldAgentName = el("div", { className: "field" });
  fieldAgentName.appendChild(el("div", { className: "label", text: "AI agent name" }));
  const agentNameInput = el("input", {
    id: "agentName",
    className: "text-input",
    type: "text",
    placeholder: "Ally",
  });
  agentNameInput.value = state.aiAgentName || DEFAULT_THEME.aiAgentName;
  fieldAgentName.appendChild(agentNameInput);
  modalBody.appendChild(fieldAgentName);

  function syncSegments() {
    langENBtn.classList.toggle("is-active", state.lang === "en");
    langDEBtn.classList.toggle("is-active", state.lang === "de");

    insKrankenBtn.classList.toggle("is-active", state.insuranceType === "kranken");
    insLebensBtn.classList.toggle("is-active", state.insuranceType === "lebens");
    insSachBtn.classList.toggle("is-active", state.insuranceType === "sach");
  }

  langENBtn.addEventListener("click", () => {
    applyDraft({ ...state, lang: "en" });
    saveTheme(state);
    syncSegments();
  });
  langDEBtn.addEventListener("click", () => {
    applyDraft({ ...state, lang: "de" });
    saveTheme(state);
    syncSegments();
  });

  insKrankenBtn.addEventListener("click", () => {
    applyDraft({ ...state, insuranceType: "kranken" });
    saveTheme(state);
    syncSegments();
  });
  insLebensBtn.addEventListener("click", () => {
    applyDraft({ ...state, insuranceType: "lebens" });
    saveTheme(state);
    syncSegments();
  });
  insSachBtn.addEventListener("click", () => {
    applyDraft({ ...state, insuranceType: "sach" });
    saveTheme(state);
    syncSegments();
  });

  syncSegments();

  // Customer URL -> expected JSON theme
  const fieldCustomer = el("div", { className: "field" });
  fieldCustomer.appendChild(el("label", { className: "label", for: "customerUrl", text: "Customer URL (website)" }));
  const customerWrap = el("div", { className: "row" });
  const customerInput = el("input", { id: "customerUrl", className: "text-input", type: "url", placeholder: "https://example.com" });
  customerInput.value = "";
  const loadColorsBtn = el("button", { className: "btn-secondary", type: "button", text: "Load colors" });
  customerWrap.appendChild(customerInput);
  customerWrap.appendChild(loadColorsBtn);
  fieldCustomer.appendChild(customerWrap);
  const customerError = el("div", { className: "modal-error", id: "customerError", text: "", style: { display: "none" } });
  fieldCustomer.appendChild(customerError);
  modalBody.appendChild(fieldCustomer);

  // Color pickers
  const fieldColors = el("div", { className: "field" });
  fieldColors.appendChild(el("div", { className: "label", text: "Colors" }));

  const mkColorField = (label, id, value) => {
    const wrap = el("div", { className: "color-field" });
    const top = el("div", { className: "row", style: { alignItems: "center" } });
    top.appendChild(el("div", { className: "color-label", text: label }));
    const colorPicker = el("input", { id, className: "color-input", type: "color" });
    colorPicker.value = value;
    const hexInput = el("input", { className: "text-input hex-input", type: "text", inputmode: "text", placeholder: "#RRGGBB" });
    hexInput.value = value.toUpperCase();
    top.appendChild(colorPicker);
    top.appendChild(hexInput);

    // Keep picker <-> hex input in sync.
    const syncFromPicker = () => {
      const v = colorPicker.value;
      hexInput.value = String(v).toUpperCase();
      draft.brandPrimary = v;
    };
    colorPicker.addEventListener("input", () => {
      hexInput.value = String(colorPicker.value).toUpperCase();
    });
    hexInput.addEventListener("change", () => {
      const v = hexInput.value.trim();
      if (/^#?[0-9a-fA-F]{6}$/.test(v)) {
        const normalized = v.startsWith("#") ? v : `#${v}`;
        colorPicker.value = normalized;
        hexInput.value = normalized.toUpperCase();
        applyDraft(readDraftFromInputs());
      }
    });

    wrap.appendChild(top);
    return { wrap, colorPicker, hexInput };
  };

  // Draft object referenced inside color field builder.
  const draft = { ...state };

  const primaryField = mkColorField("Primary", "primaryColor", state.brandPrimary);
  const accentField = mkColorField("Accent", "accentColor", state.brandAccent);
  const bgField = mkColorField("App background", "bgColor", state.brandBg);
  fieldColors.appendChild(primaryField.wrap);
  fieldColors.appendChild(accentField.wrap);
  fieldColors.appendChild(bgField.wrap);
  modalBody.appendChild(fieldColors);

  // Logo URL
  const fieldLogo = el("div", { className: "field" });
  fieldLogo.appendChild(el("label", { className: "label", for: "logoUrl", text: "Logo URL" }));
  const logoInput = el("input", { id: "logoUrl", className: "text-input", type: "url", placeholder: "https://example.com/logo.png" });
  logoInput.value = state.logoSrc || "";
  fieldLogo.appendChild(logoInput);
  const logoPreview = el("div", { className: "preview-row" });
  const logoPreviewImg = el("img", { className: "logo-preview-img", alt: "Logo preview" });
  logoPreviewImg.src = state.logoSrc || "";
  logoPreviewImg.style.display = state.logoSrc ? "block" : "none";
  logoPreview.appendChild(logoPreviewImg);
  fieldLogo.appendChild(logoPreview);
  modalBody.appendChild(fieldLogo);

  // Avatar URL
  const fieldAvatar = el("div", { className: "field" });
  fieldAvatar.appendChild(el("label", { className: "label", for: "avatarUrl", text: "AI avatar URL" }));
  const avatarInput = el("input", { id: "avatarUrl", className: "text-input", type: "url", placeholder: "https://example.com/avatar.png" });
  avatarInput.value = state.agentAvatarUrl || "";
  fieldAvatar.appendChild(avatarInput);
  const avatarPreviewWrap = el("div", { className: "preview-row" });
  const avatarPreviewImg = el("img", { className: "avatar-preview-img", alt: "Avatar preview" });
  avatarPreviewImg.src = state.agentAvatarUrl || "";
  avatarPreviewImg.style.display = state.agentAvatarUrl ? "block" : "none";
  avatarPreviewWrap.appendChild(avatarPreviewImg);
  const avatarPreviewFallback = el("div", { className: "avatar-preview-fallback", text: "AI" });
  if (state.agentAvatarUrl) avatarPreviewFallback.style.display = "none";
  avatarPreviewWrap.appendChild(avatarPreviewFallback);
  fieldAvatar.appendChild(avatarPreviewWrap);
  modalBody.appendChild(fieldAvatar);

  // WebRTC Click-to-Call config
  const fieldWebRTC = el("div", { className: "field" });
  fieldWebRTC.appendChild(el("label", { className: "label", for: "webrtcEndpointUrl", text: "WebRTC endpointUrl" }));
  const webrtcEndpointInput = el("input", {
    id: "webrtcEndpointUrl",
    className: "text-input",
    type: "url",
    placeholder: "https://your-api.com/webrtc-config",
  });
  webrtcEndpointInput.value = state.webrtcEndpointUrl || "";
  fieldWebRTC.appendChild(webrtcEndpointInput);

  fieldWebRTC.appendChild(el("label", { className: "label", for: "webrtcUserId", text: "WebRTC userId" }));
  const webrtcUserIdInput = el("input", {
    id: "webrtcUserId",
    className: "text-input",
    type: "text",
    placeholder: "user-123",
  });
  webrtcUserIdInput.value = state.webrtcUserId || "";
  fieldWebRTC.appendChild(webrtcUserIdInput);

  modalBody.appendChild(fieldWebRTC);

  const modalFooter = el("div", { className: "modal-footer" });
  const applyBtn = el("button", { className: "btn-primary", type: "button", text: "Save & close" });
  modalFooter.appendChild(applyBtn);

  modal.appendChild(modalHeader);
  modal.appendChild(modalBody);
  modal.appendChild(modalFooter);

  function setError(elm, msg) {
    if (!elm) return;
    if (msg) {
      elm.textContent = msg;
      elm.style.display = "block";
    } else {
      elm.textContent = "";
      elm.style.display = "none";
    }
  }

  function readDraftFromInputs() {
    const next = { ...draft };

    next.brandPrimary = primaryField.colorPicker.value;
    next.brandAccent = accentField.colorPicker.value;
    next.brandBg = bgField.colorPicker.value;

    // Derived
    next.brandPrimaryDark = darkenHex(next.brandPrimary, 0.18);

    // URLs
    next.logoSrc = logoInput.value.trim();
    next.agentAvatarUrl = avatarInput.value.trim();
    next.displayName = displayNameInput.value.trim();
    next.aiAgentName = agentNameInput.value.trim();
    next.lang = state.lang;
    next.insuranceType = state.insuranceType;
    next.webrtcEndpointUrl = webrtcEndpointInput.value.trim();
    next.webrtcUserId = webrtcUserIdInput.value.trim();

    return normalizeTheme(next);
  }

  async function loadColorsFromCustomerUrl() {
    const url = customerInput.value.trim();
    setError(customerError, "");
    if (!url) {
      setError(customerError, "Please paste a customer theme URL.");
      return;
    }

    try {
      const normalized = url.replace(/\/+$/, "");
      let origin = "";
      try {
        const u = new URL(/^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`);
        origin = u.origin;
      } catch {
        origin = "";
      }

      // Option B: always try the well-known theme location.
      // If the input already ends with .json, we’ll still try it first for convenience.
      const wellKnownUrl = origin
        ? `${origin}/.well-known/cognigy/theme.json`
        : `${normalized}/.well-known/cognigy/theme.json`;

      const candidates = [];
      if (/\.(json)(\?|#|$)/i.test(normalized)) candidates.push(normalized);
      candidates.push(wellKnownUrl);

      const seen = new Set();
      const uniqueCandidates = candidates.filter((c) => {
        if (!c || seen.has(c)) return false;
        seen.add(c);
        return true;
      });

      let parsed = null;
      let lastErr = null;

      for (const candidateUrl of uniqueCandidates) {
        try {
          const res = await fetch(candidateUrl, { method: "GET" });
          if (!res.ok) throw new Error(`Request failed (${candidateUrl}): ${res.status}`);
          const text = await res.text();
          // Expect JSON theme object.
          parsed = safeJsonParse(text);
          if (!parsed) throw new Error(`Response from ${candidateUrl} was not valid JSON.`);
          break;
        } catch (e) {
          lastErr = e;
        }
      }

      if (!parsed) throw lastErr || new Error("Could not load theme JSON.");

      // Accept several key styles to keep it flexible.
      const pick = (keys, fallback) => {
        for (const k of keys) {
          if (parsed[k]) return parsed[k];
        }
        return fallback;
      };

      const primary = pick(["brandPrimary", "primary"], nextThemeCandidate(state.brandPrimary));
      const accent = pick(["brandAccent", "accent"], nextThemeCandidate(state.brandAccent));
      const bg = pick(["brandBg", "bg", "background"], nextThemeCandidate(state.brandBg));
      const primaryDark = pick(["brandPrimaryDark", "primaryDark", "primary_dark"], null);
      const brandText = pick(["brandText", "text"], null);
      const brandMuted = pick(["brandMuted", "muted"], null);
      const brandBorder = pick(["brandBorder", "border"], null);
      const successBg = pick(["successBg"], null);
      const successText = pick(["successText"], null);
      const warningBg = pick(["warningBg"], null);
      const warningText = pick(["warningText"], null);

      const displayName = pick(["displayName", "name", "customerName", "userName"], null);

      // Optional WebRTC Click-to-Call config
      const webrtcEndpointUrl = pick(["webrtcEndpointUrl", "endpointUrl", "webrtcEndpoint"], null);
      const webrtcUserId = pick(["webrtcUserId", "userId", "webrtcUser"], null);

      const next = {
        ...draft,
        brandPrimary: primary,
        brandAccent: accent,
        brandBg: bg,
        brandPrimaryDark: primaryDark || darkenHex(primary, 0.18),
      };

      if (brandText) next.brandText = brandText;
      if (brandMuted) next.brandMuted = brandMuted;
      if (brandBorder) next.brandBorder = brandBorder;
      if (successBg) next.successBg = successBg;
      if (successText) next.successText = successText;
      if (warningBg) next.warningBg = warningBg;
      if (warningText) next.warningText = warningText;

      if (displayName) next.displayName = displayName;

      if (webrtcEndpointUrl) next.webrtcEndpointUrl = webrtcEndpointUrl;
      if (webrtcUserId) next.webrtcUserId = webrtcUserId;

      Object.assign(draft, next);

      // Update pickers
      primaryField.colorPicker.value = next.brandPrimary;
      accentField.colorPicker.value = next.brandAccent;
      bgField.colorPicker.value = next.brandBg;
      displayNameInput.value = next.displayName || "";

      primaryField.hexInput.value = String(next.brandPrimary).toUpperCase();
      accentField.hexInput.value = String(next.brandAccent).toUpperCase();
      bgField.hexInput.value = String(next.brandBg).toUpperCase();
      webrtcEndpointInput.value = next.webrtcEndpointUrl || "";
      webrtcUserIdInput.value = next.webrtcUserId || "";

      // Apply immediately so the custom app updates.
      applyDraft(readDraftFromInputs());
      setError(customerError, "");
    } catch (e) {
      setError(customerError, e && e.message ? e.message : "Could not load colors from the URL.");
    }
  }

  function nextThemeCandidate(v) {
    return v || DEFAULT_THEME.brandPrimary;
  }

  // Live updates from modal inputs
  function attachInputLiveSync(inputEl) {
    if (!inputEl) return;
    inputEl.addEventListener("input", () => {
      applyDraft(readDraftFromInputs());
    });
    inputEl.addEventListener("change", () => {
      applyDraft(readDraftFromInputs());
    });
  }

  attachInputLiveSync(primaryField.colorPicker);
  attachInputLiveSync(accentField.colorPicker);
  attachInputLiveSync(bgField.colorPicker);
  attachInputLiveSync(displayNameInput);
  attachInputLiveSync(agentNameInput);
  attachInputLiveSync(logoInput);
  attachInputLiveSync(avatarInput);
  attachInputLiveSync(webrtcEndpointInput);
  attachInputLiveSync(webrtcUserIdInput);

  // Keep previews in sync.
  function syncPreviews() {
    const logo = logoInput.value.trim();
    if (logo) {
      logoPreviewImg.src = logo;
      logoPreviewImg.style.display = "block";
    } else {
      logoPreviewImg.removeAttribute("src");
      logoPreviewImg.style.display = "none";
    }

    const avatar = avatarInput.value.trim();
    if (avatar) {
      avatarPreviewImg.src = avatar;
      avatarPreviewImg.style.display = "block";
      avatarPreviewFallback.style.display = "none";
    } else {
      avatarPreviewImg.removeAttribute("src");
      avatarPreviewImg.style.display = "none";
      avatarPreviewFallback.style.display = "grid";
    }
  }

  logoInput.addEventListener("input", () => syncPreviews());
  avatarInput.addEventListener("input", () => syncPreviews());

  loadColorsBtn.addEventListener("click", loadColorsFromCustomerUrl);
  modalClose.addEventListener("click", () => {
    saveTheme(state);
    modalOverlay.classList.remove("is-open");
    modalOverlay.setAttribute("aria-hidden", "true");
    settingsBtn.focus();
  });

  function openModal() {
    syncPreviews();
    setError(customerError, "");
    modalOverlay.classList.add("is-open");
    modalOverlay.setAttribute("aria-hidden", "false");
  }

  settingsBtn.addEventListener("click", () => {
    const isOpen = modalOverlay.classList.contains("is-open");
    if (isOpen) {
      saveTheme(state);
      modalOverlay.classList.remove("is-open");
      modalOverlay.setAttribute("aria-hidden", "true");
    } else {
      openModal();
    }
  });

  // Same modal toggle from the bottom homebar settings button.
  homeRightBtn.addEventListener("click", () => {
    const isOpen = modalOverlay.classList.contains("is-open");
    if (isOpen) {
      saveTheme(state);
      modalOverlay.classList.remove("is-open");
      modalOverlay.setAttribute("aria-hidden", "true");
    } else {
      openModal();
    }
  });

  // Clicking outside closes (mobile-friendly)
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      saveTheme(state);
      modalOverlay.classList.remove("is-open");
      modalOverlay.setAttribute("aria-hidden", "true");
    }
  });

  window.addEventListener("keydown", (e) => {
    const isOpen = modalOverlay.classList.contains("is-open");
    if (isOpen && e.key === "Escape") {
      saveTheme(state);
      modalOverlay.classList.remove("is-open");
      modalOverlay.setAttribute("aria-hidden", "true");
    }
  });

  // Save button
  applyBtn.addEventListener("click", () => {
    applyDraft(readDraftFromInputs());
    saveTheme(state);
    modalOverlay.classList.remove("is-open");
    modalOverlay.setAttribute("aria-hidden", "true");
    settingsBtn.focus();
  });

  resetChat();
  syncLogoAndAvatars();
  renderWebRTCMock();
  syncPreviews();

  root.appendChild(modalOverlay);
}

render();

