if (window.lucide) {
  window.lucide.createIcons({ strokeWidth: 1.8 });
}

const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");

const closeNavigation = () => {
  if (!navToggle || !nav) return;
  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open navigation");
  document.body.classList.remove("nav-open");
};

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const willOpen = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", willOpen);
    navToggle.setAttribute("aria-expanded", String(willOpen));
    navToggle.setAttribute("aria-label", willOpen ? "Close navigation" : "Open navigation");
    document.body.classList.toggle("nav-open", willOpen);
  });

  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNavigation));

  window.addEventListener("resize", () => {
    if (window.innerWidth > 800) closeNavigation();
  });
}

const taxonomyTabs = [...document.querySelectorAll("[data-taxonomy-tab]")];
const taxonomyPanels = [...document.querySelectorAll("[data-taxonomy-panel]")];

taxonomyTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const selected = tab.dataset.taxonomyTab;

    taxonomyTabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });

    taxonomyPanels.forEach((panel) => {
      const active = panel.dataset.taxonomyPanel === selected;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
  });
});

const filterButtons = [...document.querySelectorAll("[data-filter]")];
const methodRows = [...document.querySelectorAll(".method-table tbody tr")];
const methodSearch = document.querySelector("[data-method-search]");
const methodCount = document.querySelector("[data-method-count]");
const emptyState = document.querySelector("[data-empty-state]");
let activeFilter = "all";

const updateMethodRows = () => {
  const query = methodSearch?.value.trim().toLowerCase() || "";
  let visibleCount = 0;

  methodRows.forEach((row) => {
    const matchesRole = activeFilter === "all" || row.dataset.role === activeFilter;
    const matchesQuery = !query || row.textContent.toLowerCase().includes(query);
    const visible = matchesRole && matchesQuery;
    row.classList.toggle("is-hidden", !visible);
    if (visible) visibleCount += 1;
  });

  if (methodCount) methodCount.textContent = String(visibleCount);
  if (emptyState) emptyState.hidden = visibleCount !== 0;
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    updateMethodRows();
  });
});

methodSearch?.addEventListener("input", updateMethodRows);

const navLinks = [...document.querySelectorAll(".nav-links a")];
const observedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === id));
      });
    },
    { rootMargin: "-30% 0px -62% 0px", threshold: 0.01 }
  );

  observedSections.forEach((section) => sectionObserver.observe(section));
}

const copyButton = document.querySelector("[data-copy-target]");

copyButton?.addEventListener("click", async () => {
  const target = document.querySelector(copyButton.dataset.copyTarget);
  const label = copyButton.querySelector("span");
  if (!target || !label) return;

  try {
    await navigator.clipboard.writeText(target.textContent.trim());
    label.textContent = "Copied";
    copyButton.classList.add("copied");
    window.setTimeout(() => {
      label.textContent = "Copy BibTeX";
      copyButton.classList.remove("copied");
    }, 1600);
  } catch (error) {
    label.textContent = "Select BibTeX";
  }
});
