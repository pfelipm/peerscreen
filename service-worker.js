const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html';
let creating;

async function setupOffscreenDocument(path) {
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [chrome.runtime.getURL(path)]
    });
    if (existingContexts.length > 0) return;
    if (creating) {
        await creating;
    } else {
        creating = chrome.offscreen.createDocument({
            url: path,
            reasons: ['WEB_RTC'],
            justification: 'Necesario para la negociación de WebRTC y el streaming de pantalla.',
        });
        await creating;
        creating = null;
    }
}

async function closeOffscreenDocument() {
    if (!(await chrome.runtime.getContexts({contextTypes: ['OFFSCREEN_DOCUMENT']})).length) {
        return;
    }
    await chrome.offscreen.closeDocument();
}

// Función para actualizar el estado de la sesión y notificar a los clientes
async function updateSession(newSessionData) {
    const { session } = await chrome.storage.local.get('session');
    if (session && session.isSharing) {
        const updatedSession = { ...session, ...newSessionData };
        await chrome.storage.local.set({ session: updatedSession });
        chrome.runtime.sendMessage({ type: 'SESSION_UPDATE', session: updatedSession });
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'START_SHARE') {
        (async () => {
            await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);
            // CORRECCIÓN: Asegurarse de pasar el parámetro 'resolution'
            chrome.runtime.sendMessage({
                type: 'START_PEER_CONNECTION',
                peerId: message.peerId,
                maxViewers: message.maxViewers,
                resolution: message.resolution // Este parámetro ahora se pasa correctamente
            });
        })();
        return true;
    }

    if (message.type === 'STOP_SHARE') {
        (async () => {
            await closeOffscreenDocument();
            await chrome.storage.local.remove('session');
            chrome.runtime.sendMessage({ type: 'SESSION_ENDED' });
        })();
        return true;
    }

    if (message.type === 'REQUEST_TOGGLE_PAUSE') {
        chrome.runtime.sendMessage({ type: 'EXECUTE_TOGGLE_PAUSE' });
        return true;
    }

    if (message.type === 'SESSION_STARTED') {
        (async () => {
            const session = {
                isSharing: true,
                peerId: message.peerId,
                viewerCount: 0,
                maxViewers: message.maxViewers,
                isPaused: false
            };
            await chrome.storage.local.set({ session });
            chrome.runtime.sendMessage({ type: 'SESSION_UPDATE', session });

            const presenterUrl = chrome.runtime.getURL('presenter.html') + '?id=' + encodeURIComponent(message.peerId);
            chrome.tabs.create({ url: presenterUrl });
        })();
    }

    if (message.type === 'VIEWER_COUNT_UPDATE') {
        updateSession({ viewerCount: message.count });
    }

    if (message.type === 'PAUSE_STATE_UPDATE') {
        updateSession({ isPaused: message.isPaused });
    }

    if (message.type === 'GET_SESSION_STATUS') {
        (async () => {
            const { session } = await chrome.storage.local.get('session');
            sendResponse(session || { isSharing: false });
        })();
        return true;
    }
});
