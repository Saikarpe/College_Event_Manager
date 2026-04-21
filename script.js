let departments = [];
let clubs = [];
let events = [];
let loggedInDept = null;


function showPage(name) {
  document.querySelectorAll('.page').forEach(function (page) {
    page.classList.remove('active');
  });
  document.getElementById('page-' + name).classList.add('active');
  window.scrollTo(0, 0);
}

async function init() {

  document.getElementById('eventsGrid').innerHTML = '<div class="empty-state"><p>⏳ Loading events from database...</p></div>';
  document.getElementById('clubsGrid').innerHTML = '<div class="empty-state"><p>⏳ Loading clubs...</p></div>';

  const deptOk = await loadDepartments();

  if (!deptOk) {
    const errMsg = '<div class="empty-state"><p>❌ Cannot connect to database.<br>Please start XAMPP and make sure MySQL is running.</p></div>';
    document.getElementById('eventsGrid').innerHTML = errMsg;
    document.getElementById('clubsGrid').innerHTML = errMsg;
    return;
  }

  populateDeptDropdowns();

  await Promise.all([loadClubs(), loadEvents()]);

  renderEvents();
  renderClubs();
  updateStats();
}

async function loadDepartments() {
  try {
    const response = await fetch('php/get_departments.php');
    const data = await response.json();
    if (data.success) {
      departments = data.departments;
      return true;
    }
    return false;
  } catch (error) {
    console.error('loadDepartments failed:', error);
    return false;
  }
}

async function loadClubs() {
  try {
    const response = await fetch('php/get_clubs.php');
    const data = await response.json();
    if (data.success) clubs = data.clubs;
  } catch (error) {
    console.error('loadClubs failed:', error);
  }
}

async function loadEvents() {
  try {
    const response = await fetch('php/get_events.php');
    const data = await response.json();
    if (data.success) events = data.events;
  } catch (error) {
    console.error('loadEvents failed:', error);
  }
}


function populateDeptDropdowns() {
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


function renderEvents(list) {
  const display = list || events;
  const grid = document.getElementById('eventsGrid');

  if (display.length === 0) {
    grid.innerHTML = '<div class="empty-state"><p>📭 No events found.</p></div>';
    return;
  }

  grid.innerHTML = display.map(function (event) {
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


function renderClubs() {
  const grid = document.getElementById('clubsGrid');
  if (!grid) return;

  if (clubs.length === 0) {
    grid.innerHTML = '<div class="empty-state"><p>📭 No clubs found.</p></div>';
    return;
  }

  var avatarColors = ['#1d4ed8', '#0891b2', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0f766e', '#9333ea'];

  grid.innerHTML = clubs.map(function (club, index) {
    const dept = departments.find(function (d) { return d.id === club.dept_id; });
    const deptLabel = dept ? dept.short_name + ' — ' + dept.name : club.dept_id;

    const evCount = events.filter(function (e) { return e.club_id == club.id; }).length;

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


function updateStats() {
  document.getElementById('statEvents').textContent = events.length;
  document.getElementById('statOngoing').textContent = events.filter(function (e) { return e.status === 'ongoing'; }).length;
  document.getElementById('statClubs').textContent = clubs.length;
}


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


async function submitRSVP() {
  var name = document.getElementById('rsvpName').value.trim();
  var email = document.getElementById('rsvpEmail').value.trim();
  var eventId = document.getElementById('rsvpEventId').value;

  if (!name) { alert('Please enter your name.'); return; }
  if (!email) { alert('Please enter your email.'); return; }

  var servletURL = 'php/submit_rsvp.php';

  try {
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
      await loadEvents();
      renderEvents();
    } else {
      showToast('❌ ' + (data.message || 'Registration failed.'));
    }
  } catch (error) {
    showToast('⚠️ RSVP server offline. (Is XAMPP running?)');
    closeModal();
  }
}


async function doLogin() {
  var deptId = document.getElementById('loginDept').value;
  var coordId = document.getElementById('loginId').value.trim();
  var password = document.getElementById('loginPass').value;

  if (!deptId) { alert('Please select your department.'); return; }
  if (!coordId) { alert('Please enter your Coordinator ID.'); return; }
  if (!password) { alert('Please enter your password.'); return; }

  try {
    var formData = new FormData();
    formData.append('dept_id', deptId);
    formData.append('coord_id', coordId);
    formData.append('password', password);

    var response = await fetch('php/login.php', { method: 'POST', body: formData });
    var data = await response.json();

    if (data.success) {
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


function renderDashboard() {
  var dept = loggedInDept;

  document.getElementById('dashTitle').textContent = dept.name + ' — Dashboard';
  document.getElementById('dashSub').textContent = 'Manage your department\'s clubs and events';

  var myClubs = clubs.filter(function (c) { return c.dept_id === dept.id; });
  var myEvents = events.filter(function (e) { return e.dept_id === dept.id; });

  document.getElementById('kClubs').textContent = myClubs.length;
  document.getElementById('kEvents').textContent = myEvents.length;
  document.getElementById('kOngoing').textContent = myEvents.filter(function (e) { return e.status === 'ongoing'; }).length;
  document.getElementById('kUpcoming').textContent = myEvents.filter(function (e) { return e.status === 'upcoming'; }).length;

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

  var clubSelect = document.getElementById('newEvClub');
  if (myClubs.length === 0) {
    clubSelect.innerHTML = '<option value="">Create a club first</option>';
  } else {
    clubSelect.innerHTML = myClubs.map(function (c) {
      return '<option value="' + c.id + '">' + c.name + '</option>';
    }).join('');
  }

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


function switchTab(tabName) {
  document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
  document.getElementById('panel-clubs').style.display = (tabName === 'clubs') ? '' : 'none';
  document.getElementById('panel-events').style.display = (tabName === 'events') ? '' : 'none';
  document.getElementById('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1)).classList.add('active');
}


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
      document.getElementById('newClubName').value = '';
      document.getElementById('newClubDesc').value = '';

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

async function deleteClub(id) {
  if (!confirm('Delete this club and all its events?')) return;

  try {
    var formData = new FormData();
    formData.append('id', id);

    var response = await fetch('php/delete_club.php', { method: 'POST', body: formData });
    var data = await response.json();

    if (data.success) {
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
      ['newEvTitle', 'newEvDate', 'newEvVenue', 'newEvDesc'].forEach(function (id) {
        document.getElementById(id).value = '';
      });
      document.getElementById('newEvTime').value = '10:00';

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

async function deleteEvent(id) {
  if (!confirm('Delete this event?')) return;

  try {
    var formData = new FormData();
    formData.append('id', id);

    var response = await fetch('php/delete_event.php', { method: 'POST', body: formData });
    var data = await response.json();

    if (data.success) {
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


function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

function showToast(message) {
  var toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(function () { toast.classList.remove('show'); }, 3000);
}


init();
