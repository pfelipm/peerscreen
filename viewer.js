document.addEventListener('DOMContentLoaded', () => {
    // --- Variables de estado ---
    let customMessages = null;

    // --- Elementos UI ---
    const statusMessage = document.getElementById('status-message');
    const remoteVideo = document.getElementById('remote-video');
    const pauseOverlay = document.getElementById('pause-overlay');
    const videoContainer = document.getElementById('video-container');

    // --- Lógica de Internacionalización (i18n) ---
    function getMsg(key, substitutions) {
        if (customMessages && customMessages[key]) {
            return customMessages[key].message;
        }
        return chrome.i18n.getMessage(key, substitutions);
    }

    async function applyTranslations() {
        const { userLanguage = 'auto' } = await chrome.storage.local.get('userLanguage');

        customMessages = null;
        if (userLanguage !== 'auto') {
            try {
                const response = await fetch(`/_locales/${userLanguage}/messages.json`);
                if (response.ok) {
                    customMessages = await response.json();
                }
            } catch (error) {
                console.error(`Error fetching language file:`, error);
            }
        }

        document.title = getMsg('viewerTitle');
        document.querySelectorAll('[data-i18n]').forEach(elem => {
            const key = elem.getAttribute('data-i18n');
            if (key) {
                elem.textContent = getMsg(key);
            }
        });
    }

    // --- Lógica principal de la página del visor ---
    function startViewerLogic() {
        const urlParams = new URLSearchParams(window.location.search);
        const remotePeerId = urlParams.get('id');

        if (!remotePeerId) {
            statusMessage.textContent = getMsg('errorNoSessionId');
            return;
        }

        videoContainer.classList.add('hidden');
        statusMessage.textContent = `${getMsg('viewerConnectingTo')} ${remotePeerId}`;

        const peer = new Peer({
            host: '0.peerjs.com', port: 443, path: '/', secure: true, debug: 2
        });

        const cleanup = () => {
            chrome.storage.local.remove('viewingSessionId');
        };

        peer.on('connection', (dataConnection) => {
            dataConnection.on('data', (data) => {
                try {
                    const parsedData = JSON.parse(data);
                    if (parsedData.type === 'rejected' && parsedData.reason === 'session_full') {
                        statusMessage.textContent = getMsg('errorSessionFull');
                        peer.destroy();
                    } else if (parsedData.type === 'stream-status') {
                        pauseOverlay.classList.toggle('hidden', !parsedData.isPaused);
                    }
                } catch (e) {
                    console.error("Error al procesar datos:", e);
                }
            });
        });

        peer.on('open', (id) => {
            const dummyCanvas = document.createElement('canvas');
            dummyCanvas.width = 1;
            dummyCanvas.height = 1;
            const dummyStream = dummyCanvas.captureStream();
            const call = peer.call(remotePeerId, dummyStream);

            if (call) {
                call.on('stream', (stream) => {
                    chrome.storage.local.set({ viewingSessionId: remotePeerId });
                    statusMessage.classList.add('hidden');
                    videoContainer.classList.remove('hidden');
                    remoteVideo.srcObject = stream;
                });

                call.on('close', () => {
                    cleanup();
                    if (!statusMessage.textContent.includes(getMsg('errorSessionFull'))) {
                        document.body.innerHTML = `<h1>${getMsg('sessionEnded')}</h1>`;
                    }
                });

                call.on('error', (err) => {
                    cleanup();
                    statusMessage.textContent = getMsg('errorConnectionFailed');
                });
            } else {
                statusMessage.textContent = getMsg('errorCallFailed');
            }
        });

        peer.on('error', (err) => {
            cleanup();
            statusMessage.textContent = `${getMsg('errorConnectionGeneric')} ${err.type}`;
        });

        window.addEventListener('beforeunload', cleanup);
    }

    // --- Función de Inicialización y Oyente de Cambios ---
    const initialize = async () => {
        await applyTranslations();
        startViewerLogic();
    };

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.userLanguage) {
            applyTranslations();
        }
    });

    initialize();
});
