'use strict';

/* ────────────────────────────────────────────
   DATA MODEL
──────────────────────────────────────────── */
const CATEGORIES = [
  { id: 'cancelleria',    label: 'Cancelleria',          icon: '✏️', color: '#EFF6FF', iconBg: '#EFF6FF' },
  { id: 'attrezzatura',  label: 'Attrezzatura sportiva', icon: '⚽', color: '#F0FDF4', iconBg: '#F0FDF4' },
  { id: 'attrezzi',      label: 'Attrezzi',              icon: '🔧', color: '#FFFBEB', iconBg: '#FFFBEB' },
  { id: 'pranzo',        label: 'Pranzo',                icon: '🍽️', color: '#FFF0F3', iconBg: '#FFF0F3' },
  { id: 'pulizie',       label: 'Pulizie',               icon: '🧹', color: '#F0FDF4', iconBg: '#F0FDF4' },
  { id: 'primosoccorso', label: 'Primo soccorso',        icon: '🩹', color: '#FFF1F2', iconBg: '#FFF1F2' },
];

const DEFAULT_ITEMS = {
  cancelleria: [
    { name: 'Fogli bianchi',   min: 100, have: 0 },
    { name: 'Forbici',         min: 5,   have: 0 },
    { name: 'Matite',          min: 10,  have: 0 },
    { name: 'Biro',            min: 10,  have: 0 },
    { name: 'Pennarelli',      min: 2,   have: 0 },
    { name: 'Gomme',           min: 5,   have: 0 },
    { name: 'Nastro adesivo',  min: 3,   have: 0 },
  ],
  attrezzatura: [
    { name: 'Palloni morbidi',     min: 4,  have: 0 },
    { name: 'Pompette',            min: 2,  have: 0 },
    { name: 'Cinesini',            min: 20, have: 0 },
    { name: 'Nastro bianco/rosso', min: 1,  have: 0 },
    { name: 'Palline biliardino',  min: 6,  have: 0 },
    { name: 'Spugne',              min: 5,  have: 0 },
  ],
  attrezzi: [
    { name: 'Ghiaccio spray',  min: 2, have: 0 },
    { name: 'Cacciaviti',      min: 2, have: 0 },
    { name: 'Martello',        min: 1, have: 0 },
  ],
  pranzo: [
    { name: 'Scottex',        min: 10, have: 0 },
    { name: 'Tovagliette',    min: 50, have: 0 },
    { name: 'Forchette',      min: 50, have: 0 },
    { name: 'Piatti',         min: 50, have: 0 },
    { name: 'Bicchieri',      min: 50, have: 0 },
    { name: 'Sacchi rifiuti', min: 10, have: 0 },
  ],
  pulizie: [
    { name: 'Scope',                min: 4,  have: 6  },
    { name: 'Palette',              min: 3,  have: 3  },
    { name: 'Moci',                 min: 4,  have: 8  },
    { name: 'Secchi',               min: 6,  have: 12 },
    { name: 'Ammoniaca',            min: 1,  have: 1  },
    { name: 'Disinfettante tavoli', min: 2,  have: 1  },
    { name: 'Panni',                min: 8,  have: 10 },
    { name: 'Guanti',               min: 10, have: 0  },
    { name: 'Prodotto pavimenti',   min: 1,  have: 0  },
    { name: 'Sapone mani',          min: 3,  have: 0  },
  ],
  primosoccorso: [
    { name: 'Kit pronto soccorso', min: 1,  have: 0 },
    { name: 'Cerotti assortiti',   min: 20, have: 0 },
    { name: 'Garze sterili',       min: 10, have: 0 },
    { name: 'Ghiaccio istantaneo', min: 5,  have: 0 },
    { name: 'Disinfettante',       min: 1,  have: 0 },
  ],
};

/* ────────────────────────────────────────────
   STATE & PERSISTENCE
──────────────────────────────────────────── */
let state = loadState();
let openCats = new Set(CATEGORIES.map(c => c.id));
let addingCat = null;

function loadState() {
  try {
    const raw = localStorage.getItem('oratori_v2');
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return {
    list: ['Pombio', '13'],
    current: 'Pombio',
    data: {
      Pombio: deepClone(DEFAULT_ITEMS),
      '13': deepClone(DEFAULT_ITEMS),
    }
  };
}

function save() {
  try { localStorage.setItem('oratori_v2', JSON.stringify(state)); } catch(e) {}
}

function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }
function cur() { return state.data[state.current]; }

/* ────────────────────────────────────────────
   STATUS HELPERS
──────────────────────────────────────────── */
function getStatus(item) {
  if (item.have === 0 && item.min > 0) return 'miss';
  if (item.have < item.min) return 'warn';
  return 'ok';
}

function badgeHtml(catId) {
  const items = cur()[catId] || [];
  if (!items.length) return '<span class="cat-badge badge-ok">vuota</span>';
  const miss = items.filter(i => getStatus(i) === 'miss').length;
  const warn = items.filter(i => getStatus(i) === 'warn').length;
  if (miss > 0) return `<span class="cat-badge badge-miss">${miss} mancant${miss===1?'e':'i'}</span>`;
  if (warn > 0) return `<span class="cat-badge badge-warn">${warn} in scarsità</span>`;
  return `<span class="cat-badge badge-ok">tutto ok</span>`;
}

/* ────────────────────────────────────────────
   ESCAPE HELPERS
──────────────────────────────────────────── */
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function escAttr(str) { return esc(str); }

/* ────────────────────────────────────────────
   RENDER
──────────────────────────────────────────── */
function render() {
  renderTabs();
  renderSummary();
  renderCategories();
}

function renderTabs() {
  const el = document.getElementById('oratorio-tabs');
  el.innerHTML = state.list.map(o =>
    `<button class="oratorio-tab${o===state.current?' active':''}"
      onclick="switchOratorio('${escAttr(o)}')"
      role="tab"
      aria-selected="${o===state.current}">${esc(o)}</button>`
  ).join('');
}

function renderSummary() {
  const data = cur();
  let tot=0, ok=0, warn=0, miss=0;
  CATEGORIES.forEach(cat => {
    (data[cat.id]||[]).forEach(item => {
      tot++;
      const s = getStatus(item);
      if(s==='ok') ok++;
      else if(s==='warn') warn++;
      else miss++;
    });
  });
  document.getElementById('summary').innerHTML = `
    <div class="summary-card"><div class="s-num">${tot}</div><div class="s-label">Totale voci</div></div>
    <div class="summary-card s-ok"><div class="s-num">${ok}</div><div class="s-label">Sufficienti</div></div>
    <div class="summary-card s-warn"><div class="s-num">${warn}</div><div class="s-label">Pochi</div></div>
    <div class="summary-card s-miss"><div class="s-num">${miss}</div><div class="s-label">Mancanti</div></div>
  `;
}

function renderCategories() {
  const data = cur();
  const container = document.getElementById('categories');
  container.innerHTML = CATEGORIES.map(cat => {
    const items = data[cat.id] || [];
    const open = openCats.has(cat.id);

    const rows = items.map((item, idx) => {
      const s = getStatus(item);
      const pipCls = s==='ok'?'pip-ok':s==='warn'?'pip-warn':'pip-miss';
      const inputCls = s==='ok'?'':s==='warn'?' warn':' miss';
      return `<tr>
        <td>
          <div class="item-name">
            <span class="status-pip ${pipCls}" title="${s==='ok'?'Sufficiente':s==='warn'?'In scarsità':'Mancante'}"></span>
            ${esc(item.name)}
          </div>
        </td>
        <td class="c">
          <div class="num-wrap">
            <input class="num-input" type="number" min="0" value="${item.min}"
              aria-label="Minimo necessario per ${esc(item.name)}"
              onchange="updateMin('${cat.id}',${idx},this.value)"
              onkeydown="if(event.key==='Enter')this.blur()" />
          </div>
        </td>
        <td class="c">
          <div class="num-wrap">
            <input class="num-input${inputCls}" type="number" min="0" value="${item.have}"
              aria-label="Disponibili di ${esc(item.name)}"
              onchange="updateHave('${cat.id}',${idx},this.value)"
              onkeydown="if(event.key==='Enter')this.blur()" />
          </div>
        </td>
        <td class="c">
          <button class="btn btn-ghost btn-danger" onclick="delItem('${cat.id}',${idx})"
            title="Elimina ${esc(item.name)}" aria-label="Elimina ${esc(item.name)}" style="padding:5px 8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </td>
      </tr>`;
    }).join('');

    const addRow = addingCat === cat.id
      ? `<div class="cat-footer">
          <input class="add-input" id="add-input-${cat.id}" placeholder="Nome materiale…"
            onkeydown="handleAddKey(event,'${cat.id}')" />
          <button class="btn" style="padding:6px 12px;" onclick="confirmAdd('${cat.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            OK
          </button>
          <button class="btn btn-ghost" onclick="cancelAdd()" style="padding:6px 10px;" aria-label="Annulla">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>`
      : `<div class="cat-footer">
          <button class="btn btn-ghost" style="font-size:12px; gap:5px;" onclick="startAdd('${cat.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="13" height="13" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Aggiungi materiale
          </button>
        </div>`;

    return `<div class="cat-card" id="cat-${cat.id}">
      <div class="cat-header" onclick="toggleCat('${cat.id}')" role="button" tabindex="0"
        aria-expanded="${open}" aria-controls="cat-body-${cat.id}"
        onkeydown="if(event.key==='Enter'||event.key===' ')toggleCat('${cat.id}')">
        <div class="cat-icon" style="background:${cat.color};" aria-hidden="true">${cat.icon}</div>
        <span class="cat-title">${cat.label}</span>
        <span class="cat-meta">${items.length} voci</span>
        ${badgeHtml(cat.id)}
        <svg class="chevron${open?' open':''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      ${open ? `<div class="cat-body" id="cat-body-${cat.id}" role="region" aria-label="${cat.label}">
        <table class="items-table" aria-label="Materiali ${cat.label}">
          <thead><tr>
            <th>Materiale</th>
            <th class="c">Min. necessario</th>
            <th class="c">Disponibili</th>
            <th></th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
        ${addRow}
      </div>` : ''}
    </div>`;
  }).join('');

  if (addingCat) {
    const inp = document.getElementById('add-input-' + addingCat);
    if (inp) inp.focus();
  }
}

/* ────────────────────────────────────────────
   ACTIONS
──────────────────────────────────────────── */
function switchOratorio(name) {
  state.current = name;
  save();
  render();
}

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

function toggleCat(id) {
  if (openCats.has(id)) openCats.delete(id);
  else openCats.add(id);
  renderCategories();
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
  const inp = document.getElementById('add-input-' + catId);
  const name = (inp ? inp.value : '').trim();
  if (!name) { cancelAdd(); return; }
  if (!cur()[catId]) cur()[catId] = [];
  cur()[catId].push({ name, min: 1, have: 0 });
  addingCat = null;
  save();
  render();
  showToast(`"${name}" aggiunto`);
}

function handleAddKey(e, catId) {
  if (e.key === 'Enter') confirmAdd(catId);
  if (e.key === 'Escape') cancelAdd();
}

/* ────────────────────────────────────────────
   ORATORIO MODAL
──────────────────────────────────────────── */
function showModal() {
  document.getElementById('modal').classList.add('open');
  setTimeout(() => document.getElementById('modal-input').focus(), 50);
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.getElementById('modal-input').value = '';
}

function confirmAddOratorio() {
  const name = document.getElementById('modal-input').value.trim();
  if (!name) return;
  if (state.list.includes(name)) {
    showToast('Oratorio già esistente', true);
    return;
  }
  state.list.push(name);
  state.data[name] = deepClone(DEFAULT_ITEMS);
  state.current = name;
  save();
  closeModal();
  render();
  showToast(`Oratorio "${name}" creato`);
}

/* ────────────────────────────────────────────
   TOAST
──────────────────────────────────────────── */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ────────────────────────────────────────────
   PDF EXPORT
──────────────────────────────────────────── */
function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const now = new Date().toLocaleDateString('it-IT', { day:'2-digit', month:'long', year:'numeric' });

  // Header block
  doc.setFillColor(245, 243, 240);
  doc.roundedRect(margin, 14, pageW - margin*2, 20, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(26, 25, 22);
  doc.text(`Materiali — ${state.current}`, margin + 6, 23);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(122, 117, 112);
  doc.text(`Esportato il ${now}`, pageW - margin - 2, 23, { align: 'right' });

  // Summary row
  const data = cur();
  let totOk=0, totWarn=0, totMiss=0, totTot=0;
  CATEGORIES.forEach(cat => {
    (data[cat.id]||[]).forEach(item => {
      totTot++;
      const s = getStatus(item);
      if(s==='ok') totOk++;
      else if(s==='warn') totWarn++;
      else totMiss++;
    });
  });
  doc.setFontSize(8.5);
  doc.setTextColor(122, 117, 112);
  doc.text(`${totTot} voci totali  ·  ${totOk} sufficienti  ·  ${totWarn} in scarsità  ·  ${totMiss} mancanti`, margin + 6, 30);

  let y = 42;

  CATEGORIES.forEach(cat => {
    const items = (data[cat.id] || []);
    if (!items.length) return;

    if (y > pageH - 50) { doc.addPage(); y = 20; }

    // Category header
    doc.setFillColor(230, 230, 226);
    doc.roundedRect(margin, y - 4, pageW - margin*2, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(26, 25, 22);
    doc.text(cat.label.toUpperCase(), margin + 4, y + 3);
    y += 12;

    // Table
    const tableRows = items.map(item => {
      const s = getStatus(item);
      const statusLabel = s === 'ok' ? '✓' : s === 'warn' ? '!' : '✗';
      return [item.name, item.min.toString(), item.have.toString(), statusLabel];
    });

    doc.autoTable({
      startY: y,
      head: [['Materiale', 'Min. necessario', 'Disponibili', 'Stato']],
      body: tableRows,
      margin: { left: margin, right: margin },
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
        textColor: [26, 25, 22],
        lineColor: [226, 221, 215],
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: [247, 246, 243],
        textColor: [122, 117, 112],
        fontStyle: 'normal',
        fontSize: 8,
      },
      alternateRowStyles: { fillColor: [252, 251, 249] },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 32, halign: 'center' },
        2: { cellWidth: 28, halign: 'center' },
        3: { cellWidth: 18, halign: 'center' },
      },
      didParseCell(data) {
        if (data.column.index === 3 && data.section === 'body') {
          const v = data.cell.raw;
          if (v === '✓') data.cell.styles.textColor = [16, 185, 129];
          else if (v === '!') data.cell.styles.textColor = [245, 158, 11];
          else data.cell.styles.textColor = [239, 68, 68];
        }
      },
      didDrawPage() {},
    });

    y = doc.lastAutoTable.finalY + 10;
  });

  // Footer on every page
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(176, 170, 164);
    doc.text(`Pagina ${i} di ${pages}`, pageW / 2, pageH - 10, { align: 'center' });
    doc.text(`materiali oratori — ${state.current}`, margin, pageH - 10);
  }

  doc.save(`materiali-${state.current.toLowerCase().replace(/\s+/g,'-')}-${new Date().toISOString().slice(0,10)}.pdf`);
  showToast('PDF esportato');
}

/* ────────────────────────────────────────────
   EVENT LISTENERS (modal & keyboard)
──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modal').addEventListener('click', e => {
    if (e.target === document.getElementById('modal')) closeModal();
  });

  document.getElementById('modal-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') confirmAddOratorio();
    if (e.key === 'Escape') closeModal();
  });

  render();
});
