/* =========================================================
   Fallo Productions — site content + behaviour
   ---------------------------------------------------------
   EDIT YOUR PROJECTS HERE. Everything on the page (showcase,
   gallery and previous works) is built from this one list, so
   every photo stays linked to the project it belongs to.

   Photos go in:  images/projects/<project id>/
   "photos" is either:
     - a list of the exact file names (case-sensitive!), or
     - a number N, if the files are named 1.jpg, 2.jpg ... N.jpg
   The first photo is used as the cover unless you set "cover".
   ========================================================= */

const PROJECTS = [
  {
    id: "Spamalot",
    title: "Monthy python's Spamalot",
    year: 2025,
    venue: "Mjøndalen Samfunnshus",
    client: "Nedbrutt",
    category: "Theatre",
    services: ["Lighting design", "Technical Project management"],
    description: "Full lighting design, Planning of audio and lights for full scale theatrical production, Rigging of audio and lights.",
    photos: 1,
    featured: true,
  },
  {
    id: "Addams",
    title: "Addams Family",
    year: 2026,
    venue: "Outdoor custom stage",
    client: "Hokksund byteater Jr",
    category: "Theatre",
    services: ["Full lighting design"],
    description: "Theatrical lighting for Addams family",
    photos: 8,
    featured: true,
  },
];

/* ---------- helpers ---------- */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Build photo paths: photos can be a number (1.jpg ... n.jpg) or an explicit list of filenames.
PROJECTS.forEach((p) => {
  const files = Array.isArray(p.photos)
    ? p.photos
    : Array.from({ length: p.photos }, (_, i) => `${i + 1}.jpg`);
  // encodeURIComponent handles spaces, brackets etc. in folder/file names
  const path = (f) => `images/projects/${encodeURIComponent(p.id)}/${encodeURIComponent(f)}`;
  p.photoList = files.map(path);
  p.cover = p.cover ? path(p.cover) : p.photoList[0];
});

// Every photo, linked back to its project
const PHOTOS = PROJECTS.flatMap((p) =>
  p.photoList.map((src, index) => ({ src, index, project: p }))
);

// Stage-light gradient used as a placeholder behind every photo
function stageGradient(key) {
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const hues = [32, 205, 275, 335, 165, 45, 12, 220];
  const a = hues[h % hues.length];
  const b = hues[(h >>> 4) % hues.length];
  const x1 = 12 + (h % 30);
  const x2 = 58 + ((h >>> 6) % 30);
  return [
    `radial-gradient(ellipse 18% 95% at ${x1}% -5%, hsla(${a},95%,62%,.6), transparent 72%)`,
    `radial-gradient(ellipse 18% 95% at ${x2}% -5%, hsla(${b},95%,62%,.5), transparent 72%)`,
    `radial-gradient(ellipse 14% 80% at 50% -5%, hsla(${a},90%,80%,.25), transparent 70%)`,
    `radial-gradient(ellipse 80% 35% at 50% 108%, hsla(${a},80%,45%,.35), transparent 70%)`,
    `linear-gradient(180deg, #14141a, #060608)`,
  ].join(", ");
}

// Photo on top, placeholder underneath (shows if the photo is missing)
function applyBackgrounds(root = document) {
  $$("[data-bg]", root).forEach((el) => {
    el.style.backgroundImage = `url("${el.dataset.bg}"), ${stageGradient(el.dataset.bg)}`;
  });
}

/* ---------- header + menu ---------- */

const header = $(".site-header");
const menu = $("#site-menu");
const toggle = $(".menu-toggle");

function setMenu(open) {
  menu.classList.toggle("is-open", open);
  menu.inert = !open;
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.classList.toggle("menu-open", open);
  document.body.classList.toggle("no-scroll", open);
}
setMenu(false);
toggle.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
$$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));

/* ---------- showcase ---------- */

function renderShowcase() {
  const shows = PROJECTS.filter((p) => p.featured).slice(0, 4);
  $("#showcase-list").innerHTML = shows
    .map(
      (p, i) => `
    <article class="show">
      <div class="show__media" data-bg="${p.cover}" data-parallax></div>
      <div class="show__caption reveal">
        <span class="show__num">${String(i + 1).padStart(2, "0")}</span>
        <div>
          <p class="show__meta">${p.venue} · ${p.year}</p>
          <h3>${p.title}</h3>
          <ul class="tags">${p.services.map((s) => `<li>${s}</li>`).join("")}</ul>
          <button class="link-arrow" data-project="${p.id}">View photos <span aria-hidden="true">→</span></button>
        </div>
      </div>
    </article>`
    )
    .join("");
}

/* ---------- gallery ---------- */

const TILE_PATTERN = ["tile--wide tile--tall", "", "", "tile--tall", "", "tile--wide", "", ""];
let galleryItems = PHOTOS;

function renderFilters() {
  const cats = ["All", ...new Set(PROJECTS.map((p) => p.category))];
  $("#gallery-filters").innerHTML = cats
    .map((c, i) => `<button class="filter" aria-pressed="${i === 0}" data-cat="${c}">${c}</button>`)
    .join("");
  $("#gallery-filters").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter");
    if (!btn) return;
    $$(".filter").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    renderGallery(btn.dataset.cat);
  });
}

function renderGallery(cat = "All") {
  galleryItems = cat === "All" ? PHOTOS : PHOTOS.filter((ph) => ph.project.category === cat);
  const el = $("#gallery");
  el.innerHTML = galleryItems
    .map(
      (ph, i) => `
    <button class="tile ${TILE_PATTERN[i % TILE_PATTERN.length]}" data-index="${i}"
            aria-label="${ph.project.title}, photo ${ph.index + 1}">
      <span class="tile__img" data-bg="${ph.src}"></span>
      <span class="tile__cap"><small>${ph.project.category}</small>${ph.project.title}</span>
    </button>`
    )
    .join("");
  applyBackgrounds(el);
}

$("#gallery").addEventListener("click", (e) => {
  const tile = e.target.closest(".tile");
  if (tile) openLightbox(galleryItems, Number(tile.dataset.index));
});

/* ---------- previous works ---------- */

function renderWorks() {
  $("#works-list").innerHTML = PROJECTS.map(
    (p) => `
    <article class="work reveal">
      <div class="work__media">
        <button class="work__cover tile" data-project="${p.id}" aria-label="View photos from ${p.title}" style="display:block;width:100%">
          <span class="tile__img" data-bg="${p.cover}"></span>
          <span class="work__count">${p.photoList.length} photos</span>
        </button>
        <div class="work__thumbs">
          ${p.photoList
            .slice(0, 5)
            .map(
              (src, i) =>
                `<button class="work__thumb" data-bg="${src}" data-project="${p.id}" data-start="${i}" aria-label="${p.title}, photo ${i + 1}"></button>`
            )
            .join("")}
        </div>
      </div>
      <div>
        <span class="work__year">${p.year}</span>
        <h3>${p.title}</h3>
        <p class="work__desc">${p.description}</p>
        <dl class="work__facts">
          <dt>Venue</dt><dd>${p.venue}</dd>
          <dt>Client</dt><dd>${p.client}</dd>
          <dt>Services</dt><dd>${p.services.join(", ")}</dd>
        </dl>
        <button class="link-arrow" data-project="${p.id}">View project photos <span aria-hidden="true">→</span></button>
      </div>
    </article>`
  ).join("");
}

// Any element with data-project opens that project's photos
document.addEventListener("click", (e) => {
  const trigger = e.target.closest("[data-project]");
  if (!trigger) return;
  const items = PHOTOS.filter((ph) => ph.project.id === trigger.dataset.project);
  openLightbox(items, Number(trigger.dataset.start || 0));
});

/* ---------- lightbox ---------- */

const lb = {
  el: $("#lightbox"),
  stage: $("#lb-stage"),
  img: $("#lb-img"),
  caption: $("#lb-caption"),
  counter: $("#lb-counter"),
  items: [],
  i: 0,
  lastFocus: null,
};
lb.el.inert = true;

function openLightbox(items, index) {
  if (!items.length) return;
  lb.items = items;
  lb.lastFocus = document.activeElement;
  lb.el.classList.add("is-open");
  lb.el.inert = false;
  document.body.classList.add("no-scroll");
  showPhoto(index);
  $("#lb-close").focus();
}

function closeLightbox() {
  lb.el.classList.remove("is-open");
  lb.el.inert = true;
  if (!menu.classList.contains("is-open")) document.body.classList.remove("no-scroll");
  lb.lastFocus?.focus();
}

function showPhoto(index) {
  const n = lb.items.length;
  lb.i = (index + n) % n;
  const ph = lb.items[lb.i];
  lb.stage.style.backgroundImage = stageGradient(ph.src);
  lb.stage.classList.remove("has-img");
  lb.img.hidden = true;
  lb.img.onload = () => {
    lb.img.hidden = false;
    lb.stage.classList.add("has-img");
  };
  lb.img.onerror = () => (lb.img.hidden = true);
  lb.img.alt = `${ph.project.title} — photo ${ph.index + 1}`;
  lb.img.src = ph.src;
  lb.caption.textContent = `${ph.project.title} · ${ph.project.venue} · ${ph.project.year}`;
  lb.counter.textContent = `${String(lb.i + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`;
  const multi = n > 1;
  $("#lb-prev").hidden = !multi;
  $("#lb-next").hidden = !multi;
}

$("#lb-close").addEventListener("click", closeLightbox);
$("#lb-prev").addEventListener("click", () => showPhoto(lb.i - 1));
$("#lb-next").addEventListener("click", () => showPhoto(lb.i + 1));
lb.el.addEventListener("click", (e) => {
  if (e.target === lb.el || e.target === lb.stage) closeLightbox();
});

let touchX = null;
lb.stage.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
lb.stage.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) showPhoto(lb.i + (dx < 0 ? 1 : -1));
  touchX = null;
});

document.addEventListener("keydown", (e) => {
  if (lb.el.classList.contains("is-open")) {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") showPhoto(lb.i + 1);
    if (e.key === "ArrowLeft") showPhoto(lb.i - 1);
  } else if (e.key === "Escape" && menu.classList.contains("is-open")) {
    setMenu(false);
    toggle.focus();
  }
});

/* ---------- scroll effects ---------- */

function setupReveal() {
  const items = $$(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      }),
    { threshold: 0.2 }
  );
  items.forEach((el) => io.observe(el));
}

let ticking = false;
function onScroll() {
  header.classList.toggle("is-scrolled", window.scrollY > 40);
  if (reduceMotion || ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const vh = window.innerHeight;
    $$("[data-parallax]").forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const offset = (r.top + r.height / 2 - vh / 2) * -0.1;
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    });
    ticking = false;
  });
}

/* ---------- contact form (opens the visitor's email app) ---------- */

$("#contact-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const subject = `Enquiry: ${f.get("type")}${f.get("date") ? " – " + f.get("date") : ""}`;
  const body = `Name: ${f.get("name")}\nEmail: ${f.get("email")}\nEvent date: ${f.get("date") || "-"}\nService: ${f.get("type")}\n\n${f.get("message")}`;
  window.location.href = `mailto:${e.target.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

/* ---------- init ---------- */

renderShowcase();
renderFilters();
renderGallery();
renderWorks();
applyBackgrounds();
setupReveal();
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);
$("#year").textContent = new Date().getFullYear();
