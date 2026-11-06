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
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      closeNavigation();
      navToggle.focus();
    }
  });
}

const taxonomyTabs = [...document.querySelectorAll("[data-taxonomy-tab]")];
const taxonomyPanels = [...document.querySelectorAll("[data-taxonomy-panel]")];

taxonomyTabs.forEach((tab, index) => {
  tab.id = `taxonomy-tab-${tab.dataset.taxonomyTab}`;
  tab.tabIndex = index === 0 ? 0 : -1;
  document.getElementById(tab.getAttribute("aria-controls"))?.setAttribute("aria-labelledby", tab.id);
  tab.addEventListener("click", () => {
    const selected = tab.dataset.taxonomyTab;

    taxonomyTabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
    });

    taxonomyPanels.forEach((panel) => {
      const active = panel.dataset.taxonomyPanel === selected;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
  });
  tab.addEventListener("keydown", (event) => {
    let nextIndex;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % taxonomyTabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index + taxonomyTabs.length - 1) % taxonomyTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = taxonomyTabs.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    taxonomyTabs[nextIndex].click();
    taxonomyTabs[nextIndex].focus();
  });
});

const filterButtons = [...document.querySelectorAll("[data-filter]")];
const methodRows = [...document.querySelectorAll(".method-table tbody tr")];
const methodSearch = document.querySelector("[data-method-search]");
const methodCount = document.querySelector("[data-method-count]");
const emptyState = document.querySelector("[data-empty-state]");
const mobileMethodList = document.querySelector("[data-mobile-methods]");
const methodScroll = mobileMethodList?.closest(".table-wrap");
const mobileMethodTemplate = document.querySelector("#mobile-method-template");
const roleNames = { generation: "Generation", planning: "Planning", hybrid: "Hybrid", boundary: "Static comparator" };
const mobileMethods = methodRows.map((row) => {
  const entry = mobileMethodTemplate.content.firstElementChild.cloneNode(true);
  entry.dataset.role = row.dataset.role;
  entry.querySelector("strong").textContent = row.cells[0].querySelector("strong").textContent;
  entry.querySelector("small").textContent = row.cells[0].querySelector("small").textContent;
  entry.querySelector(".mobile-method-role").textContent = roleNames[row.dataset.role];
  entry.querySelectorAll("dd").forEach((field, index) => {
    field.textContent = row.cells[index + 1].textContent;
  });
  return entry;
});
mobileMethodList.append(...mobileMethods);
methodScroll?.classList.add("has-mobile-methods");
let activeFilter = "all";

const updateMethodRows = () => {
  const query = methodSearch?.value.trim().toLowerCase() || "";
  let visibleCount = 0;

  methodRows.forEach((row, index) => {
    const matchesRole = activeFilter === "all" || row.dataset.role === activeFilter;
    const matchesQuery = !query || row.textContent.toLowerCase().includes(query);
    const visible = matchesRole && matchesQuery;
    row.classList.toggle("is-hidden", !visible);
    const entry = mobileMethods[index];
    entry.hidden = !visible;
    if (!visible) entry.open = false;
    if (visible) visibleCount += 1;
  });

  if (methodCount) methodCount.textContent = String(visibleCount);
  if (emptyState) emptyState.hidden = visibleCount !== 0;
  if (methodScroll) methodScroll.scrollTop = 0;
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => {
      item.classList.toggle("is-active", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });
    updateMethodRows();
  });
});

methodSearch?.addEventListener("input", updateMethodRows);

const navLinks = [...document.querySelectorAll(".nav-links a")];
const observedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const updateActiveNavigation = () => {
  let activeId = "";
  observedSections.forEach((section) => {
    if (section.getBoundingClientRect().top <= 150) activeId = `#${section.id}`;
  });
  navLinks.forEach((link) => {
    const active = link.getAttribute("href") === activeId;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
};
let navigationFrame;
window.addEventListener("scroll", () => {
  if (navigationFrame) return;
  navigationFrame = requestAnimationFrame(() => {
    updateActiveNavigation();
    navigationFrame = undefined;
  });
}, { passive: true });
window.addEventListener("resize", updateActiveNavigation);
updateActiveNavigation();

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
  } catch {
    const range = document.createRange();
    range.selectNodeContents(target);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    label.textContent = document.execCommand("copy") ? "Copied" : "BibTeX selected";
  }
});

const figureDialog = document.querySelector("[data-figure-dialog]");
const figureViewport = document.querySelector("[data-figure-viewport]");
const figureImage = document.querySelector("[data-figure-image]");
const figureTitle = document.querySelector("#figure-dialog-title");
const figureOriginal = document.querySelector("[data-figure-original]");
const figureZoom = document.querySelector("[data-figure-zoom]");

const renderIcons = () => window.lucide?.createIcons({ attrs: { "stroke-width": 1.8 } });

const resetFigureZoom = () => {
  figureViewport.classList.remove("is-zoomed");
  figureViewport.scrollTo(0, 0);
  figureZoom.setAttribute("aria-pressed", "false");
  figureZoom.setAttribute("aria-label", "Zoom to original size");
  figureZoom.title = "Zoom to original size";
};

document.querySelectorAll("img[data-figure]").forEach((image) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "figure-button";
  button.setAttribute("aria-label", `Enlarge: ${image.alt}`);
  button.title = "Enlarge figure";
  image.before(button);
  button.append(image);
  const mark = document.createElement("span");
  mark.className = "figure-zoom-mark";
  mark.setAttribute("aria-hidden", "true");
  mark.innerHTML = '<i data-lucide="zoom-in"></i>';
  button.append(mark);

  button.addEventListener("click", () => {
    const caption = image.closest("figure").querySelector("figcaption");
    figureTitle.textContent = caption?.textContent || image.alt;
    figureImage.src = image.src;
    figureImage.alt = image.alt;
    figureOriginal.href = image.dataset.pdf;
    resetFigureZoom();
    figureDialog.showModal();
    document.body.classList.add("figure-open");
  });
});

document.querySelector("[data-figure-close]").addEventListener("click", () => figureDialog.close());
figureDialog.addEventListener("close", () => document.body.classList.remove("figure-open"));
figureDialog.addEventListener("click", (event) => {
  const rect = figureDialog.getBoundingClientRect();
  if (event.target === figureDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) {
    figureDialog.close();
  }
});
figureZoom.addEventListener("click", () => {
  const zoomed = figureViewport.classList.toggle("is-zoomed");
  figureZoom.setAttribute("aria-pressed", String(zoomed));
  figureZoom.setAttribute("aria-label", zoomed ? "Fit figure to window" : "Zoom to original size");
  figureZoom.title = zoomed ? "Fit figure to window" : "Zoom to original size";
});

renderIcons();
