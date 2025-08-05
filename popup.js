document.addEventListener('DOMContentLoaded', () => {
    // --- Constantes ---
    const langCycle = ['auto', 'es', 'en'];
    const pauseIcon = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    const resumeIcon = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';

    // --- Variables de estado ---
    let currentLang = 'auto';
    let customMessages = null;

    // --- Elementos UI ---
    const langToggleBtn = document.getElementById('lang-toggle-btn');
    const startButton = document.getElementById('start-share');
    const stopButton = document.getElementById('stop-share');
    const pauseButton = document.getElementById('pause-share-btn');
    const presentBtn = document.getElementById('present-btn');
    const connectViewerBtn = document.getElementById('connect-viewer-btn');
    const disconnectViewerBtn = document.getElementById('disconnect-viewer-btn');
    const resolutionSelector = document.getElementById('resolution-selector');
    const defaultControls = document.getElementById('default-controls');
    const viewerModeControls = document.getElementById('viewer-mode-controls');
    const viewingSessionIdDisplay = document.getElementById('viewing-session-id');
    const shareControls = document.getElementById('share-controls');
    const sessionActiveControls = document.getElementById('session-active-controls');
    const joinSection = document.getElementById('join-section');
    const peerIdDisplay = document.getElementById('peer-id-display');
    const copyIdBtn = document.getElementById('copy-id-btn');
    const qrCodeContainer = document.getElementById('qr-code-container');
    const maxViewersSlider = document.getElementById('max-viewers-slider');
    const maxViewersValue = document.getElementById('max-viewers-value');
    const viewerCountDisplay = document.getElementById('viewer-count-display');
    const remoteIdInput = document.getElementById('remote-id-input');
    const roomNameInput = document.getElementById('room-name-input');

    // --- Lógica de Internacionalización (i18n) ---
    function getMsg(key, substitutions) {
        if (customMessages && customMessages[key]) {
            return customMessages[key].message;
        }
        return chrome.i18n.getMessage(key, substitutions);
    }

    function setLocaleStrings() {
        document.querySelectorAll('[data-i18n]').forEach(elem => {
            elem.textContent = getMsg(elem.getAttribute('data-i18n'));
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
            elem.placeholder = getMsg(elem.getAttribute('data-i18n-placeholder'));
        });
        document.querySelectorAll('[data-i18n-title]').forEach(elem => {
            elem.title = getMsg(elem.getAttribute('data-i18n-title'));
        });
        document.title = getMsg('appName');
    }

    function updateLangButton() {
        let content = '';
        if (currentLang === 'auto') {
            const iconUrl = chrome.runtime.getURL('icons/auto.png');
            content = `<img src="${iconUrl}" alt="Auto icon"> <span>${getMsg('lang_auto')}</span>`;
        } else if (currentLang === 'es') {
            const flagUrl = chrome.runtime.getURL('icons/es.png');
            content = `<img src="${flagUrl}" alt="ES flag"> <span>${getMsg('lang_es')}</span>`;
        } else if (currentLang === 'en') {
            const flagUrl = chrome.runtime.getURL('icons/gb.png');
            content = `<img src="${flagUrl}" alt="GB flag"> <span>${getMsg('lang_en')}</span>`;
        }
        langToggleBtn.innerHTML = content;
    }

    langToggleBtn.addEventListener('click', () => {
        const currentIndex = langCycle.indexOf(currentLang);
        const nextIndex = (currentIndex + 1) % langCycle.length;
        const newLang = langCycle[nextIndex];
        chrome.storage.local.set({ userLanguage: newLang }, () => {
            window.location.reload();
        });
    });

    // --- Lógica de generación de código ---
    const generateShortCode = () => {
        return Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
               Math.random().toString(36).substring(2, 6).toUpperCase();
    };

    // --- Lógica de ajustes ---
    const loadSettings = async () => {
        const { maxViewers = 10, roomName = '' } = await chrome.storage.local.get(['maxViewers', 'roomName']);
        maxViewersSlider.value = maxViewers;
        maxViewersValue.textContent = maxViewers;
        roomNameInput.value = roomName;
        startButton.disabled = !roomNameInput.value.trim();
    };

    const saveSettings = () => {
        const maxViewers = parseInt(maxViewersSlider.value, 10);
        const roomName = roomNameInput.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        chrome.storage.local.set({ maxViewers, roomName });
    };

    maxViewersSlider.addEventListener('input', () => { maxViewersValue.textContent = maxViewersSlider.value; });
    maxViewersSlider.addEventListener('change', saveSettings);
    roomNameInput.addEventListener('change', saveSettings);

    // --- Lógica de UI ---
    const showViewerUI = (sessionId) => {
        defaultControls.classList.add('hidden');
        viewerModeControls.classList.remove('hidden');
        viewingSessionIdDisplay.textContent = sessionId;
    };

    const showDefaultUI = () => {
        defaultControls.classList.remove('hidden');
        viewerModeControls.classList.add('hidden');
    };

    const updateSharingUI = (session) => {
        const { isSharing, peerId, viewerCount, maxViewers, isPaused } = session;
        shareControls.classList.toggle('hidden', isSharing);
        sessionActiveControls.classList.toggle('hidden', !isSharing);
        joinSection.classList.toggle('hidden', isSharing);

        qrCodeContainer.classList.add('hidden');
        qrCodeContainer.innerHTML = '';

        if (isSharing) {
            peerIdDisplay.textContent = peerId;
            viewerCountDisplay.textContent = `${viewerCount} / ${maxViewers}`;

            if (isPaused) {
                pauseButton.innerHTML = `${resumeIcon} ${getMsg('resumeButton')}`;
                pauseButton.classList.add('resume');
            } else {
                pauseButton.innerHTML = `${pauseIcon} ${getMsg('pauseButton')}`;
                pauseButton.classList.remove('resume');
            }

            const viewerUrl = chrome.runtime.getURL('viewer.html') + '?id=' + encodeURIComponent(peerId);
            new QRCode(qrCodeContainer, {
                text: viewerUrl, width: 160, height: 160,
                colorDark: "#000000", colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
            qrCodeContainer.classList.remove('hidden');
        }
    };

    // --- Lógica de activación/desactivación de botones ---
    roomNameInput.addEventListener('input', () => {
        startButton.disabled = !roomNameInput.value.trim();
    });

    remoteIdInput.addEventListener('input', () => {
        connectViewerBtn.disabled = !remoteIdInput.value.trim();
    });

    // --- Lógica de eventos ---
    startButton.addEventListener('click', () => {
        const roomName = roomNameInput.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        const shortCode = generateShortCode();
        const fullPeerId = `${roomName}-${shortCode}`;
        const maxViewers = parseInt(maxViewersSlider.value, 10);
        const resolution = resolutionSelector.value;
        chrome.runtime.sendMessage({ type: 'START_SHARE', peerId: fullPeerId, maxViewers, resolution });
    });

    pauseButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'REQUEST_TOGGLE_PAUSE' });
    });

    stopButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'STOP_SHARE' });
    });

    presentBtn.addEventListener('click', () => {
        const peerId = peerIdDisplay.textContent;
        if (!peerId) return;
        const presenterUrl = chrome.runtime.getURL('presenter.html') + '?id=' + encodeURIComponent(peerId);
        chrome.tabs.create({ url: presenterUrl });
    });

    connectViewerBtn.addEventListener('click', () => {
        const remoteId = remoteIdInput.value.trim();
        const viewerUrl = chrome.runtime.getURL('viewer.html') + '?id=' + encodeURIComponent(remoteId);
        chrome.tabs.create({ url: viewerUrl });
        window.close();
    });

    disconnectViewerBtn.addEventListener('click', () => {
        chrome.storage.local.get('viewingSessionId', ({ viewingSessionId }) => {
            if (!viewingSessionId) return;
            const viewerUrlPattern = chrome.runtime.getURL('viewer.html') + '*';
            chrome.tabs.query({ url: viewerUrlPattern }, (tabs) => {
                const targetTab = tabs.find(tab => tab.url.includes(viewingSessionId));
                if (targetTab) chrome.tabs.remove(targetTab.id);
                chrome.storage.local.remove('viewingSessionId');
                showDefaultUI();
            });
        });
    });

    copyIdBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(peerIdDisplay.textContent).then(() => {
            const originalIcon = copyIdBtn.innerHTML;
            copyIdBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" style="color: green;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>';
            setTimeout(() => { copyIdBtn.innerHTML = originalIcon; }, 1500);
        });
    });

    // --- Inicialización ---
    const initialize = async () => {
        const { userLanguage = 'auto' } = await chrome.storage.local.get('userLanguage');
        currentLang = userLanguage;

        if (currentLang !== 'auto') {
            try {
                const response = await fetch(`/_locales/${currentLang}/messages.json`);
                if (response.ok) {
                    customMessages = await response.json();
                } else {
                    console.error(`Could not load language file for: ${currentLang}`);
                }
            } catch (error) {
                console.error(`Error fetching language file:`, error);
            }
        }

        setLocaleStrings();
        updateLangButton();

        await loadSettings();

        resolutionSelector.value = 'native';
        startButton.disabled = !roomNameInput.value.trim();
        connectViewerBtn.disabled = true;

        chrome.storage.local.get(['viewingSessionId', 'session'], ({ viewingSessionId, session }) => {
            if (viewingSessionId) {
                showViewerUI(viewingSessionId);
            } else {
                showDefaultUI();
                if (session && session.isSharing) {
                    updateSharingUI(session);
                } else {
                     chrome.runtime.sendMessage({ type: 'GET_SESSION_STATUS' }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.log(chrome.runtime.lastError.message);
                            updateSharingUI({ isSharing: false });
                        } else if (response) {
                            updateSharingUI(response);
                        }
                    });
                }
            }
        });
    };

    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'SESSION_UPDATE') {
            updateSharingUI(message.session);
        } else if (message.type === 'SESSION_ENDED') {
            showDefaultUI();
            updateSharingUI({ isSharing: false });
        }
    });

    initialize();
});
