import WebSocket from 'ws';

let started = false;

let socket;

function onMessage(message) {
    socket.clients.forEach(client => {
        if (client !== this && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

function send(channel, data) {
    let message = channel + '|' + JSON.stringify(data);

    socket.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

function start(server) {
    if (started) return;
    started = true;

    socket = new WebSocket.Server({
        server: server,
        clientTracking: true,
    });

    socket.on('connection', function (ws, req) {
        ws.on('message', onMessage);
    })
}

export { start, send }