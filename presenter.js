document.addEventListener('DOMContentLoaded', () => {
    // --- Variables de estado ---
    let customMessages = null;

    // --- Elementos UI ---
    const qrCodeContainer = document.getElementById('qr-code');
    const sessionIdDisplay = document.getElementById('session-id-display');

    // --- Lógica de Internacionalización (i18n) ---
    function getMsg(key, substitutions) {
        if (customMessages && customMessages[key]) {
            return customMessages[key].message;
        }
        return chrome.i18n.getMessage(key, substitutions);
    }

    function setLocaleStrings() {
        document.title = getMsg('presenterTitle');
        document.querySelectorAll('[data-i18n]').forEach(elem => {
            const key = elem.getAttribute('data-i18n');
            // Solo reemplazar si el mensaje existe, para no borrar el ID de sesión
            if (key && getMsg(key)) {
                elem.textContent = getMsg(key);
            }
        });
    }

    // --- Lógica principal de la página del presentador ---
    function startPresenterLogic() {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('id');

        if (!sessionId) {
            sessionIdDisplay.textContent = getMsg('errorNoIdFound');
            return;
        }

        // Quitamos el atributo i18n para que no se sobrescriba el ID
        sessionIdDisplay.removeAttribute('data-i18n');
        sessionIdDisplay.textContent = sessionId;

        const viewerUrl = chrome.runtime.getURL('viewer.html') + '?id=' + encodeURIComponent(sessionId);

        new QRCode(qrCodeContainer, {
            text: viewerUrl,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    // --- Función de Inicialización ---
    const initialize = async () => {
        // 1. Comprobar si el usuario ha forzado un idioma
        const { userLanguage = 'auto' } = await chrome.storage.local.get('userLanguage');

        // 2. Si ha forzado uno, cargar el archivo JSON correspondiente
        if (userLanguage !== 'auto') {
            try {
                const response = await fetch(`/_locales/${userLanguage}/messages.json`);
                if (response.ok) {
                    customMessages = await response.json();
                } else {
                    console.error(`Could not load language file for: ${userLanguage}`);
                }
            } catch (error) {
                console.error(`Error fetching language file:`, error);
            }
        }

        // 3. Aplicar los textos a la página
        setLocaleStrings();
        // 4. Iniciar la lógica principal de la página
        startPresenterLogic();
    };

    initialize();
});
