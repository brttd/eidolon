import WebSocket from 'ws';

let started = false;

let socket;

let listeners = {};

let loudChannels = [];

function emitMessage(channel, data, source) {
    if (!Array.isArray(listeners[channel])) return;

    for (let i = 0; i < listeners[channel].length; i++) {
        listeners[channel][i](data, source);
    }
}

function onMessage(message) {
    try {
        message = message.split('|');

        if (message.length === 1) {
            throw new Error('Message did not contain both channel and data');
        }

        if (loudChannels.includes(message[0])) {
            socket.clients.forEach(client => {
                if (client !== this && client.readyState === WebSocket.OPEN) {
                    client.send(message[0] + '|' + message[1]);
                }
            });
        }

        message[1] = JSON.parse(message[1]);

        emitMessage(message[0], message[1], this.publicObject);
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

function loud(channel) {
    if (!loudChannels.includes(channel)) {
        loudChannels.push(channel);
    }

    return;
}

function start(server) {
    if (started) return;
    started = true;

    socket = new WebSocket.Server({
        server: server,
        clientTracking: true,
    });

    socket.on('connection', function (ws, req) {
        ws.publicObject = {
            send: sendTo.bind(ws, ws)
        };

        ws.on('message', onMessage);

        /*
        sendTo(ws, 'frame-message', {
            text: 'Connected',
            description: req.connection.remoteAddress
        });
        */
    })
}

export { start, send,  on, loud }