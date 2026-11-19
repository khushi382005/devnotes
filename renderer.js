const $ = (id) => document.getElementById(id);

let notes = loadNotes();
let activeCategory = 'All';
let editId = null;

function loadNotes() {
  try { return JSON.parse(localStorage.getItem('devnotes')) || []; }
  catch (e) { return []; }
}
function saveNotes() {
  localStorage.setItem('devnotes', JSON.stringify(notes));
}
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1600);
}
function fmtDate(ts) {
  if (!ts) return 'Earlier';
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ---------- Modal ---------- */
function openModal(note) {
  editId = note ? note.id : null;
  $('modalTitle').textContent = note ? 'Edit Note' : 'New Note';
  $('titleInput').value = note ? note.title : '';
  $('categoryInput').value = note ? note.category : (activeCategory !== 'All' ? activeCategory : '');
  $('codeInput').value = note ? note.code : '';
  $('langInput').value = note ? (note.lang || 'auto') : 'auto';
  $('draftNote').textContent = '';
  if (!note) restoreDraft();
  $('catSuggestions').innerHTML = '';
  [...new Set(notes.map((n) => n.category))].forEach((c) => {
    const o = document.createElement('option');
    o.value = c;
    $('catSuggestions').appendChild(o);
  });
  $('modal').classList.remove('hidden');
  $('titleInput').focus();
}
function closeModal() {
  $('modal').classList.add('hidden');
  editId = null;
}

$('newBtn').addEventListener('click', () => openModal());
$('closeBtn').addEventListener('click', closeModal);
$('cancelBtn').addEventListener('click', closeModal);
$('modal').addEventListener('click', (e) => { if (e.target === $('modal')) closeModal(); });

$('saveBtn').addEventListener('click', () => {
  const title = $('titleInput').value.trim();
  const category = $('categoryInput').value.trim() || 'General';
  const code = $('codeInput').value;
  const lang = $('langInput').value;
  if (!title || !code.trim()) {
    toast('Please enter both a title and some code/note');
    return;
  }
  if (editId) {
    const n = notes.find((x) => x.id === editId);
    n.title = title; n.category = category; n.code = code; n.lang = lang;
    toast('Note updated');
  } else {
    notes.unshift({ id: Date.now(), title, category, code, lang, createdAt: Date.now() });
    toast('Note saved');
  }
  saveNotes();
  clearDraft();
  closeModal();
  render();
});

/* ---------- Auto-save draft ---------- */
function saveDraft() {
  if (editId) return; // drafts are only for new notes
  const d = { title: $('titleInput').value, category: $('categoryInput').value, lang: $('langInput').value, code: $('codeInput').value };
  if (d.title.trim() || d.category.trim() || d.code.trim()) {
    localStorage.setItem('devnotes-draft', JSON.stringify(d));
    $('draftNote').textContent = '✍️ Draft auto-saved';
  } else {
    localStorage.removeItem('devnotes-draft');
    $('draftNote').textContent = '';
  }
}
function getDraft() {
  try { return JSON.parse(localStorage.getItem('devnotes-draft')); } catch (e) { return null; }
}
function clearDraft() { localStorage.removeItem('devnotes-draft'); }
function restoreDraft() {
  const d = getDraft();
  if (!d) return false;
  $('titleInput').value = d.title || '';
  $('categoryInput').value = d.category || $('categoryInput').value;
  $('langInput').value = d.lang || 'auto';
  $('codeInput').value = d.code || '';
  $('draftNote').textContent = '✍️ Unsaved draft restored';
  return true;
}
['titleInput', 'categoryInput', 'codeInput'].forEach((id) => $(id).addEventListener('input', saveDraft));
$('langInput').addEventListener('change', saveDraft);

/* ---------- Actions ---------- */
function deleteNote(id) {
  if (!confirm('Delete this note?')) return;
  notes = notes.filter((n) => n.id !== id);
  if (activeCategory !== 'All' && !notes.some((n) => n.category === activeCategory)) activeCategory = 'All';
  saveNotes();
  render();
  toast('Note deleted');
}
function copyNote(code, btn) {
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = '✅ Copied';
    setTimeout(() => (btn.textContent = '📋 Copy'), 1200);
  });
}

/* ---------- Syntax highlighting ---------- */
const LANG_NAMES = { cpp: 'C++', c: 'C', java: 'Java', python: 'Python', javascript: 'JavaScript', typescript: 'TypeScript',
  csharp: 'C#', php: 'PHP', sql: 'SQL', xml: 'HTML', css: 'CSS', bash: 'Bash', json: 'JSON', plaintext: 'Text' };
function highlightCode(n) {
  try {
    if (n.lang && n.lang !== 'auto') {
      return { html: hljs.highlight(n.code, { language: n.lang, ignoreIllegals: true }).value, label: LANG_NAMES[n.lang] || n.lang };
    }
    const r = hljs.highlightAuto(n.code);
    return { html: r.value, label: r.language ? (LANG_NAMES[r.language] || r.language) : 'Text' };
  } catch (e) {
    const d = document.createElement('div');
    d.textContent = n.code;
    return { html: d.innerHTML, label: 'Text' };
  }
}

/* ---------- Rendering ---------- */
function renderSidebar() {
  const list = $('categoryList');
  list.innerHTML = '';
  const cats = [...new Set(notes.map((n) => n.category))];
  const items = [['All', notes.length], ...cats.map((c) => [c, notes.filter((n) => n.category === c).length])];
  items.forEach(([name, count]) => {
    const li = document.createElement('li');
    if (name === activeCategory) li.classList.add('active');
    const label = document.createElement('span');
    label.textContent = (name === 'All' ? '📚 ' : '📁 ') + name;
    const pill = document.createElement('span');
    pill.className = 'pill';
    pill.textContent = count;
    li.append(label, pill);
    li.onclick = () => { activeCategory = name; render(); };
    list.appendChild(li);
  });
}

function renderStats() {
  $('statTotal').textContent = notes.length;
  $('statCats').textContent = new Set(notes.map((n) => n.category)).size;
  const today = new Date().toDateString();
  $('statToday').textContent = notes.filter((n) => n.createdAt && new Date(n.createdAt).toDateString() === today).length;
}

function buildCard(n, index) {
  const card = document.createElement('div');
  card.className = 'note';
  card.style.setProperty('--i', Math.min(index, 8));

  const head = document.createElement('div');
  head.className = 'note-head';
  const h3 = document.createElement('h3');
  h3.textContent = n.title;
  const tag = document.createElement('span');
  tag.className = 'tag';
  tag.textContent = n.category;
  const tags = document.createElement('div');
  tags.className = 'tags';
  const langInfo = highlightCode(n);
  const langTag = document.createElement('span');
  langTag.className = 'tag lang';
  langTag.textContent = langInfo.label;
  tags.append(langTag, tag);
  head.append(h3, tags);

  const date = document.createElement('div');
  date.className = 'date';
  date.textContent = fmtDate(n.createdAt);

  const wrap = document.createElement('div');
  wrap.className = 'code-wrap';
  const pre = document.createElement('pre');
  pre.className = 'code';
  const codeEl = document.createElement('code');
  codeEl.className = 'hljs';
  codeEl.innerHTML = langInfo.html; // produced by highlight.js, which escapes the code
  pre.appendChild(codeEl);
  const fade = document.createElement('div');
  fade.className = 'fade';
  wrap.append(pre, fade);

  const isLong = n.code.split('\n').length > 7 || n.code.length > 350;
  let moreBtn = null;
  if (isLong) {
    pre.classList.add('collapsed');
    wrap.classList.add('has-more');
    moreBtn = document.createElement('button');
    moreBtn.className = 'more-btn';
    moreBtn.textContent = 'Show more ▾';
    moreBtn.onclick = () => {
      const collapsed = pre.classList.toggle('collapsed');
      pre.classList.toggle('expanded', !collapsed);
      wrap.classList.toggle('has-more', collapsed);
      moreBtn.textContent = collapsed ? 'Show more ▾' : 'Show less ▴';
    };
  }

  const actions = document.createElement('div');
  actions.className = 'actions';
  const copyBtn = document.createElement('button');
  copyBtn.className = 'btn primary';
  copyBtn.textContent = '📋 Copy';
  copyBtn.onclick = () => copyNote(n.code, copyBtn);
  const editBtn = document.createElement('button');
  editBtn.className = 'btn ghost';
  editBtn.textContent = '✏️ Edit';
  editBtn.onclick = () => openModal(n);
  const delBtn = document.createElement('button');
  delBtn.className = 'btn danger';
  delBtn.textContent = '🗑 Delete';
  delBtn.onclick = () => deleteNote(n.id);
  actions.append(copyBtn, editBtn, delBtn);

  card.append(head, date, wrap);
  if (moreBtn) card.appendChild(moreBtn);
  card.appendChild(actions);
  return card;
}

function render() {
  renderSidebar();
  renderStats();

  const q = $('searchBox').value.trim().toLowerCase();
  const filtered = notes.filter((n) =>
    (activeCategory === 'All' || n.category === activeCategory) &&
    (n.title.toLowerCase().includes(q) ||
     n.code.toLowerCase().includes(q) ||
     n.category.toLowerCase().includes(q))
  );

  $('listTitle').textContent = activeCategory === 'All' ? 'All Notes' : activeCategory;
  $('countLabel').textContent = filtered.length + (filtered.length === 1 ? ' note' : ' notes');

  const box = $('notesContainer');
  box.innerHTML = '';
  if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    const icon = document.createElement('div');
    icon.textContent = '🗒️';
    const msg = document.createElement('p');
    msg.textContent = notes.length === 0
      ? 'No notes yet. Click "New Note" to add your first snippet!'
      : 'No notes match your search.';
    empty.append(icon, msg);
    box.appendChild(empty);
    return;
  }
  filtered.forEach((n, i) => box.appendChild(buildCard(n, i)));
}

/* ---------- Search, theme, shortcuts ---------- */
$('searchBox').addEventListener('input', render);

const themeBtn = $('themeBtn');
function applyTheme(dark) {
  document.body.classList.toggle('dark', dark);
  $('hlLight').disabled = dark;
  $('hlDark').disabled = !dark;
  themeBtn.textContent = dark ? '☀️ Light Mode' : '🌙 Dark Mode';
}
applyTheme(localStorage.getItem('devnotes-theme') === 'dark');
themeBtn.addEventListener('click', () => {
  const dark = !document.body.classList.contains('dark');
  applyTheme(dark);
  localStorage.setItem('devnotes-theme', dark ? 'dark' : 'light');
});

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === 'k') { e.preventDefault(); $('searchBox').focus(); }
  if (e.key === 'Escape') closeModal();
});

render();

// If the app was closed while a new note was half-written, bring it back
if (getDraft()) setTimeout(() => openModal(), 3400);
