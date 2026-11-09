/* =========================================================
   Fallo Productions — inventory app
   Equipment, jobs (with availability + packing lists) and
   service history for lighting & audio gear.
   ========================================================= */

(async function () {
  /* ---------------- constants ---------------- */

  const DEPARTMENTS = {
    Lighting: [
      "Moving head – spot", "Moving head – wash", "Moving head – beam", "Moving head – hybrid",
      "LED par", "LED bar / batten", "Profile / ellipsoidal", "Fresnel / PC", "Blinder",
      "Strobe", "Follow spot", "Hazer", "Fog machine", "Lighting console", "DMX splitter / node", "Dimmer",
    ],
    Audio: [
      "Line array", "Point source speaker", "Subwoofer", "Stage monitor", "Amplifier",
      "Mixing console", "Stagebox", "Microphone – dynamic", "Microphone – condenser",
      "Wireless mic system", "In-ear system", "DI box", "Processor", "Playback", "Intercom",
    ],
    Rigging: ["Truss", "Chain hoist", "Clamp", "Shackle / steel", "Safety cable", "Base plate", "Stand", "Ground support"],
    "Power & Cable": [
      "Power distro", "Power cable", "Powercon cable", "XLR cable", "DMX cable",
      "Speakon cable", "Multicore", "Network cable", "Adapter",
    ],
    Video: ["Projector", "Screen", "LED wall panel", "Camera", "Video switcher", "Monitor"],
    Other: ["Flight case", "Tool", "Consumable", "Vehicle", "Other"],
  };
  const ITEM_STATUSES = ["Available", "In repair", "Lost", "Retired"];
  const CONDITIONS = ["New", "Good", "Fair", "Poor", "Broken"];
  const JOB_STATUSES = ["Planned", "Confirmed", "Out", "Returned", "Cancelled"];
  const LOG_TYPES = ["Service", "Repair", "Safety test", "Inspection", "Note"];
  const SERVICE_TYPES = ["Service", "Safety test", "Inspection"];
  const ACTIVE = (status) => ["Planned", "Confirmed", "Out"].includes(status);
  const CURRENCY = (window.APP_CONFIG || {}).currency || "NOK";

  const ITEM_FIELDS = {
    name: "text", department: "text", category: "text", manufacturer: "text", model: "text",
    serial_number: "text", quantity: "int", status: "text", condition: "text", location: "text",
    case_label: "text", weight_kg: "num", power_w: "num", dmx_channels: "int", purchase_date: "date",
    purchase_price: "num", last_service: "date", next_service: "date", notes: "text",
  };
  const JOB_FIELDS = {
    name: "text", client: "text", venue: "text", start_date: "date", end_date: "date", status: "text", notes: "text",
  };

  const BADGE = {
    Available: "green", "In repair": "amber", Lost: "red", Retired: "grey",
    Planned: "grey", Confirmed: "blue", Out: "amber", Returned: "green", Cancelled: "grey",
    New: "amber", Replied: "blue", Booked: "green", Closed: "grey",
  };
  const INQUIRY_STATUSES = ["New", "Replied", "Booked", "Closed"];

  /* ---------------- helpers ---------------- */

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const isoDate = (d = new Date()) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const today = () => isoDate();
  const addDays = (iso, n) => {
    const d = new Date(iso + "T00:00");
    d.setDate(d.getDate() + n);
    return isoDate(d);
  };
  const fmtDate = (iso) =>
    iso ? new Date(iso + "T00:00").toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "–";
  const fmtRange = (a, b) => (a === b ? fmtDate(a) : `${fmtDate(a)} – ${fmtDate(b)}`);
  const num = (n, d = 0) => new Intl.NumberFormat(undefined, { maximumFractionDigits: d }).format(n || 0);
  const money = (n) => {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: CURRENCY, maximumFractionDigits: 0 }).format(n || 0);
    } catch (e) {
      return `${num(n)} ${CURRENCY}`;
    }
  };
  const badge = (s) => `<span class="badge badge--${BADGE[s] || "grey"}">${esc(s)}</span>`;
  const sum = (arr, fn) => arr.reduce((t, x) => t + (Number(fn(x)) || 0), 0);
  const byName = (a, b) => a.name.localeCompare(b.name);
  const deptOrder = (d) => Object.keys(DEPARTMENTS).indexOf(d);
  const byDeptName = (a, b) => deptOrder(a.department) - deptOrder(b.department) || byName(a, b);

  function toast(msg, isError = false) {
    const t = $("#toast");
    (modal.open ? modal : document.body).appendChild(t);
    t.textContent = msg;
    t.classList.toggle("toast--error", isError);
    t.classList.add("show");
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove("show"), isError ? 5000 : 2600);
  }

  // Read form values, converting by type ("" → null)
  function readForm(form, fields) {
    const out = {};
    for (const [name, type] of Object.entries(fields)) {
      const el = form.elements[name];
      if (!el) continue;
      const v = el.value.trim();
      if (v === "") out[name] = null;
      else if (type === "int") out[name] = parseInt(v, 10);
      else if (type === "num") out[name] = Number(v);
      else out[name] = v;
    }
    return out;
  }

  // Form field builders
  function field(name, label, value, o = {}) {
    const id = `${o.prefix || "f"}-${name}`;
    const attrs = [
      o.required ? "required" : "",
      o.min != null ? `min="${o.min}"` : "",
      o.step ? `step="${o.step}"` : "",
      o.list ? `list="${o.list}"` : "",
      o.placeholder ? `placeholder="${esc(o.placeholder)}"` : "",
    ].join(" ");
    const control =
      o.type === "textarea"
        ? `<textarea id="${id}" name="${name}" rows="${o.rows || 3}">${esc(value)}</textarea>`
        : `<input id="${id}" name="${name}" type="${o.type || "text"}" value="${esc(value)}" ${attrs}>`;
    return `<div class="field ${o.span ? "span-" + o.span : ""}"><label for="${id}">${label}</label>${control}</div>`;
  }
  function select(name, label, options, value, o = {}) {
    const id = `${o.prefix || "f"}-${name}`;
    const opts = options
      .map((opt) => {
        const [v, text] = Array.isArray(opt) ? opt : [opt, opt];
        return `<option value="${esc(v)}" ${v === value ? "selected" : ""}>${esc(text)}</option>`;
      })
      .join("");
    return `<div class="field ${o.span ? "span-" + o.span : ""}"><label for="${id}">${label}</label><select id="${id}" name="${name}" ${o.required ? "required" : ""}>${opts}</select></div>`;
  }
  const section = (title) => `<p class="form-section">${title}</p>`;

  /* ---------------- auth ---------------- */

  const main = $("#app-main");
  const modal = $("#modal");

  let user;
  try {
    user = await DB.getUser();
  } catch (e) {
    user = null;
  }
  if (!user) {
    location.replace("login.html");
    return;
  }
  $("#user-email").textContent = user.email || "";
  if (DB.demo) $("#demo-banner").hidden = false;

  /* ---------------- state ---------------- */

  const S = { items: [], jobs: [], jobItems: [], logs: [], inquiries: [], inquiriesError: null };
  // Inquiries are loaded on their own, so the inventory still works if the
  // inquiries table hasn't been created in Supabase yet.
  try {
    S.inquiries = await DB.list("inquiries");
  } catch (err) {
    S.inquiriesError = err.message;
  }
  try {
    const [items, jobs, jobItems, logs] = await Promise.all([
      DB.list("items"), DB.list("jobs"), DB.list("job_items"), DB.list("service_log"),
    ]);
    Object.assign(S, { items, jobs, jobItems, logs });
  } catch (err) {
    main.innerHTML = `<div class="panel"><h2>Couldn't load the inventory</h2><p class="sub">${esc(err.message)}</p>
      <p class="sub">Check that the database tables are created (supabase/schema.sql) and that js/config.js is correct.</p></div>`;
    return;
  }

  const itemById = (id) => S.items.find((i) => i.id === id);
  const jobById = (id) => S.jobs.find((j) => j.id === id);
  const jobLines = (jobId) =>
    S.jobItems
      .filter((ji) => ji.job_id === jobId)
      .map((ji) => ({ ji, item: itemById(ji.item_id) }))
      .filter((l) => l.item)
      .sort((a, b) => byDeptName(a.item, b.item));

  const overlaps = (a1, a2, b1, b2) => a1 <= b2 && b1 <= a2;

  // Units of an item booked on other active jobs overlapping a date range
  function bookedQty(itemId, start, end, excludeJobId) {
    return sum(
      S.jobItems.filter((ji) => ji.item_id === itemId && ji.job_id !== excludeJobId),
      (ji) => {
        const j = jobById(ji.job_id);
        return j && ACTIVE(j.status) && overlaps(start, end, j.start_date, j.end_date) ? ji.quantity : 0;
      }
    );
  }
  const usable = (item) => (item.status === "Available" ? item.quantity : 0);
  const availableFor = (item, start, end, excludeJobId) => usable(item) - bookedQty(item.id, start, end, excludeJobId);
  const availableToday = (item) => availableFor(item, today(), today());

  function serviceState(item) {
    if (!item.next_service || ["Retired", "Lost"].includes(item.status)) return "";
    if (item.next_service < today()) return "overdue";
    if (item.next_service <= addDays(today(), 30)) return "due-soon";
    return "";
  }

  function jobTotals(jobId) {
    const lines = jobLines(jobId);
    return {
      lines: lines.length,
      units: sum(lines, (l) => l.ji.quantity),
      weight: sum(lines, (l) => l.ji.quantity * (l.item.weight_kg || 0)),
      power: sum(lines, (l) => l.ji.quantity * (l.item.power_w || 0)),
      dmx: sum(lines, (l) => l.ji.quantity * (l.item.dmx_channels || 0)),
    };
  }

  /* ---------------- routing ---------------- */

  const VIEWS = { dashboard: renderDashboard, equipment: renderEquipment, jobs: renderJobs, service: renderService, inquiries: renderInquiries };
  let view = "dashboard";
  const F = { eq: { q: "", dept: "", status: "" }, jobs: { q: "", status: "active" } };

  function route() {
    const v = location.hash.slice(1);
    view = VIEWS[v] ? v : "dashboard";
    $$(".tab").forEach((t) => t.setAttribute("aria-current", t.dataset.view === view ? "page" : "false"));
    render();
    window.scrollTo(0, 0);
  }
  function render() {
    VIEWS[view]();
    updateInquiryCount();
  }
  window.addEventListener("hashchange", route);

  /* ---------------- dashboard ---------------- */

  function stat(label, value, sub, warn) {
    return `<div class="stat ${warn ? "stat--warn" : ""}"><div class="stat__label">${label}</div><div class="stat__value">${value}</div><div class="stat__sub">${sub}</div></div>`;
  }

  function renderDashboard() {
    const t = today();
    const owned = S.items.filter((i) => !["Retired", "Lost"].includes(i.status));
    const units = sum(owned, (i) => i.quantity);
    const value = sum(owned, (i) => i.quantity * (i.purchase_price || 0));
    const out = sum(S.jobItems, (ji) => (jobById(ji.job_id)?.status === "Out" ? ji.quantity : 0));
    const repair = S.items.filter((i) => i.status === "In repair").sort(byName);
    const due = owned.filter(serviceState).sort((a, b) => a.next_service.localeCompare(b.next_service));
    const upcoming = S.jobs
      .filter((j) => ACTIVE(j.status) && j.end_date >= t)
      .sort((a, b) => a.start_date.localeCompare(b.start_date))
      .slice(0, 8);

    const depts = Object.keys(DEPARTMENTS)
      .map((d) => {
        const list = owned.filter((i) => i.department === d);
        return { d, lines: list.length, units: sum(list, (i) => i.quantity), value: sum(list, (i) => i.quantity * (i.purchase_price || 0)) };
      })
      .filter((x) => x.lines);

    main.innerHTML = `
      <div class="view-head">
        <div><p class="eyebrow">Overview</p><h1>Dashboard</h1></div>
        <div class="head-actions">
          <button class="btn btn--sm" data-action="new-item">+ Equipment</button>
          <button class="btn btn--sm btn--ghost" data-action="new-job">+ Job</button>
        </div>
      </div>
      <div class="stats">
        ${stat("Equipment", num(units), `units in ${owned.length} product lines`)}
        ${stat("Value", money(value), "by purchase price")}
        ${stat("Out on jobs", num(out), "units checked out")}
        ${stat("In repair", repair.length, repair.length === 1 ? "item" : "items", repair.length)}
        ${stat("Service due", due.length, "overdue or within 30 days", due.length)}
        ${stat("New inquiries", newInquiries(), "from the website", newInquiries())}
      </div>
      <div class="panels">
        <section class="panel">
          <h2>Upcoming jobs</h2>
          ${upcoming.length ? `<ul class="rowlist">${upcoming.map((j) => {
            const tot = jobTotals(j.id);
            return `<li><button class="row" data-job="${j.id}">
              <span><strong>${esc(j.name)}</strong><span class="sub">${fmtRange(j.start_date, j.end_date)}${j.venue ? " · " + esc(j.venue) : ""}</span></span>
              <span class="row__end">${num(tot.units)} units ${badge(j.status)}</span></button></li>`;
          }).join("")}</ul>` : `<p class="empty">No upcoming jobs.</p>`}
        </section>
        <section class="panel">
          <h2>Service due</h2>
          ${due.length ? `<ul class="rowlist">${due.slice(0, 8).map((i) => `<li><button class="row" data-item="${i.id}">
              <span><strong>${esc(i.name)}</strong><span class="sub">${esc(i.department)}${i.serial_number ? " · SN " + esc(i.serial_number) : ""}</span></span>
              <span class="row__end ${serviceState(i)}">${serviceState(i) === "overdue" ? "Overdue · " : ""}${fmtDate(i.next_service)}</span></button></li>`).join("")}</ul>`
            : `<p class="empty">Nothing due in the next 30 days.</p>`}
        </section>
        <section class="panel">
          <h2>By department</h2>
          ${depts.length ? `<div class="table-wrap"><table class="data"><thead><tr><th>Department</th><th class="num">Lines</th><th class="num">Units</th><th class="num">Value</th></tr></thead><tbody>
            ${depts.map((x) => `<tr><td>${esc(x.d)}</td><td class="num">${x.lines}</td><td class="num">${num(x.units)}</td><td class="num">${money(x.value)}</td></tr>`).join("")}
          </tbody></table></div>` : `<p class="empty">No equipment yet.</p>`}
        </section>
        <section class="panel">
          <h2>In repair</h2>
          ${repair.length ? `<ul class="rowlist">${repair.map((i) => `<li><button class="row" data-item="${i.id}">
              <span><strong>${esc(i.name)}</strong><span class="sub">${esc([i.manufacturer, i.model].filter(Boolean).join(" "))}</span></span>
              <span class="row__end">${num(i.quantity)} pcs</span></button></li>`).join("")}</ul>`
            : `<p class="empty">Nothing in repair.</p>`}
        </section>
      </div>`;
  }

  /* ---------------- equipment ---------------- */

  function renderEquipment() {
    main.innerHTML = `
      <div class="view-head">
        <div><p class="eyebrow">Inventory</p><h1>Equipment</h1></div>
        <div class="head-actions">
          <button class="btn btn--sm" data-action="new-item">+ Add equipment</button>
          <button class="btn btn--sm btn--ghost" data-action="export">Export CSV</button>
        </div>
      </div>
      <div class="toolbar">
        <input class="input" type="search" id="eq-q" placeholder="Search name, model, serial no., case…" value="${esc(F.eq.q)}" aria-label="Search equipment">
        <select class="input" id="eq-dept" aria-label="Department">
          <option value="">All departments</option>
          ${Object.keys(DEPARTMENTS).map((d) => `<option ${d === F.eq.dept ? "selected" : ""}>${esc(d)}</option>`).join("")}
        </select>
        <select class="input" id="eq-status" aria-label="Status">
          <option value="">All statuses</option>
          ${ITEM_STATUSES.map((s) => `<option ${s === F.eq.status ? "selected" : ""}>${esc(s)}</option>`).join("")}
        </select>
      </div>
      <div id="eq-table"></div>`;

    $("#eq-q").addEventListener("input", (e) => { F.eq.q = e.target.value; drawEquipmentTable(); });
    $("#eq-dept").addEventListener("change", (e) => { F.eq.dept = e.target.value; drawEquipmentTable(); });
    $("#eq-status").addEventListener("change", (e) => { F.eq.status = e.target.value; drawEquipmentTable(); });
    drawEquipmentTable();
  }

  function drawEquipmentTable() {
    const q = F.eq.q.trim().toLowerCase();
    const rows = S.items
      .filter((i) =>
        (!F.eq.dept || i.department === F.eq.dept) &&
        (!F.eq.status || i.status === F.eq.status) &&
        (!q || [i.name, i.category, i.manufacturer, i.model, i.serial_number, i.case_label, i.location]
          .some((v) => v && v.toLowerCase().includes(q))))
      .sort(byDeptName);

    $("#eq-table").innerHTML = rows.length
      ? `<p class="result-count">${rows.length} product lines · ${num(sum(rows, (i) => i.quantity))} units</p>
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Item</th><th>Department</th><th class="num">Available / qty</th><th>Status</th><th>Location / case</th><th>Next service</th></tr></thead>
          <tbody>${rows.map((i) => {
            const avail = availableToday(i);
            const st = serviceState(i);
            return `<tr class="clickable" data-item="${i.id}" tabindex="0">
              <td><strong>${esc(i.name)}</strong><span class="sub">${esc([i.manufacturer, i.model].filter(Boolean).join(" ") || "—")}${i.serial_number ? " · SN " + esc(i.serial_number) : ""}</span></td>
              <td>${esc(i.department)}<span class="sub">${esc(i.category || "")}</span></td>
              <td class="num">${num(avail)} / ${num(i.quantity)}</td>
              <td>${badge(i.status)}</td>
              <td>${esc(i.location || "—")}<span class="sub">${esc(i.case_label || "")}</span></td>
              <td class="nowrap ${st}">${fmtDate(i.next_service)}</td>
            </tr>`;
          }).join("")}</tbody>
        </table></div>`
      : `<div class="table-wrap"><p class="empty">${S.items.length ? "No equipment matches your filters." : "No equipment yet. Click “Add equipment” to register your first item."}</p></div>`;
  }

  function openItem(id) {
    const isNew = !id;
    const it = isNew
      ? { department: F.eq.dept || "Lighting", quantity: 1, status: "Available", condition: "Good" }
      : itemById(id);
    if (!it) return;

    openModal(isNew ? "New equipment" : it.name, `
      <form id="item-form" class="form-grid">
        ${field("name", "Name", it.name, { span: 2, required: true, placeholder: "e.g. Spot moving head" })}
        ${select("department", "Department", Object.keys(DEPARTMENTS), it.department)}
        ${field("category", "Type", it.category, { list: "cat-list" })}
        <datalist id="cat-list"></datalist>
        ${field("manufacturer", "Manufacturer", it.manufacturer)}
        ${field("model", "Model", it.model)}
        ${field("serial_number", "Serial number", it.serial_number, { span: 2 })}
        ${field("quantity", "Quantity", it.quantity, { type: "number", min: 0, required: true })}
        ${select("status", "Status", ITEM_STATUSES, it.status)}
        ${select("condition", "Condition", CONDITIONS, it.condition)}
        <div></div>

        ${section("Storage")}
        ${field("location", "Location", it.location, { span: 2, placeholder: "e.g. Warehouse, shelf B3" })}
        ${field("case_label", "Case / dolly", it.case_label, { span: 2, placeholder: "e.g. Case L1–L4" })}

        ${section("Technical (per unit)")}
        ${field("weight_kg", "Weight (kg)", it.weight_kg, { type: "number", min: 0, step: "any" })}
        ${field("power_w", "Power (W)", it.power_w, { type: "number", min: 0, step: "any" })}
        ${field("dmx_channels", "DMX channels", it.dmx_channels, { type: "number", min: 0 })}
        <div></div>

        ${section("Purchase & service")}
        ${field("purchase_date", "Purchase date", it.purchase_date, { type: "date" })}
        ${field("purchase_price", `Price per unit (${CURRENCY})`, it.purchase_price, { type: "number", min: 0, step: "any" })}
        ${field("last_service", "Last service / test", it.last_service, { type: "date" })}
        ${field("next_service", "Next service due", it.next_service, { type: "date" })}
        ${field("notes", "Notes", it.notes, { type: "textarea", span: 4 })}

        <div class="form-actions">
          <div>${isNew ? "" : `<button type="button" class="btn btn--sm btn--danger" id="item-delete">Delete</button>`}</div>
          <div>
            <button type="button" class="btn btn--sm btn--ghost" data-action="close-modal">Cancel</button>
            <button type="submit" class="btn btn--sm">${isNew ? "Add equipment" : "Save changes"}</button>
          </div>
        </div>
      </form>
      ${isNew ? "" : itemExtrasHTML(it)}`);

    const form = $("#item-form");
    const setCats = () => {
      $("#cat-list").innerHTML = (DEPARTMENTS[form.elements.department.value] || [])
        .map((c) => `<option value="${esc(c)}">`).join("");
    };
    setCats();
    form.elements.department.addEventListener("change", setCats);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = readForm(form, ITEM_FIELDS);
      try {
        if (isNew) {
          const row = await DB.insert("items", data);
          S.items.push(row);
          toast("Equipment added");
          openItem(row.id);
        } else {
          Object.assign(it, await DB.update("items", it.id, data));
          toast("Saved");
          closeModal();
        }
        render();
      } catch (err) {
        toast(err.message, true);
      }
    });

    if (isNew) {
      form.elements.name.focus();
      return;
    }

    $("#item-delete").addEventListener("click", async () => {
      if (!confirm(`Delete "${it.name}"?\n\nThis also removes it from all jobs and deletes its service history.`)) return;
      try {
        await DB.remove("items", it.id);
        S.items = S.items.filter((i) => i.id !== it.id);
        S.jobItems = S.jobItems.filter((ji) => ji.item_id !== it.id);
        S.logs = S.logs.filter((l) => l.item_id !== it.id);
        closeModal();
        render();
        toast("Equipment deleted");
      } catch (err) {
        toast(err.message, true);
      }
    });

    bindLogForm($("#log-form"), () => it.id, () => openItem(it.id));
    bindLogDeletes($("#item-logs"), () => openItem(it.id));
  }

  function itemExtrasHTML(it) {
    const bookings = S.jobItems
      .filter((ji) => ji.item_id === it.id)
      .map((ji) => ({ ji, job: jobById(ji.job_id) }))
      .filter((b) => b.job && ACTIVE(b.job.status) && b.job.end_date >= today())
      .sort((a, b) => a.job.start_date.localeCompare(b.job.start_date));
    const logs = S.logs.filter((l) => l.item_id === it.id).sort((a, b) => b.date.localeCompare(a.date));

    return `
      <div class="subsection">
        <div class="subsection__head"><h3>Bookings</h3><span class="sub">${num(availableToday(it))} of ${num(it.quantity)} available today</span></div>
        ${bookings.length ? `<ul class="rowlist">${bookings.map((b) => `<li><button class="row" data-job="${b.job.id}">
          <span><strong>${esc(b.job.name)}</strong><span class="sub">${fmtRange(b.job.start_date, b.job.end_date)}</span></span>
          <span class="row__end">${num(b.ji.quantity)} pcs ${badge(b.job.status)}</span></button></li>`).join("")}</ul>`
          : `<p class="sub">Not booked on any upcoming jobs.</p>`}
      </div>
      <div class="subsection">
        <div class="subsection__head"><h3>Service history</h3></div>
        <form id="log-form" class="form-grid">${logFieldsHTML()}</form>
        <div id="item-logs" style="margin-top:16px">${logTableHTML(logs, false)}</div>
      </div>`;
  }

  /* ---------------- service log ---------------- */

  function logFieldsHTML(withItemSelect = false) {
    const items = [...S.items].sort(byDeptName);
    return `
      ${withItemSelect ? select("item_id", "Equipment", [["", "Choose equipment…"], ...items.map((i) => [i.id, `${i.name}${i.serial_number ? " (SN " + i.serial_number + ")" : ""} — ${i.department}`])], "", { span: 4, prefix: "l", required: true }) : ""}
      ${field("date", "Date", today(), { type: "date", prefix: "l", required: true })}
      ${select("type", "Type", LOG_TYPES, "Service", { prefix: "l" })}
      ${field("cost", `Cost (${CURRENCY})`, "", { type: "number", min: 0, step: "any", prefix: "l" })}
      ${field("next_service", "Set next service due", "", { type: "date", prefix: "l" })}
      ${field("description", "What was done?", "", { span: 4, prefix: "l", placeholder: "e.g. Replaced lamp, cleaned fans, passed electrical safety test" })}
      <div class="form-actions"><div></div><div>
        ${withItemSelect ? `<button type="button" class="btn btn--sm btn--ghost" data-action="close-modal">Cancel</button>` : ""}
        <button type="submit" class="btn btn--sm">Add log entry</button></div></div>`;
  }

  function logTableHTML(logs, showItem) {
    if (!logs.length) return `<p class="sub">No log entries yet.</p>`;
    return `<div class="table-wrap"><table class="data">
      <thead><tr><th>Date</th>${showItem ? "<th>Equipment</th>" : ""}<th>Type</th><th>Description</th><th class="num">Cost</th><th>By</th><th></th></tr></thead>
      <tbody>${logs.map((l) => {
        const it = itemById(l.item_id);
        return `<tr>
          <td class="nowrap">${fmtDate(l.date)}</td>
          ${showItem ? `<td>${it ? `<button class="link-arrow" style="border:0;padding:0" data-item="${it.id}">${esc(it.name)}</button>` : "—"}</td>` : ""}
          <td>${esc(l.type)}</td>
          <td>${esc(l.description || "")}</td>
          <td class="num">${l.cost != null ? money(l.cost) : "–"}</td>
          <td><span class="sub">${esc(l.created_by || "")}</span></td>
          <td class="num"><button class="icon-btn" data-delete-log="${l.id}" aria-label="Delete log entry">✕</button></td>
        </tr>`;
      }).join("")}</tbody></table></div>`;
  }

  function bindLogForm(form, getItemId, after) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const itemId = getItemId();
      const item = itemById(itemId);
      if (!item) return toast("Choose the equipment first.", true);
      const f = readForm(form, { date: "date", type: "text", cost: "num", description: "text", next_service: "date" });
      try {
        const row = await DB.insert("service_log", {
          item_id: itemId, date: f.date || today(), type: f.type, description: f.description,
          cost: f.cost, created_by: user.email || null,
        });
        S.logs.push(row);
        const patch = {};
        if (SERVICE_TYPES.includes(row.type) && (!item.last_service || row.date > item.last_service)) patch.last_service = row.date;
        if (f.next_service) patch.next_service = f.next_service;
        if (Object.keys(patch).length) Object.assign(item, await DB.update("items", itemId, patch));
        toast("Log entry added");
        render();
        after();
      } catch (err) {
        toast(err.message, true);
      }
    });
  }

  function bindLogDeletes(container, after) {
    container.addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-delete-log]");
      if (!btn || !confirm("Delete this log entry?")) return;
      try {
        await DB.remove("service_log", btn.dataset.deleteLog);
        S.logs = S.logs.filter((l) => l.id !== btn.dataset.deleteLog);
        render();
        after();
      } catch (err) {
        toast(err.message, true);
      }
    });
  }

  function openLogForm() {
    openModal("New service log entry", `<form id="log-form" class="form-grid">${logFieldsHTML(true)}</form>`);
    const form = $("#log-form");
    bindLogForm(form, () => form.elements.item_id.value, closeModal);
  }

  function renderService() {
    const due = S.items.filter(serviceState).sort((a, b) => a.next_service.localeCompare(b.next_service));
    const logs = [...S.logs].sort((a, b) => b.date.localeCompare(a.date) || String(b.created_at).localeCompare(String(a.created_at)));

    main.innerHTML = `
      <div class="view-head">
        <div><p class="eyebrow">Maintenance</p><h1>Service</h1></div>
        <div class="head-actions"><button class="btn btn--sm" data-action="new-log">+ Log entry</button></div>
      </div>
      <div class="panels" style="grid-template-columns:1fr">
        <section class="panel">
          <h2>Due &amp; overdue</h2>
          ${due.length ? `<div class="table-wrap"><table class="data">
            <thead><tr><th>Equipment</th><th>Department</th><th>Last service</th><th>Next due</th></tr></thead>
            <tbody>${due.map((i) => `<tr class="clickable" data-item="${i.id}" tabindex="0">
              <td><strong>${esc(i.name)}</strong><span class="sub">${esc([i.manufacturer, i.model].filter(Boolean).join(" "))}${i.serial_number ? " · SN " + esc(i.serial_number) : ""}</span></td>
              <td>${esc(i.department)}</td>
              <td class="nowrap">${fmtDate(i.last_service)}</td>
              <td class="nowrap ${serviceState(i)}">${serviceState(i) === "overdue" ? "Overdue · " : ""}${fmtDate(i.next_service)}</td>
            </tr>`).join("")}</tbody></table></div>`
            : `<p class="empty">Nothing due in the next 30 days.</p>`}
        </section>
        <section class="panel">
          <h2>History</h2>
          <div id="all-logs">${logTableHTML(logs, true)}</div>
        </section>
      </div>`;
    bindLogDeletes($("#all-logs"), () => {});
  }

  /* ---------------- inquiries (from the website contact form) ---------------- */

  const INQUIRY_FIELDS = { status: "text", notes: "text" };
  const newInquiries = () => S.inquiries.filter((q) => q.status === "New").length;
  const inquiryById = (id) => S.inquiries.find((q) => q.id === id);
  const fmtTime = (ts) =>
    ts ? new Date(ts).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "–";

  // The little number next to the "Inquiries" tab
  function updateInquiryCount() {
    const n = newInquiries();
    const el = $("#inq-count");
    el.textContent = n;
    el.hidden = n === 0;
  }

  function renderInquiries() {
    const rows = [...S.inquiries].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    const setupHelp = S.inquiriesError
      ? `<div class="panel"><h2>Inquiries aren't set up yet</h2>
           <p class="sub">Run the "Inquiries" part of supabase/schema.sql in Supabase → SQL Editor, then reload this page.</p>
           <p class="sub">Error: ${esc(S.inquiriesError)}</p></div>`
      : "";

    main.innerHTML = `
      <div class="view-head">
        <div><p class="eyebrow">From the website</p><h1>Inquiries</h1></div>
      </div>
      ${setupHelp || (rows.length
        ? `<div class="table-wrap"><table class="data">
            <thead><tr><th>Received</th><th>From</th><th>Service</th><th>Event date</th><th>Status</th></tr></thead>
            <tbody>${rows.map((q) => `<tr class="clickable" data-inquiry="${q.id}" tabindex="0">
              <td class="nowrap">${fmtTime(q.created_at)}</td>
              <td><strong>${esc(q.name)}</strong><span class="sub">${esc(q.email)}</span></td>
              <td>${esc(q.service || "—")}</td>
              <td class="nowrap">${fmtDate(q.event_date)}</td>
              <td>${badge(q.status)}</td>
            </tr>`).join("")}</tbody></table></div>`
        : `<div class="table-wrap"><p class="empty">No inquiries yet. They appear here when someone uses the contact form on the website.</p></div>`)}`;
  }

  function openInquiry(id) {
    const q = inquiryById(id);
    if (!q) return;
    const subject = `Re: your enquiry${q.event_date ? " for " + fmtDate(q.event_date) : ""}`;
    const replyHref = `mailto:${encodeURIComponent(q.email)}?subject=${encodeURIComponent(subject)}`;

    openModal(`Inquiry from ${q.name}`, `
      <dl class="inquiry-facts">
        <dt>Received</dt><dd>${fmtTime(q.created_at)}</dd>
        <dt>Email</dt><dd><a href="mailto:${esc(q.email)}">${esc(q.email)}</a></dd>
        <dt>Service</dt><dd>${esc(q.service || "—")}</dd>
        <dt>Event date</dt><dd>${fmtDate(q.event_date)}</dd>
      </dl>
      <p class="inquiry-message">${esc(q.message)}</p>
      <form id="inquiry-form" class="form-grid">
        ${select("status", "Status", INQUIRY_STATUSES, q.status)}
        <div class="field span-3" style="align-self:end"><a class="btn btn--sm btn--ghost" href="${replyHref}">Reply by email</a></div>
        ${field("notes", "Staff notes (only visible here)", q.notes, { type: "textarea", span: 4, rows: 3 })}
        <div class="form-actions">
          <div><button type="button" class="btn btn--sm btn--danger" id="inquiry-delete">Delete</button></div>
          <div>
            <button type="button" class="btn btn--sm btn--ghost" data-action="close-modal">Close</button>
            <button type="submit" class="btn btn--sm">Save</button>
          </div>
        </div>
      </form>`);

    $("#inquiry-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        Object.assign(q, await DB.update("inquiries", q.id, readForm(e.target, INQUIRY_FIELDS)));
        closeModal();
        render();
        toast("Saved");
      } catch (err) {
        toast(err.message, true);
      }
    });

    $("#inquiry-delete").addEventListener("click", async () => {
      if (!confirm(`Delete the inquiry from ${q.name}?`)) return;
      try {
        await DB.remove("inquiries", q.id);
        S.inquiries = S.inquiries.filter((x) => x.id !== q.id);
        closeModal();
        render();
        toast("Inquiry deleted");
      } catch (err) {
        toast(err.message, true);
      }
    });
  }

  /* ---------------- jobs ---------------- */

  function renderJobs() {
    main.innerHTML = `
      <div class="view-head">
        <div><p class="eyebrow">Bookings</p><h1>Jobs</h1></div>
        <div class="head-actions"><button class="btn btn--sm" data-action="new-job">+ New job</button></div>
      </div>
      <div class="toolbar">
        <input class="input" type="search" id="job-q" placeholder="Search job, client, venue…" value="${esc(F.jobs.q)}" aria-label="Search jobs">
        <select class="input" id="job-status" aria-label="Status">
          ${[["active", "Active & upcoming"], ["all", "All jobs"], ...JOB_STATUSES.map((s) => [s, s])]
            .map(([v, t]) => `<option value="${v}" ${v === F.jobs.status ? "selected" : ""}>${t}</option>`).join("")}
        </select>
      </div>
      <div id="job-table"></div>`;
    $("#job-q").addEventListener("input", (e) => { F.jobs.q = e.target.value; drawJobsTable(); });
    $("#job-status").addEventListener("change", (e) => { F.jobs.status = e.target.value; drawJobsTable(); });
    drawJobsTable();
  }

  function drawJobsTable() {
    const q = F.jobs.q.trim().toLowerCase();
    const st = F.jobs.status;
    const rows = S.jobs
      .filter((j) =>
        (st === "all" || (st === "active" ? ACTIVE(j.status) : j.status === st)) &&
        (!q || [j.name, j.client, j.venue].some((v) => v && v.toLowerCase().includes(q))))
      .sort((a, b) => (st === "active" ? a.start_date.localeCompare(b.start_date) : b.start_date.localeCompare(a.start_date)));

    $("#job-table").innerHTML = rows.length
      ? `<div class="table-wrap"><table class="data">
          <thead><tr><th>Job</th><th>Venue</th><th>Dates</th><th>Status</th><th class="num">Units</th><th class="num">Weight</th></tr></thead>
          <tbody>${rows.map((j) => {
            const t = jobTotals(j.id);
            const conflict = hasConflict(j);
            return `<tr class="clickable" data-job="${j.id}" tabindex="0">
              <td><strong>${esc(j.name)}</strong><span class="sub">${esc(j.client || "")}</span>${conflict ? `<span class="warn-text">⚠ Not enough equipment available</span>` : ""}</td>
              <td>${esc(j.venue || "—")}</td>
              <td class="nowrap">${fmtRange(j.start_date, j.end_date)}</td>
              <td>${badge(j.status)}</td>
              <td class="num">${num(t.units)}</td>
              <td class="num">${num(t.weight)} kg</td>
            </tr>`;
          }).join("")}</tbody></table></div>`
      : `<div class="table-wrap"><p class="empty">${S.jobs.length ? "No jobs match your filters." : "No jobs yet. Click “New job” to plan your first booking."}</p></div>`;
  }

  function hasConflict(j) {
    if (!ACTIVE(j.status)) return false;
    return jobLines(j.id).some((l) => l.ji.quantity > availableFor(l.item, j.start_date, j.end_date, j.id));
  }

  function openJob(id) {
    const isNew = !id;
    const j = isNew ? { status: "Planned", start_date: today(), end_date: today() } : jobById(id);
    if (!j) return;

    openModal(isNew ? "New job" : j.name, `
      <form id="job-form" class="form-grid">
        ${field("name", "Job name", j.name, { span: 2, required: true, placeholder: "e.g. Summer festival – main stage" })}
        ${select("status", "Status", JOB_STATUSES, j.status)}
        <div></div>
        ${field("client", "Client", j.client, { span: 2 })}
        ${field("venue", "Venue", j.venue, { span: 2 })}
        ${field("start_date", "Start (incl. load-in)", j.start_date, { type: "date", required: true })}
        ${field("end_date", "End (incl. load-out)", j.end_date, { type: "date", required: true })}
        ${field("notes", "Notes", j.notes, { type: "textarea", span: 4, rows: 2 })}
        <div class="form-actions">
          <div>${isNew ? "" : `<button type="button" class="btn btn--sm btn--danger" id="job-delete">Delete</button>`}</div>
          <div>
            <button type="button" class="btn btn--sm btn--ghost" data-action="close-modal">Cancel</button>
            <button type="submit" class="btn btn--sm">${isNew ? "Create job & add equipment" : "Save changes"}</button>
          </div>
        </div>
      </form>
      ${isNew ? "" : `<div class="subsection" id="job-gear"></div>`}`);

    const form = $("#job-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = readForm(form, JOB_FIELDS);
      if (data.end_date < data.start_date) return toast("End date can't be before the start date.", true);
      try {
        if (isNew) {
          const row = await DB.insert("jobs", data);
          S.jobs.push(row);
          toast("Job created — now add equipment");
          openJob(row.id);
        } else {
          Object.assign(j, await DB.update("jobs", j.id, data));
          $("#modal-title").textContent = j.name;
          toast("Saved");
          drawJobGear(j);
        }
        render();
      } catch (err) {
        toast(err.message, true);
      }
    });

    if (isNew) {
      form.elements.name.focus();
      return;
    }

    $("#job-delete").addEventListener("click", async () => {
      if (!confirm(`Delete the job "${j.name}" and its equipment list?`)) return;
      try {
        await DB.remove("jobs", j.id);
        S.jobs = S.jobs.filter((x) => x.id !== j.id);
        S.jobItems = S.jobItems.filter((ji) => ji.job_id !== j.id);
        closeModal();
        render();
        toast("Job deleted");
      } catch (err) {
        toast(err.message, true);
      }
    });

    gearQuery = "";
    drawJobGear(j);
    bindJobGear(j);
  }

  let gearQuery = "";

  function drawJobGear(j) {
    const box = $("#job-gear");
    if (!box) return;
    const lines = jobLines(j.id);
    const t = jobTotals(j.id);
    const amps = t.power / 230;
    const quick =
      j.status === "Planned" || j.status === "Confirmed"
        ? `<button class="btn btn--sm" data-job-status="Out">Check out (mark as Out)</button>`
        : j.status === "Out"
        ? `<button class="btn btn--sm" data-job-status="Returned">Check in (mark as Returned)</button>`
        : "";

    box.innerHTML = `
      <div class="subsection__head">
        <h3>Equipment</h3>
        <div class="head-actions">
          ${quick}
          <button class="btn btn--sm btn--ghost" data-print-job ${lines.length ? "" : "disabled"}>Print packing list</button>
        </div>
      </div>
      <div class="totals">
        <div class="total"><b>${num(t.units)}</b><span>units · ${t.lines} lines</span></div>
        <div class="total"><b>${num(t.weight)} kg</b><span>total weight</span></div>
        <div class="total"><b>${num(t.power / 1000, 1)} kW</b><span>≈ ${num(amps)} A at 230 V</span></div>
        <div class="total"><b>${num(t.dmx)}</b><span>DMX channels (${Math.max(1, Math.ceil(t.dmx / 512))} universe${t.dmx > 512 ? "s" : ""})</span></div>
      </div>
      ${lines.length ? `<div class="table-wrap"><table class="data">
        <thead><tr><th>Item</th><th>Department</th><th>Qty</th><th class="num">Available for dates</th><th></th></tr></thead>
        <tbody>${lines.map(({ ji, item }) => {
          const avail = availableFor(item, j.start_date, j.end_date, j.id);
          const short = ACTIVE(j.status) && ji.quantity > avail;
          return `<tr class="${short ? "warn-row" : ""}">
            <td><strong>${esc(item.name)}</strong><span class="sub">${esc([item.manufacturer, item.model].filter(Boolean).join(" "))}${item.case_label ? " · " + esc(item.case_label) : ""}</span>
              ${short ? `<span class="warn-text">⚠ Only ${num(Math.max(0, avail))} available for these dates${item.status !== "Available" ? ` (item is ${esc(item.status.toLowerCase())})` : ""}</span>` : ""}</td>
            <td>${esc(item.department)}</td>
            <td><input class="qty-input" type="number" min="1" value="${ji.quantity}" data-line="${ji.id}" aria-label="Quantity of ${esc(item.name)}"></td>
            <td class="num">${num(Math.max(0, avail))} / ${num(item.quantity)}</td>
            <td class="num"><button class="icon-btn" data-remove-line="${ji.id}" aria-label="Remove ${esc(item.name)}">✕</button></td>
          </tr>`;
        }).join("")}</tbody></table></div>`
        : `<p class="sub">No equipment on this job yet. Search below to add some.</p>`}
      <div class="picker">
        <label for="gear-q">Add equipment</label>
        <input class="input" type="search" id="gear-q" placeholder="Search equipment by name, type, model…" value="${esc(gearQuery)}" autocomplete="off">
        <ul class="picker__results" id="gear-results"></ul>
      </div>`;
    drawGearResults(j);
  }

  function drawGearResults(j) {
    const q = gearQuery.trim().toLowerCase();
    const list = $("#gear-results");
    if (!q) {
      list.innerHTML = "";
      return;
    }
    const onJob = new Set(S.jobItems.filter((ji) => ji.job_id === j.id).map((ji) => ji.item_id));
    const matches = S.items
      .filter((i) => !["Retired", "Lost"].includes(i.status))
      .filter((i) => [i.name, i.category, i.manufacturer, i.model, i.department, i.case_label].some((v) => v && v.toLowerCase().includes(q)))
      .sort(byDeptName)
      .slice(0, 15);
    list.innerHTML = matches.length
      ? matches.map((i) => {
          const avail = Math.max(0, availableFor(i, j.start_date, j.end_date, j.id));
          return `<li>
            <span><strong>${esc(i.name)}</strong><span class="sub">${esc(i.department)}${i.category ? " · " + esc(i.category) : ""} · ${num(avail)} of ${num(i.quantity)} available${onJob.has(i.id) ? " · already on job" : ""}</span></span>
            <span class="picker__add">
              <input class="qty-input" type="number" min="1" value="${Math.min(Math.max(avail, 1), 1)}" data-add-qty="${i.id}" aria-label="Quantity">
              <button class="btn btn--xs" data-add-item="${i.id}">Add</button>
            </span></li>`;
        }).join("")
      : `<li><span class="sub">No equipment matches “${esc(gearQuery)}”.</span></li>`;
  }

  // Event handlers for the job equipment section (bound once per modal open)
  function bindJobGear(j) {
    const box = $("#job-gear");

    box.addEventListener("input", (e) => {
      if (e.target.id === "gear-q") {
        gearQuery = e.target.value;
        drawGearResults(j);
      }
    });

    box.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.matches("[data-add-qty]")) {
        e.preventDefault();
        addToJob(j, e.target.dataset.addQty, e.target.value);
      }
    });

    box.addEventListener("change", async (e) => {
      const input = e.target.closest("[data-line]");
      if (!input) return;
      const qty = parseInt(input.value, 10);
      const line = S.jobItems.find((ji) => ji.id === input.dataset.line);
      if (!line) return;
      if (!(qty >= 1)) {
        input.value = line.quantity;
        return;
      }
      try {
        Object.assign(line, await DB.update("job_items", line.id, { quantity: qty }));
        drawJobGear(j);
        render();
      } catch (err) {
        toast(err.message, true);
      }
    });

    box.addEventListener("click", async (e) => {
      const add = e.target.closest("[data-add-item]");
      const remove = e.target.closest("[data-remove-line]");
      const status = e.target.closest("[data-job-status]");
      const print = e.target.closest("[data-print-job]");
      try {
        if (add) {
          const qtyInput = box.querySelector(`[data-add-qty="${add.dataset.addItem}"]`);
          await addToJob(j, add.dataset.addItem, qtyInput ? qtyInput.value : 1);
        } else if (remove) {
          await DB.remove("job_items", remove.dataset.removeLine);
          S.jobItems = S.jobItems.filter((ji) => ji.id !== remove.dataset.removeLine);
          drawJobGear(j);
          render();
        } else if (status) {
          const next = status.dataset.jobStatus;
          if (next === "Out" && hasConflict(j) &&
              !confirm("Some equipment on this job isn't available in the requested quantity. Check out anyway?")) return;
          Object.assign(j, await DB.update("jobs", j.id, { status: next }));
          $("#job-form").elements.status.value = j.status;
          toast(next === "Out" ? "Checked out" : "Checked in");
          drawJobGear(j);
          render();
        } else if (print) {
          printPackingList(j);
        }
      } catch (err) {
        toast(err.message, true);
      }
    });
  }

  async function addToJob(j, itemId, qtyValue) {
    const qty = Math.max(1, parseInt(qtyValue, 10) || 1);
    const existing = S.jobItems.find((ji) => ji.job_id === j.id && ji.item_id === itemId);
    try {
      if (existing) {
        Object.assign(existing, await DB.update("job_items", existing.id, { quantity: existing.quantity + qty }));
      } else {
        S.jobItems.push(await DB.insert("job_items", { job_id: j.id, item_id: itemId, quantity: qty }));
      }
      const item = itemById(itemId);
      toast(`Added ${qty} × ${item ? item.name : "item"}`);
      drawJobGear(j);
      render();
      const search = $("#gear-q");
      if (search) search.focus();
    } catch (err) {
      toast(err.message, true);
    }
  }

  function printPackingList(j) {
    const lines = jobLines(j.id);
    const t = jobTotals(j.id);
    const groups = Object.keys(DEPARTMENTS)
      .map((d) => [d, lines.filter((l) => l.item.department === d)])
      .filter(([, ls]) => ls.length);

    $("#print-area").innerHTML = `
      <h1>Packing list — ${esc(j.name)}</h1>
      <p class="meta">${[j.client, j.venue].filter(Boolean).map(esc).join(" · ")}${j.client || j.venue ? " · " : ""}${fmtRange(j.start_date, j.end_date)} · Status: ${esc(j.status)}</p>
      <p class="meta">${num(t.units)} units · ${num(t.weight)} kg · ${num(t.power / 1000, 1)} kW (≈ ${num(t.power / 230)} A at 230 V) · ${num(t.dmx)} DMX channels</p>
      ${j.notes ? `<p class="meta">Notes: ${esc(j.notes)}</p>` : ""}
      ${groups.map(([d, ls]) => `
        <h2>${esc(d)}</h2>
        <table>
          <thead><tr><th class="check">Out</th><th class="check">In</th><th>Qty</th><th>Item</th><th>Model</th><th>Case</th><th>Weight</th></tr></thead>
          <tbody>${ls.map(({ ji, item }) => `<tr>
            <td></td><td></td>
            <td>${ji.quantity}</td>
            <td>${esc(item.name)}</td>
            <td>${esc([item.manufacturer, item.model].filter(Boolean).join(" "))}</td>
            <td>${esc(item.case_label || "")}</td>
            <td>${item.weight_kg ? num(ji.quantity * item.weight_kg) + " kg" : ""}</td>
          </tr>`).join("")}</tbody>
        </table>`).join("")}
      <div class="sign"><div>Packed by / date</div><div>Checked out by / date</div><div>Returned &amp; checked by / date</div></div>
      <p class="meta" style="margin-top:20px;font-size:9pt">Printed ${fmtDate(today())} · Fallo Productions</p>`;
    window.print();
  }

  /* ---------------- CSV export ---------------- */

  function exportCSV() {
    const cols = [
      ["name", "Name"], ["department", "Department"], ["category", "Type"], ["manufacturer", "Manufacturer"],
      ["model", "Model"], ["serial_number", "Serial number"], ["quantity", "Quantity"], ["status", "Status"],
      ["condition", "Condition"], ["location", "Location"], ["case_label", "Case"], ["weight_kg", "Weight kg"],
      ["power_w", "Power W"], ["dmx_channels", "DMX channels"], ["purchase_date", "Purchase date"],
      ["purchase_price", "Price per unit"], ["last_service", "Last service"], ["next_service", "Next service"], ["notes", "Notes"],
    ];
    const cell = (v) => {
      const s = String(v ?? "");
      return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = [...S.items].sort(byDeptName);
    const csv = [cols.map((c) => c[1]).join(";"), ...rows.map((r) => cols.map((c) => cell(r[c[0]])).join(";"))].join("\r\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `inventory-${today()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ---------------- modal ---------------- */

  function openModal(title, html) {
    $("#modal-title").textContent = title;
    $("#modal-body").innerHTML = html;
    if (!modal.open) modal.showModal();
    modal.scrollTop = 0;
  }
  function closeModal() {
    if (modal.open) modal.close();
  }
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  modal.addEventListener("close", () => {
    $("#modal-body").innerHTML = "";
    document.body.appendChild($("#toast"));
  });

  /* ---------------- global events ---------------- */

  document.addEventListener("click", async (e) => {
    const action = e.target.closest("[data-action]");
    if (action) {
      const a = action.dataset.action;
      if (a === "new-item") openItem();
      else if (a === "new-job") openJob();
      else if (a === "new-log") openLogForm();
      else if (a === "export") exportCSV();
      else if (a === "close-modal") closeModal();
      else if (a === "sign-out") {
        await DB.signOut();
        location.replace(DB.demo ? "index.html" : "login.html");
      } else if (a === "reset-demo" && confirm("Reset all demo data back to the example inventory?")) {
        DB.resetDemo();
        location.reload();
      }
      return;
    }
    const item = e.target.closest("[data-item]");
    if (item) return openItem(item.dataset.item);
    const job = e.target.closest("[data-job]");
    if (job) return openJob(job.dataset.job);
    const inquiry = e.target.closest("[data-inquiry]");
    if (inquiry) return openInquiry(inquiry.dataset.inquiry);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.matches("tr[data-item], tr[data-job], tr[data-inquiry]")) e.target.click();
  });

  route();
})();
