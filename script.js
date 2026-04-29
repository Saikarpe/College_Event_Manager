/* ============================================================
   CampusConnect — script.js
   College Event Management (with_DB version)

   ALL DATA COMES FROM MySQL DATABASE via PHP APIs.
   No hardcoded clubs or events — the database is the single source of truth.

   Flow:
     1. Page loads → init() runs
     2. init() fetches departments, clubs, events from PHP
     3. Data is stored in JS arrays TEMPORARILY (for rendering only)
     4. Any add/delete/edit operation calls PHP → updates MySQL → refreshes local arrays
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

    /* Auto-focus first input on login page */
    if (name === 'login') {
        setTimeout(function () { document.getElementById('loginDept').focus(); }, 100);
    }
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

    /* Step 5: Initialize OpenStreetMap in the About section */
    initMap();
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
   Redesigned: Solo/Team choice → Registration form
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

    /* Reset RSVP form to Step 1 (Solo/Team selection) */
    document.getElementById('rsvpStep1').style.display = '';
    document.getElementById('rsvpStep2').style.display = 'none';
    document.getElementById('rsvpName').value = '';
    document.getElementById('rsvpEmail').value = '';
    document.getElementById('rsvpTeamName').value = '';
    document.getElementById('rsvpRegType').value = 'solo';
    document.getElementById('teamNameGroup').style.display = 'none';
    document.getElementById('teamSizeGroup').style.display = 'none';
    document.getElementById('soloMemberFields').style.display = '';
    document.getElementById('teamMembersContainer').style.display = 'none';
    document.getElementById('teamMembersContainer').innerHTML = '';
    document.getElementById('rsvpTeamSize').value = '';

    document.getElementById('modal').classList.add('open');
}

/**
 * selectRegType(type) — called when user picks Solo or Team.
 * Shows the appropriate form fields.
 */
function selectRegType(type) {
    document.getElementById('rsvpRegType').value = type;
    document.getElementById('rsvpStep1').style.display = 'none';
    document.getElementById('rsvpStep2').style.display = '';

    if (type === 'team') {
        document.getElementById('teamNameGroup').style.display = '';
        document.getElementById('teamSizeGroup').style.display = '';
        document.getElementById('soloMemberFields').style.display = 'none';
        document.getElementById('teamMembersContainer').style.display = '';
        document.getElementById('teamMembersContainer').innerHTML = '';
        document.getElementById('rsvpTeamSize').value = '';
    } else {
        document.getElementById('teamNameGroup').style.display = 'none';
        document.getElementById('teamSizeGroup').style.display = 'none';
        document.getElementById('soloMemberFields').style.display = '';
        document.getElementById('teamMembersContainer').style.display = 'none';
        document.getElementById('teamMembersContainer').innerHTML = '';
        document.getElementById('rsvpTeamName').value = '';
    }
}

/**
 * onTeamSizeChange() — dynamically generates member input fields based on selected team size.
 */
function onTeamSizeChange() {
    var size = parseInt(document.getElementById('rsvpTeamSize').value) || 0;
    var container = document.getElementById('teamMembersContainer');
    container.innerHTML = '';

    if (size < 2 || size > 4) return;

    for (var i = 1; i <= size; i++) {
        var memberHTML = '<div class="team-member-card">' +
            '<div class="team-member-header">👤 Member ' + i + (i === 1 ? ' (Team Leader)' : '') + '</div>' +
            '<div class="form-row-2">' +
            '<div class="form-group">' +
            '<label>Name</label>' +
            '<input type="text" id="memberName' + i + '" placeholder="Member ' + i + ' full name">' +
            '</div>' +
            '<div class="form-group">' +
            '<label>Email</label>' +
            '<input type="email" id="memberEmail' + i + '" placeholder="Member ' + i + ' email">' +
            '</div>' +
            '</div>' +
            '</div>';
        container.innerHTML += memberHTML;
    }
}

/**
 * backToStep1() — goes back to registration type selection.
 */
function backToStep1() {
    document.getElementById('rsvpStep1').style.display = '';
    document.getElementById('rsvpStep2').style.display = 'none';
    document.getElementById('teamMembersContainer').innerHTML = '';
}

function closeModal() {
    document.getElementById('modal').classList.remove('open');
}

function closeModalOnBg(event) {
    if (event.target === document.getElementById('modal')) closeModal();
}


/* ──────────────────────────────────────
   SECTION 10: RSVP SUBMISSION
   POST to PHP rsvp.php → inserts into rsvp table in MySQL
────────────────────────────────────── */

/**
 * submitRSVP() — sends student registration data to rsvp.php.
 */
async function submitRSVP() {
    var eventId = document.getElementById('rsvpEventId').value;
    var regType = document.getElementById('rsvpRegType').value;
    var teamName = document.getElementById('rsvpTeamName').value.trim();
    var members = [];

    if (regType === 'solo') {
        /* Solo: collect single member from the solo fields */
        var name = document.getElementById('rsvpName').value.trim();
        var email = document.getElementById('rsvpEmail').value.trim();
        if (!name) { showToast('⚠️ Please enter your name.'); return; }
        if (!email) { showToast('⚠️ Please enter your email.'); return; }
        members.push({ name: name, email: email });
    } else {
        /* Team: collect all member fields */
        if (!teamName) { showToast('⚠️ Please enter your team name.'); return; }
        var teamSize = parseInt(document.getElementById('rsvpTeamSize').value) || 0;
        if (teamSize < 2 || teamSize > 4) { showToast('⚠️ Please select a team size (2-4 members).'); return; }

        for (var i = 1; i <= teamSize; i++) {
            var mName = document.getElementById('memberName' + i).value.trim();
            var mEmail = document.getElementById('memberEmail' + i).value.trim();
            if (!mName || !mEmail) {
                showToast('⚠️ Please fill in Name and Email for Member ' + i + '.');
                return;
            }
            members.push({ name: mName, email: mEmail });
        }
    }

    var btn = document.querySelector('#rsvpStep2 .btn-primary');
    setLoading(btn, true);

    try {
        /* Send as JSON so the backend can handle multiple members */
        var payload = {
            event_id: eventId,
            reg_type: regType,
            team_name: regType === 'team' ? teamName : null,
            members: members
        };

        var response = await fetch('php/rsvp.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        var data = await response.json();

        if (data.success) {
            showToast('✅ ' + (data.message || 'Registered Successfully!'));
            closeModal();
            /* Reload events from DB to get the updated rsvp_count */
            await loadEvents();
            renderEvents();
        } else {
            showToast('❌ ' + (data.message || 'Registration failed.'));
        }
    } catch (error) {
        showToast('⚠️ Server error. Please try again.');
        closeModal();
    } finally {
        setLoading(btn, false);
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

    if (!deptId) { showToast('⚠️ Please select your department.'); return; }
    if (!coordId) { showToast('⚠️ Please enter your Coordinator ID.'); return; }
    if (!password) { showToast('⚠️ Please enter your password.'); return; }

    var btn = document.querySelector('#page-login .btn-primary');
    setLoading(btn, true);

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
            showToast('❌ ' + (data.message || 'Invalid credentials. Please try again.'));
        }
    } catch (error) {
        showToast('⚠️ Cannot reach the server. Make sure XAMPP is running.');
    } finally {
        setLoading(btn, false);
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
   SECTION 11B: FORGOT PASSWORD
────────────────────────────────────── */

function showForgotPassword() {
    document.getElementById('forgotPasswordSection').style.display = '';
    document.getElementById('forgotResult').style.display = 'none';
    document.getElementById('forgotCoordId').value = '';
    document.getElementById('forgotDeptName').value = '';
}

function hideForgotPassword() {
    document.getElementById('forgotPasswordSection').style.display = 'none';
}

/**
 * forgotPassword() — sends coord_id + dept_name to reset_password.php.
 * The backend verifies the department name matches the coordinator's department,
 * generates a new random password, and returns it.
 */
async function forgotPassword() {
    var coordId = document.getElementById('forgotCoordId').value.trim();
    var deptName = document.getElementById('forgotDeptName').value.trim();

    if (!coordId) { showToast('⚠️ Please enter your Coordinator ID.'); return; }
    if (!deptName) { showToast('⚠️ Please type your Department Name for verification.'); return; }

    try {
        var formData = new FormData();
        formData.append('coord_id', coordId);
        formData.append('dept_name', deptName);

        var response = await fetch('php/reset_password.php', { method: 'POST', body: formData });
        var data = await response.json();

        var resultDiv = document.getElementById('forgotResult');
        resultDiv.style.display = '';

        if (data.success) {
            resultDiv.className = 'forgot-result forgot-result-success';
            resultDiv.innerHTML = '<strong>✅ Password Reset Successful!</strong><br>' +
                '<span style="font-size:12px;color:#15803d">Your new password is:</span> ' +
                '<span class="password-reveal">' + data.new_password + '</span>' +
                '<br><span style="font-size:11px;color:#15803d;margin-top:4px;display:inline-block">⚠️ Please use this new password to log in. Your old password no longer works.</span>';
        } else {
            resultDiv.className = 'forgot-result forgot-result-error';
            resultDiv.innerHTML = '❌ ' + (data.message || 'Verification failed. Check your Coordinator ID and Department Name.');
        }
    } catch (error) {
        showToast('⚠️ Cannot reach the server. Make sure XAMPP is running.');
    }
}


/* ──────────────────────────────────────
   SECTION 12: DASHBOARD
   Renders KPIs, club list, events table, and reports for the logged-in dept
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

    /* Render clubs list with Edit + Delete buttons */
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
                '<div class="action-buttons">' +
                '<button class="btn-edit" onclick="editClub(' + c.id + ')">Edit</button>' +
                '<button class="btn-danger" onclick="deleteClub(' + c.id + ')">Delete</button>' +
                '</div>' +
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

    /* Render events table with Edit + Delete buttons */
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
                '<td>' +
                '<div class="action-buttons">' +
                '<button class="btn-edit" onclick="editEvent(' + e.id + ')">Edit</button>' +
                '<button class="btn-danger" onclick="deleteEvent(' + e.id + ')">Delete</button>' +
                '</div>' +
                '</td>' +
                '</tr>';
        }).join('');
    }

    /* Populate the Reports event dropdown */
    var reportSelect = document.getElementById('reportEventSelect');
    reportSelect.innerHTML = '<option value="">— Choose an event —</option>';
    myEvents.forEach(function (e) {
        reportSelect.innerHTML += '<option value="' + e.id + '">' + e.title + ' (' + formatDate(e.event_date) + ')</option>';
    });
    document.getElementById('reportActions').style.display = 'none';
    document.getElementById('reportTableWrap').style.display = 'none';
}


/* ──────────────────────────────────────
   SECTION 13: TAB SWITCHING
   Now supports 3 tabs: clubs, events, reports
────────────────────────────────────── */

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
    document.getElementById('panel-clubs').style.display = (tabName === 'clubs') ? '' : 'none';
    document.getElementById('panel-events').style.display = (tabName === 'events') ? '' : 'none';
    document.getElementById('panel-reports').style.display = (tabName === 'reports') ? '' : 'none';
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

    if (!name) { showToast('⚠️ Please enter a club name.'); return; }

    var btn = document.querySelector('#panel-clubs .btn-primary');
    setLoading(btn, true);

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
            showToast('❌ ' + (data.message || 'Failed to create club.'));
        }
    } catch (error) {
        showToast('⚠️ Server error. Make sure XAMPP is running.');
    } finally {
        setLoading(btn, false);
    }
}

/**
 * deleteClub(id) — calls delete_club.php → DELETE from MySQL.
 */
function deleteClub(id) {
    showConfirm('Delete this club and all its events?', async function () {
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
                showToast('🗑️ Club deleted.');
            } else {
                showToast('❌ ' + (data.message || 'Delete failed.'));
            }
        } catch (error) {
            showToast('⚠️ Server error. Make sure XAMPP is running.');
        }
    });
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
        showToast('⚠️ Please fill in Title, Club, Date, and Venue.');
        return;
    }

    /* Convert 24-hour time (e.g. "14:30") to 12-hour (e.g. "2:30 PM") */
    var parts = time.split(':');
    var hr = parseInt(parts[0]);
    var min = parts[1];
    var period = hr >= 12 ? 'PM' : 'AM';
    var hr12 = hr > 12 ? hr - 12 : (hr === 0 ? 12 : hr);
    var fmtTime = hr12 + ':' + min + ' ' + period;

    var btn = document.querySelector('#panel-events .btn-primary');
    setLoading(btn, true);

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
            showToast('❌ ' + (data.message || 'Failed to post event.'));
        }
    } catch (error) {
        showToast('⚠️ Server error. Make sure XAMPP is running.');
    } finally {
        setLoading(btn, false);
    }
}

/**
 * deleteEvent(id) — calls delete_event.php → DELETE from MySQL.
 */
function deleteEvent(id) {
    showConfirm('Delete this event?', async function () {
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
                showToast('🗑️ Event deleted.');
            } else {
                showToast('❌ ' + (data.message || 'Delete failed.'));
            }
        } catch (error) {
            showToast('⚠️ Server error. Make sure XAMPP is running.');
        }
    });
}


/* ──────────────────────────────────────
   SECTION 16: EDIT EVENT
────────────────────────────────────── */

/**
 * editEvent(id) — opens the edit event modal pre-filled with existing data.
 */
function editEvent(id) {
    var ev = events.find(function (e) { return e.id == id; });
    if (!ev) return;

    document.getElementById('editEvId').value = ev.id;
    document.getElementById('editEvTitle').value = ev.title;
    document.getElementById('editEvDate').value = ev.event_date;
    document.getElementById('editEvVenue').value = ev.venue;
    document.getElementById('editEvStatus').value = ev.status;
    document.getElementById('editEvDesc').value = ev.description;

    /* Parse time back to 24-hour for the <input type="time"> */
    var timeParts = ev.event_time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (timeParts) {
        var h = parseInt(timeParts[1]);
        var m = timeParts[2];
        var ampm = timeParts[3].toUpperCase();
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        document.getElementById('editEvTime').value = (h < 10 ? '0' + h : h) + ':' + m;
    } else {
        document.getElementById('editEvTime').value = '10:00';
    }

    /* Populate club dropdown for this department */
    var myClubs = clubs.filter(function (c) { return c.dept_id === loggedInDept.id; });
    var clubSelect = document.getElementById('editEvClub');
    clubSelect.innerHTML = myClubs.map(function (c) {
        return '<option value="' + c.id + '"' + (c.id == ev.club_id ? ' selected' : '') + '>' + c.name + '</option>';
    }).join('');

    document.getElementById('editEventModal').classList.add('open');
    /* Auto-focus event title field */
    setTimeout(function () { document.getElementById('editEvTitle').focus(); }, 100);
}

/**
 * saveEvent() — sends updated data to edit_event.php
 */
async function saveEvent() {
    var id = document.getElementById('editEvId').value;
    var title = document.getElementById('editEvTitle').value.trim();
    var clubId = document.getElementById('editEvClub').value;
    var date = document.getElementById('editEvDate').value;
    var time = document.getElementById('editEvTime').value;
    var venue = document.getElementById('editEvVenue').value.trim();
    var status = document.getElementById('editEvStatus').value;
    var desc = document.getElementById('editEvDesc').value.trim();

    if (!title || !date || !venue) {
        showToast('⚠️ Please fill in Title, Date, and Venue.');
        return;
    }

    /* Convert time to 12-hour format */
    var parts = time.split(':');
    var hr = parseInt(parts[0]);
    var min = parts[1];
    var period = hr >= 12 ? 'PM' : 'AM';
    var hr12 = hr > 12 ? hr - 12 : (hr === 0 ? 12 : hr);
    var fmtTime = hr12 + ':' + min + ' ' + period;

    try {
        var formData = new FormData();
        formData.append('id', id);
        formData.append('title', title);
        formData.append('club_id', clubId);
        formData.append('event_date', date);
        formData.append('event_time', fmtTime);
        formData.append('venue', venue);
        formData.append('status', status);
        formData.append('description', desc);

        var response = await fetch('php/edit_event.php', { method: 'POST', body: formData });
        var data = await response.json();

        if (data.success) {
            closeEditEvent();
            await loadEvents();
            renderDashboard();
            renderEvents();
            updateStats();
            showToast('✅ Event updated successfully!');
        } else {
            showToast('❌ ' + (data.message || 'Failed to update event.'));
        }
    } catch (error) {
        showToast('⚠️ Server error. Make sure XAMPP is running.');
    }
}

function closeEditEvent() {
    document.getElementById('editEventModal').classList.remove('open');
}

function closeEditEventOnBg(event) {
    if (event.target === document.getElementById('editEventModal')) closeEditEvent();
}


/* ──────────────────────────────────────
   SECTION 17: EDIT CLUB
────────────────────────────────────── */

/**
 * editClub(id) — opens the edit club modal pre-filled with existing data.
 */
function editClub(id) {
    var club = clubs.find(function (c) { return c.id == id; });
    if (!club) return;

    document.getElementById('editClubId').value = club.id;
    document.getElementById('editClubName').value = club.name;
    document.getElementById('editClubCat').value = club.category;
    document.getElementById('editClubDesc').value = club.description;

    document.getElementById('editClubModal').classList.add('open');
    /* Auto-focus club name field */
    setTimeout(function () { document.getElementById('editClubName').focus(); }, 100);
}

/**
 * saveClub() — sends updated data to edit_club.php
 */
async function saveClub() {
    var id = document.getElementById('editClubId').value;
    var name = document.getElementById('editClubName').value.trim();
    var cat = document.getElementById('editClubCat').value;
    var desc = document.getElementById('editClubDesc').value.trim();

    if (!name) { showToast('⚠️ Please enter a club name.'); return; }

    try {
        var formData = new FormData();
        formData.append('id', id);
        formData.append('name', name);
        formData.append('category', cat);
        formData.append('description', desc);

        var response = await fetch('php/edit_club.php', { method: 'POST', body: formData });
        var data = await response.json();

        if (data.success) {
            closeEditClub();
            await loadClubs();
            renderDashboard();
            renderClubs();
            updateStats();
            showToast('✅ Club updated successfully!');
        } else {
            showToast('❌ ' + (data.message || 'Failed to update club.'));
        }
    } catch (error) {
        showToast('⚠️ Server error. Make sure XAMPP is running.');
    }
}

function closeEditClub() {
    document.getElementById('editClubModal').classList.remove('open');
}

function closeEditClubOnBg(event) {
    if (event.target === document.getElementById('editClubModal')) closeEditClub();
}


/* ──────────────────────────────────────
   SECTION 18: REGISTRATION REPORTS
────────────────────────────────────── */

/**
 * loadRegistrations() — fetches registrations for the selected event
 * and renders them in the reports table.
 */
async function loadRegistrations() {
    var eventId = document.getElementById('reportEventSelect').value;

    if (!eventId) {
        document.getElementById('reportActions').style.display = 'none';
        document.getElementById('reportTableWrap').style.display = 'none';
        return;
    }

    try {
        var response = await fetch('php/get_registrations.php?event_id=' + eventId);
        var data = await response.json();

        if (data.success) {
            var regs = data.registrations;
            document.getElementById('reportActions').style.display = '';
            document.getElementById('reportTableWrap').style.display = '';
            document.getElementById('reportCount').textContent = regs.length + ' registration(s) found';

            var tbody = document.getElementById('reportBody');
            if (regs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:28px;color:var(--text-muted)">No registrations yet for this event.</td></tr>';
            } else {
                tbody.innerHTML = regs.map(function (r, i) {
                    return '<tr>' +
                        '<td>' + (i + 1) + '</td>' +
                        '<td>' + r.student_name + '</td>' +
                        '<td>' + r.student_email + '</td>' +
                        '<td><span class="badge badge-' + r.reg_type + '">' + (r.reg_type === 'team' ? '👥 Team' : '👤 Solo') + '</span></td>' +
                        '<td>' + (r.team_name || '—') + '</td>' +
                        '<td>' + r.registered_at + '</td>' +
                        '</tr>';
                }).join('');
            }
        } else {
            showToast('❌ ' + (data.message || 'Failed to load registrations.'));
        }
    } catch (error) {
        showToast('⚠️ Server error loading registrations.');
    }
}

/**
 * exportCSV() — triggers a CSV download for the selected event.
 */
function exportCSV() {
    var eventId = document.getElementById('reportEventSelect').value;
    if (!eventId) {
        showToast('⚠️ Please select an event first.');
        return;
    }
    /* Open the export URL — browser will handle the file download */
    window.open('php/export_registrations.php?event_id=' + eventId, '_blank');
}


/* ──────────────────────────────────────
   SECTION 19: UTILITY FUNCTIONS
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
   SECTION 20: OPENSTREETMAP (Leaflet.js)
   Initializes an interactive map in the About section
────────────────────────────────────── */

/**
 * initMap() — sets up the Leaflet.js map with OpenStreetMap tiles.
 * Uses a sample college campus location (Hyderabad, India).
 */
function initMap() {
    var mapContainer = document.getElementById('campusMap');
    if (!mapContainer || typeof L === 'undefined') return;

    /* Create the map centered on a sample campus location */
    var map = L.map('campusMap', {
        scrollWheelZoom: false  /* Prevent accidental zoom while scrolling page */
    }).setView([19.900514833070407, 74.49478500923182], 15);  /* Hyderabad area coordinates */

    /* Add OpenStreetMap tile layer */
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    /* Add a marker for the campus */
    var marker = L.marker([19.900514833070407, 74.49478500923182]).addTo(map);
    marker.bindPopup(
        '<strong>🎓 CampusConnect</strong><br>College Campus<br><em>Kopargaon, Maharashtra, India</em>'
    ).openPopup();

    /* Add a circle to highlight the campus area */
    L.circle([19.900514833070407, 74.49478500923182], {
        color: '#1d4ed8',
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
        radius: 300
    }).addTo(map);

    /* Fix tile rendering issue when map container is initially hidden */
    setTimeout(function () { map.invalidateSize(); }, 200);
}


/* ──────────────────────────────────────
   SECTION 21: PASSWORD TOGGLE
────────────────────────────────────── */

/**
 * togglePassword() — toggles password field visibility.
 */
function togglePassword() {
    var passInput = document.getElementById('loginPass');
    var btn = document.getElementById('togglePassBtn');
    if (passInput.type === 'password') {
        passInput.type = 'text';
        btn.textContent = '🙈';
    } else {
        passInput.type = 'password';
        btn.textContent = '👁';
    }
}


/* ──────────────────────────────────────
   SECTION 22: CUSTOM CONFIRM MODAL
   Replaces browser's plain confirm() dialog
────────────────────────────────────── */

var _confirmCallback = null;

/**
 * showConfirm(message, onYes) — shows a styled confirmation modal.
 * @param {string} message — the question to display
 * @param {function} onYes  — callback executed if user clicks "Yes, Delete"
 */
function showConfirm(message, onYes) {
    _confirmCallback = onYes;
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmModal').classList.add('open');

    var yesBtn = document.getElementById('confirmYesBtn');
    yesBtn.onclick = function () {
        closeConfirm();
        if (_confirmCallback) _confirmCallback();
    };
}

function closeConfirm() {
    document.getElementById('confirmModal').classList.remove('open');
    _confirmCallback = null;
}

function closeConfirmOnBg(event) {
    if (event.target === document.getElementById('confirmModal')) closeConfirm();
}


/* ──────────────────────────────────────
   SECTION 23: LOADING STATE HELPER
────────────────────────────────────── */

/**
 * setLoading(btn, isLoading) — disables a button and shows a loading spinner.
 */
function setLoading(btn, isLoading) {
    if (!btn) return;
    if (isLoading) {
        btn.dataset.originalText = btn.textContent;
        btn.textContent = '⏳ Please wait…';
        btn.disabled = true;
        btn.classList.add('btn-loading');
    } else {
        btn.textContent = btn.dataset.originalText || 'Submit';
        btn.disabled = false;
        btn.classList.remove('btn-loading');
    }
}


/* ──────────────────────────────────────
   SECTION 24: KEYBOARD SHORTCUTS
   Enter key submits forms, Escape closes modals
────────────────────────────────────── */

/**
 * Login form — Enter key triggers doLogin()
 */
['loginId', 'loginPass'].forEach(function (id) {
    document.getElementById(id).addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            doLogin();
        }
    });
});

/**
 * Forgot Password form — Enter key triggers forgotPassword()
 */
['forgotCoordId', 'forgotDeptName'].forEach(function (id) {
    document.getElementById(id).addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            forgotPassword();
        }
    });
});

/**
 * RSVP form — Enter key triggers submitRSVP()
 */
['rsvpName', 'rsvpEmail'].forEach(function (id) {
    document.getElementById(id).addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            submitRSVP();
        }
    });
});

/**
 * Dashboard forms — Enter key triggers form submit
 */
['newClubName', 'newClubDesc'].forEach(function (id) {
    document.getElementById(id).addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            addClub();
        }
    });
});

['newEvTitle', 'newEvVenue'].forEach(function (id) {
    document.getElementById(id).addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addEvent();
        }
    });
});

/**
 * Escape key — closes any open modal
 */
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        if (document.getElementById('confirmModal').classList.contains('open')) {
            closeConfirm();
        } else if (document.getElementById('modal').classList.contains('open')) {
            closeModal();
        } else if (document.getElementById('editEventModal').classList.contains('open')) {
            closeEditEvent();
        } else if (document.getElementById('editClubModal').classList.contains('open')) {
            closeEditClub();
        }
    }
});


/* ──────────────────────────────────────
   SECTION 25: SCROLL SPY — Active Nav Link
   Highlights the nav link matching the section currently in view
────────────────────────────────────── */

window.addEventListener('scroll', function () {
    var sections = ['section-events', 'section-clubs', 'section-about'];
    var navLinks = document.querySelectorAll('.nav-links a');
    var scrollPos = window.scrollY + 140; /* offset for navbar height + buffer */

    /* Remove all active states first */
    navLinks.forEach(function (link) { link.classList.remove('active'); });

    for (var i = sections.length - 1; i >= 0; i--) {
        var section = document.getElementById(sections[i]);
        if (section && scrollPos >= section.offsetTop) {
            navLinks[i].classList.add('active');
            break;
        }
    }
});


/* ──────────────────────────────────────
   START — Run init() on page load
────────────────────────────────────── */
init();

