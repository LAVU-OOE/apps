// Global Configuration
const API_URL = "https://apps-api.lavu-ooe.workers.dev/";
let apps = [];
let currentLang = "de";

// Dual Language Context Matrix
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
        labelNameDe: "Name der Anwendung (DE) *",
        labelNameEn: "Name der Anwendung (EN) *",
        labelUrl: "Anwendungs-URL (Link) *",
        labelDescDe: "Beschreibung (DE)",
        labelDescEn: "Beschreibung (EN)",
        labelIcon: "Emoji Icon",
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
        labelNameDe: "Application Name (DE) *",
        labelNameEn: "Application Name (EN) *",
        labelUrl: "Application URL (Link) *",
        labelDescDe: "Description (DE)",
        labelDescEn: "Description (EN)",
        labelIcon: "Emoji Icon",
        btnCancel: "Cancel",
        btnSave: "Save",
        btnSaving: "Saving...",
        errFetch: "Error loading the application log from API.",
        errSave: "Could not save the application."
    }
};

// Initialize Dashboard
document.addEventListener("DOMContentLoaded", () => {
    setLanguage(currentLang);
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
        // Fallback-Array nutzt nun die neue, übersetzbare Struktur
        apps = [
            {
                name_de: "Etiketten-Druckstudio",
                name_en: "Label Printing Studio",
                url: "https://lavu-ooe.github.io/Etiketten-Druckstudio/",
                desc_de: "Studio zur Erstellung und zum Druck von standardisierten Behälter- und Sortieretiketten.",
                desc_en: "Studio for creating and printing standardized container and sorting labels.",
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
        
        // Dynamische Sprachauswahl mit Fallback auf flache alte Felder (falls in der API noch alte Daten liegen)
        const activeName = app[`name_${currentLang}`] || app.name || "App";
        const activeDesc = app[`desc_${currentLang}`] || app.desc || "";

        card.innerHTML = `
            <div class="app-icon">${app.icon || "🚀"}</div>
            <h3>${activeName}</h3>
            <p>${activeDesc}</p>
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

function openModal() {
    document.getElementById("addAppModal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("addAppModal").classList.add("hidden");
    document.getElementById("addAppForm").reset();
}

// Handle Form Execution and Save Data Dynamically
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = translations[currentLang].btnSaving;
    }

    // Erfasst die Werte aus den getrennten Sprachfeldern
    const appData = {
        name_de: document.getElementById("appNameDe").value,
        name_en: document.getElementById("appNameEn").value,
        url: document.getElementById("appUrl").value,
        desc_de: document.getElementById("appDescDe").value,
        desc_en: document.getElementById("appDescEn").value,
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
        } else if (responseData && responseData.added) {
            apps.push(responseData.added);
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

// Update Local Language String Matrix Options
function setLanguage(lang) {
    currentLang = lang;
    
    const safeSetText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    };
    const safeSetHtml = (id, html) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    };

    const btnDe = document.getElementById("langBtnDe");
    const btnEn = document.getElementById("langBtnEn");
    if (btnDe) btnDe.classList.toggle("active", lang === "de");
    if (btnEn) btnEn.classList.toggle("active", lang === "en");

    // UI Elemente anpassen
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

    // Modal Form Labels
    safeSetText("modalTitle", translations[lang].modalTitle);
    safeSetText("labelNameDe", translations[lang].labelNameDe);
    safeSetText("labelNameEn", translations[lang].labelNameEn);
    safeSetText("labelUrl", translations[lang].labelUrl);
    safeSetText("labelDescDe", translations[lang].labelDescDe);
    safeSetText("labelDescEn", translations[lang].labelDescEn);
    safeSetText("labelIcon", translations[lang].labelIcon);
    safeSetText("btnCancel", translations[lang].btnCancel);
    safeSetText("submitBtn", translations[lang].btnSave);
    
    safeSetHtml("footerTextEl", translations[lang].footerText);
    safeSetText("gridLoading", translations[lang].loading);

    renderApps();
}