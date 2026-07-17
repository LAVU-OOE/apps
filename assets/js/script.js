// Global Configuration
const API_URL = "https://apps-api.lavu-ooe.workers.dev/";
let apps = [];
let currentLang = "de";

// Vollständige Übersetzungsmatrix für alle Elemente
const translations = {
    de: {
        title: "LAVU OÖ - Anwendungs-Verzeichnis",
        subtitle: "Zentrale Software-Infrastruktur & digitale Logistikwerkzeuge",
        badgeSustainable: "Nachhaltig",
        badgeInnovative: "Innovativ",
        badgeMunicipal: "Kommunal",
        btnInfo: "ℹ️ Info",
        statAsz: "Altstoffsammelzentren (ASZ)",
        statRec: "Jährlich gesammelte Wertstoffe",
        statStaff: "Engagierte Teammitglieder",
        statCirc: "Kreislaufwirtschaft Oberösterreich",
        footerText: 'Erstellt mit <span style="color: #e74c3c;">&hearts;</span> von Karli',
        loading: "Lade Anwendungen...",
        addApp: "App hinzufügen",
        modalTitle: "Neue App hinzufügen",
        labelName: "Name der Anwendung *",
        labelUrl: "Anwendungs-URL (Link) *",
        labelDesc: "Beschreibung",
        labelIcon: "Emoji Icon",
        phName: "z.B. Etiketten-Druckstudio",
        phUrl: "https://example.com",
        phDesc: "Kurze Beschreibung der Funktion...",
        phIcon: "z.B. 🏷️ (Standard: 🚀)",
        btnCancel: "Abbrechen",
        btnSave: "Speichern",
        btnSaving: "Wird gespeichert...",
        errFetch: "Fehler beim Laden des API-Verzeichnisses.",
        errSave: "Fehler beim Speichern der Anwendung."
    },
    en: {
        title: "LAVU OÖ - Application Directory",
        subtitle: "Central software infrastructure & digital logistics tools",
        badgeSustainable: "Sustainable",
        badgeInnovative: "Innovative",
        badgeMunicipal: "Municipal",
        btnInfo: "ℹ️ Info",
        statAsz: "Recycling Centers (ASZ)",
        statRec: "Waste materials collected annually",
        statStaff: "Dedicated team members",
        statCirc: "Circular Economy Upper Austria",
        footerText: 'Built with <span style="color: #e74c3c;">&hearts;</span> by Karli',
        loading: "Loading applications...",
        addApp: "Add Application",
        modalTitle: "Add New Application",
        labelName: "Application Name *",
        labelUrl: "Application URL (Link) *",
        labelDesc: "Description",
        labelIcon: "Emoji Icon",
        phName: "e.g. Label Printing Studio",
        phUrl: "https://example.com",
        phDesc: "Short description...",
        phIcon: "e.g. 🏷️ (Default: 🚀)",
        btnCancel: "Cancel",
        btnSave: "Save",
        btnSaving: "Saving...",
        errFetch: "Error loading the application log from API.",
        errSave: "Could not save the application."
    }
};

// Initialize Dashboard
document.addEventListener("DOMContentLoaded", () => {
    setLanguage(currentLang); // Setzt die Startsprache direkt fehlerfrei
    loadAppsFromAPI();
});

// Fetch Application Array from Worker Endpoint
async function loadAppsFromAPI() {
    try {
        const response = await fetch(API_URL, { method: "GET" });
        if (!response.ok) throw new Error(`HTTP Status ${response.status}`);
        
        apps = await response.json();
        renderApps();
    } catch (error) {
        console.error("API load failed, falling back to basic layout:", error);
        apps = [
            {
                name: "Etiketten-Druckstudio",
                url: "https://lavu-ooe.github.io/Etiketten-Druckstudio/",
                desc: "Studio zur Erstellung und zum Druck von standardisierten Behälter- und Sortieretiketten.",
                icon: "🏷️"
            }
        ];
        renderApps();
    }
}

// Render active items
function renderApps() {
    const grid = document.getElementById("app-grid");
    if (!grid) return;
    grid.innerHTML = "";

    apps.forEach(app => {
        const card = document.createElement("a");
        card.className = "app-card";
        card.href = app.url;
        card.target = "_blank";
        card.innerHTML = `
            <div class="app-icon">${app.icon || "🚀"}</div>
            <h3>${app.name}</h3>
            <p>${app.desc || ""}</p>
        `;
        grid.appendChild(card);
    });

    const addCard = document.createElement("div");
    addCard.className = "app-card add-placeholder-card";
    addCard.innerHTML = `
        <div class="add-card-content">
            <span class="add-icon">➕</span>
            <span class="add-text" id="addPlaceholderText">${translations[currentLang].addApp}</span>
        </div>
    `;
    addCard.addEventListener("click", openModal);
    grid.appendChild(addCard);
}

// Modal Toggle Mechanics
function openModal() {
    document.getElementById("addAppModal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("addAppModal").classList.add("hidden");
    document.getElementById("addAppForm").reset();
}

// Handle Form Execution
async function handleFormSubmit(event) {
    event.preventDefault();
    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = translations[currentLang].btnSaving;
    }

    const appData = {
        name: document.getElementById("appName").value,
        url: document.getElementById("appUrl").value,
        desc: document.getElementById("appDesc").value,
        icon: document.getElementById("appIcon").value.trim() || "🚀"
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(appData)
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const responseData = await response.json().catch(() => null);

        if (Array.isArray(responseData)) {
            apps = responseData;
        } else {
            apps.push(appData);
        }

        renderApps();
        closeModal();
    } catch (error) {
        console.error("Error submitting new application link:", error);
        alert(translations[currentLang].errSave);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = translations[currentLang].btnSave;
        }
    }
}

// Update Local Language Options (Jetzt absolut ausfallsicher)
function setLanguage(lang) {
    currentLang = lang;
    
    // Helfer, um Fehler zu vermeiden, falls IDs im HTML fehlen
    const safeSetText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    };
    const safeSetHtml = (id, html) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    };
    const safeSetPlaceholder = (id, ph) => {
        const el = document.getElementById(id);
        if (el && ph) el.placeholder = ph;
    };

    // Klassen für Buttons umschalten
    const btnDe = document.getElementById("langBtnDe");
    const btnEn = document.getElementById("langBtnEn");
    if (btnDe) btnDe.classList.toggle("active", lang === "de");
    if (btnEn) btnEn.classList.toggle("active", lang === "en");

    // Texte injizieren
    safeSetText("titleText", translations[lang].title);
    safeSetText("subtitleText", translations[lang].subtitle);
    safeSetText("badgeSustainable", translations[lang].badgeSustainable);
    safeSetText("badgeInnovative", translations[lang].badgeInnovative);
    safeSetText("badgeMunicipal", translations[lang].badgeMunicipal);
    safeSetText("btnInfoStats", translations[lang].btnInfo);
    
    // Stats Labels
    safeSetText("lblStatAsz", translations[lang].statAsz);
    safeSetText("lblStatRec", translations[lang].statRec);
    safeSetText("lblStatStaff", translations[lang].statStaff);
    safeSetText("lblStatCirc", translations[lang].statCirc);

    // Modal Form
    safeSetText("modalTitle", translations[lang].modalTitle);
    safeSetText("labelName", translations[lang].labelName);
    safeSetText("labelUrl", translations[lang].labelUrl);
    safeSetText("labelDesc", translations[lang].labelDesc);
    safeSetText("labelIcon", translations[lang].labelIcon);
    safeSetText("btnCancel", translations[lang].btnCancel);
    safeSetText("submitBtn", translations[lang].btnSave);
    
    // Form Placeholders
    safeSetPlaceholder("appName", translations[lang].phName);
    safeSetPlaceholder("appUrl", translations[lang].phUrl);
    safeSetPlaceholder("appDesc", translations[lang].phDesc);
    safeSetPlaceholder("appIcon", translations[lang].phIcon);
    
    // Footer & Loading
    safeSetHtml("footerTextEl", translations[lang].footerText);
    safeSetText("gridLoading", translations[lang].loading);

    renderApps();
}