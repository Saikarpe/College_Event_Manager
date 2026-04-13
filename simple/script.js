let appData = { departments: [], clubs: [], events: [], session: null };

async function loadData() {
    const res = await fetch('api.php?action=get_data');
    appData = await res.json();
    
    populateDropdowns();
    renderPublic();
    updateNav();
    
    if (appData.session) {
        renderDashboard();
    }
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById('page-' + pageId).classList.remove('hidden');
}

function updateNav() {
    const isLogged = appData.session !== null;
    document.getElementById('navLoginBtn').classList.toggle('hidden', isLogged);
    document.getElementById('navDashBtn').classList.toggle('hidden', !isLogged);
    document.getElementById('navLogoutBtn').classList.toggle('hidden', !isLogged);
}

function populateDropdowns() {
    const filterDept = document.getElementById('filterDept');
    const loginDept = document.getElementById('loginDept');
    
    filterDept.innerHTML = '<option value="all">All Departments</option>';
    loginDept.innerHTML = '';
    
    appData.departments.forEach(d => {
        filterDept.innerHTML += `<option value="${d.id}">${d.name}</option>`;
        loginDept.innerHTML += `<option value="${d.id}">${d.name}</option>`;
    });
}

function renderPublic() {
    const filterD = document.getElementById('filterDept').value;
    const searchQ = document.getElementById('filterSearch').value.toLowerCase();
    
    const eventsHtml = appData.events.filter(e => {
        return (filterD === 'all' || e.dept_id === filterD) && e.title.toLowerCase().includes(searchQ);
    }).map(e => `
        <div class="card">
            <span class="badge">${e.status}</span>
            <h3 style="margin-top:8px">${e.title}</h3>
            <div class="card-meta">${e.event_date} @ ${e.event_time} | ${e.venue}</div>
            <p>${e.description}</p>
        </div>
    `).join('');
    document.getElementById('eventsGrid').innerHTML = eventsHtml || '<p>No events found.</p>';

    const clubsHtml = appData.clubs.filter(c => {
        return (filterD === 'all' || c.dept_id === filterD) && c.name.toLowerCase().includes(searchQ);
    }).map(c => `
        <div class="card">
            <span class="badge">${c.category}</span>
            <h3 style="margin-top:8px">${c.name}</h3>
            <p>${c.description}</p>
        </div>
    `).join('');
    document.getElementById('clubsGrid').innerHTML = clubsHtml || '<p>No clubs found.</p>';
}

// Auth
async function doLogin() {
    const res = await fetch('api.php?action=login', {
        method: 'POST',
        body: JSON.stringify({
            dept_id: document.getElementById('loginDept').value,
            coord_id: document.getElementById('loginId').value,
            password: document.getElementById('loginPass').value
        })
    });
    const data = await res.json();
    if (data.success) {
        await loadData();
        showPage('dashboard');
    } else {
        alert(data.message);
    }
}

async function doLogout() {
    await fetch('api.php?action=logout');
    appData.session = null;
    updateNav();
    showPage('home');
}

// Dashboard
function renderDashboard() {
    document.getElementById('dashTitle').innerText = `${appData.session.name} Dashboard`;
    
    const myClubs = appData.clubs.filter(c => c.dept_id === appData.session.id);
    const myEvents = appData.events.filter(e => e.dept_id === appData.session.id);
    
    // Populate Club Dropdown for Events
    const clubSel = document.getElementById('nEvClub');
    clubSel.innerHTML = myClubs.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    
    // Render Club List
    document.getElementById('dClubList').innerHTML = myClubs.map(c => `
        <div class="flex flex-between align-center" style="border:1px solid #ccc; padding:8px;">
            <div><strong>${c.name}</strong> (${c.category})</div>
            <button class="btn" onclick="deleteClub(${c.id})">Del</button>
        </div>
    `).join('');

    // Render Event List
    document.getElementById('dEvList').innerHTML = myEvents.map(e => `
        <div class="flex flex-between align-center" style="border:1px solid #ccc; padding:8px;">
            <div><strong>${e.title}</strong> <br><small>${e.event_date}</small></div>
            <button class="btn" onclick="deleteEvent(${e.id})">Del</button>
        </div>
    `).join('');
}

// CRUD Operations
async function createClub() {
    await fetch('api.php?action=add_club', {
        method: 'POST',
        body: JSON.stringify({
            name: document.getElementById('nClubName').value,
            category: document.getElementById('nClubCat').value,
            description: document.getElementById('nClubDesc').value
        })
    });
    document.querySelectorAll('#nClubName, #nClubCat, #nClubDesc').forEach(el => el.value = '');
    await loadData();
}

async function postEvent() {
    await fetch('api.php?action=add_event', {
        method: 'POST',
        body: JSON.stringify({
            title: document.getElementById('nEvTitle').value,
            club_id: document.getElementById('nEvClub').value,
            date: document.getElementById('nEvDate').value,
            time: document.getElementById('nEvTime').value,
            venue: document.getElementById('nEvVenue').value,
            status: document.getElementById('nEvStatus').value,
            description: document.getElementById('nEvDesc').value
        })
    });
    document.querySelectorAll('#nEvTitle, #nEvDate, #nEvVenue, #nEvDesc').forEach(el => el.value = '');
    await loadData();
}

async function deleteClub(id) {
    if(confirm('Delete club?')) {
        await fetch(`api.php?action=delete_club&id=${id}`);
        await loadData();
    }
}

async function deleteEvent(id) {
    if(confirm('Delete event?')) {
        await fetch(`api.php?action=delete_event&id=${id}`);
        await loadData();
    }
}

// Init
loadData();