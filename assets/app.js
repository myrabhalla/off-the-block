/* ==========================================================================
   Off The Block — fueling log
   Entries live in localStorage on this device only. Nothing is uploaded.
   ========================================================================== */

(function () {
  'use strict';

  var STORE = 'offTheBlockLog.v2';
  var LEGACY_STORE = 'offTheBlockLogs';

  var PHASES = ['before', 'during', 'after'];
  var PHASE_LABEL = { before: 'Before', during: 'During', after: 'After' };
  var CONTEXT_LABEL = { training: 'Training', competition: 'Competition' };

  var state = { entries: [], filter: 'all' };

  /* ------------------------------ storage ------------------------------ */

  function read() {
    try {
      var raw = localStorage.getItem(STORE);
      if (raw) return JSON.parse(raw) || [];
    } catch (e) { /* fall through to migration */ }
    return migrateLegacy();
  }

  function migrateLegacy() {
    var old;
    try {
      old = JSON.parse(localStorage.getItem(LEGACY_STORE)) || [];
    } catch (e) {
      return [];
    }
    var migrated = old.map(function (row, i) {
      var timing = String(row.timing || '').toLowerCase();
      var context = timing.indexOf('competition') > -1 ? 'competition' : 'training';
      var phase = 'before';
      if (timing.indexOf('during') > -1) phase = 'during';
      else if (timing.indexOf('post') > -1 || timing.indexOf('after') > -1) phase = 'after';
      return {
        id: row.id || 'legacy-' + i,
        date: row.date || '',
        context: context,
        phase: phase,
        food: row.food || '',
        fluid: '',
        energy: '',
        notes: row.notes || ''
      };
    }).filter(function (row) { return row.date && row.food; });
    if (migrated.length) write(migrated);
    return migrated;
  }

  function write(entries) {
    try {
      localStorage.setItem(STORE, JSON.stringify(entries));
    } catch (e) {
      alert('Could not save — your browser storage may be full or blocked.');
    }
  }

  /* ------------------------------ dates ------------------------------ */

  // Parse YYYY-MM-DD as a local date so the label never shifts a day.
  function parseDate(iso) {
    var p = String(iso).split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }

  function todayISO() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function dayLabel(iso) {
    var pretty = parseDate(iso).toLocaleDateString(undefined, {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    var diff = Math.round((parseDate(todayISO()) - parseDate(iso)) / 86400000);
    if (diff === 0) return 'Today — ' + pretty;
    if (diff === 1) return 'Yesterday — ' + pretty;
    return pretty;
  }

  /* ------------------------------ elements ------------------------------ */

  var form = document.getElementById('logForm');
  var listEl = document.getElementById('logList');
  var statsEl = document.getElementById('logStats');
  var filtersEl = document.getElementById('logFilters');
  var clearBtn = document.getElementById('clearAll');
  var exportBtn = document.getElementById('exportCsv');

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  /* ------------------------------ stats ------------------------------ */

  function renderStats() {
    var entries = state.entries;
    var weekAgo = parseDate(todayISO()).getTime() - 6 * 86400000;
    var thisWeek = entries.filter(function (e) {
      return parseDate(e.date).getTime() >= weekAgo;
    }).length;

    var days = {};
    entries.forEach(function (e) { days[e.date] = true; });

    var rated = entries.filter(function (e) { return Number(e.energy) > 0; });
    var avg = rated.length
      ? (rated.reduce(function (sum, e) { return sum + Number(e.energy); }, 0) / rated.length).toFixed(1)
      : '—';

    var stats = [
      [String(entries.length), 'Entries logged'],
      [String(thisWeek), 'In the last 7 days'],
      [String(Object.keys(days).length), 'Days covered'],
      [String(avg), 'Average energy']
    ];

    statsEl.textContent = '';
    stats.forEach(function (pair) {
      var box = el('div', 'stat');
      box.appendChild(el('span', 'stat-value', pair[0]));
      box.appendChild(el('span', 'stat-label', pair[1]));
      statsEl.appendChild(box);
    });
  }

  /* ------------------------------ entries ------------------------------ */

  function energyDots(value) {
    var wrap = el('span', 'energy-dots');
    for (var i = 1; i <= 5; i++) {
      wrap.appendChild(el('i', i <= Number(value) ? 'on' : ''));
    }
    return wrap;
  }

  function buildEntry(entry) {
    var row = el('article', 'entry' + (entry.context === 'competition' ? ' is-competition' : ''));

    var when = el('div', 'entry-when');
    var tag = el('span', 'tag tag-' + entry.context, CONTEXT_LABEL[entry.context] || 'Training');
    when.appendChild(tag);
    when.appendChild(el('span', 'entry-phase', PHASE_LABEL[entry.phase] || 'Before'));
    row.appendChild(when);

    var body = el('div', 'entry-body');
    body.appendChild(el('p', 'entry-food', entry.food));
    if (entry.notes) body.appendChild(el('p', 'entry-notes', entry.notes));

    var meta = el('div', 'entry-meta');
    if (entry.fluid) {
      meta.appendChild(el('span', null, entry.fluid + ' oz fluid'));
    }
    if (Number(entry.energy) > 0) {
      var energy = el('span');
      energy.appendChild(el('span', null, 'Energy'));
      energy.appendChild(energyDots(entry.energy));
      meta.appendChild(energy);
    }
    if (meta.childNodes.length) body.appendChild(meta);
    row.appendChild(body);

    var remove = el('button', 'entry-remove', 'Remove');
    remove.type = 'button';
    remove.setAttribute('aria-label', 'Remove entry: ' + entry.food);
    remove.addEventListener('click', function () {
      state.entries = state.entries.filter(function (e) { return e.id !== entry.id; });
      write(state.entries);
      render();
    });
    row.appendChild(remove);

    return row;
  }

  function emptyState() {
    var box = el('div', 'empty-state');
    box.innerHTML =
      '<svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">' +
      '<path d="M4 32c5-4.5 9.5-4.5 14.5 0S28 36.5 33 32s9.5-4.5 15 0" stroke="#63a5f2" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="M4 42c5-4.5 9.5-4.5 14.5 0S28 46.5 33 42s9.5-4.5 15 0" stroke="#2f6fe0" stroke-width="2.6" stroke-linecap="round"/>' +
      '<circle cx="33" cy="14" r="6" stroke="#8ed6ef" stroke-width="2.6"/>' +
      '<path d="M9 24c7-5.5 15-5.5 22 0" stroke="#8ed6ef" stroke-width="2.6" stroke-linecap="round"/></svg>';
    box.appendChild(el('p', 'empty-title', 'Nothing logged yet'));
    box.appendChild(el('p', null, 'Add your first entry above. A week of entries is usually enough to start seeing patterns.'));
    return box;
  }

  function noMatchState() {
    var box = el('div', 'empty-state');
    box.appendChild(el('p', 'empty-title', 'No entries match this filter'));
    box.appendChild(el('p', null, 'Try selecting “All entries”.'));
    return box;
  }

  function render() {
    renderStats();

    var visible = state.entries.filter(function (e) {
      return state.filter === 'all' || e.context === state.filter;
    });

    listEl.textContent = '';

    if (!state.entries.length) {
      listEl.appendChild(emptyState());
      return;
    }
    if (!visible.length) {
      listEl.appendChild(noMatchState());
      return;
    }

    // Group by date, newest day first; within a day, ordered before → during → after.
    var byDate = {};
    visible.forEach(function (e) {
      (byDate[e.date] = byDate[e.date] || []).push(e);
    });

    Object.keys(byDate).sort().reverse().forEach(function (date) {
      var group = el('section', 'day-group');
      group.appendChild(el('h3', 'day-label', dayLabel(date)));
      byDate[date]
        .sort(function (a, b) { return PHASES.indexOf(a.phase) - PHASES.indexOf(b.phase); })
        .forEach(function (entry) { group.appendChild(buildEntry(entry)); });
      listEl.appendChild(group);
    });
  }

  /* ------------------------------ actions ------------------------------ */

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var data = new FormData(form);
    state.entries.push({
      id: String(Date.now()) + '-' + Math.round(Math.random() * 1e6),
      date: data.get('date'),
      context: data.get('context'),
      phase: data.get('phase'),
      food: String(data.get('food') || '').trim(),
      fluid: String(data.get('fluid') || '').trim(),
      energy: String(data.get('energy') || ''),
      notes: String(data.get('notes') || '').trim()
    });
    write(state.entries);
    var keepDate = data.get('date');
    form.reset();
    form.elements.date.value = keepDate;
    render();
    listEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  filtersEl.addEventListener('click', function (event) {
    var button = event.target.closest('.chip');
    if (!button) return;
    state.filter = button.dataset.filter;
    Array.prototype.forEach.call(filtersEl.querySelectorAll('.chip'), function (chip) {
      chip.setAttribute('aria-pressed', String(chip === button));
    });
    render();
  });

  clearBtn.addEventListener('click', function () {
    if (!state.entries.length) return;
    if (!confirm('Delete all ' + state.entries.length + ' log entries? This cannot be undone.')) return;
    state.entries = [];
    write(state.entries);
    render();
  });

  exportBtn.addEventListener('click', function () {
    if (!state.entries.length) return;
    var header = ['Date', 'Context', 'Phase', 'Food and drink', 'Fluid (oz)', 'Energy (1-5)', 'Notes'];
    var rows = state.entries
      .slice()
      .sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; })
      .map(function (e) {
        return [e.date, CONTEXT_LABEL[e.context], PHASE_LABEL[e.phase], e.food, e.fluid, e.energy, e.notes];
      });
    var csv = [header].concat(rows).map(function (row) {
      return row.map(function (cell) {
        return '"' + String(cell === undefined || cell === null ? '' : cell).replace(/"/g, '""') + '"';
      }).join(',');
    }).join('\r\n');

    var link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    link.download = 'off-the-block-log-' + todayISO() + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  });

  /* ------------------------------ init ------------------------------ */

  state.entries = read();
  form.elements.date.value = todayISO();
  render();
})();
