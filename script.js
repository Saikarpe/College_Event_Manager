/* ============================================================
   CampusConnect — script.js
   College Event Management (with_DB version)

   ALL DATA COMES FROM MySQL DATABASE via PHP APIs.
   No hardcoded clubs or events — the database is the single source of truth.

   Flow:
     1. Page loads → init() runs
     2. init() fetches departments, clubs, events from PHP
     3. Data is stored in JS arrays TEMPORARILY (for rendering only)
     4. Any add/delete operation calls PHP → updates MySQL → refreshes local arrays
============================================================ */


/* ──────────────────────────────────────
   SECTION 1: STATE VARIABLES
   These start EMPTY — filled by PHP API calls in init()
────────────────────────────────────── */

let departments = [];   /* Filled by get_departments.php */
let clubs = [];   /* Filled by get_clubs.php       */
let events = [];   /* Filled by get_events.php      */
let loggedInDept = null; /* Set after successful login    */


/* ──────────────────────────────────────
   SECTION 2: PAGE ROUTING
────────────────────────────────────── */

/**
 * showPage(name) — shows page-{name} and hides all others.
 */
function showPage(name) {
  document.querySelectorAll('.page').forEach(function (page) {
    page.classList.remove('active');
  });
  document.getElementById('page-' + name).classList.add('active');
  window.scrollTo(0, 0);
}


/* ──────────────────────────────────────
   SECTION 3: INITIALISATION
   Fetches all data from PHP/MySQL on page load.
   Shows an error message if the server is not running.
────────────────────────────────────── */

/**
 * init() — entry point. Loads all data from the database.
 */
async function init() {

  /* Show a loading message while data is being fetched */
  document.getElementById('eventsGrid').innerHTML = '<div class="empty-state"><p>⏳ Loading events from database...</p></div>';
  document.getElementById('clubsGrid').innerHTML = '<div class="empty-state"><p>⏳ Loading clubs...</p></div>';

  /* Step 1: Fetch departments from MySQL */
  const deptOk = await loadDepartments();

  if (!deptOk) {
    /* If departments can't be loaded, the DB is unreachable — show error and stop */
    const errMsg = '<div class="empty-state"><p>❌ Cannot connect to database.<br>Please start XAMPP and make sure MySQL is running.</p></div>';
    document.getElementById('eventsGrid').innerHTML = errMsg;
    document.getElementById('clubsGrid').innerHTML = errMsg;
    return; /* Stop further execution */
  }

  /* Step 2: Populate department dropdowns now that we have the data */
  populateDeptDropdowns();

  /* Step 3: Fetch clubs and events in parallel using Promise.all() */
  await Promise.all([loadClubs(), loadEvents()]);

  /* Step 4: Render everything on screen */
  renderEvents();
  renderClubs();
  updateStats();
}

/* ── Individual data loaders ── */

/**
 * loadDepartments() — fetches departments from get_departments.php
 * Returns true on success, false on failure.
 */
async function loadDepartments() {
  try {
    const response = await fetch('php/get_departments.php');
    const data = await response.json();
    if (data.success) {
      departments = data.departments; /* Store in local array */
      return true;
    }
    return false;
  } catch (error) {
    /* fetch() throws if PHP file not found or server is offline */
    console.error('loadDepartments failed:', error);
    return false;
  }
}

/**
 * loadClubs() — fetches all clubs from get_clubs.php
 */
async function loadClubs() {
  try {
    const response = await fetch('php/get_clubs.php');
    const data = await response.json();
    if (data.success) clubs = data.clubs;
  } catch (error) {
    console.error('loadClubs failed:', error);
  }
}

/**
 * loadEvents() — fetches all events from get_events.php
 */
async function loadEvents() {
  try {
    const response = await fetch('php/get_events.php');
    const data = await response.json();
    if (data.success) events = data.events;
  } catch (error) {
    console.error('loadEvents failed:', error);
  }
}


/* ──────────────────────────────────────
   SECTION 4: POPULATE DEPT DROPDOWNS
   Builds <option> elements from the departments array (fetched from DB)
────────────────────────────────────── */

function populateDeptDropdowns() {
  /* Filter dropdown on the home page */
  const filterSelect = document.getElementById('filterDept');
  if (filterSelect) {
    filterSelect.innerHTML = '<option value="all">All Departments</option>';
    departments.forEach(function (dept) {
      var option = document.createElement('option');
      option.value = dept.id;
      option.textContent = dept.name;
      filterSelect.appendChild(option);
    });
  }

  /* Department dropdown on the login page */
  const loginSelect = document.getElementById('loginDept');
  if (loginSelect) {
    loginSelect.innerHTML = '<option value="">Select your department...</option>';
    departments.forEach(function (dept) {
      var option = document.createElement('option');
      option.value = dept.id;
      option.textContent = dept.name;
      loginSelect.appendChild(option);
    });
  }
}


/* ──────────────────────────────────────
   SECTION 5: RENDER EVENTS
   Builds event cards from the events array (fetched from DB)
────────────────────────────────────── */

/**
 * renderEvents(list) — renders event cards.
 * @param {Array} list — optional filtered subset; defaults to all events.
 */
function renderEvents(list) {
  const display = list || events;
  const grid = document.getElementById('eventsGrid');

  if (display.length === 0) {
    grid.innerHTML = '<div class="empty-state"><p>📭 No events found.</p></div>';
    return;
  }

  grid.innerHTML = display.map(function (event) {
    /* Find department short name from our departments array */
    const dept = departments.find(function (d) { return d.id === event.dept_id; });
    const deptShort = dept ? dept.short_name : event.dept_id.toUpperCase();

    const badgeClass = 'badge-' + event.status;

    return '<div class="event-card" onclick="openModal(' + event.id + ')">' +
      '<div class="card-stripe ' + event.status + '"></div>' +
      '<div class="card-body">' +
      '<div class="card-dept">' + deptShort + ' Dept</div>' +
      '<div class="card-club">' + (event.club_name || '') + '</div>' +
      '<div class="card-title">' + event.title + '</div>' +
      '<div class="card-desc">' + event.description + '</div>' +
      '<div class="card-meta">' +
      '<span>📅 ' + formatDate(event.event_date) + '</span>' +
      '<span>🕐 ' + event.event_time + '</span>' +
      '<span>📍 ' + event.venue + '</span>' +
      '</div>' +
      '</div>' +
      '<div class="card-footer">' +
      '<span class="badge ' + badgeClass + '">' + event.status + '</span>' +
      '<span style="font-size:12px;color:var(--text-muted)">👥 ' + event.rsvp_count + ' RSVPs</span>' +
      '</div>' +
      '</div>';
  }).join('');
}


/* ──────────────────────────────────────
   SECTION 6: RENDER CLUBS
   Builds club cards from the clubs array (fetched from DB)
────────────────────────────────────── */

function renderClubs() {
  const grid = document.getElementById('clubsGrid');
  if (!grid) return;

  if (clubs.length === 0) {
    grid.innerHTML = '<div class="empty-state"><p>📭 No clubs found.</p></div>';
    return;
  }

  /* Avatar background colors — cycle through for variety */
  var avatarColors = ['#1d4ed8', '#0891b2', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0f766e', '#9333ea'];

  grid.innerHTML = clubs.map(function (club, index) {
    const dept = departments.find(function (d) { return d.id === club.dept_id; });
    const deptLabel = dept ? dept.short_name + ' — ' + dept.name : club.dept_id;

    /* Count events for this club from events array */
    const evCount = events.filter(function (e) { return e.club_id == club.id; }).length;

    /* First two initials of club name */
    const initials = club.name.split(' ').map(function (w) { return w[0]; }).join('').substring(0, 2).toUpperCase();
    const avatarColor = avatarColors[index % avatarColors.length];

    return '<div class="club-card">' +
      '<div class="club-card-header">' +
      '<div class="club-avatar" style="background:' + avatarColor + '">' + initials + '</div>' +
      '<div>' +
      '<div class="club-name">' + club.name + '</div>' +
      '<div class="club-dept-label">' + deptLabel + '</div>' +
      '</div>' +
      '</div>' +
      '<div class="club-desc">' + club.description + '</div>' +
      '<div class="club-card-footer">' +
      '<span class="cat-badge">' + club.category + '</span>' +
      '<span class="event-count-label">' + evCount + ' event' + (evCount !== 1 ? 's' : '') + '</span>' +
      '</div>' +
      '</div>';
  }).join('');
}


/* ──────────────────────────────────────
   SECTION 7: UPDATE STATS
────────────────────────────────────── */

function updateStats() {
  document.getElementById('statEvents').textContent = events.length;
  document.getElementById('statOngoing').textContent = events.filter(function (e) { return e.status === 'ongoing'; }).length;
  document.getElementById('statClubs').textContent = clubs.length;
}


/* ──────────────────────────────────────
   SECTION 8: FILTERING
────────────────────────────────────── */

/**
 * applyFilter() — filters the events array and re-renders.
 * Only operates on the in-memory array (no extra DB call needed).
 */
function applyFilter() {
  const deptFilter = document.getElementById('filterDept').value;
  const statusFilter = document.getElementById('filterStatus').value;
  const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();

  var filtered = events.filter(function (event) {
    var matchDept = (deptFilter === 'all') || (event.dept_id === deptFilter);
    var matchStatus = (statusFilter === 'all') || (event.status === statusFilter);
    var matchSearch = !searchTerm
      || event.title.toLowerCase().includes(searchTerm)
      || event.description.toLowerCase().includes(searchTerm)
      || event.venue.toLowerCase().includes(searchTerm);
    return matchDept && matchStatus && matchSearch;
  });

  renderEvents(filtered);
}


/* ──────────────────────────────────────
   SECTION 9: MODAL (Event Detail + RSVP)
────────────────────────────────────── */

function openModal(id) {
  const event = events.find(function (e) { return e.id == id; });
  if (!event) return;

  const dept = departments.find(function (d) { return d.id === event.dept_id; });

  document.getElementById('modalDept').textContent = dept ? dept.name : '';
  document.getElementById('modalTitle').textContent = event.title;
  document.getElementById('modalDesc').textContent = event.description;
  document.getElementById('modalDate').textContent = formatDate(event.event_date);
  document.getElementById('modalTime').textContent = event.event_time;
  document.getElementById('modalVenue').textContent = event.venue;
  document.getElementById('modalRsvp').textContent = event.rsvp_count + ' students registered';
  document.getElementById('rsvpEventId').value = event.id;

  const badge = document.getElementById('modalBadge');
  badge.textContent = event.status;
  badge.className = 'badge badge-' + event.status;

  /* Clear previous RSVP form values */
  document.getElementById('rsvpName').value = '';
  document.getElementById('rsvpEmail').value = '';

  document.getElementById('modal').classList.add('open');
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

function closeModalOnBg(event) {
  if (event.target === document.getElementById('modal')) closeModal();
}


/* ──────────────────────────────────────
   SECTION 10: RSVP SUBMISSION
   POST to Java Servlet → Servlet inserts into rsvp table in MySQL
────────────────────────────────────── */

/**
 * submitRSVP() — sends student name + email + event_id to RSVPServlet.
 * The Servlet inserts the record into the rsvp table and increments rsvp_count.
 */
async function submitRSVP() {
  var name = document.getElementById('rsvpName').value.trim();
  var email = document.getElementById('rsvpEmail').value.trim();
  var eventId = document.getElementById('rsvpEventId').value;

  if (!name) { alert('Please enter your name.'); return; }
  if (!email) { alert('Please enter your email.'); return; }

  /* Java Servlet URL — Apache Tomcat at port 8080 */
  var servletURL = 'http://localhost:8080/college_events/RSVPServlet';

  try {
    /* HTTP POST to Java Servlet with URL-encoded body */
    var response = await fetch(servletURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'event_id=' + eventId
        + '&student_name=' + encodeURIComponent(name)
        + '&student_email=' + encodeURIComponent(email)
    });

    var data = await response.json();

    if (data.success) {
      showToast('✅ Registered successfully!');
      closeModal();
      /* Reload events from DB to get the updated rsvp_count */
      await loadEvents();
      renderEvents();
    } else {
      showToast('❌ ' + (data.message || 'Registration failed.'));
    }
  } catch (error) {
    /* Servlet not running — inform user */
    showToast('⚠️ RSVP server offline. (Start Tomcat to enable RSVP)');
    closeModal();
  }
}


/* ──────────────────────────────────────
   SECTION 11: AUTHENTICATION
   Login validated by PHP against the coordinators table in MySQL.
   No local credential checking — DB is the only authority.
────────────────────────────────────── */

/**
 * doLogin() — sends credentials to login.php which queries MySQL.
 */
async function doLogin() {
  var deptId = document.getElementById('loginDept').value;
  var coordId = document.getElementById('loginId').value.trim();
  var password = document.getElementById('loginPass').value;

  if (!deptId) { alert('Please select your department.'); return; }
  if (!coordId) { alert('Please enter your Coordinator ID.'); return; }
  if (!password) { alert('Please enter your password.'); return; }

  try {
    /* Send credentials to PHP as POST data */
    var formData = new FormData();
    formData.append('dept_id', deptId);
    formData.append('coord_id', coordId);
    formData.append('password', password);

    var response = await fetch('php/login.php', { method: 'POST', body: formData });
    var data = await response.json();

    if (data.success) {
      /* Find the full department object from our departments array */
      loggedInDept = departments.find(function (d) { return d.id === data.dept_id; })
        || { id: data.dept_id, name: data.dept_name, short_name: data.dept_id.toUpperCase() };
      onLoginSuccess();
    } else {
      alert(data.message || 'Invalid credentials. Please try again.');
    }
  } catch (error) {
    alert('Cannot reach the server. Make sure XAMPP is running.');
  }
}

function onLoginSuccess() {
  document.getElementById('btnLogin').style.display = 'none';
  document.getElementById('btnLogout').style.display = '';
  renderDashboard();
  showPage('dashboard');
  showToast('✅ Logged in — ' + loggedInDept.name);
}

function doLogout() {
  loggedInDept = null;
  document.getElementById('btnLogin').style.display = '';
  document.getElementById('btnLogout').style.display = 'none';
  showPage('home');
  showToast('👋 Logged out.');
}


/* ──────────────────────────────────────
   SECTION 12: DASHBOARD
   Renders KPIs, club list, and events table for the logged-in dept
────────────────────────────────────── */

function renderDashboard() {
  var dept = loggedInDept;

  document.getElementById('dashTitle').textContent = dept.name + ' — Dashboard';
  document.getElementById('dashSub').textContent = 'Manage your department\'s clubs and events';

  /* Filter data for this department only */
  var myClubs = clubs.filter(function (c) { return c.dept_id === dept.id; });
  var myEvents = events.filter(function (e) { return e.dept_id === dept.id; });

  /* KPI numbers */
  document.getElementById('kClubs').textContent = myClubs.length;
  document.getElementById('kEvents').textContent = myEvents.length;
  document.getElementById('kOngoing').textContent = myEvents.filter(function (e) { return e.status === 'ongoing'; }).length;
  document.getElementById('kUpcoming').textContent = myEvents.filter(function (e) { return e.status === 'upcoming'; }).length;

  /* Render clubs list */
  var clubList = document.getElementById('dashClubList');
  if (myClubs.length === 0) {
    clubList.innerHTML = '<p style="color:var(--text-muted);font-size:13px;padding:12px 0">No clubs yet. Create your first club above!</p>';
  } else {
    clubList.innerHTML = myClubs.map(function (c) {
      var evCount = events.filter(function (e) { return e.club_id == c.id; }).length;
      return '<div class="club-row">' +
        '<div>' +
        '<div class="club-row-name">' + c.name + '</div>' +
        '<div class="club-row-meta">' + c.category + ' · ' + evCount + ' event(s) · ' + c.description + '</div>' +
        '</div>' +
        '<button class="btn-danger" onclick="deleteClub(' + c.id + ')">Delete</button>' +
        '</div>';
    }).join('');
  }

  /* Populate club <select> in the Post Event form */
  var clubSelect = document.getElementById('newEvClub');
  if (myClubs.length === 0) {
    clubSelect.innerHTML = '<option value="">Create a club first</option>';
  } else {
    clubSelect.innerHTML = myClubs.map(function (c) {
      return '<option value="' + c.id + '">' + c.name + '</option>';
    }).join('');
  }

  /* Render events table */
  var tbody = document.getElementById('dashEventBody');
  if (myEvents.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:28px;color:var(--text-muted)">No events yet. Post one above!</td></tr>';
  } else {
    tbody.innerHTML = myEvents.map(function (e) {
      return '<tr>' +
        '<td>' + e.title + '</td>' +
        '<td>' + (e.club_name || '—') + '</td>' +
        '<td>' + formatDate(e.event_date) + '</td>' +
        '<td>' + e.venue + '</td>' +
        '<td><span class="badge badge-' + e.status + '">' + e.status + '</span></td>' +
        '<td><button class="btn-danger" onclick="deleteEvent(' + e.id + ')">Delete</button></td>' +
        '</tr>';
    }).join('');
  }
}


/* ──────────────────────────────────────
   SECTION 13: TAB SWITCHING
────────────────────────────────────── */

function switchTab(tabName) {
  document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
  document.getElementById('panel-clubs').style.display = (tabName === 'clubs') ? '' : 'none';
  document.getElementById('panel-events').style.display = (tabName === 'events') ? '' : 'none';
  document.getElementById('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1)).classList.add('active');
}


/* ──────────────────────────────────────
   SECTION 14: CLUB CRUD
   All operations go to PHP → MySQL.
   After success, reload data from DB and re-render.
────────────────────────────────────── */

/**
 * addClub() — sends new club data to add_club.php → INSERT into clubs table.
 */
async function addClub() {
  var name = document.getElementById('newClubName').value.trim();
  var cat = document.getElementById('newClubCat').value;
  var desc = document.getElementById('newClubDesc').value.trim();

  if (!name) { alert('Please enter a club name.'); return; }

  try {
    var formData = new FormData();
    formData.append('name', name);
    formData.append('category', cat);
    formData.append('description', desc || name + ' club.');
    formData.append('dept_id', loggedInDept.id);

    var response = await fetch('php/add_club.php', { method: 'POST', body: formData });
    var data = await response.json();

    if (data.success) {
      /* Clear form */
      document.getElementById('newClubName').value = '';
      document.getElementById('newClubDesc').value = '';

      /* Reload clubs from DB — database is the source of truth */
      await loadClubs();
      renderDashboard();
      renderClubs();
      updateStats();
      showToast('✅ Club "' + name + '" created!');
    } else {
      alert(data.message || 'Failed to create club.');
    }
  } catch (error) {
    alert('Server error. Make sure XAMPP is running.');
  }
}

/**
 * deleteClub(id) — calls delete_club.php → DELETE from MySQL.
 */
async function deleteClub(id) {
  if (!confirm('Delete this club and all its events?')) return;

  try {
    var formData = new FormData();
    formData.append('id', id);

    var response = await fetch('php/delete_club.php', { method: 'POST', body: formData });
    var data = await response.json();

    if (data.success) {
      /* Reload both clubs and events from DB (events cascade-deleted) */
      await Promise.all([loadClubs(), loadEvents()]);
      renderDashboard();
      renderClubs();
      renderEvents();
      updateStats();
      showToast('Club deleted.');
    } else {
      alert(data.message || 'Delete failed.');
    }
  } catch (error) {
    alert('Server error. Make sure XAMPP is running.');
  }
}


/* ──────────────────────────────────────
   SECTION 15: EVENT CRUD
   All operations go to PHP → MySQL.
────────────────────────────────────── */

/**
 * addEvent() — sends new event data to add_event.php → INSERT into events table.
 */
async function addEvent() {
  var title = document.getElementById('newEvTitle').value.trim();
  var clubId = document.getElementById('newEvClub').value;
  var date = document.getElementById('newEvDate').value;
  var time = document.getElementById('newEvTime').value;
  var venue = document.getElementById('newEvVenue').value.trim();
  var status = document.getElementById('newEvStatus').value;
  var desc = document.getElementById('newEvDesc').value.trim();

  if (!title || !clubId || !date || !venue) {
    alert('Please fill in Title, Club, Date, and Venue.');
    return;
  }

  /* Convert 24-hour time (e.g. "14:30") to 12-hour (e.g. "2:30 PM") */
  var parts = time.split(':');
  var hr = parseInt(parts[0]);
  var min = parts[1];
  var period = hr >= 12 ? 'PM' : 'AM';
  var hr12 = hr > 12 ? hr - 12 : (hr === 0 ? 12 : hr);
  var fmtTime = hr12 + ':' + min + ' ' + period;

  try {
    var formData = new FormData();
    formData.append('title', title);
    formData.append('club_id', clubId);
    formData.append('dept_id', loggedInDept.id);
    formData.append('event_date', date);
    formData.append('event_time', fmtTime);
    formData.append('venue', venue);
    formData.append('status', status);
    formData.append('description', desc || 'Event by ' + loggedInDept.name + '.');

    var response = await fetch('php/add_event.php', { method: 'POST', body: formData });
    var data = await response.json();

    if (data.success) {
      /* Clear event form */
      ['newEvTitle', 'newEvDate', 'newEvVenue', 'newEvDesc'].forEach(function (id) {
        document.getElementById(id).value = '';
      });
      document.getElementById('newEvTime').value = '10:00';

      /* Reload events from DB */
      await loadEvents();
      renderDashboard();
      renderEvents();
      updateStats();
      showToast('✅ Event "' + title + '" posted!');
    } else {
      alert(data.message || 'Failed to post event.');
    }
  } catch (error) {
    alert('Server error. Make sure XAMPP is running.');
  }
}

/**
 * deleteEvent(id) — calls delete_event.php → DELETE from MySQL.
 */
async function deleteEvent(id) {
  if (!confirm('Delete this event?')) return;

  try {
    var formData = new FormData();
    formData.append('id', id);

    var response = await fetch('php/delete_event.php', { method: 'POST', body: formData });
    var data = await response.json();

    if (data.success) {
      /* Reload events from DB */
      await loadEvents();
      renderDashboard();
      renderEvents();
      updateStats();
      showToast('Event deleted.');
    } else {
      alert(data.message || 'Delete failed.');
    }
  } catch (error) {
    alert('Server error. Make sure XAMPP is running.');
  }
}


/* ──────────────────────────────────────
   SECTION 16: UTILITY FUNCTIONS
────────────────────────────────────── */

/**
 * formatDate("2026-04-15") → "15 Apr 2026"
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

/**
 * showToast(message) — shows a brief notification at bottom-right for 3 seconds.
 */
function showToast(message) {
  var toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(function () { toast.classList.remove('show'); }, 3000);
}


/* ──────────────────────────────────────
   START — Run init() on page load
────────────────────────────────────── */
init();
