/* ═══════════════════════════
   DATA STORE
═══════════════════════════ */
 
const DEPARTMENTS = [
  { id:'cs',  name:'Computer Department',                  short:'CS',   coord_id:'COORD-CS-01',  pass:'cs@123' },
  { id:'it',  name:'Information Technology',               short:'IT',   coord_id:'COORD-IT-01',  pass:'it@123' },
  { id:'ece', name:'Electronics & Computer Engineering',   short:'ECE',  coord_id:'COORD-ECE-01', pass:'ece@123' },
  { id:'me',  name:'Mechanical Department',                short:'ME',   coord_id:'COORD-ME-01',  pass:'me@123' },
  { id:'ee',  name:'Electrical Department',                short:'EE',   coord_id:'COORD-EE-01',  pass:'ee@123' },
  { id:'mx',  name:'Mechatronics Department',              short:'MX',   coord_id:'COORD-MX-01',  pass:'mx@123' },
  { id:'st',  name:'Structural Department',                short:'ST',   coord_id:'COORD-ST-01',  pass:'st@123' },
  { id:'cv',  name:'Civil Department',                     short:'CV',   coord_id:'COORD-CV-01',  pass:'cv@123' },
  { id:'sac',  name:'Student Activity Council',            short:'sac',   coord_id:'COORD-SAC-01',  pass:'sac@123' },
  { id:'nss',  name:'National Service Scheme',            short:'nss',   coord_id:'COORD-NSS-01',  pass:'nss@123' },
  
];
 
let clubs = [
  { id:'c1', dept:'cs',  name:'Coding Club',      cat:'Technical', desc:'Competitive programming and software development.' },
  { id:'c2', dept:'cs',  name:'AI/ML Society',    cat:'Technical', desc:'Artificial intelligence research and projects.' },
  { id:'c3', dept:'it',  name:'CSI Chapter',      cat:'Technical', desc:'Computer Society of India student chapter.' },
  { id:'c4', dept:'ece', name:'IEEE ECE',          cat:'Technical', desc:'IEEE student branch for electronics enthusiasts.' },
  { id:'c5', dept:'me',  name:'Robocon Team',      cat:'Technical', desc:'National robotics competition team.' },
  { id:'c6', dept:'ee',  name:'Power Systems Club',cat:'Technical', desc:'Electrical power and energy research.' },
  { id:'c7', dept:'cs',  name:'Cultural Society',  cat:'Cultural',  desc:'Arts, music, and cultural events.' },
  { id:'c8', dept:'cv',  name:'GreenBuild Club',   cat:'Social',    desc:'Sustainable construction and green design.' },
];
 
let events = [
  { id:1, dept:'cs',  club:'c1', title:'Code Sprint 2026',      desc:'24-hour competitive programming marathon. Solo and team participation. Cash prizes worth ₹15,000.',               date:'2026-04-15', time:'8:00 AM', venue:'CS Building',       status:'upcoming', rsvp:98,  color:'g1' },
  { id:2, dept:'cs',  club:'c2', title:'AI & ML Seminar',       desc:'Expert talk on real-world applications of Artificial Intelligence and Machine Learning in industry and research.',  date:'2026-04-18', time:'11:00 AM',venue:'Seminar Hall A',     status:'upcoming', rsvp:72,  color:'g6' },
  { id:3, dept:'it',  club:'c3', title:'Web Dev Bootcamp',      desc:'3-day intensive bootcamp on modern web development — HTML, CSS, JavaScript and React.',                           date:'2026-04-10', time:'10:00 AM',venue:'Lab 3 & 4',          status:'upcoming', rsvp:56,  color:'g2' },
  { id:4, dept:'ece', club:'c4', title:'Arduino Workshop',      desc:'Hands-on workshop on Arduino microcontrollers. Build IoT projects and circuit designs from scratch.',              date:'2026-04-08', time:'2:00 PM', venue:'Electronics Lab',    status:'ongoing',  rsvp:34,  color:'g4' },
  { id:5, dept:'me',  club:'c5', title:'Robocon Qualifier',     desc:'Internal qualifier for the national Robocon robotics competition. Present your bot concept.',                      date:'2026-04-20', time:'9:00 AM', venue:'Mechanical Workshop',status:'upcoming', rsvp:28,  color:'g3' },
  { id:6, dept:'ee',  club:'c6', title:'Power Systems Talk',    desc:'Industry expert session on smart grid technology, renewable energy integration and demand forecasting.',          date:'2026-04-08', time:'3:00 PM', venue:'EE Seminar Room',    status:'ongoing',  rsvp:41,  color:'g5' },
  { id:7, dept:'cs',  club:'c7', title:'Tarang Cultural Fest',  desc:'Annual cultural extravaganza featuring dance, drama, music, art installations and fashion show.',                  date:'2026-04-12', time:'5:00 PM', venue:'Auditorium',         status:'upcoming', rsvp:210, color:'g7' },
  { id:8, dept:'cv',  club:'c8', title:'Green Build Expo',      desc:'Showcase of sustainable construction materials and techniques. Guest lectures from industry leaders.',             date:'2026-04-22', time:'10:00 AM',venue:'Civil Dept Hall',     status:'upcoming', rsvp:36,  color:'g4' },
];
 
let currentDept = 'all';
let currentStatus = 'all';
let selectedColor = 'g1';
let loggedIn = null; // dept object
let dashTab = 'clubs';
let calendarDate = new Date();
 
const AV_COLORS = ['#0D8AB9','#06B6D4','#1A9FCC','#0A7BA3','#068B99'];
const AV_INIT   = ['RS','KP','AM','VD','SP'];
const CLUB_AV_COLORS = ['#0D8AB9','#1A9FCC','#06B6D4','#0A7BA3','#068B99','#05899B','#0098B3','#04A5B5'];
const DEPT_EMOJIS = { cs:'💻', it:'🖥️', ece:'⚡', me:'⚙️', ee:'🔌', mx:'🤖', st:'🏗️', cv:'🏛️' };

/* ═══════════════════════════
   PAGE ROUTING
═══════════════════════════ */
function showPage(p) {
  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
  document.getElementById('page-'+p).classList.add('active');
}
function goHome() { showPage('home'); renderAll(); }

/* Nav link active highlight */
function setActiveNav(el) {
  document.querySelectorAll('.nav-center .nav-link').forEach(l => l.classList.remove('active'));
  el.classList.add('active');
}

/* Mobile menu */
function toggleMobileMenu() {
  document.getElementById('mobileNav').classList.toggle('open');
}
function closeMobileMenu() {
  document.getElementById('mobileNav').classList.remove('open');
}
 
/* ═══════════════════════════
   INIT
═══════════════════════════ */
function init() {
  // Populate dept select in login
  const sel = document.getElementById('loginDept');
  DEPARTMENTS.forEach(d => {
    const o = document.createElement('option');
    o.value = d.id; 
    o.textContent = d.name;
    sel.appendChild(o);
  });

  // Populate dept dropdown on main page
  populateDeptDropdown();

  // Render everything
  renderAll();

  // Close dept dropdown on outside click
  document.addEventListener('click', (e) => {
    const wrap = document.getElementById('deptDropdownWrap');
    if (wrap && !wrap.contains(e.target)) {
      wrap.classList.remove('open');
    }
  });

  // Scroll spy for nav links
  setupScrollSpy();
}

/* ═══════════════════════════
   RENDER ALL SECTIONS
═══════════════════════════ */
function renderAll() {
  renderEvents();
  renderClubs();
  renderCalendar();
}

/* ═══════════════════════════
   DEPARTMENT DROPDOWN
═══════════════════════════ */
function populateDeptDropdown() {
  const menu = document.getElementById('deptDropdownMenu');
  // Keep the "All Departments" item, add the rest
  let html = `<div class="dept-dropdown-item active" data-dept="all" onclick="selectDept(this, 'all')">
    <span>🏫</span> All Departments
  </div>`;
  DEPARTMENTS.forEach(d => {
    html += `<div class="dept-dropdown-item" data-dept="${d.id}" onclick="selectDept(this, '${d.id}')">
      <span>${DEPT_EMOJIS[d.id] || '📚'}</span> ${d.name}
      <span class="dept-short-tag">${d.short}</span>
    </div>`;
  });
  menu.innerHTML = html;
}

function toggleDeptDropdown() {
  const wrap = document.getElementById('deptDropdownWrap');
  wrap.classList.toggle('open');
}

function selectDept(el, deptId) {
  currentDept = deptId;

  // Update active state in dropdown
  document.querySelectorAll('.dept-dropdown-item').forEach(item => item.classList.remove('active'));
  el.classList.add('active');

  // Update button label
  const label = document.getElementById('deptDropdownLabel');
  if (deptId === 'all') {
    label.textContent = 'All Departments';
  } else {
    const dept = DEPARTMENTS.find(d => d.id === deptId);
    label.textContent = dept ? dept.name : 'All Departments';
  }

  // Close dropdown
  document.getElementById('deptDropdownWrap').classList.remove('open');

  renderEvents();
}
 
function setStatus(el) {
  currentStatus = el.dataset.s;
  document.querySelectorAll('.stab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderEvents();
}
 
function getFiltered() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  return events.filter(e => {
    const club = clubs.find(c => c.id === e.club);
    const dept = DEPARTMENTS.find(d => d.id === e.dept);
    const matchDept = currentDept === 'all' || e.dept === currentDept;
    const matchStatus = currentStatus === 'all' || e.status === currentStatus;
    const matchQ = !q || e.title.toLowerCase().includes(q)
      || (club && club.name.toLowerCase().includes(q))
      || (dept && dept.name.toLowerCase().includes(q))
      || e.desc.toLowerCase().includes(q);
    return matchDept && matchStatus && matchQ;
  });
}
 
function renderEvents() {
  const filtered = getFiltered();
  const grid = document.getElementById('evGrid');
 
  // Stats
  const ongoing = events.filter(e => e.status === 'ongoing').length;
  const upcoming = events.filter(e => e.status === 'upcoming').length;
  document.getElementById('stat-on').textContent = ongoing;
  document.getElementById('stat-up').textContent = upcoming + '+';
  document.getElementById('stat-clubs').textContent = clubs.length;
  document.getElementById('evCount').textContent = filtered.length + ' event' + (filtered.length !== 1 ? 's' : '');
 
  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <h3>No events found</h3>
      <p>Try a different department, status filter, or search term.</p>
    </div>`;
    return;
  }
 
  grid.innerHTML = filtered.map((e, i) => {
    const club = clubs.find(c => c.id === e.club);
    const dept = DEPARTMENTS.find(d => d.id === e.dept);
    const bClass = e.status === 'ongoing' ? 'badge-ongoing' : e.status === 'upcoming' ? 'badge-upcoming' : 'badge-past';
    const bLabel = e.status.charAt(0).toUpperCase() + e.status.slice(1);
    const avH = [0,1,2].map(j => `<div class="av" style="background:${AV_COLORS[j%5]}">${AV_INIT[j%5]}</div>`).join('');
 
    return `<div class="event-card" style="animation-delay:${i*0.04}s" onclick="openModal(${e.id})">
      <div class="card-banner ${e.color}">
        <div class="card-dept-tag">${dept ? dept.short : ''}</div>
        <span class="badge ${bClass}">${bLabel}</span>
      </div>
      <div class="card-body">
        <div class="card-club">${club ? club.name : ''}</div>
        <div class="card-title">${e.title}</div>
        <div class="card-desc">${e.desc}</div>
        <div class="card-meta">
          <span class="meta-item">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            ${fmtDate(e.date)}
          </span>
          <span class="meta-item">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            ${e.time}
          </span>
          <span class="meta-item">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
            ${e.venue}
          </span>
        </div>
      </div>
      <div class="card-footer">
        <div class="rsvp-info">
          <div class="avatars">${avH}</div>
          <span>+${e.rsvp} RSVPs</span>
        </div>
        <button class="btn btn-primary btn-sm">Details</button>
      </div>
    </div>`;
  }).join('');
}

/* ═══════════════════════════
   CLUBS SECTION
═══════════════════════════ */
function renderClubs() {
  const grid = document.getElementById('clubsGrid');
  if (!grid) return;

  grid.innerHTML = clubs.map((c, i) => {
    const dept = DEPARTMENTS.find(d => d.id === c.dept);
    const evCount = events.filter(e => e.club === c.id).length;
    const colorIdx = i % CLUB_AV_COLORS.length;
    const catClass = 'club-cat-' + c.cat.toLowerCase();
    const initials = c.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

    return `<div class="club-card" style="animation-delay:${i * 0.05}s">
      <div class="club-card-header">
        <div class="club-card-avatar" style="background:${CLUB_AV_COLORS[colorIdx]}">${initials}</div>
        <div>
          <div class="club-card-name">${c.name}</div>
          <div class="club-card-dept">${dept ? dept.short + ' — ' + dept.name : ''}</div>
        </div>
      </div>
      <div class="club-card-desc">${c.desc}</div>
      <div class="club-card-footer">
        <span class="club-card-cat ${catClass}">${c.cat}</span>
        <span class="club-card-events-count">${evCount} event${evCount !== 1 ? 's' : ''}</span>
      </div>
    </div>`;
  }).join('');
}

/* ═══════════════════════════
   CALENDAR SECTION
═══════════════════════════ */
function renderCalendar() {
  const grid = document.getElementById('calendarGrid');
  const label = document.getElementById('calMonthLabel');
  if (!grid || !label) return;

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const today = new Date();

  label.textContent = calendarDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build event lookup by date string
  const eventsByDate = {};
  events.forEach(e => {
    if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
    eventsByDate[e.date].push(e);
  });

  // Header row
  let html = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    .map(d => `<div class="cal-header-cell">${d}</div>`).join('');

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="cal-cell empty"></div>`;
  }

  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEvents = eventsByDate[dateStr] || [];
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

    let dotsHtml = '';
    if (dayEvents.length) {
      dotsHtml = '<div class="cal-dots">';
      dayEvents.forEach(e => {
        const dotClass = e.status === 'ongoing' ? 'cal-dot-ongoing' 
                       : e.status === 'upcoming' ? 'cal-dot-upcoming' 
                       : 'cal-dot-past';
        dotsHtml += `<div class="cal-dot ${dotClass}" title="${e.title}"></div>`;
      });
      dotsHtml += '</div>';
    }

    const classes = ['cal-cell'];
    if (isToday) classes.push('today');
    if (dayEvents.length) classes.push('has-event');

    html += `<div class="${classes.join(' ')}" ${dayEvents.length ? `onclick="showCalendarEvents('${dateStr}')"` : ''}>
      <span class="cal-day-num">${day}</span>
      ${dotsHtml}
    </div>`;
  }

  grid.innerHTML = html;
}

function changeMonth(delta) {
  calendarDate.setMonth(calendarDate.getMonth() + delta);
  renderCalendar();
}

function showCalendarEvents(dateStr) {
  const dayEvents = events.filter(e => e.date === dateStr);
  if (dayEvents.length === 1) {
    openModal(dayEvents[0].id);
  } else if (dayEvents.length > 1) {
    // Open the first event's modal
    openModal(dayEvents[0].id);
  }
}

/* ═══════════════════════════
   SCROLL SPY
═══════════════════════════ */
function setupScrollSpy() {
  const sections = ['section-events', 'section-clubs', 'section-calendar', 'section-about'];
  const navLinks = document.querySelectorAll('.nav-center .nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}
 
/* ═══════════════════════════
   MODAL
═══════════════════════════ */
function openModal(id) {
  const e = events.find(ev => ev.id === id);
  if (!e) return;
  const club = clubs.find(c => c.id === e.club);
  const dept = DEPARTMENTS.find(d => d.id === e.dept);
  const bClass = e.status === 'ongoing' ? 'badge-ongoing' : e.status === 'upcoming' ? 'badge-upcoming' : 'badge-past';
  document.getElementById('mBanner').className = 'modal-banner ' + e.color;
  document.getElementById('mBadge').className = 'badge ' + bClass;
  document.getElementById('mBadge').textContent = e.status.charAt(0).toUpperCase() + e.status.slice(1);
  document.getElementById('mDept').textContent = dept ? dept.name : '';
  document.getElementById('mClub').textContent = club ? club.name : '';
  document.getElementById('mTitle').textContent = e.title;
  document.getElementById('mDesc').textContent = e.desc;
  document.getElementById('mDate').textContent = fmtDate(e.date);
  document.getElementById('mTime').textContent = e.time;
  document.getElementById('mVenue').textContent = e.venue;
  document.getElementById('mRsvp').textContent = e.rsvp + ' registered';
  document.getElementById('modal').classList.add('open');
}
function closeModal(ev) { if (ev.target === document.getElementById('modal')) closeModalD(); }
function closeModalD() { document.getElementById('modal').classList.remove('open'); }
 
/* ═══════════════════════════
   AUTH
═══════════════════════════ */
function doLogin() {
  const dId   = document.getElementById('loginDept').value;
  const coordId = document.getElementById('loginId').value.trim();
  const pass  = document.getElementById('loginPass').value;
 
  const dept = DEPARTMENTS.find(d => d.id === dId);
  if (!dept) return alert('Please select a department.');
  if (!coordId) return alert('Please enter your Coordinator ID.');
  if (!pass) return alert('Please enter your password.');
 
  if (coordId !== dept.coord_id || pass !== dept.pass) {
    return alert('Invalid Coordinator ID or password. Please check your credentials.');
  }
 
  loggedIn = dept;
  document.getElementById('navLoginBtn').style.display = 'none';
  document.getElementById('navLogoutBtn').style.display = '';
  renderDashboard();
  showPage('dashboard');
}
 
function doLogout() {
  loggedIn = null;
  document.getElementById('navLoginBtn').style.display = '';
  document.getElementById('navLogoutBtn').style.display = 'none';
  goHome();
}
 
/* ═══════════════════════════
   DASHBOARD
═══════════════════════════ */
function renderDashboard() {
  const d = loggedIn;
  document.getElementById('dashTitle').textContent = d.name;
  document.getElementById('dashDeptTag').textContent = d.short;
  document.getElementById('dashSub').textContent = `Coordinator: ${d.coord_id} · Manage clubs & events`;
 
  const myClubs = clubs.filter(c => c.dept === d.id);
  const myEvents = events.filter(e => e.dept === d.id);
 
  document.getElementById('kClubs').textContent = myClubs.length;
  document.getElementById('kEvents').textContent = myEvents.length;
  document.getElementById('kOngoing').textContent = myEvents.filter(e => e.status === 'ongoing').length;
  document.getElementById('kUpcoming').textContent = myEvents.filter(e => e.status === 'upcoming').length;
  document.getElementById('kRsvp').textContent = myEvents.reduce((s, e) => s + e.rsvp, 0);
 
  // Clubs panel
  const clubList = document.getElementById('dClubList');
  if (!myClubs.length) {
    clubList.innerHTML = `<div style="text-align:center;padding:28px 20px;color:var(--muted);font-size:13px">No clubs yet. Create your department's first club above!</div>`;
  } else {
    clubList.innerHTML = myClubs.map(c => {
      const evCount = events.filter(e => e.club === c.id).length;
      return `<div class="club-row">
        <div class="club-row-info">
          <div class="club-row-name">${c.name}</div>
          <div class="club-row-meta">${c.cat} · ${evCount} event${evCount !== 1 ? 's' : ''} · ${c.desc}</div>
        </div>
        <div class="club-row-actions">
          <button class="tbtn del" onclick="deleteClub('${c.id}')">Delete</button>
        </div>
      </div>`;
    }).join('');
  }
 
  // Club dropdown for events form
  const clubSel = document.getElementById('nEvClub');
  clubSel.innerHTML = myClubs.length
    ? myClubs.map(c => `<option value="${c.id}">${c.name}</option>`).join('')
    : `<option value="">No clubs — create a club first</option>`;
 
  // Events table
  const tbody = document.getElementById('dEvTable');
  if (!myEvents.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:28px;color:var(--muted)">No events yet. Post an event above!</td></tr>`;
  } else {
    tbody.innerHTML = myEvents.map(e => {
      const c = clubs.find(cl => cl.id === e.club);
      const bClass = e.status === 'ongoing' ? 'badge-ongoing' : e.status === 'upcoming' ? 'badge-upcoming' : 'badge-past';
      return `<tr>
        <td>${e.title}</td>
        <td>${c ? c.name : '—'}</td>
        <td>${fmtDate(e.date)}</td>
        <td><span class="badge ${bClass}" style="font-size:10px;padding:2px 8px">${e.status}</span></td>
        <td>${e.rsvp}</td>
        <td>
          <div class="table-btns">
            <button class="tbtn del" onclick="deleteEvent(${e.id})">Delete</button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }
}
 
function setDTab(el, tab) {
  dashTab = tab;
  document.querySelectorAll('.dtab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('dpanel-clubs').style.display = tab === 'clubs' ? 'block' : 'none';
  document.getElementById('dpanel-events').style.display = tab === 'events' ? 'block' : 'none';
}
 
/* ═══════════════════════════
   CLUB CRUD
═══════════════════════════ */
function createClub() {
  const name = document.getElementById('nClubName').value.trim();
  const cat  = document.getElementById('nClubCat').value;
  const desc = document.getElementById('nClubDesc').value.trim();
  if (!name) return alert('Please enter a club name.');
  if (clubs.find(c => c.name.toLowerCase() === name.toLowerCase() && c.dept === loggedIn.id)) {
    return alert('A club with this name already exists in your department.');
  }
  clubs.push({ id: 'c' + Date.now(), dept: loggedIn.id, name, cat, desc: desc || name + ' club.' });
  clearClubForm();
  renderDashboard();
  renderClubs();
  toast('Club "' + name + '" created!');
}
 
function deleteClub(id) {
  if (!confirm('Delete this club and all its events?')) return;
  clubs = clubs.filter(c => c.id !== id);
  events = events.filter(e => e.club !== id);
  renderDashboard();
  renderClubs();
  renderCalendar();
  toast('Club deleted.');
}
 
function clearClubForm() {
  document.getElementById('nClubName').value = '';
  document.getElementById('nClubDesc').value = '';
}
 
/* ═══════════════════════════
   EVENT CRUD
═══════════════════════════ */
function postEvent() {
  const title  = document.getElementById('nEvTitle').value.trim();
  const clubId = document.getElementById('nEvClub').value;
  const date   = document.getElementById('nEvDate').value;
  const time   = document.getElementById('nEvTime').value;
  const venue  = document.getElementById('nEvVenue').value.trim();
  const status = document.getElementById('nEvStatus').value;
  const desc   = document.getElementById('nEvDesc').value.trim();
 
  if (!title || !clubId || !date || !venue) return alert('Please fill in Title, Club, Date, and Venue.');
  if (!clubs.find(c => c.id === clubId)) return alert('Please create a club first before posting an event.');
 
  const hr = parseInt(time.split(':')[0]);
  const min = time.split(':')[1];
  const period = hr >= 12 ? 'PM' : 'AM';
  const hr12 = hr > 12 ? hr - 12 : (hr === 0 ? 12 : hr);
  const fTime = hr12 + ':' + min + ' ' + period;
 
  events.push({
    id: Date.now(), dept: loggedIn.id, club: clubId,
    title, desc: desc || 'Event by ' + loggedIn.name + '.',
    date, time: fTime, venue, status, rsvp: 0, color: selectedColor
  });
  clearEvForm();
  renderDashboard();
  renderEvents();
  renderCalendar();
  toast('Event "' + title + '" posted!');
}
 
function deleteEvent(id) {
  if (!confirm('Delete this event?')) return;
  events = events.filter(e => e.id !== id);
  renderDashboard();
  renderEvents();
  renderCalendar();
  toast('Event deleted.');
}
 
function clearEvForm() {
  ['nEvTitle','nEvDate','nEvVenue','nEvDesc'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('nEvTime').value = '10:00';
}
 
function pickColor(el) {
  document.querySelectorAll('.cp').forEach(c => c.classList.remove('sel'));
  el.classList.add('sel');
  selectedColor = el.dataset.c;
}
 
/* ═══════════════════════════
   UTILS
═══════════════════════════ */
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}
 
function toast(msg) {
  document.getElementById('toastMsg').textContent = msg;
  const t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
 
/* ═══ INIT ═══ */
init();