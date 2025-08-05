document.addEventListener('DOMContentLoaded', () => {
    const statusMessage = document.getElementById('status-message');
    const remoteVideo = document.getElementById('remote-video');
    const pauseOverlay = document.getElementById('pause-overlay');
    const videoContainer = document.getElementById('video-container');

    // --- Lógica de Internacionalización (i18n) ---
    const setLocaleStrings = () => {
        document.title = chrome.i18n.getMessage('viewerTitle');
        document.querySelectorAll('[data-i18n]').forEach(elem => {
            elem.textContent = chrome.i18n.getMessage(elem.getAttribute('data-i18n'));
        });
    };

    setLocaleStrings();

    const urlParams = new URLSearchParams(window.location.search);
    const remotePeerId = urlParams.get('id');

    if (!remotePeerId) {
        statusMessage.textContent = chrome.i18n.getMessage('errorNoSessionId');
        return;
    }

    videoContainer.classList.add('hidden');
    statusMessage.textContent = `${chrome.i18n.getMessage('viewerConnectingTo')} ${remotePeerId}`;

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
                    statusMessage.textContent = chrome.i18n.getMessage('errorSessionFull');
                    peer.destroy();
                } else if (parsedData.type === 'stream-status') {
                    console.log('Pause state received:', parsedData.isPaused);
                    pauseOverlay.classList.toggle('hidden', !parsedData.isPaused);
                }
            } catch (e) {
                console.error("Error al procesar datos:", e);
            }
        });
    });

    peer.on('open', (id) => {
        console.log('Visor de PeerJS inicializado. Mi ID es:', id);

        const dummyCanvas = document.createElement('canvas');
        dummyCanvas.width = 1;
        dummyCanvas.height = 1;
        const dummyStream = dummyCanvas.captureStream();

        const call = peer.call(remotePeerId, dummyStream);

        if (call) {
            call.on('stream', (stream) => {
                console.log('Stream remoto recibido.');
                chrome.storage.local.set({ viewingSessionId: remotePeerId });
                statusMessage.classList.add('hidden');
                videoContainer.classList.remove('hidden');
                remoteVideo.srcObject = stream;
            });

            call.on('close', () => {
                console.log('La llamada ha terminado.');
                cleanup();
                if (!statusMessage.textContent.includes(chrome.i18n.getMessage('errorSessionFull'))) {
                    document.body.innerHTML = `<h1>${chrome.i18n.getMessage('sessionEnded')}</h1>`;
                }
            });

            call.on('error', (err) => {
                console.error('Error en la llamada:', err);
                cleanup();
                statusMessage.textContent = chrome.i18n.getMessage('errorConnectionFailed');
            });
        } else {
            statusMessage.textContent = chrome.i18n.getMessage('errorCallFailed');
        }
    });

    peer.on('error', (err) => {
        console.error('Error de PeerJS en el visor:', err);
        cleanup();
        statusMessage.textContent = `${chrome.i18n.getMessage('errorConnectionGeneric')} ${err.type}`;
    });

    window.addEventListener('beforeunload', cleanup);
});
