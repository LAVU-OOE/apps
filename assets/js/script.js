// ... (Globale Konfigurationen bleiben gleich)
const API_URL = "https://apps-api.lavu-ooe.workers.dev/";

// Funktion zum Absenden des Formulars (Aktualisiert für alle neuen Felder)
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Wird gespeichert...";
    }

    // Daten aus den neuen Feldern sammeln
    const appData = {
        nameDe: document.getElementById("appNameDe")?.value || "",
        nameEn: document.getElementById("appNameEn")?.value || "",
        url: document.getElementById("appUrl")?.value || "",
        descDe: document.getElementById("appDescDe")?.value || "",
        descEn: document.getElementById("appDescEn")?.value || "",
        icon: document.getElementById("appIcon")?.value?.trim() || "🚀",
        password: document.getElementById("adminPassword")?.value || "" // Passwort für den Worker
    };

    // Validierung: Name (DE oder EN) und URL müssen vorhanden sein
    if ((!appData.nameDe && !appData.nameEn) || !appData.url) {
        alert("Bitte fülle alle Pflichtfelder (Name und URL) aus.");
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = "Speichern";
        }
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(appData)
        });

        if (!response.ok) throw new Error("Netzwerkfehler");

        closeModal();
        location.reload(); // Seite neu laden für die Aktualisierung
    } catch (error) {
        console.error("Fehler:", error);
        alert("Fehler beim Speichern. Passwort korrekt?");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = "Speichern";
        }
    }
}