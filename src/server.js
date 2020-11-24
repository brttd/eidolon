import sirv from 'sirv';
import polka from 'polka';
import WebSocket from 'ws';
import compression from 'compression';
import * as sapper from '@sapper/server';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

let server = polka() // You can also use Express
	.use(
		compression({ threshold: 0 }),
		sirv('static', { dev }),
		sapper.middleware()
	)
	.listen(PORT, err => {
		if (err) console.log('error', err);
	});

const wss = new WebSocket.Server({
	server: server.server,
	clientTracking: true,
});

wss.on('connection', function (ws) {
	ws.on('message', function (message) {
		wss.clients.forEach(client => {
			if (client !== ws && client.readyState === WebSocket.OPEN) {
				client.send(message);
			}
		});
	});
})