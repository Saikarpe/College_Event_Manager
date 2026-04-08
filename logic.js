const DEPARTMENTS = [
    { id: "cs",  name: "Computer Science & Engineering", short: "CS"  },
    { id: "it",  name: "Information Technology",         short: "IT"  },
    { id: "ece", name: "Electronics & Computer Engg.",   short: "ECE" },
    { id: "me",  name: "Mechanical Engineering",         short: "ME"  },
    { id: "ee",  name: "Electrical Engineering",         short: "EE"  },
    { id: "mx",  name: "Mechatronics Engineering",       short: "MX"  },
    { id: "st",  name: "Structural Engineering",         short: "ST"  },
    { id: "cv",  name: "Civil Engineering",              short: "CV"  },
    { id: "sac", name: "Student Activity Council",       short: "SAC" }
];

const COORDINATORS = {
    cs:  { id: "COORD-CS-01",  pass: "cs123"  },
    it:  { id: "COORD-IT-01",  pass: "it123"  },
    ece: { id: "COORD-ECE-01", pass: "ece123" },
    me:  { id: "COORD-ME-01",  pass: "me123"  },
    ee:  { id: "COORD-EE-01",  pass: "ee123"  },
    mx:  { id: "COORD-MX-01",  pass: "mx123"  },
    st:  { id: "COORD-ST-01",  pass: "st123"  },
    cv:  { id: "COORD-CV-01",  pass: "cv123"  },
    sac: { id: "COORD-SAC-01", pass: "sac123" }
};

const clubs = [
    { id: 1, name: "Nexus Coding Club",    dept: "cs",  category: "Technical", desc: "Competitive programming and hackathons."        },
    { id: 2, name: "Robotics Club",        dept: "me",  category: "Technical", desc: "Robot design and automation projects."           },
    { id: 3, name: "Circuit Breakers",     dept: "ece", category: "Technical", desc: "Electronics projects and IoT workshops."         },
    { id: 4, name: "Tarang Cultural Club", dept: "sac", category: "Cultural",  desc: "Annual cultural fest and  performances."        },
    { id: 5, name: "Green Earth Club",     dept: "cv",  category: "Social",    desc: "Environmental awareness and tree plantation."    },
    { id: 6, name: "Smart Automation",     dept: "mx",  category: "Technical", desc: "CNC and mechatronics projects."                  },
    { id: 7, name: "Power Grid Club",      dept: "ee",  category: "Technical", desc: "Renewable energy and smart grid projects."       },
    { id: 8, name: "Web Dev Society",      dept: "it",  category: "Technical", desc: "Web design and application development."         }
];

const events = [
    {
        id: 1, title: "Hackathon 2026",
        dept: "cs", clubId: 1,
        date: "2026-04-20", time: "9:00 AM", venue: "Computer Lab 1",
        status: "upcoming", rsvp: 38,
        desc: "24-hour coding marathon. Build innovative solutions to real-world problems."
    },
    {
        id: 2, title: "Robotics Workshop",
        dept: "me", clubId: 2,
        date: "2026-04-09", time: "10:00 AM", venue: "Workshop Hall B",
        status: "ongoing", rsvp: 52,
        desc: "Hands-on workshop on robot building using Arduino and sensors."
    },
    {
        id: 3, title: "IoT Seminar",
        dept: "ece", clubId: 3,
        date: "2026-03-15", time: "2:00 PM", venue: "Seminar Hall A",
        status: "past", rsvp: 61,
        desc: "Expert talk on Internet of Things and smart city applications."
    },
    {
        id: 4, title: "Tarang Cultural Fest",
        dept: "sac", clubId: 4,
        date: "2026-05-01", time: "5:00 PM", venue: "Open Air Auditorium",
        status: "upcoming", rsvp: 200,
        desc: "Annual cultural festival featuring music, dance, drama and art."
    },
    {
        id: 5, title: "Renewable Energy Expo",
        dept: "ee", clubId: 7,
        date: "2026-04-25", time: "11:00 AM", venue: "Exhibition Hall",
        status: "upcoming", rsvp: 30,
        desc: "Student project exhibition on solar, wind and hydro energy systems."
    }
];

const BANNER_COLORS = {
    cs: "banner-cs", it: "banner-it", ece: "banner-ece",
    me: "banner-me", ee: "banner-ee", mx: "banner-mx",
    st: "banner-st", cv: "banner-cv", sac: "banner-sac"
};

let loggedInDept = null;

function showPage(pageName) {
    document.getElementById("page-home").style.display      = "none";
    document.getElementById("page-about").style.display     = "none";
    document.getElementById("page-login").style.display     = "none";
    document.getElementById("page-dashboard").style.display = "none";
    document.getElementById("page-" + pageName).style.display = "block";
    window.scrollTo(0, 0);
}

function filterEvents() {
    const dept   = document.getElementById("deptFilter").value;
    const status = document.getElementById("statusFilter").value;
    const search = document.getElementById("searchBox").value.toLowerCase();

    const filtered = events.filter(function(event) {
        const matchDept   = (dept   === "all" || event.dept   === dept);
        const matchStatus = (status === "all" || event.status === status);
        const matchSearch = (search === "" || event.title.toLowerCase().includes(search));
        return matchDept && matchStatus && matchSearch;
    });

    document.getElementById("evCount").textContent = filtered.length + " events";

    document.getElementById("statUpcoming").textContent = events.filter(e => e.status === "upcoming").length;
    document.getElementById("statOngoing").textContent  = events.filter(e => e.status === "ongoing").length;
    document.getElementById("statClubs").textContent    = clubs.length;

    renderEvents(filtered);
}

function renderEvents(list) {
    const grid = document.getElementById("eventsGrid");

    if (list.length === 0) {
        grid.innerHTML = '<div class="empty-state"><h3>No events found</h3><p>Try a different filter or search term.</p></div>';
        return;
    }

    let html = "";

    list.forEach(function(event) {
        const dept      = DEPARTMENTS.find(d => d.id === event.dept);
        const banner    = BANNER_COLORS[event.dept] || "banner-cs";
        const badgeClass = "badge-" + event.status;
        const badgeLabel = event.status.charAt(0).toUpperCase() + event.status.slice(1);
        const dateStr   = new Date(event.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

        html += `
        <div class="event-card" onclick="openModal(${event.id})">
            <div class="card-banner ${banner}">
                <span class="badge ${badgeClass}">${badgeLabel}</span>
            </div>
            <div class="card-body">
                <div class="card-title">${event.title}</div>
                <div class="card-desc">${event.desc}</div>
                <div class="card-meta">
                    <span>📅 ${dateStr}</span>
                    <span>📍 ${event.venue}</span>
                </div>
            </div>
        </div>`;
    });

    grid.innerHTML = html;
}

function renderClubs() {
    const grid = document.getElementById("clubsGrid");
    let html = "";

    clubs.forEach(function(club) {
        const dept = DEPARTMENTS.find(d => d.id === club.dept);
        html += `
        <div class="club-card">
            <div class="club-name">${club.name}</div>
            <div class="club-dept">${dept ? dept.short : ""} — ${club.category}</div>
            <div class="club-desc">${club.desc}</div>
        </div>`;
    });

    grid.innerHTML = html;
}

function openModal(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const club   = clubs.find(c => c.id === event.clubId);
    const dept   = DEPARTMENTS.find(d => d.id === event.dept);
    const banner = BANNER_COLORS[event.dept] || "banner-cs";
    const dateStr = new Date(event.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

    document.getElementById("mHeader").className  = "modal-header " + banner;
    document.getElementById("mDept").textContent  = dept  ? dept.name  : "";
    document.getElementById("mClub").textContent  = club  ? club.name  : "";
    document.getElementById("mBadge").textContent = event.status.charAt(0).toUpperCase() + event.status.slice(1);
    document.getElementById("mBadge").className   = "badge badge-" + event.status;
    document.getElementById("mTitle").textContent = event.title;
    document.getElementById("mDesc").textContent  = event.desc;
    document.getElementById("mDate").textContent  = dateStr;
    document.getElementById("mTime").textContent  = event.time;
    document.getElementById("mVenue").textContent = event.venue;
    document.getElementById("mRsvp").textContent  = event.rsvp + " registered";

    document.getElementById("modal").classList.add("open");
}

function closeModal() {
    document.getElementById("modal").classList.remove("open");
}

function closeModalOnBackground(e) {
    if (e.target === document.getElementById("modal")) {
        closeModal();
    }
}

function doLogin() {
    const dept = document.getElementById("loginDept").value;
    const id   = document.getElementById("loginId").value.trim();
    const pass = document.getElementById("loginPass").value;

    if (!dept) { alert("Please select your department."); return; }

    const creds = COORDINATORS[dept];
    if (!creds || id !== creds.id || pass !== creds.pass) {
        alert("Invalid Coordinator ID or Password.");
        return;
    }

    loggedInDept = dept;

    document.getElementById("loginLink").style.display  = "none";
    document.getElementById("logoutLink").style.display = "inline";

    showPage("dashboard");
    renderDashboard();
}

function doLogout() {
    loggedInDept = null;
    document.getElementById("loginLink").style.display  = "inline";
    document.getElementById("logoutLink").style.display = "none";
    showPage("home");
}

function renderDashboard() {
    const dept = DEPARTMENTS.find(d => d.id === loggedInDept);

    document.getElementById("dashTitle").textContent = dept ? dept.name : "";
    document.getElementById("dashBadge").textContent = dept ? dept.short : "";

    const myClubs   = clubs.filter(c => c.dept === loggedInDept);
    const myEvents  = events.filter(e => e.dept === loggedInDept);
    const totalRsvp = myEvents.reduce((sum, e) => sum + e.rsvp, 0);

    document.getElementById("kClubs").textContent   = myClubs.length;
    document.getElementById("kEvents").textContent  = myEvents.length;
    document.getElementById("kOngoing").textContent = myEvents.filter(e => e.status === "ongoing").length;
    document.getElementById("kUpcoming").textContent= myEvents.filter(e => e.status === "upcoming").length;
    document.getElementById("kRsvp").textContent    = totalRsvp;

    const clubSelect = document.getElementById("nEvClub");
    clubSelect.innerHTML = '<option value="">Select Club</option>';
    myClubs.forEach(c => {
        clubSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
    });

    renderDashClubs(myClubs);
    renderDashEvents(myEvents);
}

function renderDashClubs(myClubs) {
    const list = document.getElementById("dashClubList");
    if (myClubs.length === 0) {
        list.innerHTML = '<p style="color:#9ca3af;padding:16px">No clubs yet.</p>';
        return;
    }
    let html = "";
    myClubs.forEach(club => {
        html += `
        <div class="club-list-item">
            <div>
                <strong>${club.name}</strong> — <span style="color:#9ca3af">${club.category}</span>
                <p style="color:#9ca3af;font-size:13px;margin-top:4px">${club.desc}</p>
            </div>
            <button class="btn-ghost" style="font-size:12px;padding:6px 12px" onclick="deleteClub(${club.id})">Delete</button>
        </div>`;
    });
    list.innerHTML = html;
}

function renderDashEvents(myEvents) {
    const tbody = document.getElementById("dashEventTable");
    if (myEvents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#9ca3af">No events yet.</td></tr>';
        return;
    }
    let html = "";
    myEvents.forEach(event => {
        const club    = clubs.find(c => c.id === event.clubId);
        const dateStr = new Date(event.date + "T00:00:00").toLocaleDateString("en-IN");
        html += `
        <tr>
            <td>${event.title}</td>
            <td>${club ? club.name : "—"}</td>
            <td>${dateStr}</td>
            <td><span class="badge badge-${event.status}">${event.status}</span></td>
            <td>${event.rsvp}</td>
            <td><button class="btn-ghost" style="font-size:12px;padding:6px 12px" onclick="deleteEvent(${event.id})">Delete</button></td>
        </tr>`;
    });
    tbody.innerHTML = html;
}

function switchTab(tab) {
    const isClubs = (tab === "clubs");
    document.getElementById("clubPanel").style.display  = isClubs ? "block" : "none";
    document.getElementById("eventPanel").style.display = isClubs ? "none"  : "block";
    document.getElementById("tabClubs").classList.toggle("active",  isClubs);
    document.getElementById("tabEvents").classList.toggle("active", !isClubs);
}

function createClub() {
    const name = document.getElementById("newClubName").value.trim();
    const cat  = document.getElementById("newClubCat").value;
    const desc = document.getElementById("newClubDesc").value.trim();

    if (!name) { alert("Please enter a club name.");   return; }
    if (!desc)  { alert("Please enter a description."); return; }

    clubs.push({ id: clubs.length + 1, name: name, dept: loggedInDept, category: cat, desc: desc });

    document.getElementById("newClubName").value = "";
    document.getElementById("newClubDesc").value = "";

    showToast("Club created!");
    renderDashboard();
}

function postEvent() {
    const title  = document.getElementById("newEvTitle").value.trim();
    const clubId = parseInt(document.getElementById("nEvClub").value);
    const date   = document.getElementById("newEvDate").value;
    const time   = document.getElementById("newEvTime").value;
    const venue  = document.getElementById("newEvVenue").value.trim();
    const status = document.getElementById("newEvStatus").value;
    const desc   = document.getElementById("newEvDesc").value.trim();

    if (!title) { alert("Please enter an event title."); return; }
    if (!date)  { alert("Please select a date.");        return; }
    if (!venue) { alert("Please enter a venue.");        return; }
    if (!desc)  { alert("Please enter a description.");  return; }

    events.push({
        id: events.length + 1, title: title,
        dept: loggedInDept, clubId: clubId || null,
        date: date, time: time || "10:00 AM",
        venue: venue, status: status, desc: desc, rsvp: 0
    });

    document.getElementById("newEvTitle").value = "";
    document.getElementById("newEvDate").value  = "";
    document.getElementById("newEvVenue").value = "";
    document.getElementById("newEvDesc").value  = "";

    showToast("Event posted!");
    renderDashboard();
}

function deleteClub(clubId) {
    if (!confirm("Delete this club?")) return;
    const i = clubs.findIndex(c => c.id === clubId);
    if (i !== -1) clubs.splice(i, 1);
    showToast("Club deleted.");
    renderDashboard();
}

function deleteEvent(eventId) {
    if (!confirm("Delete this event?")) return;
    const i = events.findIndex(e => e.id === eventId);
    if (i !== -1) events.splice(i, 1);
    showToast("Event deleted.");
    renderDashboard();
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(function() { toast.classList.remove("show"); }, 3000);
}

function init() {
    const deptFilter = document.getElementById("deptFilter");
    const loginDept  = document.getElementById("loginDept");

    DEPARTMENTS.forEach(function(dept) {
        const opt1 = document.createElement("option");
        opt1.value = dept.id;
        opt1.textContent = dept.name;
        deptFilter.appendChild(opt1);

        const opt2 = document.createElement("option");
        opt2.value = dept.id;
        opt2.textContent = dept.name;
        loginDept.appendChild(opt2);
    });

    filterEvents();
    renderClubs();
}

window.onload = init;