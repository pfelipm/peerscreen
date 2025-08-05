let peer;
let localStream;
let maxViewers = 10;
let isPaused = false;
const connections = new Map();

function updateViewerCount() {
    chrome.runtime.sendMessage({ type: 'VIEWER_COUNT_UPDATE', count: connections.size });
}

function broadcastToViewers(data) {
    const message = JSON.stringify(data);
    for (const conn of connections.values()) {
        if (conn.dataConnection && conn.dataConnection.open) {
            conn.dataConnection.send(message);
        }
    }
}

function togglePause() {
    isPaused = !isPaused;
    localStream.getVideoTracks().forEach(track => {
        track.enabled = !isPaused;
    });
    console.log(`Stream ${isPaused ? 'paused' : 'resumed'}`);

    chrome.runtime.sendMessage({ type: 'PAUSE_STATE_UPDATE', isPaused });
    broadcastToViewers({ type: 'stream-status', isPaused });
}

chrome.runtime.onMessage.addListener(handleMessages);

async function handleMessages(message) {
    if (message.type === 'START_PEER_CONNECTION') {
        if (peer && peer.open) return;

        maxViewers = message.maxViewers || 10;
        const peerId = message.peerId;
        const resolution = message.resolution || 'native';

        if (!peerId) {
            console.error("No se proporcionó un ID de sesión para iniciar.");
            return;
        }

        try {
            const videoConstraints = { cursor: "always" };
            if (resolution !== 'native') {
                videoConstraints.height = parseInt(resolution, 10);
            }

            localStream = await navigator.mediaDevices.getDisplayMedia({
                video: videoConstraints,
                audio: true
            });

            localStream.getVideoTracks()[0].onended = () => { chrome.runtime.sendMessage({ type: 'STOP_SHARE' }); };

            peer = new Peer(peerId, {
                host: '0.peerjs.com', port: 443, path: '/', secure: true, debug: 2
            });

            peer.on('open', (id) => {
                console.log('Offscreen PeerJS inicializado. ID confirmado:', id);
                chrome.runtime.sendMessage({ type: 'SESSION_STARTED', peerId: id, maxViewers: maxViewers });
            });

            peer.on('call', (call) => {
                if (connections.size >= maxViewers) {
                    const tempConn = peer.connect(call.peer);
                    tempConn.on('open', () => {
                        tempConn.send(JSON.stringify({ type: 'rejected', reason: 'session_full' }));
                        setTimeout(() => { tempConn.close(); call.close(); }, 500);
                    });
                    return;
                }

                call.answer(localStream);

                const dataConnection = peer.connect(call.peer);
                dataConnection.on('open', () => {
                    connections.set(call.peer, { call, dataConnection });
                    updateViewerCount();
                    dataConnection.send(JSON.stringify({ type: 'stream-status', isPaused }));
                });

                call.on('close', () => {
                    connections.delete(call.peer);
                    updateViewerCount();
                });

                call.on('error', (err) => {
                    connections.delete(call.peer);
                    updateViewerCount();
                });
            });

            peer.on('error', (err) => {
                console.error('Error de PeerJS:', err);
                chrome.runtime.sendMessage({ type: 'STOP_SHARE' });
            });

        } catch (err) {
            console.error('Error al obtener stream:', err);
            chrome.runtime.sendMessage({ type: 'STOP_SHARE' });
        }
    } else if (message.type === 'EXECUTE_TOGGLE_PAUSE') {
        if (localStream) {
            togglePause();
        }
    }
}
