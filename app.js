"use strict";

/* ════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════ */
const ICONS = [
  "✏️",
  "📎",
  "📏",
  "🖊️",
  "📌",
  "📋",
  "📝",
  "🗒️",
  "⚽",
  "🏀",
  "🏐",
  "🎾",
  "🏓",
  "🥅",
  "🎯",
  "🏋️",
  "🔧",
  "🔨",
  "🪛",
  "🪚",
  "🔩",
  "⚙️",
  "🗜️",
  "🪝",
  "🍽️",
  "🍴",
  "🥄",
  "🧂",
  "🍲",
  "🫙",
  "🥡",
  "🧃",
  "🧹",
  "🪣",
  "🧽",
  "🧴",
  "🧼",
  "🪥",
  "🫧",
  "🗑️",
  "🩹",
  "💊",
  "🩺",
  "🧰",
  "🩻",
  "🏥",
  "💉",
  "🌡️",
  "📦",
  "🎒",
  "🧳",
  "🪜",
  "📚",
  "🎨",
  "🎵",
  "⭐",
  "🚗",
  "⛺",
  "🏕️",
  "🌿",
  "🌸",
  "🎉",
  "🔋",
  "💡",
];

/* ════════════════════════════════════════════
   DATA MODEL
════════════════════════════════════════════ */
const DEFAULT_CATS = [
  { id: "cancelleria", label: "Cancelleria", icon: "✏️" },
  { id: "attrezzatura", label: "Attrezzatura sportiva", icon: "⚽" },
  { id: "attrezzi", label: "Attrezzi", icon: "🔧" },
  { id: "pranzo", label: "Pranzo", icon: "🍽️" },
  { id: "pulizie", label: "Pulizie", icon: "🧹" },
  { id: "primosoccorso", label: "Primo soccorso", icon: "🩹" },
];

const DEFAULT_ITEMS = {
  cancelleria: [
    { name: "Fogli bianchi", min: 100, have: 0 },
    { name: "Forbici", min: 5, have: 0 },
    { name: "Matite", min: 10, have: 0 },
    { name: "Biro", min: 10, have: 0 },
    { name: "Pennarelli", min: 2, have: 0 },
    { name: "Gomme", min: 5, have: 0 },
    { name: "Nastro adesivo", min: 3, have: 0 },
  ],
  attrezzatura: [
    { name: "Palloni morbidi", min: 4, have: 0 },
    { name: "Pompette", min: 2, have: 0 },
    { name: "Cinesini", min: 20, have: 0 },
    { name: "Nastro bianco/rosso", min: 1, have: 0 },
    { name: "Palline biliardino", min: 6, have: 0 },
    { name: "Spugne", min: 5, have: 0 },
  ],
  attrezzi: [
    { name: "Ghiaccio spray", min: 2, have: 0 },
    { name: "Cacciaviti", min: 2, have: 0 },
    { name: "Martello", min: 1, have: 0 },
  ],
  pranzo: [
    { name: "Scottex", min: 10, have: 0 },
    { name: "Tovagliette", min: 50, have: 0 },
    { name: "Forchette", min: 50, have: 0 },
    { name: "Piatti", min: 50, have: 0 },
    { name: "Bicchieri", min: 50, have: 0 },
    { name: "Sacchi rifiuti", min: 10, have: 0 },
  ],
  pulizie: [
    { name: "Scope", min: 4, have: 6 },
    { name: "Palette", min: 3, have: 3 },
    { name: "Moci", min: 4, have: 8 },
    { name: "Secchi", min: 6, have: 12 },
    { name: "Ammoniaca", min: 1, have: 1 },
    { name: "Disinfettante tavoli", min: 2, have: 1 },
    { name: "Panni", min: 8, have: 10 },
    { name: "Guanti", min: 10, have: 0 },
    { name: "Prodotto pavimenti", min: 1, have: 0 },
    { name: "Sapone mani", min: 3, have: 0 },
  ],
  primosoccorso: [
    { name: "Kit pronto soccorso", min: 1, have: 0 },
    { name: "Cerotti assortiti", min: 20, have: 0 },
    { name: "Garze sterili", min: 10, have: 0 },
    { name: "Ghiaccio istantaneo", min: 5, have: 0 },
    { name: "Disinfettante", min: 1, have: 0 },
  ],
};

const CAT_COLORS = [
  "#EFF6FF",
  "#F0FDF4",
  "#FFFBEB",
  "#FFF0F3",
  "#F5F0FF",
  "#FFF1F2",
  "#F0F9FF",
  "#FEFCE8",
  "#F7FEE7",
  "#FDF4FF",
  "#FFF7ED",
  "#F0FDFA",
];

/* ════════════════════════════════════════════
   STATE
════════════════════════════════════════════ */
let state = loadState();
let openCats = new Set(
  state.categories ? state.categories.map((c) => c.id) : [],
);
let addingCat = null;
let catSort = "custom";
let itemSorts = {}; // catId -> 'custom' | 'alpha' | 'qty' | 'avail'

// Modal state
let modalMode = null; // 'add-oratorio' | 'rename-oratorio' | 'add-cat' | 'edit-cat'
let modalTarget = null; // oratorio name or cat id
let selectedIcon = "📦";

/* ════════════════════════════════════════════
   PERSISTENCE
════════════════════════════════════════════ */
function loadState() {
  try {
    const raw = localStorage.getItem("toolbox_v1");
    if (raw) {
      const s = JSON.parse(raw);
      // back-compat: ensure categories array exists
      if (!s.categories) s.categories = DEFAULT_CATS.map((c) => ({ ...c }));
      return s;
    }
  } catch (e) {}
  return makeDefaultState();
}

function makeDefaultState() {
  return {
    list: ["Pombio", "13"],
    current: "Pombio",
    categories: DEFAULT_CATS.map((c) => ({ ...c })),
    data: {
      Pombio: deepClone(DEFAULT_ITEMS),
      13: deepClone(DEFAULT_ITEMS),
    },
  };
}

function save() {
  try {
    localStorage.setItem("toolbox_v1", JSON.stringify(state));
  } catch (e) {}
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
function cur() {
  return state.data[state.current];
}
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

/* ════════════════════════════════════════════
   STATUS
════════════════════════════════════════════ */
function getStatus(item) {
  if (item.have === 0 && item.min > 0) return "miss";
  if (item.have < item.min) return "warn";
  return "ok";
}

function badgeHtml(catId) {
  const items = cur()[catId] || [];
  if (!items.length) return '<span class="cat-badge badge-ok">vuota</span>';
  const miss = items.filter((i) => getStatus(i) === "miss").length;
  const warn = items.filter((i) => getStatus(i) === "warn").length;
  if (miss > 0)
    return `<span class="cat-badge badge-miss">${miss} mancant${miss === 1 ? "e" : "i"}</span>`;
  if (warn > 0)
    return `<span class="cat-badge badge-warn">${warn} in scarsità</span>`;
  return `<span class="cat-badge badge-ok">tutto ok ✓</span>`;
}

/* ════════════════════════════════════════════
   ESCAPE
════════════════════════════════════════════ */
function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function escAttr(s) {
  return esc(s);
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
  el.innerHTML = state.list
    .map((o) => {
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
    })
    .join("");
}

/* ── SUMMARY ── */
function renderSummary() {
  const data = cur();
  let tot = 0,
    ok = 0,
    warn = 0,
    miss = 0;
  state.categories.forEach((cat) => {
    (data[cat.id] || []).forEach((item) => {
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
  const cats = [...state.categories];
  if (catSort === "alpha")
    cats.sort((a, b) => a.label.localeCompare(b.label, "it"));
  return cats;
}

function getSortedItems(catId) {
  const items = [...(cur()[catId] || [])];
  const sort = itemSorts[catId] || "custom";
  if (sort === "alpha")
    items.sort((a, b) => a.name.localeCompare(b.name, "it"));
  else if (sort === "qty") items.sort((a, b) => b.min - a.min);
  else if (sort === "avail") items.sort((a, b) => b.have - a.have);
  return items;
}

function renderCategories() {
  const data = cur();
  const container = document.getElementById("categories");
  const cats = getSortedCats();

  container.innerHTML = cats
    .map((cat, catIdx) => {
      const items = getSortedItems(cat.id);
      const open = openCats.has(cat.id);
      const currentSort = itemSorts[cat.id] || "custom";
      const color = CAT_COLORS[catIdx % CAT_COLORS.length];

      const rows = items
        .map((item, idx) => {
          // find real index in original array for mutations
          const realIdx = (cur()[cat.id] || []).findIndex((i) => i === item);
          const s = getStatus(item);
          const rowCls =
            s === "miss" ? "row-miss" : s === "warn" ? "row-warn" : "row-ok";
          const inputCls = s === "ok" ? "" : s === "warn" ? " warn" : " miss";
          const statusLabel =
            s === "ok"
              ? '<span class="status-badge ok">OK ✓</span>'
              : s === "warn"
                ? '<span class="status-badge warn">Pochi !</span>'
                : '<span class="status-badge miss">⚠ Mancante</span>';

          return `<tr class="item-row ${rowCls}" draggable="true"
          data-cat="${escAttr(cat.id)}" data-idx="${realIdx}">
        <td>
          <div class="item-name">
            <span class="item-drag-handle" title="Trascina">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
            </span>
            ${esc(item.name)}
            ${statusLabel}
          </div>
        </td>
        <td class="c">
          <div class="num-wrap">
            <input class="num-input" type="number" min="0" value="${item.min}"
              aria-label="Minimo per ${esc(item.name)}"
              onchange="updateMin('${escAttr(cat.id)}',${realIdx},this.value)"
              onkeydown="if(event.key==='Enter')this.blur()" />
          </div>
        </td>
        <td class="c">
          <div class="num-wrap">
            <input class="num-input${inputCls}" type="number" min="0" value="${item.have}"
              aria-label="Disponibili di ${esc(item.name)}"
              onchange="updateHave('${escAttr(cat.id)}',${realIdx},this.value)"
              onkeydown="if(event.key==='Enter')this.blur()" />
          </div>
        </td>
        <td class="c">
          <button class="btn-icon danger" onclick="delItem('${escAttr(cat.id)}',${realIdx})" title="Elimina">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </td>
      </tr>`;
        })
        .join("");

      const addRow =
        addingCat === cat.id
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

      const sortPills = ["custom", "alpha", "qty", "avail"]
        .map((s) => {
          const labels = {
            custom: "Manuale",
            alpha: "A→Z",
            qty: "Quantità",
            avail: "Disponibili",
          };
          return `<button class="item-sort-pill${currentSort === s ? " active" : ""}" onclick="setItemSort('${escAttr(cat.id)}','${s}')">${labels[s]}</button>`;
        })
        .join("");

      const itemToolbar = open
        ? `
      <div class="cat-item-toolbar">
        <span class="item-sort-label">Ordina:</span>
        <div class="item-sort-pills">${sortPills}</div>
      </div>`
        : "";

      return `<div class="cat-card" id="cat-${cat.id}"
        draggable="${catSort === "custom" ? "true" : "false"}"
        data-cat-id="${escAttr(cat.id)}">
      <div class="cat-header" onclick="toggleCat('${escAttr(cat.id)}')" role="button" tabindex="0"
        aria-expanded="${open}"
        onkeydown="if(event.key==='Enter'||event.key===' ')toggleCat('${escAttr(cat.id)}')">
        ${
          catSort === "custom"
            ? `<span class="drag-handle" onclick="event.stopPropagation()" title="Trascina">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
        </span>`
            : ""
        }
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
      ${
        open
          ? `
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
        </div>`
          : ""
      }
    </div>`;
    })
    .join("");

  if (addingCat) {
    const inp = document.getElementById("add-input-" + addingCat);
    if (inp) inp.focus();
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
  document.querySelectorAll(".cat-card").forEach((card) => {
    card.addEventListener("dragstart", (e) => {
      dragCatId = card.dataset.catId;
      card.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      document
        .querySelectorAll(".cat-card")
        .forEach((c) => c.classList.remove("drag-over"));
      dragCatId = null;
    });
    card.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (card.dataset.catId !== dragCatId) card.classList.add("drag-over");
    });
    card.addEventListener("dragleave", () =>
      card.classList.remove("drag-over"),
    );
    card.addEventListener("drop", (e) => {
      e.preventDefault();
      card.classList.remove("drag-over");
      const fromId = dragCatId;
      const toId = card.dataset.catId;
      if (fromId && fromId !== toId) {
        reorderCats(fromId, toId);
      }
    });
  });
}

function reorderCats(fromId, toId) {
  const cats = state.categories;
  const fi = cats.findIndex((c) => c.id === fromId);
  const ti = cats.findIndex((c) => c.id === toId);
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
let dragItemIdx = null;

function setupItemDrag() {
  document.querySelectorAll(".item-row").forEach((row) => {
    row.addEventListener("dragstart", (e) => {
      dragItemCat = row.dataset.cat;
      dragItemIdx = parseInt(row.dataset.idx);
      row.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    row.addEventListener("dragend", () => {
      row.classList.remove("dragging");
      document
        .querySelectorAll(".item-row")
        .forEach((r) => r.classList.remove("drag-over-row"));
      dragItemCat = null;
      dragItemIdx = null;
    });
    row.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (row.dataset.cat === dragItemCat) row.classList.add("drag-over-row");
    });
    row.addEventListener("dragleave", () =>
      row.classList.remove("drag-over-row"),
    );
    row.addEventListener("drop", (e) => {
      e.preventDefault();
      row.classList.remove("drag-over-row");
      const toIdx = parseInt(row.dataset.idx);
      if (dragItemCat === row.dataset.cat && dragItemIdx !== toIdx) {
        reorderItems(dragItemCat, dragItemIdx, toIdx);
      }
    });
  });
}

function reorderItems(catId, fromIdx, toIdx) {
  const items = cur()[catId];
  const [moved] = items.splice(fromIdx, 1);
  items.splice(toIdx, 0, moved);
  // reset to custom sort when manually dragged
  itemSorts[catId] = "custom";
  save();
  renderCategories();
}

/* ════════════════════════════════════════════
   SORTING
════════════════════════════════════════════ */
function setCatSort(s) {
  catSort = s;
  document.querySelectorAll("#cat-sort-pills .sort-pill").forEach((b) => {
    b.classList.toggle(
      "active",
      b.textContent.includes(s === "alpha" ? "A" : "Manuale"),
    );
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
  save();
  render();
}

function deleteOratorio(name) {
  if (state.list.length <= 1) {
    showToast("Devi avere almeno un oratorio");
    return;
  }
  if (!confirm(`Eliminare "${name}" e tutti i suoi dati?`)) return;
  state.list = state.list.filter((o) => o !== name);
  delete state.data[name];
  if (state.current === name) state.current = state.list[0];
  save();
  render();
  showToast(`"${name}" eliminato`);
}

function openModalAddOratorio() {
  modalMode = "add-oratorio";
  modalTarget = null;
  document.getElementById("modal-oratorio-title").textContent =
    "Nuovo oratorio";
  document.getElementById("modal-oratorio-icon").textContent = "🏫";
  document.getElementById("btn-confirm-oratorio").textContent = "Aggiungi";
  document.getElementById("input-oratorio-name").value = "";
  openModal("modal-oratorio");
}

function openModalRenameOratorio(name) {
  modalMode = "rename-oratorio";
  modalTarget = name;
  document.getElementById("modal-oratorio-title").textContent =
    "Rinomina oratorio";
  document.getElementById("modal-oratorio-icon").textContent = "✏️";
  document.getElementById("btn-confirm-oratorio").textContent = "Salva";
  document.getElementById("input-oratorio-name").value = name;
  openModal("modal-oratorio");
}

function confirmOratorio() {
  const name = document.getElementById("input-oratorio-name").value.trim();
  if (!name) return;
  if (modalMode === "add-oratorio") {
    if (state.list.includes(name)) {
      showToast("Oratorio già esistente");
      return;
    }
    state.list.push(name);
    state.data[name] = deepClone(
      Object.fromEntries(
        state.categories.map((c) => [
          c.id,
          deepClone(DEFAULT_ITEMS[c.id] || []),
        ]),
      ),
    );
    state.current = name;
    showToast(`Oratorio "${name}" creato 🎉`);
  } else {
    const old = modalTarget;
    if (name === old) {
      closeAllModals();
      return;
    }
    if (state.list.includes(name)) {
      showToast("Nome già in uso");
      return;
    }
    const idx = state.list.indexOf(old);
    state.list[idx] = name;
    state.data[name] = state.data[old];
    delete state.data[old];
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
  modalMode = "add-cat";
  modalTarget = null;
  selectedIcon = "📦";
  document.getElementById("modal-cat-title").textContent = "Nuova categoria";
  document.getElementById("modal-cat-preview").textContent = "📦";
  document.getElementById("input-cat-name").value = "";
  buildIconPicker();
  openModal("modal-cat");
}

function openModalEditCat(catId) {
  modalMode = "edit-cat";
  modalTarget = catId;
  const cat = state.categories.find((c) => c.id === catId);
  if (!cat) return;
  selectedIcon = cat.icon;
  document.getElementById("modal-cat-title").textContent = "Modifica categoria";
  document.getElementById("modal-cat-preview").textContent = cat.icon;
  document.getElementById("input-cat-name").value = cat.label;
  buildIconPicker();
  openModal("modal-cat");
}

function buildIconPicker() {
  const el = document.getElementById("icon-picker");
  el.innerHTML = ICONS.map(
    (ic) =>
      `<button class="icon-btn${ic === selectedIcon ? " selected" : ""}" onclick="selectIcon('${ic}')">${ic}</button>`,
  ).join("");
}

function selectIcon(ic) {
  selectedIcon = ic;
  document.getElementById("modal-cat-preview").textContent = ic;
  document
    .querySelectorAll(".icon-btn")
    .forEach((b) => b.classList.toggle("selected", b.textContent === ic));
}

function confirmCat() {
  const name = document.getElementById("input-cat-name").value.trim();
  if (!name) return;
  if (modalMode === "add-cat") {
    const id = "cat_" + uid();
    state.categories.push({ id, label: name, icon: selectedIcon });
    // create empty array for this category in all oratori
    state.list.forEach((o) => {
      state.data[o][id] = [];
    });
    openCats.add(id);
    showToast(`Categoria "${name}" aggiunta`);
  } else {
    const cat = state.categories.find((c) => c.id === modalTarget);
    if (cat) {
      cat.label = name;
      cat.icon = selectedIcon;
    }
    showToast(`Categoria aggiornata`);
  }
  save();
  closeAllModals();
  render();
}

function deleteCat(catId) {
  const cat = state.categories.find((c) => c.id === catId);
  if (!cat) return;
  if (!confirm(`Eliminare la categoria "${cat.label}" e tutte le sue voci?`))
    return;
  state.categories = state.categories.filter((c) => c.id !== catId);
  state.list.forEach((o) => {
    delete state.data[o][catId];
  });
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
   ITEM ACTIONS
════════════════════════════════════════════ */
function updateMin(catId, idx, val) {
  cur()[catId][idx].min = Math.max(0, parseInt(val) || 0);
  save();
  renderSummary();
  renderCategories();
}

function updateHave(catId, idx, val) {
  cur()[catId][idx].have = Math.max(0, parseInt(val) || 0);
  save();
  renderSummary();
  renderCategories();
}

function delItem(catId, idx) {
  const name = cur()[catId][idx].name;
  cur()[catId].splice(idx, 1);
  save();
  render();
  showToast(`"${name}" eliminato`);
}

function startAdd(catId) {
  addingCat = catId;
  openCats.add(catId);
  renderCategories();
}

function cancelAdd() {
  addingCat = null;
  renderCategories();
}

function confirmAdd(catId) {
  const inp = document.getElementById("add-input-" + catId);
  const name = (inp ? inp.value : "").trim();
  if (!name) {
    cancelAdd();
    return;
  }
  if (!cur()[catId]) cur()[catId] = [];
  cur()[catId].push({ name, min: 1, have: 0 });
  addingCat = null;
  save();
  render();
  showToast(`"${name}" aggiunto`);
}

function handleAddKey(e, catId) {
  if (e.key === "Enter") confirmAdd(catId);
  if (e.key === "Escape") cancelAdd();
}

/* ════════════════════════════════════════════
   MODAL HELPERS
════════════════════════════════════════════ */
function openModal(id) {
  document.getElementById("modal-overlay").classList.add("open");
  document.getElementById(id).classList.add("open");
  // focus first input after animation
  setTimeout(() => {
    const inp = document.querySelector(`#${id} input`);
    if (inp) inp.focus();
  }, 60);
}

function closeAllModals() {
  document.getElementById("modal-overlay").classList.remove("open");
  document
    .querySelectorAll(".modal")
    .forEach((m) => m.classList.remove("open"));
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
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // ── COVER HEADER ──
  // Top accent bar
  doc.setFillColor(180, 160, 255); // pastel violet
  doc.rect(0, 0, pageW, 6, "F");

  // Title block
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

  // ── SUMMARY BOXES ──
  const data = cur();
  let totOk = 0,
    totWarn = 0,
    totMiss = 0,
    totTot = 0;
  state.categories.forEach((cat) => {
    (data[cat.id] || []).forEach((item) => {
      totTot++;
      const s = getStatus(item);
      if (s === "ok") totOk++;
      else if (s === "warn") totWarn++;
      else totMiss++;
    });
  });

  const boxW = (contentW - 9) / 4;
  const boxes = [
    {
      label: "Totale voci",
      val: totTot,
      fill: [230, 225, 255],
      text: [40, 28, 80],
    },
    {
      label: "Sufficienti",
      val: totOk,
      fill: [210, 242, 225],
      text: [20, 80, 50],
    },
    {
      label: "In scarsità",
      val: totWarn,
      fill: [255, 243, 205],
      text: [100, 65, 10],
    },
    {
      label: "Mancanti",
      val: totMiss,
      fill: [255, 215, 215],
      text: [130, 30, 30],
    },
  ];
  boxes.forEach((b, i) => {
    const bx = margin + i * (boxW + 3);
    const by = 46;
    doc.setFillColor(...b.fill);
    doc.roundedRect(bx, by, boxW, 18, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...b.text);
    doc.text(String(b.val), bx + boxW / 2, by + 10, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...b.text);
    doc.text(b.label.toUpperCase(), bx + boxW / 2, by + 15.5, {
      align: "center",
    });
  });

  let y = 74;

  // ── CATEGORIES ──
  state.categories.forEach((cat) => {
    const items = data[cat.id] || [];
    if (!items.length) return;
    if (y > pageH - 55) {
      doc.addPage();
      y = 20;
    }

    // Category title bar (no icon)
    doc.setFillColor(210, 200, 250); // pastel violet
    doc.roundedRect(margin, y - 3, contentW, 11, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(40, 28, 80);
    doc.text(cat.label.toUpperCase(), margin + 5, y + 4.5);

    // Item count on right
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 85, 150);
    doc.text(`${items.length} voci`, pageW - margin - 3, y + 4.5, {
      align: "right",
    });
    y += 13;

    // Build rows with status
    const tableRows = items.map((item) => {
      const s = getStatus(item);
      const stato =
        s === "ok" ? "Sufficiente" : s === "warn" ? "In scarsità" : "Mancante";
      return {
        row: [item.name, item.min.toString(), item.have.toString(), stato],
        status: s,
      };
    });

    doc.autoTable({
      startY: y,
      head: [["Materiale", "Min. necessario", "Disponibili", "Stato"]],
      body: tableRows.map((r) => r.row),
      margin: { left: margin, right: margin },
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
        textColor: [40, 28, 80],
        lineColor: [220, 215, 240],
        lineWidth: 0.25,
        valign: "middle",
      },
      headStyles: {
        fillColor: [235, 230, 255],
        textColor: [100, 85, 150],
        fontStyle: "bold",
        fontSize: 7.5,
        cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
      },
      // No alternateRowStyles — we override everything in didParseCell
      alternateRowStyles: { fillColor: null },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 34, halign: "center" },
        2: { cellWidth: 30, halign: "center" },
        3: { cellWidth: 34, halign: "center" },
      },
      didParseCell(d) {
        if (d.section !== "body") return;
        const s = tableRows[d.row.index]?.status;
        if (s === "ok") {
          // Pastel green
          d.cell.styles.fillColor = [220, 245, 230];
          if (d.column.index === 3) {
            d.cell.styles.textColor = [20, 100, 60];
            d.cell.styles.fontStyle = "bold";
          } else {
            d.cell.styles.textColor = [40, 80, 55];
          }
        } else if (s === "warn") {
          // Pastel yellow
          d.cell.styles.fillColor = [255, 248, 210];
          if (d.column.index === 3) {
            d.cell.styles.textColor = [130, 85, 10];
            d.cell.styles.fontStyle = "bold";
          } else {
            d.cell.styles.textColor = [100, 70, 20];
          }
        } else {
          // Pastel red
          d.cell.styles.fillColor = [255, 220, 220];
          if (d.column.index === 3) {
            d.cell.styles.textColor = [160, 30, 30];
            d.cell.styles.fontStyle = "bold";
          } else {
            d.cell.styles.textColor = [120, 40, 40];
          }
        }
      },
      didDrawPage() {},
    });

    y = doc.lastAutoTable.finalY + 10;
  });

  // ── FOOTER on every page ──
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    // bottom accent bar
    doc.setFillColor(180, 160, 255);
    doc.rect(0, pageH - 5, pageW, 5, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(150, 135, 190);
    doc.text(`Pagina ${i} di ${pages}`, pageW / 2, pageH - 8, {
      align: "center",
    });
    doc.text(`OraBox Kit — ${state.current}`, margin, pageH - 8);
  }

  doc.save(
    `toolbox-${state.current.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`,
  );
  showToast("PDF esportato 📄");
}

/* ════════════════════════════════════════════
   PDF IMPORT
════════════════════════════════════════════ */

// Holds the parsed data before user confirms
let pendingImport = null;

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

async function importPDF(input) {
  const file = input.files[0];
  input.value = ""; // reset so same file can be re-selected
  if (!file) return;

  showToast("Lettura PDF in corso…");

  try {
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

    // Extract all text items with their y-position across all pages
    const allItems = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const tc = await page.getTextContent();
      // Normalise y: PDF y is from bottom, we flip it; add page offset
      tc.items.forEach((item) => {
        const str = item.str.trim();
        if (!str) return;
        allItems.push({
          str,
          x: Math.round(item.transform[4]),
          // use negative y so top-of-page = smallest number, easy to sort
          y: Math.round(item.transform[5]) * -1 + p * 10000,
          h: Math.round(item.height),
          page: p,
        });
      });
    }

    const parsed = parsePDFItems(allItems);
    if (!parsed) {
      showToast(
        "❌ PDF non riconosciuto — usa solo PDF esportati da OraBox Kit",
      );
      return;
    }

    pendingImport = parsed;
    showImportPreview(parsed);
  } catch (err) {
    console.error(err);
    showToast("❌ Errore lettura PDF");
  }
}

/**
 * Parses the flat list of text items from PDF.js into structured data.
 *
 * The PDF structure we produce is:
 *   "OraBox Kit"   (title)
 *   "Oratorio: {name}" (oratorio line)
 *   "Esportato il …"
 *   summary numbers & labels (4 boxes)
 *   For each category:
 *     "{CAT LABEL}" "{N} voci"
 *     "Materiale" "Min. necessario" "Disponibili" "Stato"   (table header)
 *     "{name}" "{min}" "{have}" "{Sufficiente|In scarsità|Mancante}"  (rows)
 *
 * PDF.js returns items in approximate reading order (top→bottom, left→right).
 * We identify rows by grouping items with the same y-coordinate.
 */
function parsePDFItems(items) {
  // ── Find oratorio name ──
  let oratorioName = null;
  for (const it of items) {
    if (it.str.startsWith("Oratorio:")) {
      oratorioName = it.str.replace("Oratorio:", "").trim();
      break;
    }
    // sometimes split across two items
  }
  // Fallback: next item after "Oratorio:"
  if (!oratorioName) {
    for (let i = 0; i < items.length - 1; i++) {
      if (items[i].str === "Oratorio:") {
        oratorioName = items[i + 1].str.trim();
        break;
      }
    }
  }
  if (!oratorioName) return null;

  // ── Group items by y-row (items within 3px of each other are same row) ──
  const rows = [];
  let currentY = null;
  let currentRow = [];
  for (const it of items) {
    if (currentY === null || Math.abs(it.y - currentY) > 4) {
      if (currentRow.length) rows.push(currentRow);
      currentRow = [it];
      currentY = it.y;
    } else {
      currentRow.push(it);
    }
  }
  if (currentRow.length) rows.push(currentRow);

  // ── Known noise strings to skip ──
  const NOISE = new Set([
    "OraBox Kit",
    "Oratorio:",
    "Esportato il",
    "Materiale",
    "Min. necessario",
    "Disponibili",
    "Stato",
    "Totale voci",
    "Sufficienti",
    "In scarsità",
    "Mancanti",
    "TOTALE VOCI",
    "SUFFICIENTI",
    "IN SCARSITÀ",
    "MANCANTI",
    "Sufficiente",
    "In scarsità",
    "Mancante",
  ]);

  const STATUS_WORDS = new Set(["Sufficiente", "In scarsità", "Mancante"]);
  const CAT_SUFFIX = " voci"; // category rows end with "{N} voci"

  const categories = [];
  let currentCat = null;

  for (const row of rows) {
    const texts = row
      .map((i) => i.str)
      .join(" ")
      .trim();
    const strs = row.map((i) => i.str.trim()).filter(Boolean);

    // ── Skip header / noise rows ──
    if (strs.length === 0) continue;
    if (strs.some((s) => s.startsWith("OraBox Kit"))) continue;
    if (strs.some((s) => s.startsWith("Oratorio:"))) continue;
    if (strs.some((s) => s.startsWith("Esportato il"))) continue;
    if (strs.some((s) => s.startsWith("Pagina "))) continue;
    // Skip table header row
    if (strs.includes("Materiale") && strs.includes("Disponibili")) continue;
    // Skip pure summary rows (only numbers and labels like SUFFICIENTI)
    if (
      strs.every(
        (s) =>
          /^\d+$/.test(s) ||
          NOISE.has(s) ||
          ["TOTALE VOCI", "SUFFICIENTI", "IN SCARSITÀ", "MANCANTI"].includes(
            s.toUpperCase(),
          ),
      )
    )
      continue;

    // ── Detect category header ──
    // Pattern: one or two items, second ends with " voci" OR row has "{NAME}" and "{N} voci"
    const vocePart = strs.find((s) => /^\d+\s+voci$/.test(s));
    const isHeader =
      vocePart !== null && strs.length <= 3 && !STATUS_WORDS.has(strs[0]);

    if (isHeader) {
      // Category name = everything except the "{N} voci" part
      const nameparts = strs.filter((s) => s !== vocePart);
      const label = nameparts.join(" ").trim();
      if (label && label !== "Materiale") {
        currentCat = { label, items: [] };
        categories.push(currentCat);
      }
      continue;
    }

    // ── Detect data row ──
    // A data row has: name, number, number, status-word
    // With PDF.js items may be split, so we collect all strs in the row
    // and try to match the pattern from the right: last=status, second-to-last=have, third-to-last=min
    if (!currentCat) continue;

    const s = strs[strs.length - 1];
    if (!STATUS_WORDS.has(s)) continue; // last item must be a status word

    const haveStr = strs[strs.length - 2];
    const minStr = strs[strs.length - 3];

    if (!/^\d+$/.test(haveStr) || !/^\d+$/.test(minStr)) continue;

    const name = strs
      .slice(0, strs.length - 3)
      .join(" ")
      .trim();
    if (!name) continue;

    const have = parseInt(haveStr, 10);
    const min = parseInt(minStr, 10);

    currentCat.items.push({ name, min, have });
  }

  if (!categories.length) return null;
  return { oratorioName, categories };
}

function showImportPreview(parsed) {
  const { oratorioName, categories } = parsed;
  const isNew = !state.list.includes(oratorioName);

  // Summary line
  const totalItems = categories.reduce((s, c) => s + c.items.length, 0);
  const summaryEl = document.getElementById("import-summary");
  summaryEl.innerHTML = `
    <span>📍 Oratorio: <span class="chip">${esc(oratorioName)}</span>${isNew ? ' <span class="import-new-badge">NUOVO</span>' : ""}</span>
    <span>📂 <span class="chip">${categories.length}</span> categorie</span>
    <span>📋 <span class="chip">${totalItems}</span> voci</span>
  `;

  // Per-category preview
  const previewEl = document.getElementById("import-preview");
  let html = `<div class="import-oratorio-info">
    📥 Dati da importare ${isNew ? `— verrà creato un nuovo oratorio "<strong>${esc(oratorioName)}</strong>"` : `— sovrascrive "<strong>${esc(oratorioName)}</strong>"`}
  </div>`;

  categories.forEach((cat) => {
    const existingCat = state.categories.find(
      (c) => c.label.toLowerCase() === cat.label.toLowerCase(),
    );
    const isNewCat = !existingCat;

    html += `<div class="import-cat-block">
      <div class="import-cat-label">
        ${existingCat ? existingCat.icon : "📦"} ${esc(cat.label)}
        ${isNewCat ? '<span class="import-new-badge">NUOVA</span>' : ""}
      </div>`;

    cat.items.forEach((item) => {
      const s =
        item.have === 0 && item.min > 0
          ? "miss"
          : item.have < item.min
            ? "warn"
            : "ok";
      const statoLabel =
        s === "ok" ? "Sufficiente" : s === "warn" ? "In scarsità" : "Mancante";
      html += `<div class="import-row ${s}">
        <span class="import-row-name">${esc(item.name)}</span>
        <span class="import-row-val">${item.min}</span>
        <span class="import-row-val">${item.have}</span>
        <span class="import-row-stato ${s}">${statoLabel}</span>
      </div>`;
    });

    html += `</div>`;
  });

  previewEl.innerHTML = html;
  openModal("modal-import");
}

function confirmImport() {
  if (!pendingImport) return;
  const { oratorioName, categories } = pendingImport;

  // Ensure oratorio exists in state
  if (!state.list.includes(oratorioName)) {
    state.list.push(oratorioName);
    state.data[oratorioName] = {};
  }

  // For each imported category, find or create it in state.categories
  categories.forEach((cat) => {
    let existing = state.categories.find(
      (c) => c.label.toLowerCase() === cat.label.toLowerCase(),
    );
    if (!existing) {
      const id = "cat_" + uid();
      existing = { id, label: cat.label, icon: "📦" };
      state.categories.push(existing);
      // Initialise empty array for all other oratori
      state.list.forEach((o) => {
        if (!state.data[o]) state.data[o] = {};
        if (!state.data[o][existing.id]) state.data[o][existing.id] = [];
      });
    }
    // Overwrite items for this oratorio + category
    state.data[oratorioName][existing.id] = cat.items.map((i) => ({
      name: i.name,
      min: i.min,
      have: i.have,
    }));
  });

  state.current = oratorioName;
  pendingImport = null;
  save();
  closeAllModals();
  render();
  showToast(`✅ Importato "${oratorioName}" — ${categories.length} categorie`);
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAllModals();
  if (
    e.key === "Enter" &&
    document.getElementById("modal-oratorio").classList.contains("open")
  )
    confirmOratorio();
  if (
    e.key === "Enter" &&
    document.getElementById("modal-cat").classList.contains("open")
  )
    confirmCat();
});

/* Sort pills sync on load */
document.querySelectorAll("#cat-sort-pills .sort-pill").forEach((b) => {
  b.addEventListener("click", () => {
    document
      .querySelectorAll("#cat-sort-pills .sort-pill")
      .forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
  });
});

/* ════════════════════════════════════════════
   INIT
════════════════════════════════════════════ */
render();
