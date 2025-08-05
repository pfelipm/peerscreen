document.addEventListener('DOMContentLoaded', () => {
    const qrCodeContainer = document.getElementById('qr-code');
    const sessionIdDisplay = document.getElementById('session-id-display');

    // --- Lógica de Internacionalización (i18n) ---
    const setLocaleStrings = () => {
        document.title = chrome.i18n.getMessage('presenterTitle');
        document.querySelectorAll('[data-i18n]').forEach(elem => {
            const key = elem.getAttribute('data-i18n');
            const message = chrome.i18n.getMessage(key);
            // Solo reemplazar si el mensaje existe, para no borrar el ID de sesión
            if (message) {
                elem.textContent = message;
            }
        });
    };

    setLocaleStrings();

    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('id');

    if (!sessionId) {
        sessionIdDisplay.textContent = chrome.i18n.getMessage('errorNoIdFound');
        return;
    }

    sessionIdDisplay.textContent = sessionId;
    // Quitamos el atributo para que no se sobrescriba el ID en futuras llamadas
    sessionIdDisplay.removeAttribute('data-i18n');

    const viewerUrl = chrome.runtime.getURL('viewer.html') + '?id=' + encodeURIComponent(sessionId);

    new QRCode(qrCodeContainer, {
        text: viewerUrl,
        width: 256,
        height: 256,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
});
