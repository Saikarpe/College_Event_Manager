/* ═══ DATA ═══ */
const COLORS = {
  bg1:'linear-gradient(135deg,#1a3a5c 0%,#0d6e9c 100%)',
  bg2:'linear-gradient(135deg,#3a1a5c 0%,#7b2fbe 100%)',
  bg3:'linear-gradient(135deg,#5c1a1a 0%,#c0392b 100%)',
  bg4:'linear-gradient(135deg,#1a5c2a 0%,#27ae60 100%)',
  bg5:'linear-gradient(135deg,#5c4a1a 0%,#d4a017 100%)',
};

let events = [
  { id:1, club:'NSS', title:'Blood Donation Camp', desc:'Annual blood donation drive organized in collaboration with the Red Cross Society. Certificates and refreshments provided.', date:'2026-04-08', time:'9:00 AM', venue:'College Ground', status:'ongoing', rsvp:82, color:'bg3' },
  { id:2, club:'CSI', title:'Web Dev Bootcamp', desc:'3-day intensive bootcamp on modern web development — HTML, CSS, JavaScript and React. Ideal for beginners and intermediate coders.', date:'2026-04-10', time:'10:00 AM', venue:'Lab 3 & 4', status:'upcoming', rsvp:56, color:'bg1' },
  { id:3, club:'Cultural', title:'Tarang Cultural Fest', desc:'The annual cultural extravaganza featuring dance, drama, music, art installations and fashion show. Open to all departments.', date:'2026-04-12', time:'5:00 PM', venue:'Auditorium', status:'upcoming', rsvp:210, color:'bg2' },
  { id:4, club:'IEEE', title:'Arduino Workshop', desc:'Hands-on workshop on Arduino microcontrollers. Learn to build IoT projects and circuit designs from scratch.', date:'2026-04-08', time:'2:00 PM', venue:'Electronics Lab', status:'ongoing', rsvp:34, color:'bg4' },
  { id:5, club:'Coding', title:'Code Sprint 2026', desc:'24-hour competitive programming marathon. Solo and team participation allowed. Cash prizes worth ₹15,000.', date:'2026-04-15', time:'8:00 AM', venue:'CS Building', status:'upcoming', rsvp:98, color:'bg1' },
  { id:6, club:'Sports', title:'Inter-Dept Cricket', desc:'Annual inter-departmental cricket tournament. Teams of 11 players. Knockout format across 4 days.', date:'2026-04-08', time:'7:00 AM', venue:'Sports Ground', status:'ongoing', rsvp:120, color:'bg4' },
  { id:7, club:'NSS', title:'Tree Plantation Drive', desc:'Community initiative to plant 500 saplings across campus and nearby village. Join us to go green.', date:'2026-04-20', time:'7:00 AM', venue:'Campus + Village', status:'upcoming', rsvp:45, color:'bg4' },
  { id:8, club:'IEEE', title:'AI & ML Seminar', desc:'Expert talk on real-world applications of Artificial Intelligence and Machine Learning in industry and research.', date:'2026-04-18', time:'11:00 AM', venue:'Seminar Hall A', status:'upcoming', rsvp:72, color:'bg5' },
  { id:9, club:'CSI', title:'Hackathon 2025', desc:'24-hour hackathon with theme: Smart City Solutions. Build apps, win prizes and get mentored by industry experts.', date:'2025-12-01', time:'9:00 AM', venue:'Innovation Lab', status:'past', rsvp:140, color:'bg2' },
  { id:10, club:'Cultural', title:'Freshers Welcome Night', desc:'Annual freshers party welcoming the new batch with games, performances and a star night concert.', date:'2025-09-15', time:'6:00 PM', venue:'Auditorium', status:'past', rsvp:300, color:'bg2' },
  { id:11, club:'Coding', title:'Git & GitHub Workshop', desc:'Beginner-friendly session on version control, branching, pull requests and open source contribution.', date:'2026-04-22', time:'3:00 PM', venue:'Lab 5', status:'upcoming', rsvp:29, color:'bg1' },
];

let currentFilter = 'all';
let selectedColor = 'bg1';
let loggedInClub = null;

/* ═══ PAGES ═══ */
function showPage(p) {
  ['home','login','dashboard'].forEach(id => {
    const el = document.getElementById('page-'+id);
    el.style.display = 'none';
    el.classList.remove('active');
  });
  const target = document.getElementById('page-'+p);
  target.style.display = p === 'home' ? 'block' : (p === 'login' ? 'flex' : 'block');
  target.classList.add('active');
  if (p === 'home') renderEvents();
}

/* ═══ LOGIN ═══ */
function doLogin() {
  const club = document.getElementById('loginClub').value;
  const pass = document.getElementById('loginPass').value;
  if (!club) return alert('Please select a club.');
  if (!pass) return alert('Please enter a password.');
  loggedInClub = club;
  document.getElementById('dashTitle').textContent = club + ' Dashboard';
  renderDashboard();
  showPage('dashboard');
}
function doLogout() {
  loggedInClub = null;
  showPage('home');
}

/* ═══ FILTER LOGIC ═══ */
function setTab(el, filter) {
  currentFilter = filter;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  applyFilters();
}

function applyFilters() {
  renderEvents();
}

function getFilteredEvents() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const club = document.getElementById('clubFilter').value;
  return events.filter(e => {
    const matchStatus = currentFilter === 'all' || e.status === currentFilter;
    const matchClub = club === 'all' || e.club === club;
    const matchQ = !q || e.title.toLowerCase().includes(q) || e.club.toLowerCase().includes(q) || e.desc.toLowerCase().includes(q);
    return matchStatus && matchClub && matchQ;
  });
}

/* ═══ RENDER HOME ═══ */
function renderEvents() {
  const filtered = getFilteredEvents();
  const grid = document.getElementById('eventsGrid');
  document.getElementById('eventCount').textContent = filtered.length + ' event' + (filtered.length !== 1 ? 's' : '');

  const ongoing = events.filter(e=>e.status==='ongoing').length;
  const upcoming = events.filter(e=>e.status==='upcoming').length;
  document.getElementById('stat-ongoing').textContent = ongoing;
  document.getElementById('stat-upcoming').textContent = upcoming + '+';

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <h3>No events found</h3>
      <p>Try a different filter or search term.</p>
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map((e, i) => {
    const badgeClass = e.status === 'ongoing' ? 'badge-ongoing' : e.status === 'upcoming' ? 'badge-upcoming' : 'badge-past';
    const badgeLabel = e.status.charAt(0).toUpperCase() + e.status.slice(1);
    const avatarColors = ['#F5A623','#2ECE8A','#7b2fbe','#c0392b','#0d6e9c'];
    const initials = ['RS','KP','AM','VD','SP'];
    const avatarHtml = Array.from({length:3}, (_, j) =>
      `<div class="avatar" style="background:${avatarColors[j%5]}">${initials[j%5]}</div>`
    ).join('');

    return `<div class="event-card" style="animation-delay:${i*0.05}s" onclick="openModal(${e.id})">
      <div class="card-banner">
        <div class="card-banner-gradient" style="background:${COLORS[e.color]}"></div>
        <span class="status-badge ${badgeClass}">${badgeLabel}</span>
      </div>
      <div class="card-body">
        <div class="card-club">${e.club}</div>
        <div class="card-title">${e.title}</div>
        <div class="card-desc">${e.desc}</div>
        <div class="card-meta">
          <span class="meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            ${formatDate(e.date)}
          </span>
          <span class="meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            ${e.time}
          </span>
          <span class="meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
            ${e.venue}
          </span>
        </div>
      </div>
      <div class="card-footer">
        <div class="rsvp-count">
          <div class="avatars">${avatarHtml}</div>
          <span>+${e.rsvp} RSVPs</span>
        </div>
        <button class="btn btn-primary btn-sm">Details</button>
      </div>
    </div>`;
  }).join('');
}

/* ═══ MODAL ═══ */
function openModal(id) {
  const e = events.find(ev => ev.id === id);
  if (!e) return;
  document.getElementById('modalBanner').style.background = COLORS[e.color];
  const badgeClass = e.status === 'ongoing' ? 'badge-ongoing' : e.status === 'upcoming' ? 'badge-upcoming' : 'badge-past';
  document.getElementById('modalBadge').className = 'status-badge ' + badgeClass;
  document.getElementById('modalBadge').textContent = e.status.charAt(0).toUpperCase() + e.status.slice(1);
  document.getElementById('modalClub').textContent = e.club;
  document.getElementById('modalTitle').textContent = e.title;
  document.getElementById('modalDesc').textContent = e.desc;
  document.getElementById('modalDate').textContent = formatDate(e.date);
  document.getElementById('modalTime').textContent = e.time;
  document.getElementById('modalVenue').textContent = e.venue;
  document.getElementById('modalRsvp').textContent = e.rsvp + ' registered';
  document.getElementById('modal').classList.add('open');
}
function closeModal(e) { if (e.target === document.getElementById('modal')) closeModalDirect(); }
function closeModalDirect() { document.getElementById('modal').classList.remove('open'); }

/* ═══ DASHBOARD ═══ */
function renderDashboard() {
  const myEvents = events.filter(e => e.club === loggedInClub);
  document.getElementById('dashTotal').textContent = myEvents.length;
  document.getElementById('dashOngoing').textContent = myEvents.filter(e=>e.status==='ongoing').length;
  document.getElementById('dashUpcoming').textContent = myEvents.filter(e=>e.status==='upcoming').length;
  document.getElementById('dashRsvp').textContent = myEvents.reduce((s,e)=>s+e.rsvp,0);

  const tbody = document.getElementById('dashTable');
  if (!myEvents.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--muted)">No events yet. Post your first event above!</td></tr>`;
    return;
  }
  tbody.innerHTML = myEvents.map(e => {
    const badgeClass = e.status === 'ongoing' ? 'badge-ongoing' : e.status === 'upcoming' ? 'badge-upcoming' : 'badge-past';
    return `<tr>
      <td>${e.title}</td>
      <td>${formatDate(e.date)}</td>
      <td><span class="status-badge ${badgeClass}" style="font-size:10px;padding:3px 8px">${e.status}</span></td>
      <td>${e.rsvp}</td>
      <td>
        <div class="table-actions">
          <button class="action-btn">Edit</button>
          <button class="action-btn del" onclick="deleteEvent(${e.id})">Delete</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function postEvent() {
  const title = document.getElementById('newTitle').value.trim();
  const desc  = document.getElementById('newDesc').value.trim();
  const date  = document.getElementById('newDate').value;
  const time  = document.getElementById('newTime').value;
  const venue = document.getElementById('newVenue').value.trim();
  const status = document.getElementById('newStatus').value;
  const cat  = document.getElementById('newCat').value;

  if (!title || !date || !venue) return alert('Please fill in Title, Date, and Venue.');

  events.push({
    id: Date.now(),
    club: loggedInClub,
    title, desc: desc || 'Event by ' + loggedInClub + '.',
    date, time: time || '10:00 AM', venue, status, rsvp: 0, color: selectedColor
  });
  resetForm();
  renderDashboard();
  alert('Event posted successfully!');
}

function deleteEvent(id) {
  if (!confirm('Delete this event?')) return;
  events = events.filter(e => e.id !== id);
  renderDashboard();
}

function resetForm() {
  ['newTitle','newDesc','newDate','newVenue'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('newTime').value = '10:00';
}

function pickColor(el) {
  document.querySelectorAll('.cp').forEach(c => c.classList.remove('sel'));
  el.classList.add('sel');
  selectedColor = el.dataset.color;
}

/* ═══ UTILS ═══ */
function formatDate(d) {
  const opts = { day:'numeric', month:'short', year:'numeric' };
  return new Date(d).toLocaleDateString('en-IN', opts);
}

/* ═══ INIT ═══ */
showPage('home');