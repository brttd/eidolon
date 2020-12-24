import WebSocket from 'ws';

let started = false;

let socket;

let listeners = {};

function emitMessage(channel, data) {
    if (!Array.isArray(listeners[channel])) return;

    for (let i = 0; i < listeners[channel].length; i++) {
        listeners[channel][i](data);
    }
}

function onMessage(message) {
    socket.clients.forEach(client => {
        if (client !== this && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });

    try {
        message = message.split('|');

        if (message.length === 1) {
            throw new Error('Message did not contain both channel and data');
        }

        message[1] = JSON.parse(message[1]);

        emitMessage(message[0], message[1]);
    } catch (err) {
        console.error('SOCKET: Message error', err);

        return;
    }
}

function send(channel, data) {
    let message = channel + '|' + JSON.stringify(data);

    socket.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

function sendTo(client, channel, data) {
    let message = channel + '|' + JSON.stringify(data);

    if (client.readyState === WebSocket.OPEN) {
        client.send(message);
    }
}

function on(channel, listener) {
    if (!Array.isArray(listeners[channel])) {
        listeners[channel] = [];
    }

    listeners[channel].push(listener);
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

        /*
        sendTo(ws, 'frame-message', {
            text: 'Connected',
            description: req.connection.remoteAddress
        });
        */
    })
}

export { start, send,  on }