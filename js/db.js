/* =========================================================
   Data layer: Supabase when configured, otherwise a demo
   store kept in this browser's localStorage.
   Exposes window.DB with the same API for both.
   ========================================================= */

(function () {
  const cfg = { ...(window.APP_CONFIG || {}) };
  // Accept URLs pasted with extra paths like ".../rest/v1/" — supabase-js needs only the base URL.
  cfg.supabaseUrl = (cfg.supabaseUrl || "").trim().replace(/\/(rest|auth)\/v1\/?.*$/, "").replace(/\/+$/, "");
  cfg.supabaseKey = (cfg.supabaseKey || "").trim();
  const DEMO = !(cfg.supabaseUrl && cfg.supabaseKey);

  /* ---------------- Supabase ---------------- */
  function supabaseBackend() {
    const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey);
    const check = ({ data, error }) => {
      if (error) throw new Error(error.message);
      return data;
    };
    return {
      demo: false,
      client: sb,
      async getUser() {
        const { data } = await sb.auth.getSession();
        return data.session ? data.session.user : null;
      },
      async signIn(email, password) {
        check(await sb.auth.signInWithPassword({ email, password }));
      },
      async signOut() {
        await sb.auth.signOut();
      },
      async resetPassword(email) {
        const redirectTo = new URL("login.html", location.href).href;
        check(await sb.auth.resetPasswordForEmail(email, { redirectTo }));
      },
      async setPassword(password) {
        check(await sb.auth.updateUser({ password }));
      },
      onRecovery(cb) {
        sb.auth.onAuthStateChange((event) => {
          if (event === "PASSWORD_RECOVERY") cb();
        });
      },
      async list(table) {
        const all = [];
        for (let from = 0; ; from += 1000) {
          const rows = check(await sb.from(table).select("*").range(from, from + 999));
          all.push(...rows);
          if (rows.length < 1000) break;
        }
        return all;
      },
      async insert(table, row) {
        return check(await sb.from(table).insert(row).select().single());
      },
      async update(table, id, patch) {
        return check(await sb.from(table).update(patch).eq("id", id).select().single());
      },
      async remove(table, id) {
        check(await sb.from(table).delete().eq("id", id));
      },
    };
  }

  /* ---------------- Demo (localStorage) ---------------- */
  function demoBackend() {
    const KEY = "fs-demo-db-v1";
    let mem = null;

    const uid = () =>
      (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));

    function load() {
      if (mem) return mem;
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) return (mem = JSON.parse(raw));
      } catch (e) { /* storage blocked */ }
      return (mem = seed());
    }
    function save() {
      try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* ignore */ }
    }

    function seed() {
      const day = (n) => {
        const d = new Date();
        d.setDate(d.getDate() + n);
        return d.toISOString().slice(0, 10);
      };
      const I = (o) => ({
        id: uid(), created_at: new Date().toISOString(), quantity: 1, status: "Available",
        condition: "Good", category: null, manufacturer: null, model: null, serial_number: null,
        location: "Warehouse", case_label: null, weight_kg: null, power_w: null, dmx_channels: null,
        purchase_date: null, purchase_price: null, last_service: null, next_service: null, notes: null, ...o,
      });
      const items = [
        I({ name: "Spot moving head", department: "Lighting", category: "Moving head – spot", manufacturer: "Example", model: "Spot 400", quantity: 8, case_label: "Case L1–L4", weight_kg: 24, power_w: 450, dmx_channels: 24, purchase_price: 45000, next_service: day(20) }),
        I({ name: "Wash moving head", department: "Lighting", category: "Moving head – wash", manufacturer: "Example", model: "Wash 19x15", quantity: 12, weight_kg: 14, power_w: 380, dmx_channels: 18, purchase_price: 22000, next_service: day(90) }),
        I({ name: "LED par RGBW", department: "Lighting", category: "LED par", quantity: 24, weight_kg: 3.5, power_w: 120, dmx_channels: 8, purchase_price: 2500 }),
        I({ name: "Hazer", department: "Lighting", category: "Hazer", quantity: 2, weight_kg: 12, power_w: 1000, dmx_channels: 2, purchase_price: 9000, next_service: day(-5) }),
        I({ name: "Lighting console", department: "Lighting", category: "Lighting console", serial_number: "LC-2041", weight_kg: 28, power_w: 300, purchase_price: 120000 }),
        I({ name: "Line array top", department: "Audio", category: "Line array", quantity: 12, case_label: "Dolly A1–A3", weight_kg: 32, power_w: 0, purchase_price: 38000 }),
        I({ name: "Subwoofer 2x18\"", department: "Audio", category: "Subwoofer", quantity: 6, weight_kg: 95, purchase_price: 42000 }),
        I({ name: "Amplifier 4ch", department: "Audio", category: "Amplifier", quantity: 6, weight_kg: 16, power_w: 2000, purchase_price: 35000 }),
        I({ name: "Digital mixing console", department: "Audio", category: "Mixing console", serial_number: "MX-88213", weight_kg: 22, power_w: 250, purchase_price: 95000 }),
        I({ name: "Stage monitor 12\"", department: "Audio", category: "Stage monitor", quantity: 8, weight_kg: 17, power_w: 500, purchase_price: 11000 }),
        I({ name: "Wireless handheld system", department: "Audio", category: "Wireless mic system", quantity: 8, weight_kg: 1.5, power_w: 15, purchase_price: 9500, status: "Available" }),
        I({ name: "Dynamic vocal mic", department: "Audio", category: "Microphone – dynamic", quantity: 16, weight_kg: 0.3, purchase_price: 1200 }),
        I({ name: "In-ear monitor system", department: "Audio", category: "In-ear system", quantity: 1, weight_kg: 2, power_w: 20, status: "In repair", condition: "Poor", purchase_price: 14000 }),
        I({ name: "Box truss 3m", department: "Rigging", category: "Truss", quantity: 16, weight_kg: 18, purchase_price: 4500, next_service: day(14) }),
        I({ name: "Chain hoist 500kg", department: "Rigging", category: "Chain hoist", quantity: 6, weight_kg: 32, power_w: 750, purchase_price: 28000, next_service: day(40) }),
        I({ name: "Power distro 63A", department: "Power & Cable", category: "Power distro", quantity: 2, weight_kg: 25, purchase_price: 18000, next_service: day(-12) }),
        I({ name: "DMX cable 10m", department: "Power & Cable", category: "DMX cable", quantity: 40, weight_kg: 0.6, purchase_price: 250 }),
        I({ name: "XLR cable 10m", department: "Power & Cable", category: "XLR cable", quantity: 60, weight_kg: 0.6, purchase_price: 200 }),
      ];
      const jobs = [
        { id: uid(), created_at: new Date().toISOString(), name: "Summer Festival – Main stage", client: "Festival organiser", venue: "Outdoor arena", start_date: day(6), end_date: day(8), status: "Confirmed", notes: "Load-in day before." },
        { id: uid(), created_at: new Date().toISOString(), name: "Corporate gala", client: "Corporate client", venue: "Hotel ballroom", start_date: day(-1), end_date: day(1), status: "Out", notes: null },
      ];
      const ji = (job, name, quantity) => ({ id: uid(), job_id: job.id, item_id: items.find((i) => i.name === name).id, quantity });
      const job_items = [
        ji(jobs[0], "Spot moving head", 8), ji(jobs[0], "Wash moving head", 12), ji(jobs[0], "Line array top", 12),
        ji(jobs[0], "Subwoofer 2x18\"", 6), ji(jobs[0], "Amplifier 4ch", 6), ji(jobs[0], "Box truss 3m", 12),
        ji(jobs[1], "LED par RGBW", 16), ji(jobs[1], "Wireless handheld system", 4), ji(jobs[1], "Digital mixing console", 1),
        ji(jobs[1], "XLR cable 10m", 20),
      ];
      const service_log = [
        { id: uid(), created_at: new Date().toISOString(), item_id: items[12].id, date: day(-3), type: "Repair", description: "Intermittent dropouts on receiver 2. Sent to service.", cost: null, created_by: "demo@example.com" },
        { id: uid(), created_at: new Date().toISOString(), item_id: items[0].id, date: day(-60), type: "Service", description: "Cleaned optics and fans.", cost: 0, created_by: "demo@example.com" },
      ];
      const inquiries = [
        { id: uid(), created_at: new Date().toISOString(), name: "Example Client", email: "client@example.com", event_date: day(30), service: "Lighting & audio", message: "Hi! We're planning a company party for about 200 guests and need lights and sound. Could you send us a quote?", status: "New", notes: null },
      ];
      mem = { items, jobs, job_items, service_log, inquiries };
      save();
      return mem;
    }

    const clone = (x) => JSON.parse(JSON.stringify(x));

    return {
      demo: true,
      async getUser() { return { email: "demo@example.com" }; },
      async signIn() {},
      async signOut() {},
      async resetPassword() {},
      async setPassword() {},
      onRecovery() {},
      async list(table) { return clone(load()[table] || []); },
      async insert(table, row) {
        const db = load();
        const r = { id: uid(), created_at: new Date().toISOString(), ...row };
        (db[table] ||= []).push(r);
        save();
        return clone(r);
      },
      async update(table, id, patch) {
        const r = (load()[table] || []).find((x) => x.id === id);
        if (!r) throw new Error("Not found");
        Object.assign(r, patch);
        save();
        return clone(r);
      },
      async remove(table, id) {
        const db = load();
        db[table] = (db[table] || []).filter((x) => x.id !== id);
        // mimic "on delete cascade"
        if (table === "items") {
          db.job_items = db.job_items.filter((x) => x.item_id !== id);
          db.service_log = db.service_log.filter((x) => x.item_id !== id);
        }
        if (table === "jobs") db.job_items = db.job_items.filter((x) => x.job_id !== id);
        save();
      },
      resetDemo() {
        try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
        mem = null;
      },
    };
  }

  window.DB = DEMO ? demoBackend() : supabaseBackend();
})();
