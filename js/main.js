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

   TRANSLATION (Norwegian / English):
   - "description" (and any other text) can be written as
     { no: "norsk tekst", en: "English text" }
   - single words like category, services and venue can stay
     plain text; their translations are in the "terms" list
     in js/i18n.js
   ========================================================= */

const PROJECTS = [
  {
    id: "Addams",
    title: "Addams Family",
    year: 2026,
    venue: "Outdoor custom stage",
    client: "Hokksund byteater Jr",
    category: "Theatre",
    services: ["Lighting design"],
    description: {
      no: "Teaterlys for Addams Family",
      en: "Theatrical lighting for Addams family",
    },
    photos: 6,
    featured: true,
  },

   {
    id: "MN",
    title: "Miss Norway 2026",
    year: 2026,
    venue: "Gateway studios fornebu",
    client: "Gateway Studios",
    category: "Live Event",
    services: ["Lighting design"],
    description: {
      no: "Lys til moteshow",
      en: "Lights for fashion show",
    },
    photos: 1,
    featured: true,
  },

   {
    id: "DRMH",
    title: "Drammen helsekonferanse",
    year: 2026,
    venue: "Gateway Studios Drammen",
    client: "Gateway Studios",
    category: "Conferance",
    services: ["Live Lighting design"],
    description: {
      no: "Konferanselys for et publikum som sitter rundt scenen",
      en: "Conferance lights for audience surrounding stage",
    },
    photos: 2,
    featured: true,
  },

  {
    id: "Spamalot",
    title: "Monthy python's Spamalot",
    year: 2025,
    venue: "Mjøndalen Samfunnshus",
    client: "Nedbrutt",
    category: "Theatre",
    services: ["Lighting design", "Technical Project management"],
    description: {
      no: "Komplett lysdesign, planlegging av lyd og lys for en fullskala teaterproduksjon, og rigging av lyd og lys.",
      en: "Full lighting design, Planning of audio and lights for full scale theatrical production, Rigging of audio and lights.",
    },
    photos: 3,
    featured: true,
  },
  
  {
    id: "Kometen",
    title: "Kometen",
    year: 2026,
    venue: "Kometen Drammen",
    client: "Strømsø panorama AS",
    category: "Concert",
    services: ["Live Lighting design"],
    description: {
      no: "Konsertlys i flere sjangre, som metal, rock og punk",
      en: "Concerts lights in multiple genres such as metal, rock and punk",
    },
    photos: 5,
    featured: true,
  },
  {
    id: "Fjosnisser",
    title: "Fjøsnisser i juleknipe 2026",
    year: 2026,
    venue: "Arbeideren hokksund",
    client: "Hokksund byteater Jr",
    category: "Theatre",
    services: ["Theatrical lighting design"],
    description: {
      no: "Lysdesign med fokus på å dempe scenografien og løfte skuespillerne fram",
      en: "Lighting design with focus on bringing the scenery out of focus, and the actors in front",
    },
    photos: 6,
    featured: true,
  },
  {
    id: "Jafar",
    title: "Jafar",
    year: 2026,
    venue: "Solbergelva spinderi",
    client: "Nedbrutt",
    category: "Theatre",
    services: ["Lighting design", "audio production", "technical project planning"],
    description: {
      no: "lysdesign og lydteknikk for første teaterproduksjonen til nedbrutt",
      en: "lighting design and audio design for Nedbrutt's first theatre production",
    },
    photos: 3,
    featured: true,
  },
 

  {
    id: "TKK",
    title: "Glassverket musikkkorps",
    year: 2024,
    venue: "Tangen kirke",
    client: "Glassverket musikkkorps",
    category: "Concert",
    services: ["Live Lighting design"],
    description: {
      no: "Lys for korps i kirke",
      en: "Lights for band, church",
    },
    photos: 1,
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
  toggle.setAttribute("aria-label", t(open ? "menu.close" : "menu.open"));
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
          <p class="show__meta">${tr(p.venue)} · ${p.year}</p>
          <h3>${p.title}</h3>
          <ul class="tags">${p.services.map((s) => `<li>${tr(s)}</li>`).join("")}</ul>
          <button class="link-arrow" data-project="${p.id}">${t("showcase.viewPhotos")} <span aria-hidden="true">→</span></button>
        </div>
      </div>
    </article>`
    )
    .join("");
}

/* ---------- gallery ---------- */

const TILE_PATTERN = ["tile--wide tile--tall", "", "", "tile--tall", "", "tile--wide", "", ""];
let galleryItems = PHOTOS;
let galleryCat = "All"; // the selected filter (the category as written in PROJECTS)

function renderFilters() {
  const cats = ["All", ...new Set(PROJECTS.map((p) => p.category))];
  $("#gallery-filters").innerHTML = cats
    .map((c) => `<button class="filter" aria-pressed="${c === galleryCat}" data-cat="${c}">${c === "All" ? t("gallery.all") : tr(c)}</button>`)
    .join("");
}

$("#gallery-filters").addEventListener("click", (e) => {
  const btn = e.target.closest(".filter");
  if (!btn) return;
  $$(".filter").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
  renderGallery(btn.dataset.cat);
});

function renderGallery(cat = galleryCat) {
  galleryCat = cat;
  galleryItems = cat === "All" ? PHOTOS : PHOTOS.filter((ph) => ph.project.category === cat);
  const el = $("#gallery");
  el.innerHTML = galleryItems
    .map(
      (ph, i) => `
    <div class="tile ${TILE_PATTERN[i % TILE_PATTERN.length]}" data-index="${i}">
      <button class="tile__open" aria-label="${t("photo.label", { title: ph.project.title, n: ph.index + 1 })}">
        <span class="tile__img" data-bg="${ph.src}"></span>
        <span class="tile__cap"><small>${tr(ph.project.category)}</small>${ph.project.title}</span>
      </button>
      <button class="tile__share" aria-label="${t("gallery.share", { title: ph.project.title, n: ph.index + 1 })}">${SHARE_ICON}</button>
    </div>`
    )
    .join("");
  applyBackgrounds(el);
}

const SHARE_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="6" cy="12" r="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="18" cy="19" r="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" stroke="currentColor" stroke-width="1.6"/></svg>`;

$("#gallery").addEventListener("click", async (e) => {
  const tile = e.target.closest(".tile");
  if (!tile) return;
  const index = Number(tile.dataset.index);

  // Share icon: copy the link to this photo (same link as "Copy link" in the photo viewer)
  const share = e.target.closest(".tile__share");
  if (share) {
    try {
      await copyText(photoLink(galleryItems[index]));
      share.dataset.tip = t("lightbox.copied");
      share.classList.add("is-done");
    } catch (err) {
      share.dataset.tip = t("lightbox.copyFailed");
    }
    clearTimeout(share._timer);
    share._timer = setTimeout(() => {
      delete share.dataset.tip;
      share.classList.remove("is-done");
    }, 2000);
    return;
  }

  if (e.target.closest(".tile__open")) openLightbox(galleryItems, index, { shareable: true });
});

/* ---------- previous works ---------- */

function renderWorks() {
  $("#works-list").innerHTML = PROJECTS.map(
    (p) => `
    <article class="work reveal">
      <div class="work__media">
        <button class="work__cover tile" data-project="${p.id}" aria-label="${t("works.viewPhotosFrom", { title: p.title })}" style="display:block;width:100%">
          <span class="tile__img" data-bg="${p.cover}"></span>
          <span class="work__count">${t("works.photoCount", { n: p.photoList.length })}</span>
        </button>
        <div class="work__thumbs">
          ${p.photoList
            .slice(0, 5)
            .map(
              (src, i) =>
                `<button class="work__thumb" data-bg="${src}" data-project="${p.id}" data-start="${i}" aria-label="${t("photo.label", { title: p.title, n: i + 1 })}"></button>`
            )
            .join("")}
        </div>
      </div>
      <div>
        <span class="work__year">${p.year}</span>
        <h3>${p.title}</h3>
        <p class="work__desc">${tr(p.description)}</p>
        <dl class="work__facts">
          <dt>${t("works.venue")}</dt><dd>${tr(p.venue)}</dd>
          <dt>${t("works.client")}</dt><dd>${tr(p.client)}</dd>
          <dt>${t("works.services")}</dt><dd>${p.services.map(tr).join(", ")}</dd>
        </dl>
        <button class="link-arrow" data-project="${p.id}">${t("works.viewProjectPhotos")} <span aria-hidden="true">→</span></button>
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

// shareable: true shows the "Copy link" button (only used by the gallery)
function openLightbox(items, index, { shareable = false } = {}) {
  if (!items.length) return;
  lb.items = items;
  lb.lastFocus = document.activeElement;
  $("#lb-copy").hidden = !shareable;
  resetCopyButton();
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
  // Remove "#photo=..." from the address bar, so reloading doesn't open the photo again
  if (location.hash.startsWith("#photo=")) history.replaceState(null, "", location.pathname + location.search);
}

/* ---------- share links to gallery photos ----------
   A link looks like  https://.../#photo=Addams/3
   = project id "Addams", photo number 3 (counting from 1).
   Opening it scrolls to the gallery and opens that photo. */

function photoLink(ph) {
  const url = new URL(location.href);
  url.hash = `photo=${encodeURIComponent(ph.project.id)}/${ph.index + 1}`;
  return url.href;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    // Older browsers: copy through a hidden text box
    const box = document.createElement("textarea");
    box.value = text;
    box.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(box);
    box.select();
    const ok = document.execCommand("copy");
    box.remove();
    if (!ok) throw e;
  }
}

let copyTimer;
function resetCopyButton() {
  clearTimeout(copyTimer);
  $("#lb-copy").classList.remove("is-done");
  $("#lb-copy-text").textContent = t("lightbox.copyLink");
}

$("#lb-copy").addEventListener("click", async () => {
  const text = $("#lb-copy-text");
  try {
    await copyText(photoLink(lb.items[lb.i]));
    text.textContent = t("lightbox.copied");
    $("#lb-copy").classList.add("is-done");
  } catch (e) {
    text.textContent = t("lightbox.copyFailed");
  }
  clearTimeout(copyTimer);
  copyTimer = setTimeout(resetCopyButton, 2000);
});

function openPhotoFromLink() {
  const match = location.hash.match(/^#photo=([^/]+)\/(\d+)$/);
  if (!match) return;
  const id = decodeURIComponent(match[1]);
  const number = Number(match[2]);

  // Show all photos, so the linked one is in the gallery
  if (galleryCat !== "All") {
    renderGallery("All");
    renderFilters();
  }
  $("#portfolio").scrollIntoView({ behavior: "instant" });

  const index = galleryItems.findIndex((ph) => ph.project.id === id && ph.index + 1 === number);
  if (index !== -1) openLightbox(galleryItems, index, { shareable: true });
}
window.addEventListener("hashchange", openPhotoFromLink);

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
  lb.img.alt = t("lightbox.photo", { title: ph.project.title, n: ph.index + 1 });
  lb.img.src = ph.src;
  lb.caption.textContent = `${ph.project.title} · ${tr(ph.project.venue)} · ${ph.project.year}`;
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

/* ---------- contact form ---------- */

// The enquiry is saved to the "inquiries" table in Supabase, where staff see it
// under the Inquiries tab. If Supabase isn't set up or can't be reached, we fall
// back to opening the visitor's email program with the message filled in.
$("#contact-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const f = new FormData(form);
  const status = $("#cf-status");
  const button = form.querySelector("button[type=submit]");

  if (f.get("website")) return; // the hidden spam trap was filled in: a bot, so ignore it

  const inquiry = {
    name: f.get("name").trim(),
    email: f.get("email").trim(),
    event_date: f.get("date") || null,
    service: f.get("type"),
    message: f.get("message").trim(),
  };

  button.disabled = true;
  status.classList.remove("is-error");
  status.textContent = t("form.sending");
  try {
    await saveInquiry(inquiry);
    form.reset();
    status.textContent = t("form.sent");
  } catch (err) {
    console.warn("Could not save enquiry, falling back to email:", err);
    status.classList.add("is-error");
    status.textContent = t("form.failed");
    openEmailFallback(form.dataset.email, inquiry);
  } finally {
    button.disabled = false;
  }
});

async function saveInquiry(inquiry) {
  const cfg = window.APP_CONFIG || {};
  const url = (cfg.supabaseUrl || "").trim().replace(/\/(rest|auth)\/v1\/?.*$/, "").replace(/\/+$/, "");
  const key = (cfg.supabaseKey || "").trim();
  if (!url || !key) throw new Error("Supabase is not configured in js/config.js");

  const res = await fetch(`${url}/rest/v1/inquiries`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(inquiry),
  });
  if (!res.ok) throw new Error(`Supabase answered ${res.status}: ${await res.text()}`);
}

function openEmailFallback(to, q) {
  const subject = `Enquiry: ${q.service}${q.event_date ? " – " + q.event_date : ""}`;
  const body = `Name: ${q.name}\nEmail: ${q.email}\nEvent date: ${q.event_date || "-"}\nService: ${q.service}\n\n${q.message}`;
  window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/* ---------- init ---------- */

// Builds everything that comes from the PROJECTS list (in the current language)
function renderProjects() {
  renderShowcase();
  renderFilters();
  renderGallery();
  renderWorks();
  applyBackgrounds();
  setupReveal();
}

renderProjects();

// The NO / EN switch (js/i18n.js) sends this event: rebuild the lists in the new language
document.addEventListener("languagechange", () => {
  renderProjects();
  setMenu(menu.classList.contains("is-open"));
  onScroll();
  if (lb.el.classList.contains("is-open")) showPhoto(lb.i);
  resetCopyButton();
});
openPhotoFromLink(); // if the page was opened from a shared photo link
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);
$("#year").textContent = new Date().getFullYear();
