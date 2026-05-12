"use strict";

/* ════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════ */
const ICONS = [
  "✏️","📎","📏","🖊️","📌","📋","📝","🗒️",
  "⚽","🏀","🏐","🎾","🏓","🥅","🎯","🏋️",
  "🔧","🔨","🪛","🪚","🔩","⚙️","🗜️","🪝",
  "🍽️","🍴","🥄","🧂","🍲","🫙","🥡","🧃",
  "🧹","🪣","🧽","🧴","🧼","🪥","🫧","🗑️",
  "🩹","💊","🩺","🧰","🩻","🏥","💉","🌡️",
  "📦","🎒","🧳","🪜","📚","🎨","🎵","⭐",
  "🚗","⛺","🏕️","🌿","🌸","🎉","🔋","💡",
];

/* ════════════════════════════════════════════
   DEFAULT DATA  (usato solo per nuovi oratori vuoti)
════════════════════════════════════════════ */
const DEFAULT_CATS = [
  { id: "cancelleria",   label: "Cancelleria",         icon: "✏️" },
  { id: "attrezzatura",  label: "Attrezzatura sportiva",icon: "⚽" },
  { id: "attrezzi",      label: "Attrezzi",             icon: "🔧" },
  { id: "pranzo",        label: "Pranzo",               icon: "🍽️" },
  { id: "pulizie",       label: "Pulizie",              icon: "🧹" },
  { id: "primosoccorso", label: "Primo soccorso",       icon: "🩹" },
];

/*
  Item shape:
    { id, name, min, have, subitems?: [{id, name, min, have}] }

  Se `subitems` è presente e non vuoto, l'item è un "gruppo lista":
  min/have dell'item padre vengono calcolati come somma dei figli.
*/
const DEFAULT_ITEMS = {
  cancelleria: [
    { name: "Fogli bianchi", min: 100, have: 0 },
    { name: "Forbici",       min: 5,   have: 0 },
    { name: "Matite",        min: 10,  have: 0 },
    { name: "Biro",          min: 10,  have: 0 },
    { name: "Pennarelli",    min: 2,   have: 0 },
    { name: "Gomme",         min: 5,   have: 0 },
    { name: "Nastro adesivo",min: 3,   have: 0 },
  ],
  attrezzatura: [
    { name: "Palloni morbidi",    min: 4,  have: 0 },
    { name: "Pompette",           min: 2,  have: 0 },
    { name: "Cinesini",           min: 20, have: 0 },
    { name: "Nastro bianco/rosso",min: 1,  have: 0 },
    { name: "Palline biliardino", min: 6,  have: 0 },
    { name: "Spugne",             min: 5,  have: 0 },
  ],
  attrezzi: [
    { name: "Ghiaccio spray", min: 2, have: 0 },
    { name: "Cacciaviti",     min: 2, have: 0 },
    { name: "Martello",       min: 1, have: 0 },
  ],
  pranzo: [
    { name: "Scottex",      min: 10, have: 0 },
    { name: "Tovagliette",  min: 50, have: 0 },
    { name: "Forchette",    min: 50, have: 0 },
    { name: "Piatti",       min: 50, have: 0 },
    { name: "Bicchieri",    min: 50, have: 0 },
    { name: "Sacchi rifiuti",min:10, have: 0 },
  ],
  pulizie: [
    { name: "Scope",               min: 4,  have: 6  },
    { name: "Palette",             min: 3,  have: 3  },
    { name: "Moci",                min: 4,  have: 8  },
    { name: "Secchi",              min: 6,  have: 12 },
    { name: "Ammoniaca",           min: 1,  have: 1  },
    { name: "Disinfettante tavoli",min: 2,  have: 1  },
    { name: "Panni",               min: 8,  have: 10 },
    { name: "Guanti",              min: 10, have: 0  },
    { name: "Prodotto pavimenti",  min: 1,  have: 0  },
    { name: "Sapone mani",         min: 3,  have: 0  },
  ],
  primosoccorso: [
    { name: "Kit pronto soccorso", min: 1,  have: 0 },
    { name: "Cerotti assortiti",   min: 20, have: 0 },
    { name: "Garze sterili",       min: 10, have: 0 },
    { name: "Ghiaccio istantaneo", min: 5,  have: 0 },
    { name: "Disinfettante",       min: 1,  have: 0 },
  ],
};

const CAT_COLORS = [
  "#EFF6FF","#F0FDF4","#FFFBEB","#FFF0F3","#F5F0FF","#FFF1F2",
  "#F0F9FF","#FEFCE8","#F7FEE7","#FDF4FF","#FFF7ED","#F0FDFA",
];

/* ════════════════════════════════════════════
   UTILS
════════════════════════════════════════════ */
function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }
function uid() { return Math.random().toString(36).slice(2, 9); }

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function escAttr(s) { return esc(s); }

/* normalise: garantisce che ogni item abbia id e i campi corretti */
function normaliseItem(raw) {
  const item = {
    id:   raw.id   || "it_" + uid(),
    name: raw.name || "Voce",
    min:  raw.min  ?? 1,
    have: raw.have ?? 0,
  };
  if (Array.isArray(raw.subitems) && raw.subitems.length > 0) {
    item.subitems = raw.subitems.map(si => ({
      id:   si.id   || "si_" + uid(),
      name: si.name || "Sotto-voce",
      min:  si.min  ?? 0,
      have: si.have ?? 0,
    }));
  }
  return item;
}

function normaliseItems(rawArr) {
  return (rawArr || []).map(normaliseItem);
}

/* Per un item con sub-items, min/have sono la somma dei figli */
function effectiveMinHave(item) {
  if (item.subitems && item.subitems.length > 0) {
    return {
      min:  item.subitems.reduce((s, si) => s + si.min,  0),
      have: item.subitems.reduce((s, si) => s + si.have, 0),
    };
  }
  return { min: item.min, have: item.have };
}

/* ════════════════════════════════════════════
   DATA MODEL
════════════════════════════════════════════ */
/*
  state = {
    list:       string[]          — nomi oratori
    current:    string            — oratorio attivo
    categories: { [oratorio]: Cat[] }   ← PER ORATORIO
    data:       { [oratorio]: { [catId]: Item[] } }
  }

  FIX BUG 1: le categorie sono ora PER ORATORIO, non globali.
  Ogni oratorio ha la propria lista di categorie indipendente.
*/

function makeDefaultOratorioCategories() {
  return DEFAULT_CATS.map(c => ({ ...c, id: c.id }));
}

function makeDefaultOratorioData() {
  const data = {};
  DEFAULT_CATS.forEach(c => {
    data[c.id] = normaliseItems(DEFAULT_ITEMS[c.id] || []);
  });
  return data;
}

/* ════════════════════════════════════════════
   PERSISTENCE
════════════════════════════════════════════ */
const STORAGE_KEY = "toolbox_v2";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      return migrateState(s);
    }
  } catch(e) {}
  return makeDefaultState();
}

/* Migrazione da v1 (categories globali) a v2 (per oratorio) */
function migrateState(s) {
  // v2 già ha categories come oggetto
  if (s.categories && typeof s.categories === "object" && !Array.isArray(s.categories)) {
    // Normalise items
    (s.list || []).forEach(o => {
      if (s.categories[o]) {
        s.categories[o].forEach(cat => {
          if (s.data && s.data[o] && s.data[o][cat.id]) {
            s.data[o][cat.id] = normaliseItems(s.data[o][cat.id]);
          }
        });
      }
    });
    return s;
  }

  // v1: categories era un array globale
  const globalCats = Array.isArray(s.categories)
    ? s.categories
    : DEFAULT_CATS.map(c => ({ ...c }));

  const newState = {
    list:       s.list    || ["Pombio"],
    current:    s.current || "Pombio",
    categories: {},
    data:       {},
  };

  newState.list.forEach(o => {
    newState.categories[o] = deepClone(globalCats);
    newState.data[o] = {};
    globalCats.forEach(cat => {
      const rawItems = (s.data && s.data[o] && s.data[o][cat.id]) || [];
      newState.data[o][cat.id] = normaliseItems(rawItems);
    });
  });

  return newState;
}

function makeDefaultState() {
  const list = ["Pombio", "13"];
  const state = { list, current: "Pombio", categories: {}, data: {} };
  list.forEach(o => {
    state.categories[o] = makeDefaultOratorioCategories();
    state.data[o]       = makeDefaultOratorioData();
  });
  return state;
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Notifica altri tab
    bc.postMessage({ type: "state_updated" });
  } catch(e) {}
}

/* ════════════════════════════════════════════
   CONCORRENZA — BroadcastChannel
   Sincronizza tab diversi dello stesso browser.
   Per utenti diversi usare Export/Import JSON.
════════════════════════════════════════════ */
const bc = new BroadcastChannel("orabox_sync");
bc.onmessage = (e) => {
  if (e.data?.type === "state_updated") {
    // Ricarica dati dal localStorage e ri-renderizza
    const fresh = loadState();
    Object.assign(state, fresh);
    render();
    showToast("🔄 Dati aggiornati da un altro tab");
  }
};

/* ════════════════════════════════════════════
   STATE
════════════════════════════════════════════ */
let state = loadState();

// Ensure current oratorio exists
if (!state.list.includes(state.current)) state.current = state.list[0];

let openCats = new Set(
  (state.categories[state.current] || []).map(c => c.id)
);
let addingCat   = null;
let catSort     = "custom";
let itemSorts   = {}; // catId -> 'custom'|'alpha'|'qty'|'avail'

// Modal state
let modalMode   = null;
let modalTarget = null;
let selectedIcon = "📦";

// Sub-item add state
let addingSubCat  = null;
let addingSubItem = null; // item id

// Item edit state
let editingItem    = null; // { catId, itemId }
let editingSubItem = null; // { catId, itemId, subId }

/* ════════════════════════════════════════════
   ACCESSORS
════════════════════════════════════════════ */
function curCats() {
  return state.categories[state.current] || [];
}
function curData() {
  return state.data[state.current] || {};
}
function curItems(catId) {
  return curData()[catId] || [];
}

/* ════════════════════════════════════════════
   STATUS
════════════════════════════════════════════ */
function getStatus(item) {
  const { min, have } = effectiveMinHave(item);
  if (have === 0 && min > 0) return "miss";
  if (have < min)            return "warn";
  return "ok";
}

function badgeHtml(catId) {
  const items = curItems(catId);
  if (!items.length) return '<span class="cat-badge badge-ok">vuota</span>';
  const miss = items.filter(i => getStatus(i) === "miss").length;
  const warn = items.filter(i => getStatus(i) === "warn").length;
  if (miss > 0)
    return `<span class="cat-badge badge-miss">${miss} mancant${miss === 1 ? "e" : "i"}</span>`;
  if (warn > 0)
    return `<span class="cat-badge badge-warn">${warn} in scarsità</span>`;
  return `<span class="cat-badge badge-ok">tutto ok ✓</span>`;
}

/* ════════════════════════════════════════════
   RENDER
════════════════════════════════════════════ */
function render() {
  renderTabs();
  renderSummary();
  renderCategories();
}

/* ── TABS ── */
function renderTabs() {
  const el = document.getElementById("oratorio-tabs");
  el.innerHTML = state.list.map(o => {
    const active = o === state.current;
    return `<div class="oratorio-tab-wrap${active ? " active" : ""}">
      <button class="oratorio-tab" onclick="switchOratorio('${escAttr(o)}')" role="tab" aria-selected="${active}">${esc(o)}</button>
      <div class="oratorio-tab-actions">
        <button class="oratorio-tab-btn" onclick="openModalRenameOratorio('${escAttr(o)}')" title="Rinomina">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="oratorio-tab-btn del" onclick="deleteOratorio('${escAttr(o)}')" title="Elimina">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>
    </div>`;
  }).join("");
}

/* ── SUMMARY ── */
function renderSummary() {
  let tot = 0, ok = 0, warn = 0, miss = 0;
  curCats().forEach(cat => {
    curItems(cat.id).forEach(item => {
      tot++;
      const s = getStatus(item);
      if (s === "ok") ok++;
      else if (s === "warn") warn++;
      else miss++;
    });
  });
  document.getElementById("summary").innerHTML = `
    <div class="summary-card"><div class="s-num">${tot}</div><div class="s-label">Totale</div></div>
    <div class="summary-card s-ok"><div class="s-num">${ok}</div><div class="s-label">Sufficienti</div></div>
    <div class="summary-card s-warn"><div class="s-num">${warn}</div><div class="s-label">Pochi</div></div>
    <div class="summary-card s-miss"><div class="s-num">${miss}</div><div class="s-label">Mancanti</div></div>
  `;
}

/* ── CATEGORIES ── */
function getSortedCats() {
  const cats = [...curCats()];
  if (catSort === "alpha") cats.sort((a, b) => a.label.localeCompare(b.label, "it"));
  return cats;
}

function getSortedItems(catId) {
  const items = [...curItems(catId)];
  const sort = itemSorts[catId] || "custom";
  if (sort === "alpha") items.sort((a, b) => a.name.localeCompare(b.name, "it"));
  else if (sort === "qty")   items.sort((a, b) => effectiveMinHave(b).min  - effectiveMinHave(a).min);
  else if (sort === "avail") items.sort((a, b) => effectiveMinHave(b).have - effectiveMinHave(a).have);
  return items;
}

function renderCategories() {
  const container = document.getElementById("categories");
  const cats = getSortedCats();

  container.innerHTML = cats.map((cat, catIdx) => {
    const items   = getSortedItems(cat.id);
    const open    = openCats.has(cat.id);
    const currentSort = itemSorts[cat.id] || "custom";
    const color   = CAT_COLORS[catIdx % CAT_COLORS.length];

    const rows = items.map(item => {
      // find real index in original array
      const allItems = curItems(cat.id);
      const realIdx = allItems.findIndex(i => i.id === item.id);
      const s = getStatus(item);
      const rowCls  = s === "miss" ? "row-miss" : s === "warn" ? "row-warn" : "row-ok";
      const { min: effMin, have: effHave } = effectiveMinHave(item);
      const statusLabel =
        s === "ok"   ? '<span class="status-badge ok">OK ✓</span>' :
        s === "warn" ? '<span class="status-badge warn">Pochi !</span>' :
                       '<span class="status-badge miss">⚠ Mancante</span>';

      const hasSubitems = item.subitems && item.subitems.length > 0;

      // FIX BUG 3: il nome voce è cliccabile per rinominarla
      const nameCell = editingItem && editingItem.catId === cat.id && editingItem.itemId === item.id
        ? `<div class="item-name">
            <span class="item-drag-handle" title="Trascina">⠿</span>
            <input class="inline-edit-input" id="inline-edit-item-${item.id}"
              value="${escAttr(item.name)}"
              onblur="confirmRenameItem('${escAttr(cat.id)}','${escAttr(item.id)}')"
              onkeydown="if(event.key==='Enter')this.blur();if(event.key==='Escape')cancelEditItem()" />
            ${statusLabel}
           </div>`
        : `<div class="item-name">
            <span class="item-drag-handle" title="Trascina">⠿</span>
            <span class="item-name-text${hasSubitems ? " has-subs" : ""}"
              title="Clicca per rinominare"
              onclick="startEditItem('${escAttr(cat.id)}','${escAttr(item.id)}')">${esc(item.name)}</span>
            ${hasSubitems ? `<span class="sub-count">${item.subitems.length} tipi</span>` : ""}
            ${statusLabel}
           </div>`;

      // Sub-items rows
      let subRows = "";
      if (hasSubitems) {
        subRows = item.subitems.map((si, siIdx) => {
          const ss = si.have === 0 && si.min > 0 ? "miss" : si.have < si.min ? "warn" : "ok";
          const ssInputCls = ss === "ok" ? "" : ss === "warn" ? " warn" : " miss";
          const isEditingSub = editingSubItem &&
            editingSubItem.catId === cat.id &&
            editingSubItem.itemId === item.id &&
            editingSubItem.subId === si.id;

          const subNameCell = isEditingSub
            ? `<input class="inline-edit-input sub" id="inline-edit-sub-${si.id}"
                value="${escAttr(si.name)}"
                onblur="confirmRenameSubItem('${escAttr(cat.id)}','${escAttr(item.id)}','${escAttr(si.id)}')"
                onkeydown="if(event.key==='Enter')this.blur();if(event.key==='Escape')cancelEditSubItem()" />`
            : `<span class="subitem-name" title="Clicca per rinominare"
                onclick="startEditSubItem('${escAttr(cat.id)}','${escAttr(item.id)}','${escAttr(si.id)}')">${esc(si.name)}</span>`;

          return `<tr class="subitem-row ${ss === "miss" ? "row-miss" : ss === "warn" ? "row-warn" : "row-ok"}">
            <td><div class="subitem-cell">${subNameCell}</div></td>
            <td class="c"><div class="num-wrap">
              <input class="num-input" type="number" min="0" value="${si.min}"
                onchange="updateSubMin('${escAttr(cat.id)}','${escAttr(item.id)}','${escAttr(si.id)}',this.value)"
                onkeydown="if(event.key==='Enter')this.blur()" />
            </div></td>
            <td class="c"><div class="num-wrap">
              <input class="num-input${ssInputCls}" type="number" min="0" value="${si.have}"
                onchange="updateSubHave('${escAttr(cat.id)}','${escAttr(item.id)}','${escAttr(si.id)}',this.value)"
                onkeydown="if(event.key==='Enter')this.blur()" />
            </div></td>
            <td class="c">
              <button class="btn-icon danger" onclick="delSubItem('${escAttr(cat.id)}','${escAttr(item.id)}','${escAttr(si.id)}')" title="Rimuovi sotto-voce">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </td>
          </tr>`;
        }).join("");

        // Add sub-item row
        if (addingSubCat === cat.id && addingSubItem === item.id) {
          subRows += `<tr class="subitem-row add-subitem-row">
            <td colspan="4">
              <div class="add-subitem-inline">
                <input class="add-input sub" id="add-sub-input-${item.id}" placeholder="Nome tipo (es. Biro blu)…"
                  onkeydown="handleAddSubKey(event,'${escAttr(cat.id)}','${escAttr(item.id)}')" />
                <button class="btn btn-primary btn-sm" onclick="confirmAddSub('${escAttr(cat.id)}','${escAttr(item.id)}')">OK</button>
                <button class="btn btn-ghost btn-sm" onclick="cancelAddSub()">✕</button>
              </div>
            </td>
          </tr>`;
        } else {
          subRows += `<tr class="subitem-row add-subitem-trigger-row">
            <td colspan="4">
              <button class="btn-add-sub" onclick="startAddSub('${escAttr(cat.id)}','${escAttr(item.id)}')">
                + aggiungi tipo
              </button>
            </td>
          </tr>`;
        }
      }

      // Action buttons for item: rename handled inline, + convert to list, delete
      const actionBtns = `
        <button class="btn-icon" title="${hasSubitems ? "Aggiungi tipo alla lista" : "Converti in lista di tipi"}"
          onclick="${hasSubitems
            ? `startAddSub('${escAttr(cat.id)}','${escAttr(item.id)}')`
            : `convertToList('${escAttr(cat.id)}','${escAttr(item.id)}')`}">
          ${hasSubitems
            ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`}
        </button>
        <button class="btn-icon danger" onclick="delItem('${escAttr(cat.id)}','${escAttr(item.id)}')" title="Elimina voce">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>`;

      if (hasSubitems) {
        // Parent row shows totals, no editable inputs
        return `<tr class="item-row ${rowCls} item-group-header" draggable="true"
            data-cat="${escAttr(cat.id)}" data-item-id="${escAttr(item.id)}" data-idx="${realIdx}">
          <td>${nameCell}</td>
          <td class="c"><span class="total-chip">${effMin}</span></td>
          <td class="c"><span class="total-chip">${effHave}</span></td>
          <td class="c">${actionBtns}</td>
        </tr>` + subRows;
      }

      // Regular single item
      const inputCls = s === "ok" ? "" : s === "warn" ? " warn" : " miss";
      return `<tr class="item-row ${rowCls}" draggable="true"
          data-cat="${escAttr(cat.id)}" data-item-id="${escAttr(item.id)}" data-idx="${realIdx}">
        <td>${nameCell}</td>
        <td class="c"><div class="num-wrap">
          <input class="num-input" type="number" min="0" value="${item.min}"
            onchange="updateMin('${escAttr(cat.id)}','${escAttr(item.id)}',this.value)"
            onkeydown="if(event.key==='Enter')this.blur()" />
        </div></td>
        <td class="c"><div class="num-wrap">
          <input class="num-input${inputCls}" type="number" min="0" value="${item.have}"
            onchange="updateHave('${escAttr(cat.id)}','${escAttr(item.id)}',this.value)"
            onkeydown="if(event.key==='Enter')this.blur()" />
        </div></td>
        <td class="c">${actionBtns}</td>
      </tr>`;
    }).join("");

    const addRow = addingCat === cat.id
      ? `<div class="cat-footer">
          <input class="add-input" id="add-input-${cat.id}" placeholder="Nome materiale…"
            onkeydown="handleAddKey(event,'${escAttr(cat.id)}')" />
          <button class="btn btn-primary btn-sm" onclick="confirmAdd('${escAttr(cat.id)}')">OK</button>
          <button class="btn btn-ghost btn-sm" onclick="cancelAdd()">✕</button>
        </div>`
      : `<div class="cat-footer">
          <button class="btn btn-ghost" style="font-size:13px;" onclick="startAdd('${escAttr(cat.id)}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Aggiungi voce
          </button>
        </div>`;

    const sortPills = ["custom","alpha","qty","avail"].map(s => {
      const labels = { custom:"Manuale", alpha:"A→Z", qty:"Quantità", avail:"Disponibili" };
      return `<button class="item-sort-pill${currentSort === s ? " active" : ""}"
        onclick="setItemSort('${escAttr(cat.id)}','${s}')">${labels[s]}</button>`;
    }).join("");

    const itemToolbar = open ? `
      <div class="cat-item-toolbar">
        <span class="item-sort-label">Ordina:</span>
        <div class="item-sort-pills">${sortPills}</div>
      </div>` : "";

    return `<div class="cat-card" id="cat-${cat.id}"
        draggable="${catSort === "custom" ? "true" : "false"}"
        data-cat-id="${escAttr(cat.id)}">
      <div class="cat-header" onclick="toggleCat('${escAttr(cat.id)}')" role="button" tabindex="0"
        aria-expanded="${open}"
        onkeydown="if(event.key==='Enter'||event.key===' ')toggleCat('${escAttr(cat.id)}')">
        ${catSort === "custom" ? `<span class="drag-handle" onclick="event.stopPropagation()" title="Trascina">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
        </span>` : ""}
        <div class="cat-icon" style="background:${color};">${cat.icon}</div>
        <span class="cat-title">${esc(cat.label)}</span>
        <span class="cat-meta">${items.length} voci</span>
        ${badgeHtml(cat.id)}
        <div class="cat-actions" onclick="event.stopPropagation()">
          <button class="btn-icon" onclick="openModalEditCat('${escAttr(cat.id)}')" title="Modifica categoria">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon danger" onclick="deleteCat('${escAttr(cat.id)}')" title="Elimina categoria">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
        <div class="chevron${open ? " open" : ""}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
      ${open ? `
        ${itemToolbar}
        <div class="cat-body" id="cat-body-${cat.id}">
          <table class="items-table">
            <thead><tr>
              <th>Materiale</th>
              <th class="c">Min. necessario</th>
              <th class="c">Disponibili</th>
              <th class="c"></th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
          ${addRow}
        </div>` : ""}
    </div>`;
  }).join("");

  // Focus add inputs
  if (addingCat) {
    const inp = document.getElementById("add-input-" + addingCat);
    if (inp) inp.focus();
  }
  if (addingSubItem) {
    const inp = document.getElementById("add-sub-input-" + addingSubItem);
    if (inp) inp.focus();
  }
  if (editingItem) {
    const inp = document.getElementById("inline-edit-item-" + editingItem.itemId);
    if (inp) { inp.focus(); inp.select(); }
  }
  if (editingSubItem) {
    const inp = document.getElementById("inline-edit-sub-" + editingSubItem.subId);
    if (inp) { inp.focus(); inp.select(); }
  }

  setupCatDrag();
  setupItemDrag();
}

/* ════════════════════════════════════════════
   DRAG & DROP — CATEGORIES
════════════════════════════════════════════ */
let dragCatId = null;

function setupCatDrag() {
  if (catSort !== "custom") return;
  document.querySelectorAll(".cat-card").forEach(card => {
    card.addEventListener("dragstart", e => {
      dragCatId = card.dataset.catId;
      card.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      document.querySelectorAll(".cat-card").forEach(c => c.classList.remove("drag-over"));
      dragCatId = null;
    });
    card.addEventListener("dragover", e => {
      e.preventDefault();
      if (card.dataset.catId !== dragCatId) card.classList.add("drag-over");
    });
    card.addEventListener("dragleave", () => card.classList.remove("drag-over"));
    card.addEventListener("drop", e => {
      e.preventDefault();
      card.classList.remove("drag-over");
      const fromId = dragCatId, toId = card.dataset.catId;
      if (fromId && fromId !== toId) reorderCats(fromId, toId);
    });
  });
}

function reorderCats(fromId, toId) {
  const cats = state.categories[state.current];
  const fi = cats.findIndex(c => c.id === fromId);
  const ti = cats.findIndex(c => c.id === toId);
  if (fi < 0 || ti < 0) return;
  const [moved] = cats.splice(fi, 1);
  cats.splice(ti, 0, moved);
  save();
  renderCategories();
}

/* ════════════════════════════════════════════
   DRAG & DROP — ITEMS
════════════════════════════════════════════ */
let dragItemCat = null;
let dragItemId  = null;

function setupItemDrag() {
  document.querySelectorAll(".item-row[draggable=true]").forEach(row => {
    row.addEventListener("dragstart", e => {
      dragItemCat = row.dataset.cat;
      dragItemId  = row.dataset.itemId;
      row.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    row.addEventListener("dragend", () => {
      row.classList.remove("dragging");
      document.querySelectorAll(".item-row").forEach(r => r.classList.remove("drag-over-row"));
      dragItemCat = null;
      dragItemId  = null;
    });
    row.addEventListener("dragover", e => {
      e.preventDefault();
      if (row.dataset.cat === dragItemCat) row.classList.add("drag-over-row");
    });
    row.addEventListener("dragleave", () => row.classList.remove("drag-over-row"));
    row.addEventListener("drop", e => {
      e.preventDefault();
      row.classList.remove("drag-over-row");
      const toId = row.dataset.itemId;
      if (dragItemCat === row.dataset.cat && dragItemId !== toId) {
        reorderItems(dragItemCat, dragItemId, toId);
      }
    });
  });
}

function reorderItems(catId, fromId, toId) {
  const items = curItems(catId);
  const fi = items.findIndex(i => i.id === fromId);
  const ti = items.findIndex(i => i.id === toId);
  if (fi < 0 || ti < 0) return;
  const [moved] = items.splice(fi, 1);
  items.splice(ti, 0, moved);
  itemSorts[catId] = "custom";
  save();
  renderCategories();
}

/* ════════════════════════════════════════════
   SORTING
════════════════════════════════════════════ */
function setCatSort(s) {
  catSort = s;
  document.querySelectorAll("#cat-sort-pills .sort-pill").forEach(b => {
    b.classList.toggle("active", b.textContent.includes(s === "alpha" ? "A" : "Manuale"));
  });
  renderCategories();
}
function setItemSort(catId, s) {
  itemSorts[catId] = s;
  renderCategories();
}

/* ════════════════════════════════════════════
   ORATORIO ACTIONS
════════════════════════════════════════════ */
function switchOratorio(name) {
  state.current = name;
  openCats = new Set((state.categories[name] || []).map(c => c.id));
  save();
  render();
}

function deleteOratorio(name) {
  if (state.list.length <= 1) { showToast("Devi avere almeno un oratorio"); return; }
  if (!confirm(`Eliminare "${name}" e tutti i suoi dati?`)) return;
  state.list = state.list.filter(o => o !== name);
  delete state.data[name];
  delete state.categories[name];
  if (state.current === name) state.current = state.list[0];
  save();
  render();
  showToast(`"${name}" eliminato`);
}

function openModalAddOratorio() {
  modalMode = "add-oratorio";
  modalTarget = null;
  document.getElementById("modal-oratorio-title").textContent = "Nuovo oratorio";
  document.getElementById("modal-oratorio-icon").textContent  = "🏫";
  document.getElementById("btn-confirm-oratorio").textContent = "Aggiungi";
  document.getElementById("input-oratorio-name").value = "";
  openModal("modal-oratorio");
}

function openModalRenameOratorio(name) {
  modalMode   = "rename-oratorio";
  modalTarget = name;
  document.getElementById("modal-oratorio-title").textContent = "Rinomina oratorio";
  document.getElementById("modal-oratorio-icon").textContent  = "✏️";
  document.getElementById("btn-confirm-oratorio").textContent = "Salva";
  document.getElementById("input-oratorio-name").value = name;
  openModal("modal-oratorio");
}

function confirmOratorio() {
  const name = document.getElementById("input-oratorio-name").value.trim();
  if (!name) return;
  if (modalMode === "add-oratorio") {
    if (state.list.includes(name)) { showToast("Oratorio già esistente"); return; }
    state.list.push(name);
    // FIX BUG 1: ogni oratorio riceve una propria copia profonda di categorie e dati
    state.categories[name] = makeDefaultOratorioCategories();
    state.data[name]       = makeDefaultOratorioData();
    state.current = name;
    openCats = new Set(state.categories[name].map(c => c.id));
    showToast(`Oratorio "${name}" creato 🎉`);
  } else {
    const old = modalTarget;
    if (name === old) { closeAllModals(); return; }
    if (state.list.includes(name)) { showToast("Nome già in uso"); return; }
    const idx = state.list.indexOf(old);
    state.list[idx]        = name;
    state.data[name]       = state.data[old];
    state.categories[name] = state.categories[old];
    delete state.data[old];
    delete state.categories[old];
    if (state.current === old) state.current = name;
    showToast(`Rinominato in "${name}"`);
  }
  save();
  closeAllModals();
  render();
}

/* ════════════════════════════════════════════
   CATEGORY ACTIONS
════════════════════════════════════════════ */
function openModalAddCat() {
  modalMode   = "add-cat";
  modalTarget = null;
  selectedIcon = "📦";
  document.getElementById("modal-cat-title").textContent   = "Nuova categoria";
  document.getElementById("modal-cat-preview").textContent = "📦";
  document.getElementById("input-cat-name").value = "";
  buildIconPicker();
  openModal("modal-cat");
}

function openModalEditCat(catId) {
  modalMode   = "edit-cat";
  modalTarget = catId;
  const cat = curCats().find(c => c.id === catId);
  if (!cat) return;
  selectedIcon = cat.icon;
  document.getElementById("modal-cat-title").textContent   = "Modifica categoria";
  document.getElementById("modal-cat-preview").textContent = cat.icon;
  document.getElementById("input-cat-name").value = cat.label;
  buildIconPicker();
  openModal("modal-cat");
}

function buildIconPicker() {
  const el = document.getElementById("icon-picker");
  el.innerHTML = ICONS.map(ic =>
    `<button class="icon-btn${ic === selectedIcon ? " selected" : ""}" onclick="selectIcon('${ic}')">${ic}</button>`
  ).join("");
}

function selectIcon(ic) {
  selectedIcon = ic;
  document.getElementById("modal-cat-preview").textContent = ic;
  document.querySelectorAll(".icon-btn").forEach(b =>
    b.classList.toggle("selected", b.textContent === ic)
  );
}

function confirmCat() {
  const name = document.getElementById("input-cat-name").value.trim();
  if (!name) return;
  if (modalMode === "add-cat") {
    const id = "cat_" + uid();
    // FIX BUG 1: categoria aggiunta SOLO all'oratorio corrente
    state.categories[state.current].push({ id, label: name, icon: selectedIcon });
    if (!state.data[state.current][id]) state.data[state.current][id] = [];
    openCats.add(id);
    showToast(`Categoria "${name}" aggiunta`);
  } else {
    const cat = curCats().find(c => c.id === modalTarget);
    if (cat) { cat.label = name; cat.icon = selectedIcon; }
    showToast("Categoria aggiornata");
  }
  save();
  closeAllModals();
  render();
}

function deleteCat(catId) {
  const cat = curCats().find(c => c.id === catId);
  if (!cat) return;
  if (!confirm(`Eliminare la categoria "${cat.label}" e tutte le sue voci?`)) return;
  state.categories[state.current] = curCats().filter(c => c.id !== catId);
  delete state.data[state.current][catId];
  openCats.delete(catId);
  save();
  render();
  showToast(`Categoria "${cat.label}" eliminata`);
}

function toggleCat(id) {
  if (openCats.has(id)) openCats.delete(id);
  else openCats.add(id);
  renderCategories();
}

/* ════════════════════════════════════════════
   ITEM ACTIONS — FIX BUG 2 (usa id, non indice)
════════════════════════════════════════════ */
function getItem(catId, itemId) {
  return curItems(catId).find(i => i.id === itemId);
}

function updateMin(catId, itemId, val) {
  const item = getItem(catId, itemId);
  if (!item) return;
  item.min = Math.max(0, parseInt(val) || 0);
  save(); renderSummary(); renderCategories();
}

function updateHave(catId, itemId, val) {
  const item = getItem(catId, itemId);
  if (!item) return;
  item.have = Math.max(0, parseInt(val) || 0);
  save(); renderSummary(); renderCategories();
}

function delItem(catId, itemId) {
  const items = curItems(catId);
  const idx = items.findIndex(i => i.id === itemId);
  if (idx < 0) return;
  const name = items[idx].name;
  items.splice(idx, 1);
  save(); render();
  showToast(`"${name}" eliminato`);
}

function startAdd(catId) {
  addingCat = catId;
  openCats.add(catId);
  renderCategories();
}
function cancelAdd() { addingCat = null; renderCategories(); }

function confirmAdd(catId) {
  const inp  = document.getElementById("add-input-" + catId);
  const name = (inp ? inp.value : "").trim();
  if (!name) { cancelAdd(); return; }
  if (!curData()[catId]) curData()[catId] = [];
  curData()[catId].push(normaliseItem({ name, min: 1, have: 0 }));
  addingCat = null;
  save(); render();
  showToast(`"${name}" aggiunto`);
}

function handleAddKey(e, catId) {
  if (e.key === "Enter")  confirmAdd(catId);
  if (e.key === "Escape") cancelAdd();
}

/* ── FIX BUG 3: rinomina voce inline ── */
function startEditItem(catId, itemId) {
  editingItem    = { catId, itemId };
  editingSubItem = null;
  renderCategories();
}
function cancelEditItem() {
  editingItem = null;
  renderCategories();
}
function confirmRenameItem(catId, itemId) {
  const inp  = document.getElementById("inline-edit-item-" + itemId);
  const name = (inp ? inp.value : "").trim();
  const item = getItem(catId, itemId);
  if (item && name) item.name = name;
  editingItem = null;
  save(); renderCategories();
}

/* ── Sub-item rename inline ── */
function startEditSubItem(catId, itemId, subId) {
  editingSubItem = { catId, itemId, subId };
  editingItem    = null;
  renderCategories();
}
function cancelEditSubItem() {
  editingSubItem = null;
  renderCategories();
}
function confirmRenameSubItem(catId, itemId, subId) {
  const inp  = document.getElementById("inline-edit-sub-" + subId);
  const name = (inp ? inp.value : "").trim();
  const item = getItem(catId, itemId);
  if (item && item.subitems) {
    const si = item.subitems.find(s => s.id === subId);
    if (si && name) si.name = name;
  }
  editingSubItem = null;
  save(); renderCategories();
}

/* ════════════════════════════════════════════
   FIX BUG 2 — SUB-ITEM FEATURE
   Converti una voce semplice in lista di tipi
════════════════════════════════════════════ */
function convertToList(catId, itemId) {
  const item = getItem(catId, itemId);
  if (!item) return;
  // L'item originale diventa il primo sotto-tipo
  item.subitems = [
    { id: "si_" + uid(), name: item.name + " (tipo 1)", min: item.min, have: item.have }
  ];
  // min/have sull'item padre non si usano più (calcolati dai figli)
  item.min  = 0;
  item.have = 0;
  save(); render();
  // Apri subito l'aggiunta del secondo tipo
  addingSubCat  = catId;
  addingSubItem = itemId;
  openCats.add(catId);
  renderCategories();
  showToast(`"${item.name}" convertito in lista — aggiungi i tipi`);
}

function startAddSub(catId, itemId) {
  addingSubCat  = catId;
  addingSubItem = itemId;
  openCats.add(catId);
  renderCategories();
}
function cancelAddSub() {
  addingSubCat  = null;
  addingSubItem = null;
  renderCategories();
}
function confirmAddSub(catId, itemId) {
  const inp  = document.getElementById("add-sub-input-" + itemId);
  const name = (inp ? inp.value : "").trim();
  if (!name) { cancelAddSub(); return; }
  const item = getItem(catId, itemId);
  if (!item) return;
  if (!item.subitems) item.subitems = [];
  item.subitems.push({ id: "si_" + uid(), name, min: 0, have: 0 });
  addingSubCat  = null;
  addingSubItem = null;
  save(); renderCategories();
  showToast(`Tipo "${name}" aggiunto`);
}
function handleAddSubKey(e, catId, itemId) {
  if (e.key === "Enter")  confirmAddSub(catId, itemId);
  if (e.key === "Escape") cancelAddSub();
}

function updateSubMin(catId, itemId, subId, val) {
  const item = getItem(catId, itemId);
  if (!item || !item.subitems) return;
  const si = item.subitems.find(s => s.id === subId);
  if (si) si.min = Math.max(0, parseInt(val) || 0);
  save(); renderSummary(); renderCategories();
}
function updateSubHave(catId, itemId, subId, val) {
  const item = getItem(catId, itemId);
  if (!item || !item.subitems) return;
  const si = item.subitems.find(s => s.id === subId);
  if (si) si.have = Math.max(0, parseInt(val) || 0);
  save(); renderSummary(); renderCategories();
}
function delSubItem(catId, itemId, subId) {
  const item = getItem(catId, itemId);
  if (!item || !item.subitems) return;
  const si = item.subitems.find(s => s.id === subId);
  if (!si) return;
  item.subitems = item.subitems.filter(s => s.id !== subId);
  // Se non ci sono più sotto-voci, torna a voce semplice
  if (item.subitems.length === 0) {
    delete item.subitems;
  }
  save(); renderCategories();
  showToast(`Tipo "${si.name}" rimosso`);
}

/* ════════════════════════════════════════════
   JSON EXPORT / IMPORT  (per condivisione multi-utente)
════════════════════════════════════════════ */
function exportJSON() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a    = document.createElement("a");
  a.href     = URL.createObjectURL(blob);
  a.download = `orabox-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast("📦 Backup JSON esportato");
}

function triggerImportJSON() {
  document.getElementById("import-json-input").click();
}

async function importJSON(input) {
  const file = input.files[0];
  input.value = "";
  if (!file) return;
  try {
    const text   = await file.text();
    const parsed = JSON.parse(text);
    // Validazione minima
    if (!parsed.list || !parsed.data || !parsed.categories) {
      showToast("❌ File JSON non valido"); return;
    }
    if (!confirm(
      `Importare il backup da "${file.name}"?\n` +
      `Contiene ${parsed.list.length} oratori: ${parsed.list.join(", ")}.\n\n` +
      `Questa operazione UNISCE i dati: gli oratori esistenti verranno aggiornati,\n` +
      `quelli nuovi verranno aggiunti.`
    )) return;

    // MERGE: aggiungi/sovrascrivi oratori dal file, mantieni quelli locali
    parsed.list.forEach(o => {
      if (!state.list.includes(o)) state.list.push(o);
      state.categories[o] = (parsed.categories[o] || []);
      state.data[o]       = (parsed.data[o] || {});
      // normalise
      state.categories[o].forEach(cat => {
        if (state.data[o][cat.id]) {
          state.data[o][cat.id] = normaliseItems(state.data[o][cat.id]);
        }
      });
    });

    save(); render();
    showToast(`✅ JSON importato — ${parsed.list.length} oratori uniti`);
  } catch(e) {
    console.error(e);
    showToast("❌ Errore lettura JSON");
  }
}

/* ════════════════════════════════════════════
   MODAL HELPERS
════════════════════════════════════════════ */
function openModal(id) {
  document.getElementById("modal-overlay").classList.add("open");
  document.getElementById(id).classList.add("open");
  setTimeout(() => {
    const inp = document.querySelector(`#${id} input`);
    if (inp) inp.focus();
  }, 60);
}

function closeAllModals() {
  document.getElementById("modal-overlay").classList.remove("open");
  document.querySelectorAll(".modal").forEach(m => m.classList.remove("open"));
}

/* ════════════════════════════════════════════
   TOAST
════════════════════════════════════════════ */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}

/* ════════════════════════════════════════════
   PDF EXPORT
════════════════════════════════════════════ */
function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentW = pageW - margin * 2;
  const now = new Date().toLocaleDateString("it-IT", {
    day: "2-digit", month: "long", year: "numeric",
  });

  doc.setFillColor(180, 160, 255);
  doc.rect(0, 0, pageW, 6, "F");
  doc.setFillColor(245, 242, 255);
  doc.roundedRect(margin, 12, contentW, 28, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(40, 28, 80);
  doc.text("Lista di Materiale", margin + 8, 24);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(100, 85, 150);
  doc.text(`Oratorio: ${state.current}`, margin + 8, 32);
  doc.setFontSize(8);
  doc.setTextColor(150, 135, 190);
  doc.text(`Esportato il ${now}`, pageW - margin - 2, 32, { align: "right" });

  let totOk = 0, totWarn = 0, totMiss = 0, totTot = 0;
  curCats().forEach(cat => {
    curItems(cat.id).forEach(item => {
      totTot++;
      const s = getStatus(item);
      if (s === "ok") totOk++;
      else if (s === "warn") totWarn++;
      else totMiss++;
    });
  });

  const boxW = (contentW - 9) / 4;
  const boxes = [
    { label:"Totale voci", val:totTot, fill:[230,225,255], text:[40,28,80] },
    { label:"Sufficienti", val:totOk,  fill:[210,242,225], text:[20,80,50] },
    { label:"In scarsità", val:totWarn,fill:[255,243,205], text:[100,65,10] },
    { label:"Mancanti",    val:totMiss,fill:[255,215,215], text:[130,30,30] },
  ];
  boxes.forEach((b, i) => {
    const bx = margin + i * (boxW + 3), by = 46;
    doc.setFillColor(...b.fill);
    doc.roundedRect(bx, by, boxW, 18, 3, 3, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(16); doc.setTextColor(...b.text);
    doc.text(String(b.val), bx + boxW / 2, by + 10, { align: "center" });
    doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(...b.text);
    doc.text(b.label.toUpperCase(), bx + boxW / 2, by + 15.5, { align: "center" });
  });

  let y = 74;

  curCats().forEach(cat => {
    // Flatten sub-items for PDF: ogni sotto-tipo è una riga separata
    const rawItems = curItems(cat.id);
    if (!rawItems.length) return;

    const pdfRows = [];
    rawItems.forEach(item => {
      if (item.subitems && item.subitems.length > 0) {
        item.subitems.forEach(si => {
          const ss = si.have === 0 && si.min > 0 ? "miss" : si.have < si.min ? "warn" : "ok";
          pdfRows.push({
            row: [`${item.name} — ${si.name}`, si.min.toString(), si.have.toString(),
              ss === "ok" ? "Sufficiente" : ss === "warn" ? "In scarsità" : "Mancante"],
            status: ss,
          });
        });
      } else {
        const s = getStatus(item);
        pdfRows.push({
          row: [item.name, item.min.toString(), item.have.toString(),
            s === "ok" ? "Sufficiente" : s === "warn" ? "In scarsità" : "Mancante"],
          status: s,
        });
      }
    });

    if (y > pageH - 55) { doc.addPage(); y = 20; }

    doc.setFillColor(210, 200, 250);
    doc.roundedRect(margin, y - 3, contentW, 11, 2, 2, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(40, 28, 80);
    doc.text(cat.label.toUpperCase(), margin + 5, y + 4.5);
    doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(100, 85, 150);
    doc.text(`${rawItems.length} voci`, pageW - margin - 3, y + 4.5, { align: "right" });
    y += 13;

    doc.autoTable({
      startY: y,
      head:   [["Materiale", "Min. necessario", "Disponibili", "Stato"]],
      body:   pdfRows.map(r => r.row),
      margin: { left: margin, right: margin },
      styles: {
        font: "helvetica", fontSize: 9,
        cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
        textColor: [40, 28, 80], lineColor: [220, 215, 240], lineWidth: 0.25, valign: "middle",
      },
      headStyles: {
        fillColor: [235, 230, 255], textColor: [100, 85, 150], fontStyle: "bold",
        fontSize: 7.5, cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
      },
      alternateRowStyles: { fillColor: null },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 34, halign: "center" },
        2: { cellWidth: 30, halign: "center" },
        3: { cellWidth: 34, halign: "center" },
      },
      didParseCell(d) {
        if (d.section !== "body") return;
        const s = pdfRows[d.row.index]?.status;
        if (s === "ok") {
          d.cell.styles.fillColor = [220, 245, 230];
          d.cell.styles.textColor = d.column.index === 3 ? [20, 100, 60] : [40, 80, 55];
          if (d.column.index === 3) d.cell.styles.fontStyle = "bold";
        } else if (s === "warn") {
          d.cell.styles.fillColor = [255, 248, 210];
          d.cell.styles.textColor = d.column.index === 3 ? [130, 85, 10] : [100, 70, 20];
          if (d.column.index === 3) d.cell.styles.fontStyle = "bold";
        } else {
          d.cell.styles.fillColor = [255, 220, 220];
          d.cell.styles.textColor = d.column.index === 3 ? [160, 30, 30] : [120, 40, 40];
          if (d.column.index === 3) d.cell.styles.fontStyle = "bold";
        }
      },
    });
    y = doc.lastAutoTable.finalY + 10;
  });

  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFillColor(180, 160, 255);
    doc.rect(0, pageH - 5, pageW, 5, "F");
    doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(150, 135, 190);
    doc.text(`Pagina ${i} di ${pages}`, pageW / 2, pageH - 8, { align: "center" });
    doc.text(`OraBox Kit — ${state.current}`, margin, pageH - 8);
  }

  doc.save(`toolbox-${state.current.toLowerCase().replace(/\s+/g,"-")}-${new Date().toISOString().slice(0,10)}.pdf`);
  showToast("PDF esportato 📄");
}

/* ════════════════════════════════════════════
   PDF IMPORT (immutato dalla versione originale)
════════════════════════════════════════════ */
let pendingImport = null;

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

async function importPDF(input) {
  const file = input.files[0];
  input.value = "";
  if (!file) return;
  showToast("Lettura PDF in corso…");
  try {
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    const allItems = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const tc   = await page.getTextContent();
      tc.items.forEach(item => {
        const str = item.str.trim();
        if (!str) return;
        allItems.push({
          str, x: Math.round(item.transform[4]),
          y: Math.round(item.transform[5]) * -1 + p * 10000,
          h: Math.round(item.height), page: p,
        });
      });
    }
    const parsed = parsePDFItems(allItems);
    if (!parsed) {
      showToast("❌ PDF non riconosciuto — usa solo PDF esportati da OraBox Kit");
      return;
    }
    pendingImport = parsed;
    showImportPreview(parsed);
  } catch(err) {
    console.error(err);
    showToast("❌ Errore lettura PDF");
  }
}

function parsePDFItems(items) {
  let oratorioName = null;
  for (const it of items) {
    if (it.str.startsWith("Oratorio:")) {
      oratorioName = it.str.replace("Oratorio:", "").trim();
      break;
    }
  }
  if (!oratorioName) {
    for (let i = 0; i < items.length - 1; i++) {
      if (items[i].str === "Oratorio:") {
        oratorioName = items[i + 1].str.trim();
        break;
      }
    }
  }
  if (!oratorioName) return null;

  const rows = [];
  let currentY = null, currentRow = [];
  for (const it of items) {
    if (currentY === null || Math.abs(it.y - currentY) > 4) {
      if (currentRow.length) rows.push(currentRow);
      currentRow = [it]; currentY = it.y;
    } else {
      currentRow.push(it);
    }
  }
  if (currentRow.length) rows.push(currentRow);

  const NOISE = new Set(["OraBox Kit","Oratorio:","Esportato il","Materiale",
    "Min. necessario","Disponibili","Stato","Totale voci","Sufficienti","In scarsità",
    "Mancanti","TOTALE VOCI","SUFFICIENTI","IN SCARSITÀ","MANCANTI","Sufficiente","Mancante"]);
  const STATUS_WORDS = new Set(["Sufficiente", "In scarsità", "Mancante"]);

  const categories = [];
  let currentCat = null;

  for (const row of rows) {
    const strs = row.map(i => i.str.trim()).filter(Boolean);
    if (!strs.length) continue;
    if (strs.some(s => s.startsWith("OraBox Kit"))) continue;
    if (strs.some(s => s.startsWith("Oratorio:"))) continue;
    if (strs.some(s => s.startsWith("Esportato il"))) continue;
    if (strs.some(s => s.startsWith("Pagina "))) continue;
    if (strs.includes("Materiale") && strs.includes("Disponibili")) continue;
    if (strs.every(s =>
      /^\d+$/.test(s) || NOISE.has(s) ||
      ["TOTALE VOCI","SUFFICIENTI","IN SCARSITÀ","MANCANTI"].includes(s.toUpperCase())
    )) continue;

    const vocePart = strs.find(s => /^\d+\s+voci$/.test(s));
    const isHeader = vocePart != null && strs.length <= 3 && !STATUS_WORDS.has(strs[0]);
    if (isHeader) {
      const label = strs.filter(s => s !== vocePart).join(" ").trim();
      if (label && label !== "Materiale") {
        currentCat = { label, items: [] };
        categories.push(currentCat);
      }
      continue;
    }

    if (!currentCat) continue;
    const s = strs[strs.length - 1];
    if (!STATUS_WORDS.has(s)) continue;
    const haveStr = strs[strs.length - 2];
    const minStr  = strs[strs.length - 3];
    if (!/^\d+$/.test(haveStr) || !/^\d+$/.test(minStr)) continue;
    const name = strs.slice(0, strs.length - 3).join(" ").trim();
    if (!name) continue;
    currentCat.items.push({ name, min: parseInt(minStr,10), have: parseInt(haveStr,10) });
  }

  if (!categories.length) return null;
  return { oratorioName, categories };
}

function showImportPreview(parsed) {
  const { oratorioName, categories } = parsed;
  const isNew = !state.list.includes(oratorioName);
  const totalItems = categories.reduce((s, c) => s + c.items.length, 0);
  document.getElementById("import-summary").innerHTML = `
    <span>📍 Oratorio: <span class="chip">${esc(oratorioName)}</span>${isNew ? ' <span class="import-new-badge">NUOVO</span>' : ""}</span>
    <span>📂 <span class="chip">${categories.length}</span> categorie</span>
    <span>📋 <span class="chip">${totalItems}</span> voci</span>
  `;
  let html = `<div class="import-oratorio-info">
    📥 ${isNew ? `Verrà creato un nuovo oratorio "<strong>${esc(oratorioName)}</strong>"` : `Sovrascrive "<strong>${esc(oratorioName)}</strong>"`}
  </div>`;
  categories.forEach(cat => {
    const existingCat = curCats().find(c => c.label.toLowerCase() === cat.label.toLowerCase());
    const isNewCat = !existingCat;
    html += `<div class="import-cat-block">
      <div class="import-cat-label">
        ${existingCat ? existingCat.icon : "📦"} ${esc(cat.label)}
        ${isNewCat ? '<span class="import-new-badge">NUOVA</span>' : ""}
      </div>`;
    cat.items.forEach(item => {
      const s = item.have === 0 && item.min > 0 ? "miss" : item.have < item.min ? "warn" : "ok";
      const statoLabel = s === "ok" ? "Sufficiente" : s === "warn" ? "In scarsità" : "Mancante";
      html += `<div class="import-row ${s}">
        <span class="import-row-name">${esc(item.name)}</span>
        <span class="import-row-val">${item.min}</span>
        <span class="import-row-val">${item.have}</span>
        <span class="import-row-stato ${s}">${statoLabel}</span>
      </div>`;
    });
    html += `</div>`;
  });
  document.getElementById("import-preview").innerHTML = html;
  openModal("modal-import");
}

function confirmImport() {
  if (!pendingImport) return;
  const { oratorioName, categories } = pendingImport;

  if (!state.list.includes(oratorioName)) {
    state.list.push(oratorioName);
    state.categories[oratorioName] = [];
    state.data[oratorioName] = {};
  }

  categories.forEach(cat => {
    let existing = state.categories[oratorioName].find(
      c => c.label.toLowerCase() === cat.label.toLowerCase()
    );
    if (!existing) {
      const id = "cat_" + uid();
      existing = { id, label: cat.label, icon: "📦" };
      state.categories[oratorioName].push(existing);
    }
    state.data[oratorioName][existing.id] = normaliseItems(
      cat.items.map(i => ({ name: i.name, min: i.min, have: i.have }))
    );
  });

  state.current = oratorioName;
  pendingImport = null;
  save(); closeAllModals(); render();
  showToast(`✅ Importato "${oratorioName}" — ${categories.length} categorie`);
}

/* ════════════════════════════════════════════
   KEYBOARD
════════════════════════════════════════════ */
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeAllModals();
  if (e.key === "Enter" && document.getElementById("modal-oratorio").classList.contains("open"))
    confirmOratorio();
  if (e.key === "Enter" && document.getElementById("modal-cat").classList.contains("open"))
    confirmCat();
});

document.querySelectorAll("#cat-sort-pills .sort-pill").forEach(b => {
  b.addEventListener("click", () => {
    document.querySelectorAll("#cat-sort-pills .sort-pill").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
  });
});

/* ════════════════════════════════════════════
   INIT
════════════════════════════════════════════ */
render();
