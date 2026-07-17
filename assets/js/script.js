// Global Configuration
const API_URL = "https://apps-api.lavu-ooe.workers.dev/";
let apps = [];
let currentLang = "de";

// PWA Installation
let deferredPrompt = null;
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

// Dual Language Context Matrix (erweitert um Install-Button-Texte)
const translations = {
    de: {
        title: "Anwendungs-Verzeichnis",
        loading: "Lade Anwendungen...",
        addApp: "App hinzufügen",
        modalTitle: "Neue App hinzufügen",
        labelName: "Name der Anwendung *",
        labelUrl: "Anwendungs-URL (Link) *",
        labelDesc: "Beschreibung",
        labelIcon: "Emoji Icon",
        btnCancel: "Abbrechen",
        btnSave: "Speichern",
        btnSaving: "Wird gespeichert...",
        errFetch: "Fehler beim Laden des API-Verzeichnisses.",
        errSave: "Fehler beim Speichern der Anwendung.",
        installBtnText: "App",
        installBtnOpen: "Als App öffnen…",
        installBtnClose: "Schließen",
        installFallback: "Die App kann über das Browser-Menü oder den Installationsbanner installiert werden."
    },
    en: {
        title: "Application Directory",
        loading: "Loading applications...",
        addApp: "Add Application",
        modalTitle: "Add New Application",
        labelName: "Application Name *",
        labelUrl: "Application URL (Link) *",
        labelDesc: "Description",
        labelIcon: "Emoji Icon",
        btnCancel: "Cancel",
        btnSave: "Save",
        btnSaving: "Saving...",
        errFetch: "Error loading the application log from API.",
        errSave: "Could not save the application.",
        installBtnText: "Install",
        installBtnOpen: "Open as…",
        installBtnClose: "Close",
        installFallback: "You can install this app via the browser menu or the installation banner."
    }
};

// Initialize Dashboard
document.addEventListener("DOMContentLoaded", () => {
    loadAppsFromAPI();
    updateInstallButton(); // initialer Zustand
    registerInstallEvents();
});

// PWA Event-Registrierung
function registerInstallEvents() {
    // beforeinstallprompt abfangen
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        updateInstallButton();
    });

    // App wurde installiert
    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        localStorage.setItem('pwaInstalled', 'true');
        updateInstallButton();
    });

    // Sichtbarkeitsänderung (z.B. Wechsel in den Standalone-Modus)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            updateInstallButton();
        }
    });
}

// Update des Install-Buttons je nach Zustand
function updateInstallButton() {
    const btn = document.getElementById('installAppBtn');
    const icon = document.getElementById('installIcon');
    const text = document.getElementById('installText');
    if (!btn) return;

    // Zustand ermitteln
    const isInstalled = localStorage.getItem('pwaInstalled') === 'true' || isStandalone;
    const isInStandalone = isStandalone || window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

    // 1. Standalone-Modus: "Schließen"
    if (isInStandalone) {
        icon.textContent = '❌';
        text.textContent = translations[currentLang].installBtnClose;
        btn.onclick = () => window.close();
        btn.style.background = '#718096';
        return;
    }

    // 2. Installiert, aber im Browser: "Als App öffnen"
    if (isInstalled) {
        icon.textContent = '📲';
        text.textContent = translations[currentLang].installBtnOpen;
        btn.onclick = openInstalledApp;
        btn.style.background = '#38a169'; // grün
        return;
    }

    // 3. Nicht installiert: "App installieren"
    icon.textContent = '📲';
    text.textContent = translations[currentLang].installBtnText;
    btn.onclick = installApp;
    btn.style.background = '#3182ce';
}

// Installationsdialog auslösen
function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                localStorage.setItem('pwaInstalled', 'true');
                updateInstallButton();
            }
            deferredPrompt = null;
        });
    } else {
        // Fallback: Browser-eigener Installationsmechanismus
        alert(translations[currentLang].installFallback);
    }
}

// Installierte App öffnen (Android Intent)
function openInstalledApp() {
    const url = window.location.href;
    // Intent für Chrome (funktioniert auf Android)
    const intentUrl = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end;`;
    window.location.href = intentUrl;
    // Fallback: nach 2 Sekunden normale URL öffnen (falls Intent fehlschlägt)
    setTimeout(() => {
        window.open(url, '_blank');
    }, 2000);
}

// Fetch Application Array from Worker Endpoint
async function loadAppsFromAPI() {
    const grid = document.getElementById("app-grid");
    try {
        const response = await fetch(API_URL, { method: "GET" });
        if (!response.ok) throw new Error(`HTTP Status ${response.status}`);
        
        apps = await response.json();
        renderApps();
    } catch (error) {
        console.error("API load failed, falling back to basic layout:", error);
        // Fallback array if database is offline or not created yet
        apps = [
            {
                name: "Etiketten-Druckstudio",
                url: "https://lavu-ooe.github.io/Etiketten-Druckstudio/",
                desc: "Studio for creating and printing standardized container and sorting labels.",
                icon: "🏷️"
            }
        ];
        renderApps();
    }
}

// Render active items and appends the dynamic operational placeholder card
function renderApps() {
    const grid = document.getElementById("app-grid");
    if (!grid) return;
    grid.innerHTML = "";

    // 1. Map existing entries to standard card templates
    apps.forEach(app => {
        const card = document.createElement("a");
        card.className = "app-card";
        card.href = app.url;
        card.target = "_blank"; // Open applications in a new tab
        card.innerHTML = `
            <div class="app-icon">${app.icon || "🚀"}</div>
            <h3>${app.name}</h3>
            <p>${app.desc || ""}</p>
        `;
        grid.appendChild(card);
    });

    // 2. Inject the 'Add App' Interactive Box into the next sequential slot
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

// Handle Form Execution and Save Data Dynamically
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.innerText = translations[currentLang].btnSaving;

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

        const contentType = response.headers.get("content-type");
        let responseData = null;
        
        if (contentType && contentType.includes("application/json")) {
            responseData = await response.json();
        } else {
            await response.text(); 
        }

        // Smart state assignment based on API behavior
        if (Array.isArray(responseData)) {
            apps = responseData;
        } else if (responseData && responseData.added) {
            apps.push(responseData.added);
        } else {
            apps.push(appData); // Edge-case local sync fallback
        }

        renderApps();
        closeModal();
    } catch (error) {
        console.error("Error submitting new application link:", error);
        alert(translations[currentLang].errSave);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = translations[currentLang].btnSave;
    }
}

// Update Local Language String Matrix Options
function setLanguage(lang) {
    currentLang = lang;
    
    // Toggle active link visual highlights
    document.getElementById("langBtnDe").classList.toggle("active", lang === "de");
    document.getElementById("langBtnEn").classList.toggle("active", lang === "en");

    // Dynamic document DOM string injection
    document.getElementById("titleText").innerText = translations[lang].title;
    document.getElementById("modalTitle").innerText = translations[lang].modalTitle;
    document.getElementById("labelName").innerText = translations[lang].labelName;
    document.getElementById("labelUrl").innerText = translations[lang].labelUrl;
    document.getElementById("labelDesc").innerText = translations[lang].labelDesc;
    document.getElementById("labelIcon").innerText = translations[lang].labelIcon;
    document.getElementById("btnCancel").innerText = translations[lang].btnCancel;
    document.getElementById("submitBtn").innerText = translations[lang].btnSave;
    
    const loadingEl = document.getElementById("gridLoading");
    if (loadingEl) loadingEl.innerText = translations[lang].loading;

    // Update Add-Button-Text im Grid
    const addText = document.getElementById("addPlaceholderText");
    if (addText) addText.innerText = translations[lang].addApp;

    // Update Install-Button
    updateInstallButton();

    // Refresh display layout text layers
    renderApps();
}