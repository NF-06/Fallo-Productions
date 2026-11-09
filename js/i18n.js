/* =========================================================
   Fallo Productions — translations (Norwegian / English)
   ---------------------------------------------------------
   EDIT THE WEBSITE TEXT HERE.

   Every text on the page has a key, like "hero.title".
   In index.html the element says data-i18n="hero.title",
   and the text shown comes from the list below, in the
   visitor's chosen language. (The Norwegian text is also
   written in index.html, but it gets replaced from here,
   so always edit it in this file.)

   - data-i18n="key"       → replaces the element's text
   - data-i18n-aria="key"  → replaces its aria-label
                             (read aloud by screen readers)
   - {name} inside a text  → filled in by the code, e.g. {n} = a number

   "terms" translates words used in the project list in
   js/main.js (categories, services, venues). If a word is
   missing here, it is shown exactly as written in main.js.
   ========================================================= */

const I18N = {
  no: {
    // Browser tab + Google
    "meta.title": "Fallo Productions — Lys- og lydproduksjon",
    "meta.description": "Fallo Productions leverer lys- og lydproduksjon til konserter, festivaler, teater og bedriftsarrangementer.",

    // Header + menu
    "lang.label": "Språk",
    "logo.home": "Fallo Productions – til toppen",
    "social.instagram": "Fallo Productions på Instagram",
    "social.facebook": "Fallo Productions på Facebook",
    "menu.label": "Hovedmeny",
    "menu.open": "Åpne meny",
    "menu.close": "Lukk meny",
    "nav.home": "Hjem",
    "nav.showcase": "Utvalgte show",
    "nav.portfolio": "Portefølje",
    "nav.works": "Tidligere arbeid",
    "nav.about": "Om oss",
    "nav.contact": "Kontakt",
    "staff.login": "Ansattinnlogging",

    // Hero
    "hero.eyebrow": "Event produksjon",
    "hero.title": "Vi skaper øyeblikk",
    "hero.lede": "Lysdesign, lyddesign og teknisk produksjon for konserter, festivaler, teater og bedriftsarrangementer.",
    "hero.cta.work": "Se arbeidet vårt",
    "hero.cta.quote": "Be om tilbud",
    "hero.scroll": "Bla ned",

    // Showcase
    "showcase.eyebrow": "Utvalgte Produksjoner",
    "showcase.title": "Siste produksjoner",
    "showcase.viewPhotos": "Se bilder",

    // Services
    "services.label": "Tjenester",
    "services.lighting.title": "Lys",
    "services.lighting.text": "Design, programmering og kjøring – fra intime scener til store arenarigger.",
    "services.audio.title": "Lyd",
    "services.audio.text": "PA-anlegg, monitorering og lydteknikk tilpasset hvert rom.",
    "services.rigging.title": "Rigg og scene",
    "services.rigging.text": "Truss, scene og strømfordeling, trygt montert.",
    "services.rental.title": "Utleie",
    "services.rental.text": "Godt vedlikeholdt lys- og lydutstyr, klart til bruk.",

    // Gallery
    "gallery.eyebrow": "Portefølje",
    "gallery.title": "Galleri",
    "gallery.text": "Et innblikk i lys og lyd fra ulike arrangementer. Velg et bilde for å se det i full størrelse.",
    "gallery.filterLabel": "Filtrer bilder",
    "gallery.all": "Alle",
    "photo.label": "{title}, bilde {n}",
    "gallery.share": "Kopier lenke til {title}, bilde {n}",
    "photo.credit": "Foto: {name}",
    "works.photographer": "Foto",

    // Previous works
    "works.eyebrow": "Tidligere arbeid",
    "works.title": "Prosjekter",
    "works.text": "Noen av produksjonene vi har levert, med bilder fra hver av dem.",
    "works.photoCount": "{n} bilder",
    "works.viewPhotosFrom": "Se bilder fra {title}",
    "works.venue": "Sted",
    "works.client": "Kunde",
    "works.services": "Tjenester",
    "works.viewProjectPhotos": "Se bilder fra prosjektet",

    // About
    "about.eyebrow": "Om oss",
    "about.title": "Menneskene bak lyset",
    "about.photoLabel": "Teamet i Fallo Productions",
    "about.p1": "Fallo Productions er et lys- og lydproduksjonsselskap basert i Mjøndalen. Vi designer, bygger og drifter den tekniske delen av konserter, festivaler, teater og bedriftsarrangementer.",
    "about.p2": "Hvert show er forskjellig, og det er hvert rom også. Vi starter med hva du vil at publikum skal føle, og planlegger lys, lyd og rigg ut fra det. Fra første skisse til siste kabel er pakket ned, forholder du deg til de samme folkene.",
    "about.cta": "Ta kontakt",

    // Contact
    "contact.eyebrow": "Kontakt",
    "contact.title": "La oss planlegge ditt neste show",
    "contact.email": "E-post",
    "contact.phone": "Telefon",
    "contact.address": "Adresse",
    "contact.orgNo": "Org.nr.",
    "form.name": "Navn",
    "form.email": "E-post",
    "form.date": "Dato for arrangementet",
    "form.type": "Hva trenger du?",
    "form.type.lighting": "Lys",
    "form.type.audio": "Lyd",
    "form.type.both": "Lys og lyd",
    "form.type.rental": "Utleie av utstyr",
    "form.type.other": "Annet",
    "form.message": "Fortell oss om arrangementet",
    "form.submit": "Send forespørsel",
    "form.sending": "Sender…",
    "form.sent": "Takk! Forespørselen din er sendt. Vi tar kontakt så snart vi kan.",
    "form.failed": "Skjemaet kunne ikke sendes. Åpner e-postprogrammet ditt i stedet…",

    // Lightbox (photo viewer)
    "lightbox.label": "Bildevisning",
    "lightbox.close": "Lukk",
    "lightbox.prev": "Forrige bilde",
    "lightbox.next": "Neste bilde",
    "lightbox.photo": "{title} — bilde {n}",
    "lightbox.copyLink": "Kopier lenke",
    "lightbox.copied": "Lenke kopiert!",
    "lightbox.copyFailed": "Kunne ikke kopiere",

    // Words used in the project list (js/main.js)
    terms: {
      "Theatre": "Teater",
      "Live Event": "Livearrangement",
      "Conferance": "Konferanse",
      "Conference": "Konferanse",
      "Concert": "Konsert",
      "Lighting design": "Lysdesign",
      "Live Lighting design": "Live-lysdesign",
      "Theatrical lighting design": "Teaterlysdesign",
      "Technical Project management": "Teknisk prosjektledelse",
      "audio production": "Lydproduksjon",
      "Outdoor custom stage": "Utendørs spesialbygd scene",
    },
  },

  en: {
    "meta.title": "Fallo Productions — Light & Audio Production",
    "meta.description": "Fallo Productions delivers lighting and audio production for concerts, festivals, theatre and corporate events.",

    "lang.label": "Language",
    "logo.home": "Fallo Productions – home",
    "social.instagram": "Fallo Productions on Instagram",
    "social.facebook": "Fallo Productions on Facebook",
    "menu.label": "Main",
    "menu.open": "Open menu",
    "menu.close": "Close menu",
    "nav.home": "Home",
    "nav.showcase": "Showcase",
    "nav.portfolio": "Portfolio",
    "nav.works": "Previous works",
    "nav.about": "About",
    "nav.contact": "Contact",
    "staff.login": "Staff login",

    "hero.eyebrow": "Event production",
    "hero.title": "We make the moment",
    "hero.lede": "Lighting design, sound design and technical production for concerts, festivals, theatre and corporate events.",
    "hero.cta.work": "See our work",
    "hero.cta.quote": "Request a quote",
    "hero.scroll": "Scroll",

    "showcase.eyebrow": "Selected shows",
    "showcase.title": "Recent productions",
    "showcase.viewPhotos": "View photos",

    "services.label": "Services",
    "services.lighting.title": "Lighting",
    "services.lighting.text": "Design, programming and operation — from intimate stages to arena rigs.",
    "services.audio.title": "Audio",
    "services.audio.text": "PA systems, monitoring and engineering tuned for every room.",
    "services.rigging.title": "Rigging & stage",
    "services.rigging.text": "Truss, staging and power distribution, safely installed.",
    "services.rental.title": "Rental",
    "services.rental.text": "Well-maintained lighting and audio equipment, ready to go.",

    "gallery.eyebrow": "Portfolio",
    "gallery.title": "Gallery",
    "gallery.text": "A look at our lighting and sound across different events. Select a photo to view it full size.",
    "gallery.filterLabel": "Filter photos",
    "gallery.all": "All",
    "photo.label": "{title}, photo {n}",
    "gallery.share": "Copy link to {title}, photo {n}",
    "photo.credit": "Photo: {name}",
    "works.photographer": "Photo",

    "works.eyebrow": "Previous works",
    "works.title": "Projects",
    "works.text": "Some of the productions we've delivered, with photos from each one.",
    "works.photoCount": "{n} photos",
    "works.viewPhotosFrom": "View photos from {title}",
    "works.venue": "Venue",
    "works.client": "Client",
    "works.services": "Services",
    "works.viewProjectPhotos": "View project photos",

    "about.eyebrow": "About",
    "about.title": "The people behind the light",
    "about.photoLabel": "The Fallo Productions team",
    "about.p1": "Fallo Productions is a lighting and audio production company based in Mjøndalen. We design, build and run the technical side of concerts, festivals, theatre and corporate events.",
    "about.p2": "Every show is different, and so is every room. We start with what you want the audience to feel, then plan the light, sound and rigging to make it happen. From the first sketch to the last cable packed away, you deal with the same people.",
    "about.cta": "Get in touch",

    "contact.eyebrow": "Contact",
    "contact.title": "Let's plan your next show",
    "contact.email": "Email",
    "contact.phone": "Phone",
    "contact.address": "Address",
    "contact.orgNo": "Org. no.",
    "form.name": "Name",
    "form.email": "Email",
    "form.date": "Event date",
    "form.type": "What do you need?",
    "form.type.lighting": "Lighting",
    "form.type.audio": "Audio",
    "form.type.both": "Lighting & audio",
    "form.type.rental": "Equipment rental",
    "form.type.other": "Other",
    "form.message": "Tell us about the event",
    "form.submit": "Send enquiry",
    "form.sending": "Sending…",
    "form.sent": "Thanks! Your enquiry has been sent. We'll get back to you soon.",
    "form.failed": "Couldn't send the form. Opening your email program instead…",

    "lightbox.label": "Photo viewer",
    "lightbox.close": "Close",
    "lightbox.prev": "Previous photo",
    "lightbox.next": "Next photo",
    "lightbox.photo": "{title} — photo {n}",
    "lightbox.copyLink": "Copy link",
    "lightbox.copied": "Link copied!",
    "lightbox.copyFailed": "Couldn't copy",

    terms: {},
  },
};

/* ---------- how it works (you normally don't need to edit below) ---------- */

const LANGS = Object.keys(I18N); // ["no", "en"]
const DEFAULT_LANG = "no";

// The visitor's earlier choice is remembered in their browser
let LANG = (() => {
  try {
    return localStorage.getItem("lang");
  } catch (e) {
    return null;
  }
})();
if (!LANGS.includes(LANG)) LANG = DEFAULT_LANG;

// t("works.photoCount", { n: 5 }) → "5 bilder"
function t(key, vars = {}) {
  const text = I18N[LANG][key] ?? I18N.en[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? "");
}

// Translate a value from the project list:
//   { no: "...", en: "..." } → the text in the current language
//   "Theatre"                → looked up in "terms" above
function tr(value) {
  if (value && typeof value === "object") return value[LANG] ?? value.en ?? value.no ?? "";
  return I18N[LANG].terms?.[value] ?? value;
}

function applyStaticText() {
  document.documentElement.lang = LANG;
  document.title = t("meta.title");
  document.querySelector('meta[name="description"]')?.setAttribute("content", t("meta.description"));
  document.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
  document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === LANG)));
}

function setLanguage(lang) {
  if (!LANGS.includes(lang) || lang === LANG) return;
  LANG = lang;
  try {
    localStorage.setItem("lang", lang);
  } catch (e) {
    /* storage blocked: the choice just isn't remembered */
  }
  applyStaticText();
  // main.js listens for this and rebuilds the project lists
  document.dispatchEvent(new CustomEvent("languagechange"));
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-lang]");
  if (btn) setLanguage(btn.dataset.lang);
});

applyStaticText();
