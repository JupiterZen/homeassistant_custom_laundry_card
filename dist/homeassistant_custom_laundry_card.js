// x-release-please-start-version
const VERSION = "0.1.0";
// x-release-please-end

// Generic card for Home Connect washers and dryers (both expose almost
// identical entity shapes — operation_state, door, selected_program,
// power_state, remaining_program_time — this card covers both instead
// of duplicating a near-identical washer-card and dryer-card).
// Built against `homeconnect_local_hass` ("Home Connect Local") entity
// names; see smarthome/bosch/notes for the entity lists this was
// matched against. No upstream reference existed for this card (unlike
// the dishwasher-card fork), so it is a fresh build, not a fork.
const SUFFIXES = {
  connectivity: ["_connectivity", "_connection"],
  remoteStart: ["_remote_start"],
  door: ["_door"],
  operation: ["_operation_state"],
  // homeconnect_local_hass reports a remaining duration (hours), not an
  // absolute finish time — see _finish() below, which handles both.
  finish: ["_program_finish_time", "_remaining_program_time"],
  progress: ["_program_progress"],
  activeProgram: ["_active_program"],
  selectedProgram: ["_selected_program"],
  delay: ["_start_in_relative", "_start_in"],
  // Only the writable switch is mapped — not every appliance exposes
  // one (the washer here only has a read-only power_state sensor), so
  // the power button is simply hidden when it doesn't exist.
  power: ["_power"],
  stop: ["_stop_program", "_abort"],
  pause: ["_pause"],
  resume: ["_resume"],
  start: ["_start"],
  // Dryer-only. Simply absent (and hidden) on a washer's entity map.
  dryingTarget: ["_drying_target"],
  wrinkleGuard: ["_wrinkle_guard"],
  gentle: ["_gentle"],
  // Washer-only. Simply absent (and hidden) on a dryer's entity map.
  spinSpeed: ["_spin_speed"],
  washingTemperature: ["_washing_temperature"],
  prewash: ["_prewash"],
};

// Verified against the actual `selected_program` option lists reported by
// homeconnect_local_hass for a Bosch washer + dryer — the prefix has no
// underscore between "laundry" and "care" (unlike the entity_id suffix
// convention), and program names are compact, no underscores. The dryer
// additionally repeats each name 2-3x with underscores (an upstream
// Home Connect quirk, looks like merged language variants) — _programLabel()
// strips the whole prefix and leaves the rest as-is via a fallback, so an
// unmapped program still shows something readable instead of "".
const DEFAULT_PROGRAMS = {
  laundrycare_washer_program_cotton: "Cotton",
  laundrycare_washer_program_cotton_cottoneco: "Cotton Eco",
  laundrycare_washer_program_mix: "Mix",
  laundrycare_washer_program_easycare: "Easy Care",
  laundrycare_washer_program_delicatessilk: "Delicates / Silk",
  laundrycare_washer_program_wool: "Wool",
  laundrycare_washer_program_darkwash: "Dark Wash",
  laundrycare_washer_program_sensitive: "Sensitive",
  laundrycare_washer_program_shirtsblouses: "Shirts / Blouses",
  laundrycare_washer_program_drumclean: "Drum Clean",
  laundrycare_washer_program_auto30: "Auto 30°C",
  laundrycare_washer_program_auto60: "Auto 60°C",
  laundrycare_common_program_juststart: "Just Start",
  laundrycare_dryer_program_cotton_cotton_cotton: "Cotton",
  laundrycare_dryer_program_cottoneco_cottoneco_cottoneco: "Cotton Eco",
  laundrycare_dryer_program_synthetic_synthetic_synthetic: "Synthetic",
  laundrycare_dryer_program_mix_mix_mix: "Mix",
  laundrycare_dryer_program_towels_towels_towels: "Towels",
  laundrycare_dryer_program_timecold_timecold_timecold: "Timed — cold",
  laundrycare_dryer_program_timewarm_timewarm_timewarm: "Timed — warm",
  laundrycare_dryer_program_hygiene_hygiene_hygiene: "Hygiene",
  laundrycare_dryer_program_delicates_delicates_delicates: "Delicates",
  laundrycare_dryer_program_jeans_jeans_jeans: "Jeans",
  laundrycare_dryer_program_shirtblouses_shirtblouses_shirtblouses: "Shirts / Blouses",
  laundrycare_dryer_program_woolfinish_woolfinish_woolfinish: "Wool finish",
  laundrycare_dryer_program_outdoor_outdoor_sportswear: "Outdoor / Sportswear",
  laundrycare_dryer_program_silentdry_silentdry_silentdry: "Silent dry",
  laundrycare_dryer_program_super40_super40_super40: "Super 40",
  laundrycare_dryer_program_bedlinens_bedlinens_bedlinens: "Bed linens",
  laundrycare_dryer_program_coldrefresh_coldrefresh_coldrefresh: "Cold refresh",
  laundrycare_dryer_program_connecteddry: "Connected dry",
};

const TEXT = {
  de: {
    loading: "Wird geladen …",
    missing: "Keine Home-Connect-Entitäten gefunden.",
    online: "Online",
    offline: "Offline",
    remote: "Fernstart",
    noRemote: "Kein Fernstart",
    open: "Tür offen",
    closed: "Tür geschlossen",
    locked: "Verriegelt",
    progress: "Fortschritt",
    finish: "Fertig",
    program: "Programm",
    delay: "Startverzögerung",
    options: "Optionen",
    now: "Jetzt",
    active: "Aktiv",
    off: "Aus",
    powerOn: "Einschalten",
    start: "Starten",
    pause: "Pausieren",
    resumeAction: "Fortsetzen",
    stop: "Programm stoppen",
    confirm: "Laufendes Programm wirklich stoppen?",
    noProgram: "Kein Programm gewählt",
    inactive: "Inaktiv",
    ready: "Bereit",
    delayedstart: "Start geplant",
    run: "Läuft",
    pause_state: "Pausiert",
    actionrequired: "Eingriff erforderlich",
    finished: "Fertig",
    error: "Fehler",
    aborting: "Wird abgebrochen",
    unknown: "Status unbekannt",
    dryingTarget: "Trockenziel",
    wrinkleGuard: "Knitterschutz",
    gentle: "Schonend",
    spinSpeed: "Schleuderdrehzahl",
    washingTemperature: "Waschtemperatur",
    prewash: "Vorwäsche",
  },
  en: {
    loading: "Loading …",
    missing: "No Home Connect entities found.",
    online: "Online",
    offline: "Offline",
    remote: "Remote start",
    noRemote: "No remote start",
    open: "Door open",
    closed: "Door closed",
    locked: "Locked",
    progress: "Progress",
    finish: "Finish",
    program: "Program",
    delay: "Start delay",
    options: "Options",
    now: "Now",
    active: "Active",
    off: "Off",
    powerOn: "Power on",
    start: "Start",
    pause: "Pause",
    resumeAction: "Resume",
    stop: "Stop program",
    confirm: "Really stop the running program?",
    noProgram: "No program selected",
    inactive: "Inactive",
    ready: "Ready",
    delayedstart: "Scheduled",
    run: "Running",
    pause_state: "Paused",
    actionrequired: "Action required",
    finished: "Finished",
    error: "Error",
    aborting: "Aborting",
    unknown: "Unknown state",
    dryingTarget: "Drying target",
    wrinkleGuard: "Wrinkle guard",
    gentle: "Gentle",
    spinSpeed: "Spin speed",
    washingTemperature: "Washing temperature",
    prewash: "Prewash",
  },
};

class LaundryCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = null;
    this._hass = null;
    this._entities = null;
    this._discovering = false;
    this._signature = "";
  }

  static getStubConfig() {
    return { type: "custom:laundry-card", device_id: "", title: "Waschmaschine", icon: "mdi:washing-machine" };
  }

  setConfig(config) {
    if (!config?.device_id && !config?.entities) {
      throw new Error("laundry-card requires device_id or entities");
    }
    this._config = {
      title: "Waschmaschine",
      icon: "mdi:washing-machine",
      show_program: true,
      show_delay: true,
      show_options: true,
      ...config,
    };
    this._entities = config.entities ? { ...config.entities } : null;
    this._discovering = false;
    this._signature = "";
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._entities && !this._discovering && this._config?.device_id) {
      void this._discover();
    }
    const signature = this._stateSignature();
    if (signature !== this._signature) {
      this._signature = signature;
      this._render();
    }
  }

  getCardSize() { return 5; }
  getGridOptions() { return { columns: 12, min_columns: 6, rows: 5, min_rows: 4 }; }

  get _language() {
    const language = this._hass?.locale?.language || this._hass?.language || "de";
    return String(language).toLowerCase().startsWith("de") ? "de" : "en";
  }

  get _text() { return TEXT[this._language]; }

  async _discover() {
    this._discovering = true;
    this._render();
    try {
      const result = await this._hass.callWS({ type: "config/entity_registry/list_for_display" });
      const registry = Array.isArray(result) ? result : result?.entities || [];
      const SUPPORTED_PLATFORMS = ["home_connect", "home_connect_alt", "homeconnect_ws"];
      const ids = registry
        .filter((entry) => {
          const device = entry.di || entry.device_id;
          const platform = entry.pl || entry.platform;
          return device === this._config.device_id && (!platform || SUPPORTED_PLATFORMS.includes(platform));
        })
        .map((entry) => entry.ei || entry.entity_id)
        .filter(Boolean);

      // Some roles exist under two domains on the same appliance — e.g.
      // "door" as both binary_sensor (on/off) and sensor (open/closed/
      // locked, matching what _door() below expects). DOMAIN_PREFERENCE
      // picks deterministically instead of relying on registry order.
      const DOMAIN_PREFERENCE = { door: ["sensor.", "binary_sensor."] };
      this._entities = {};
      for (const [key, suffixes] of Object.entries(SUFFIXES)) {
        const matches = ids.filter((candidate) => suffixes.some((suffix) => candidate.endsWith(suffix)));
        const preference = DOMAIN_PREFERENCE[key];
        const id = preference
          ? preference.map((domain) => matches.find((m) => m.startsWith(domain))).find(Boolean) || matches[0]
          : matches[0];
        if (id) this._entities[key] = id;
      }
    } catch (error) {
      console.error("laundry-card discovery failed", error);
      this._entities = {};
    } finally {
      this._discovering = false;
      this._signature = "";
      this._render();
    }
  }

  _stateSignature() {
    if (!this._hass || !this._entities) return "";
    const relevant = {};
    for (const [key, id] of Object.entries(this._entities)) {
      const state = this._hass.states[id];
      relevant[key] = state ? [state.state, state.attributes?.options] : null;
    }
    return JSON.stringify(relevant);
  }

  _state(key) {
    const id = this._entities?.[key];
    return id ? this._hass?.states?.[id] : undefined;
  }

  _available(key) {
    const state = this._state(key);
    return Boolean(state && !["unavailable", "unknown"].includes(state.state));
  }

  _on(key) { return this._state(key)?.state === "on"; }
  _operation() { return this._state("operation")?.state || "unknown"; }
  _running() { return ["run", "pause", "delayedstart", "aborting"].includes(this._operation()); }

  _operationLabel(operation) {
    if (operation === "pause") return this._text.pause_state;
    return this._text[operation] || this._text.unknown;
  }

  _progress() {
    const value = Number(this._state("progress")?.state);
    return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : null;
  }

  _program() {
    const invalid = ["", "unknown", "unavailable", "none"];
    const active = this._state("activeProgram")?.state || "";
    if (!invalid.includes(active)) return active;
    const selected = this._state("selectedProgram")?.state || "";
    return invalid.includes(selected) ? "" : selected;
  }

  _programLabel(value) {
    if (!value) return this._text.noProgram;
    const names = { ...DEFAULT_PROGRAMS, ...(this._config.program_names || {}) };
    return names[value] || value.replace(/^laundrycare_(washer|dryer|common)_program_/, "").replaceAll("_", " ");
  }

  _finish() {
    const entity = this._state("finish");
    const value = entity?.state;
    if (!value || ["unknown", "unavailable", "none"].includes(value)) return "";
    const isDuration = entity?.attributes?.device_class === "duration" || !Number.isNaN(Number(value));
    const date = isDuration ? new Date(Date.now() + Number(value) * 3600000) : new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString(this._language === "de" ? "de-CH" : "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  _door() {
    // Handles both shapes: a sensor with open/closed/locked strings
    // (preferred, see DOMAIN_PREFERENCE in _discover()) and a plain
    // binary_sensor with on/off, in case a config maps that in manually.
    const entity = this._state("door");
    const state = entity?.state;
    const isBinary = this._entities?.door?.startsWith("binary_sensor.");
    const open = isBinary ? state === "on" : state === "open";
    if (open) return { label: this._text.open, icon: "mdi:door-open", tone: "warning" };
    if (!isBinary && state === "locked") return { label: this._text.locked, icon: "mdi:door-closed-lock", tone: "good" };
    return { label: this._text.closed, icon: "mdi:door-closed", tone: "muted" };
  }

  _escape(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  _render() {
    if (!this.shadowRoot || !this._config) return;
    if (!this._hass || this._discovering) {
      this.shadowRoot.innerHTML = this._frame(`<div class="message"><span class="spinner"></span>${this._text.loading}</div>`);
      return;
    }
    if (!this._entities || !Object.keys(this._entities).length) {
      this.shadowRoot.innerHTML = this._frame(`<div class="message error"><ha-icon icon="mdi:alert-circle-outline"></ha-icon>${this._text.missing}</div>`);
      return;
    }

    const t = this._text;
    const operation = this._operation();
    const progress = this._progress();
    const percentage = progress ?? 0;
    const circumference = 2 * Math.PI * 58;
    const offset = circumference * (1 - percentage / 100);
    const program = this._program();
    const finish = this._finish();
    const door = this._door();
    const online = this._on("connectivity");
    const remote = this._on("remoteStart");
    const running = this._running();
    const icon = this._config.icon || "mdi:washing-machine";

    this.shadowRoot.innerHTML = this._frame(`
      <div class="card" style="--accent:${this._escape(this._config.accent_color || "var(--primary-color)")}">
        <header>
          <div><div class="title">${this._escape(this._config.title)}</div><div class="subtitle">${this._escape(this._programLabel(program))}</div></div>
          ${this._state("connectivity") ? `<button class="status ${online ? "good" : "bad"}" data-info="connectivity"><span></span>${online ? t.online : t.offline}</button>` : ""}
        </header>
        <div class="hero">
          <div class="visual ${running ? "running" : ""}">
            <svg viewBox="0 0 140 140"><circle class="track" cx="70" cy="70" r="58"></circle><circle class="value" cx="70" cy="70" r="58" style="stroke-dasharray:${circumference};stroke-dashoffset:${offset}"></circle></svg>
            <div class="machine"><ha-icon icon="${icon}"></ha-icon>${running ? '<i class="b1"></i><i class="b2"></i><i class="b3"></i>' : ""}</div>
            <div class="percent"><b>${progress === null ? "—" : `${Math.round(progress)}%`}</b><small>${t.progress}</small></div>
          </div>
          <div class="summary">
            <div class="operation ${this._escape(operation)}">${this._escape(this._operationLabel(operation))}</div>
            <div class="program">${this._escape(this._programLabel(program))}</div>
            <div class="facts">
              ${finish ? `<div><ha-icon icon="mdi:clock-check-outline"></ha-icon><span><small>${t.finish}</small>${this._escape(finish)}</span></div>` : ""}
              ${this._state("door") ? `<div><ha-icon icon="${door.icon}"></ha-icon><span><small>${t.program}</small>${this._escape(door.label)}</span></div>` : ""}
            </div>
          </div>
        </div>
        <div class="pills">
          ${this._state("door") ? `<button class="pill ${door.tone}" data-info="door"><ha-icon icon="${door.icon}"></ha-icon>${this._escape(door.label)}</button>` : ""}
          ${this._state("remoteStart") ? `<button class="pill ${remote ? "good" : "muted"}" data-info="remoteStart"><ha-icon icon="${remote ? "mdi:play-network" : "mdi:play-network-outline"}"></ha-icon>${remote ? t.remote : t.noRemote}</button>` : ""}
        </div>
        ${this._programControl(running)}
        ${this._delayControl(running)}
        ${this._optionControls()}
        ${this._actions(running)}
      </div>
    `);
    this._bind();
  }

  _programControl(running) {
    if (!this._config.show_program || !this._available("selectedProgram")) return "";
    const state = this._state("selectedProgram");
    const options = state.attributes?.options || [];
    if (!options.length) return "";
    const html = options.map((value) => `<option value="${this._escape(value)}" ${value === state.state ? "selected" : ""}>${this._escape(this._programLabel(value))}</option>`).join("");
    return `<section><label><ha-icon icon="mdi:playlist-check"></ha-icon>${this._text.program}</label><div class="select"><select id="program" ${running ? "disabled" : ""}>${html}</select><ha-icon icon="mdi:chevron-down"></ha-icon></div></section>`;
  }

  _delayControl(running) {
    if (!this._config.show_delay || !this._available("delay") || running) return "";
    // homeconnect_local_hass exposes start delay as a read-only `sensor`
    // (hours), not a writable `number` (seconds) — set_value buttons only
    // make sense for the writable case.
    const id = this._entities?.delay;
    if (!id?.startsWith("number.")) return "";
    return `<section><label><ha-icon icon="mdi:clock-start"></ha-icon>${this._text.delay}</label><div class="segments"><button data-delay="0">${this._text.now}</button><button data-delay="3600">+1 h</button><button data-delay="10800">+3 h</button></div></section>`;
  }

  _optionSelectControls() {
    // Select-domain options (drying target, spin speed, washing
    // temperature) render as dropdowns rather than toggle pills, since
    // they are multi-value, not on/off.
    const definitions = [
      ["dryingTarget", this._text.dryingTarget, "mdi:tumble-dryer"],
      ["spinSpeed", this._text.spinSpeed, "mdi:speedometer"],
      ["washingTemperature", this._text.washingTemperature, "mdi:thermometer"],
      ["wrinkleGuard", this._text.wrinkleGuard, "mdi:tshirt-crew-outline"],
    ];
    return definitions
      .filter(([key]) => this._available(key) && (this._state(key).attributes?.options?.length))
      .map(([key, label, icon]) => {
        const state = this._state(key);
        const options = state.attributes.options;
        const html = options
          .map((value) => `<option value="${this._escape(value)}" ${value === state.state ? "selected" : ""}>${this._escape(value.replaceAll("_", " "))}</option>`)
          .join("");
        return `<section><label><ha-icon icon="${icon}"></ha-icon>${this._escape(label)}</label><div class="select"><select data-select="${key}">${html}</select><ha-icon icon="mdi:chevron-down"></ha-icon></div></section>`;
      })
      .join("");
  }

  _optionControls() {
    if (!this._config.show_options) return "";
    const toggleDefinitions = [
      ["gentle", this._text.gentle, "mdi:feather"],
      ["prewash", this._text.prewash, "mdi:water-outline"],
    ];
    const buttons = toggleDefinitions
      .filter(([key]) => this._available(key))
      .map(([key, label, icon]) => {
        const active = this._on(key);
        return `<button class="option ${active ? "active" : ""}" data-toggle="${key}"><ha-icon icon="${icon}"></ha-icon><span><b>${this._escape(label)}</b><small>${active ? this._text.active : this._text.off}</small></span></button>`;
      })
      .join("");
    const toggles = buttons ? `<section><label><ha-icon icon="mdi:tune-variant"></ha-icon>${this._text.options}</label><div class="options">${buttons}</div></section>` : "";
    return toggles + this._optionSelectControls();
  }

  _actions(running) {
    const power = this._available("power") && this._state("power").state !== "on";
    const start = Boolean(this._state("start")) && !running;
    const pause = Boolean(this._state("pause")) && this._operation() === "run";
    const resume = Boolean(this._state("resume")) && this._operation() === "pause";
    const stop = Boolean(this._state("stop")) && running;
    if (!power && !start && !pause && !resume && !stop) return "";
    return `<footer>
      ${power ? `<button class="action primary" data-action="power"><ha-icon icon="mdi:power"></ha-icon>${this._text.powerOn}</button>` : ""}
      ${start ? `<button class="action primary" data-action="start"><ha-icon icon="mdi:play"></ha-icon>${this._text.start}</button>` : ""}
      ${pause ? `<button class="action" data-action="pause"><ha-icon icon="mdi:pause"></ha-icon>${this._text.pause}</button>` : ""}
      ${resume ? `<button class="action primary" data-action="resume"><ha-icon icon="mdi:play"></ha-icon>${this._text.resumeAction}</button>` : ""}
      ${stop ? `<button class="action danger" data-action="stop"><ha-icon icon="mdi:stop-circle-outline"></ha-icon>${this._text.stop}</button>` : ""}
    </footer>`;
  }

  _bind() {
    this.shadowRoot.querySelectorAll("[data-info]").forEach((element) => element.addEventListener("click", () => this._moreInfo(element.dataset.info)));
    this.shadowRoot.querySelectorAll("[data-toggle]").forEach((element) => element.addEventListener("click", () => this._service("homeassistant", "toggle", { entity_id: this._entities[element.dataset.toggle] })));
    this.shadowRoot.querySelectorAll("[data-delay]").forEach((element) => element.addEventListener("click", () => this._service("number", "set_value", { entity_id: this._entities.delay, value: Number(element.dataset.delay) })));
    this.shadowRoot.querySelectorAll("[data-select]").forEach((element) => element.addEventListener("change", (event) => this._service("select", "select_option", { entity_id: this._entities[element.dataset.select], option: event.target.value })));
    this.shadowRoot.querySelector('[data-action="power"]')?.addEventListener("click", () => this._service("switch", "turn_on", { entity_id: this._entities.power }));
    this.shadowRoot.querySelector('[data-action="start"]')?.addEventListener("click", () => this._service("button", "press", { entity_id: this._entities.start }));
    this.shadowRoot.querySelector('[data-action="pause"]')?.addEventListener("click", () => this._service("button", "press", { entity_id: this._entities.pause }));
    this.shadowRoot.querySelector('[data-action="resume"]')?.addEventListener("click", () => this._service("button", "press", { entity_id: this._entities.resume }));
    this.shadowRoot.querySelector('[data-action="stop"]')?.addEventListener("click", () => {
      if (globalThis.confirm(this._text.confirm)) this._service("button", "press", { entity_id: this._entities.stop });
    });
    this.shadowRoot.getElementById("program")?.addEventListener("change", (event) => this._service("select", "select_option", { entity_id: this._entities.selectedProgram, option: event.target.value }));
  }

  _moreInfo(key) {
    const entityId = this._entities[key];
    if (!entityId) return;
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
  }

  async _service(domain, service, data) {
    try {
      await this._hass.callService(domain, service, data);
    } catch (error) {
      console.error(`laundry-card ${domain}.${service} failed`, error);
    }
  }

  _frame(content) {
    return `<style>
      :host{display:block;container-type:inline-size}ha-card{overflow:hidden}.card{padding:20px;color:var(--primary-text-color)}header{display:flex;justify-content:space-between;gap:16px;margin-bottom:12px}.title{font-size:1.25rem;font-weight:700}.subtitle,.program{color:var(--secondary-text-color);margin-top:3px}.status,.pill{border:0;border-radius:999px;background:var(--secondary-background-color);padding:7px 10px;display:inline-flex;align-items:center;gap:6px;cursor:pointer;color:inherit;white-space:nowrap}.status span{width:7px;height:7px;border-radius:50%;background:currentColor}.good{color:var(--success-color,#43a047)}.bad{color:var(--error-color,#db4437)}.warning{color:var(--warning-color,#f9a825)}.muted{color:var(--secondary-text-color)}
      .hero{display:grid;grid-template-columns:170px 1fr;align-items:center;gap:20px;padding:4px 0 16px}.visual{width:160px;height:160px;position:relative;display:grid;place-items:center;margin:auto}.visual svg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}circle{fill:none;stroke-width:8}.track{stroke:var(--divider-color)}.value{stroke:var(--accent);stroke-linecap:round;transition:stroke-dashoffset .4s}.machine{width:84px;height:84px;border-radius:26px;display:grid;place-items:center;background:var(--secondary-background-color);color:var(--accent);position:relative;box-shadow:inset 0 0 0 1px var(--divider-color)}.machine ha-icon{--mdc-icon-size:52px}.running .machine{animation:pulse 2s ease-in-out infinite}.machine i{position:absolute;border:2px solid var(--accent);border-radius:50%;opacity:0;animation:bubble 2.4s ease-in-out infinite}.b1{width:8px;height:8px;left:18px;bottom:15px}.b2{width:5px;height:5px;left:40px;bottom:10px;animation-delay:.7s!important}.b3{width:10px;height:10px;right:17px;bottom:17px;animation-delay:1.3s!important}.percent{position:absolute;bottom:-2px;background:var(--ha-card-background,var(--card-background-color));padding:2px 8px;border-radius:99px;display:flex;gap:4px;align-items:baseline}.percent small{color:var(--secondary-text-color)}.operation{font-size:1.7rem;font-weight:750}.operation.run{color:var(--success-color,#43a047)}.operation.pause,.operation.delayedstart{color:var(--warning-color,#f9a825)}.operation.error{color:var(--error-color,#db4437)}.facts{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:18px}.facts>div{display:flex;gap:8px;align-items:center}.facts ha-icon,section>label ha-icon{color:var(--accent)}.facts span{display:flex;flex-direction:column}.facts small{color:var(--secondary-text-color)}
      .pills{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px}.pill ha-icon{--mdc-icon-size:17px}section{border-top:1px solid var(--divider-color);padding-top:14px;margin-top:14px}section>label{display:flex;align-items:center;gap:7px;color:var(--secondary-text-color);font-size:.8rem;font-weight:650;margin-bottom:9px}.select{position:relative}.select select{width:100%;appearance:none;border:1px solid var(--divider-color);border-radius:12px;padding:12px 42px 12px 13px;background:var(--secondary-background-color);color:var(--primary-text-color)}.select>ha-icon{position:absolute;right:12px;top:50%;transform:translateY(-50%);pointer-events:none}.segments{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.segments button,.option{border:1px solid var(--divider-color);border-radius:11px;background:var(--secondary-background-color);color:inherit;cursor:pointer}.segments button{padding:9px}.options{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.option{padding:11px;display:flex;align-items:center;gap:10px;text-align:left}.option span{display:flex;flex-direction:column}.option small{color:var(--secondary-text-color);margin-top:2px}.option.active{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 12%,var(--secondary-background-color))}.option.active ha-icon{color:var(--accent)}footer{display:flex;gap:9px;margin-top:18px;flex-wrap:wrap}.action{flex:1;min-width:100px;border:0;border-radius:12px;min-height:44px;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:700;cursor:pointer;background:var(--secondary-background-color);color:inherit}.primary{background:var(--accent);color:var(--text-primary-color,#fff)}.danger{background:color-mix(in srgb,var(--error-color,#db4437) 14%,var(--secondary-background-color));color:var(--error-color,#db4437)}.message{min-height:120px;padding:24px;display:flex;align-items:center;justify-content:center;gap:10px;color:var(--secondary-text-color)}.error{color:var(--error-color,#db4437)}.spinner{width:24px;height:24px;border:3px solid var(--divider-color);border-top-color:var(--primary-color);border-radius:50%;animation:spin .8s linear infinite}
      @keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{50%{transform:scale(1.04)}}@keyframes bubble{0%{transform:translateY(0) scale(.6);opacity:0}25%{opacity:.8}100%{transform:translateY(-48px) scale(1.15);opacity:0}}
      @container(max-width:430px){.card{padding:16px}.hero{grid-template-columns:1fr;gap:8px}.visual{width:145px;height:145px}.summary{text-align:center}.operation{font-size:1.45rem}.facts{justify-content:center}.pills{justify-content:center}}@container(max-width:320px){.options,.facts{grid-template-columns:1fr}footer{flex-direction:column}}@media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}
    </style><ha-card>${content}</ha-card>`;
  }
}

if (!customElements.get("laundry-card")) customElements.define("laundry-card", LaundryCard);
globalThis.customCards = globalThis.customCards || [];
const matchesEntity = (entity, terms) => {
  const entityId = String(entity?.entity_id || entity || "").toLowerCase();
  const name = String(entity?.attributes?.friendly_name || entity?.name || "").toLowerCase();
  return terms.some((term) => entityId.includes(term) || name.includes(term));
};

globalThis.customCards.push({
  type: "laundry-card",
  name: "Home Connect Laundry Card",
  description: "Home Connect washer / dryer control card",
  preview: true,
  getEntitySuggestion: (hass, entityId) => {
    if (!matchesEntity(hass.states?.[entityId], ["wasmachine", "washer", "droger", "dryer", "laundrycare"])) return null;
    const device_id = hass.entities?.[entityId]?.device_id;
    if (!device_id) return null;
    return {
      config: {
        type: "custom:laundry-card",
        device_id,
      },
    };
  },
});
console.info(`%c LAUNDRY-CARD %c ${VERSION} `, "color:#fff;background:#1976d2;font-weight:700", "color:#1976d2;background:#fff;font-weight:700");
