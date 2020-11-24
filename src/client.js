import * as sapper from '@sapper/app';

sapper.start({
	target: document.querySelector('#sapper')
});



Window.socket = function() {
	let listeners = {};

	let lastConnectTime = 0;
	
	let webSocket;
	
	function send(channel, message) {
		console.debug('SOCKET: Message sent', channel, message);

		webSocket.send(JSON.stringify({
			channel: channel,
			data: message
		}));
	}

	function listen(channel, listener) {
		if (!Array.isArray(listeners[channel])) {
			listeners[channel] = [];
		}

		listeners[channel].push(listener);
	}

	function emitMessage(message) {
		if (!Array.isArray(listeners[message.channel])) return;

		for (let i = 0; i < listeners[message.channel].length; i++) {
			listeners[message.channel][i](message.data);
		}
	}

	function handleMessage(message) {
		try {
			message = JSON.parse(message.data);

			if (message.channel) {
				console.debug('SOCKET: Message recieved', message);

				emitMessage(message);
			} else {
				console.info('SOCKET: Message invalid', message);
			}
		} catch (err) {
			console.error('SOCKET: Message error', err);
		}
	}

	function setupSocket() {
		let socketUrl = 'ws://' + window.location.hostname;

		if (window.location.port) {
			socketUrl += ':' + window.location.port;
		}

		console.log('SOCKET: Creating', socketUrl);

		webSocket = new WebSocket(socketUrl);

		webSocket.onmessage = handleMessage
		

		webSocket.onerror = function(err) {
			console.err('SOCKET: Error', err);
		}

		webSocket.onclose = function(err) {
			console.warn('SOCKET: Closed', err);

			lastConnectTime += 100;

			setTimeout(setupSocket, Math.min(2000, lastConnectTime));
		}
		
		webSocket.onopen = function() {
			console.log('SOCKET: Connected', socketUrl);
		}
	}

	setupSocket();
	
	return {
		on: listen,
		send: send
	}
}();

