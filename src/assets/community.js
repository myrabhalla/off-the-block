/* ==========================================================================
   Off The Block — community wall and feedback
   Same approach as the fueling log: everything lives in localStorage on this
   device. No server, no accounts, nothing uploaded.
   ========================================================================== */

(function () {
  'use strict';

  var MEMBER_STORE = 'offTheBlockMembers.v1';
  var FEEDBACK_STORE = 'offTheBlockFeedback.v1';

  var state = { members: [], feedback: [], filter: 'all' };

  /* ------------------------------ storage ------------------------------ */

  function read(key) {
    try {
      var raw = localStorage.getItem(key);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      alert('Could not save — your browser storage may be full or blocked.');
      return false;
    }
  }

  function newId() {
    return String(Date.now()) + '-' + Math.round(Math.random() * 1e6);
  }

  /* ------------------------------ helpers ------------------------------ */

  var listEl = document.getElementById('feedbackList');
  var memberEl = document.getElementById('memberList');
  var statsEl = document.getElementById('communityStats');
  var filtersEl = document.getElementById('feedbackFilters');
  var joinForm = document.getElementById('joinForm');
  var feedbackForm = document.getElementById('feedbackForm');
  var joinStatus = document.getElementById('joinStatus');
  var feedbackStatus = document.getElementById('feedbackStatus');
  var clearBtn = document.getElementById('clearCommunity');
  var exportBtn = document.getElementById('exportFeedback');

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  // Up to two letters, so the avatar stays legible at 28px on the member pills.
  function initials(name) {
    var parts = String(name).trim().split(/\s+/).slice(0, 2);
    return parts.map(function (p) { return p.charAt(0).toUpperCase(); }).join('') || '?';
  }

  function prettyDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function say(node, message) {
    node.textContent = message;
    node.hidden = false;
    window.clearTimeout(node._timer);
    node._timer = window.setTimeout(function () { node.hidden = true; }, 6000);
  }

  /* ------------------------------ stats ------------------------------ */

  function renderStats() {
    var rated = state.feedback.filter(function (f) { return Number(f.rating) > 0; });
    var avg = rated.length
      ? (rated.reduce(function (sum, f) { return sum + Number(f.rating); }, 0) / rated.length).toFixed(1)
      : '—';

    var roles = {};
    state.members.concat(state.feedback).forEach(function (row) {
      if (row.role) roles[row.role] = true;
    });

    var stats = [
      [String(state.members.length), 'On the wall'],
      [String(state.feedback.length), 'Comments left'],
      [avg, 'Average rating'],
      [String(Object.keys(roles).length), 'Kinds of member']
    ];

    statsEl.textContent = '';
    stats.forEach(function (pair) {
      var box = el('div', 'stat');
      box.appendChild(el('span', 'stat-value', pair[0]));
      box.appendChild(el('span', 'stat-label', pair[1]));
      statsEl.appendChild(box);
    });
  }

  /* ------------------------------ members ------------------------------ */

  function renderMembers() {
    memberEl.textContent = '';

    if (!state.members.length) {
      var box = el('div', 'empty-state');
      box.appendChild(el('p', 'empty-title', 'Nobody on the wall yet'));
      box.appendChild(el('p', null, 'Add your name above and you will be the first.'));
      memberEl.appendChild(box);
      return;
    }

    var list = el('ul', 'member-row');
    state.members.slice().reverse().forEach(function (member) {
      var item = el('li');
      item.appendChild(el('span', 'post-avatar', initials(member.name)));

      var label = member.name + ' · ' + member.role;
      if (member.club) label += ' · ' + member.club;
      item.appendChild(el('span', null, label));

      var remove = el('button', 'entry-remove', '×');
      remove.type = 'button';
      remove.setAttribute('aria-label', 'Remove ' + member.name + ' from the wall');
      remove.addEventListener('click', function () {
        state.members = state.members.filter(function (m) { return m.id !== member.id; });
        write(MEMBER_STORE, state.members);
        render();
      });
      item.appendChild(remove);

      list.appendChild(item);
    });
    memberEl.appendChild(list);
  }

  /* ------------------------------ feedback ------------------------------ */

  function stars(rating) {
    var n = Number(rating) || 0;
    var node = el('span', 'post-stars', '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n));
    node.setAttribute('aria-label', n + ' out of 5');
    return node;
  }

  function buildPost(item) {
    var post = el('article', 'post');

    post.appendChild(el('span', 'post-avatar', initials(item.name)));

    var body = el('div');
    var head = el('div', 'post-head');
    head.appendChild(el('span', 'post-name', item.name));
    head.appendChild(el('span', 'tag', item.role));
    if (Number(item.rating) > 0) head.appendChild(stars(item.rating));
    head.appendChild(el('span', 'post-date', prettyDate(item.created)));
    body.appendChild(head);
    body.appendChild(el('p', 'post-body', item.message));
    post.appendChild(body);

    var remove = el('button', 'entry-remove', 'Remove');
    remove.type = 'button';
    remove.setAttribute('aria-label', 'Remove comment by ' + item.name);
    remove.addEventListener('click', function () {
      state.feedback = state.feedback.filter(function (f) { return f.id !== item.id; });
      write(FEEDBACK_STORE, state.feedback);
      render();
    });
    post.appendChild(remove);

    return post;
  }

  function renderFeedback() {
    listEl.textContent = '';

    var visible = state.feedback.filter(function (f) {
      return state.filter === 'all' || f.role === state.filter;
    });

    if (!state.feedback.length) {
      var empty = el('div', 'empty-state');
      empty.innerHTML =
        '<svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">' +
        '<path d="M6 12h40v26H24l-11 9v-9H6z" stroke="#0b2a52" stroke-width="2.8" stroke-linejoin="round"/>' +
        '<path d="M16 22h20M16 30h13" stroke="#2b8ad4" stroke-width="2.8" stroke-linecap="round"/>' +
        '<circle cx="41" cy="13" r="5" fill="#f26b3a"/></svg>';
      empty.appendChild(el('p', 'empty-title', 'No comments yet'));
      empty.appendChild(el('p', null, 'Leave the first one — what changed for you, or what is still missing.'));
      listEl.appendChild(empty);
      return;
    }

    if (!visible.length) {
      var none = el('div', 'empty-state');
      none.appendChild(el('p', 'empty-title', 'No comments from this group yet'));
      none.appendChild(el('p', null, 'Try selecting “Everyone”.'));
      listEl.appendChild(none);
      return;
    }

    // Newest first: people should see the most recent note without scrolling.
    visible.slice().reverse().forEach(function (item) {
      listEl.appendChild(buildPost(item));
    });
  }

  function render() {
    renderStats();
    renderMembers();
    renderFeedback();
  }

  /* ------------------------------ actions ------------------------------ */

  joinForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var data = new FormData(joinForm);
    var name = String(data.get('name') || '').trim();
    if (!name) return;

    var member = {
      id: newId(),
      name: name,
      role: String(data.get('role') || 'Swimmer'),
      club: String(data.get('club') || '').trim(),
      created: new Date().toISOString()
    };

    state.members.push(member);
    write(MEMBER_STORE, state.members);
    joinForm.reset();
    render();
    say(joinStatus, 'You are on the wall, ' + name + '. Leave a comment when you have used the guide for a bit.');
  });

  feedbackForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var data = new FormData(feedbackForm);
    var name = String(data.get('name') || '').trim();
    var message = String(data.get('message') || '').trim();
    if (!name || !message) return;

    state.feedback.push({
      id: newId(),
      name: name,
      role: String(data.get('role') || 'Swimmer'),
      rating: String(data.get('rating') || ''),
      message: message,
      created: new Date().toISOString()
    });

    write(FEEDBACK_STORE, state.feedback);
    feedbackForm.reset();
    render();
    say(feedbackStatus, 'Posted — thank you. Your comment is saved in this browser.');
    listEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  filtersEl.addEventListener('click', function (event) {
    var button = event.target.closest('.chip');
    if (!button) return;
    state.filter = button.dataset.filter;
    Array.prototype.forEach.call(filtersEl.querySelectorAll('.chip'), function (chip) {
      chip.setAttribute('aria-pressed', String(chip === button));
    });
    renderFeedback();
  });

  clearBtn.addEventListener('click', function () {
    var total = state.members.length + state.feedback.length;
    if (!total) return;
    if (!confirm('Delete all ' + total + ' members and comments on this device? This cannot be undone.')) return;
    state.members = [];
    state.feedback = [];
    write(MEMBER_STORE, state.members);
    write(FEEDBACK_STORE, state.feedback);
    render();
  });

  exportBtn.addEventListener('click', function () {
    if (!state.feedback.length) return;
    var header = ['Date', 'Name', 'Role', 'Rating (1-5)', 'Comment'];
    var rows = state.feedback.map(function (f) {
      return [f.created, f.name, f.role, f.rating, f.message];
    });
    var csv = [header].concat(rows).map(function (row) {
      return row.map(function (cell) {
        return '"' + String(cell === undefined || cell === null ? '' : cell).replace(/"/g, '""') + '"';
      }).join(',');
    }).join('\r\n');

    var link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    link.download = 'off-the-block-feedback.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  });

  /* ------------------------------ init ------------------------------ */

  state.members = read(MEMBER_STORE);
  state.feedback = read(FEEDBACK_STORE);
  render();
})();
