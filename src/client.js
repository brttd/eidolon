import * as sapper from "@sapper/app";

sapper.start({
	target: document.querySelector("#sapper"),
});

Window.socket = (function () {
	let listeners = {};

	let queue = [];

	let lastConnectTime = 0;

	let webSocket;

	function send(channel, data) {
		if (webSocket && webSocket.readyState === WebSocket.OPEN) {
			console.debug("SOCKET: Message sent", channel, data);

			webSocket.send(channel + "|" + JSON.stringify(data));
		} else {
			queue.push([channel, data]);
		}
	}

	function listen(channel, listener) {
		if (!Array.isArray(listeners[channel])) {
			listeners[channel] = [];
		}

		listeners[channel].push(listener);
	}

	function emitMessage(channel, data) {
		if (!Array.isArray(listeners[channel])) return;

		for (let i = 0; i < listeners[channel].length; i++) {
			listeners[channel][i](data);
		}
	}

	function handleMessage(message) {
		try {
			message = message.data.split("|");

			if (message.length === 1) {
				throw new Error("Message did not contain both channel and data");
			}

			message[1] = JSON.parse(message[1]);

			console.debug("SOCKET: Message recieved", message[0], message[1]);

			emitMessage(message[0], message[1]);
		} catch (err) {
			console.error("SOCKET: Message error", err);
		}
	}

	function setupSocket() {
		let socketUrl = "ws://" + window.location.hostname;

		if (window.location.port) {
			socketUrl += ":" + window.location.port;
		}

		console.log("SOCKET: Creating", socketUrl);

		webSocket = new WebSocket(socketUrl);

		webSocket.onmessage = handleMessage;

		webSocket.onerror = function (err) {
			console.error("SOCKET: Error", err);
		};

		webSocket.onclose = function (err) {
			console.warn("SOCKET: Closed", err);

			lastConnectTime += 250;

			setTimeout(setupSocket, Math.min(10000, lastConnectTime));
		};

		webSocket.onopen = function () {
			console.log("SOCKET: Connected", socketUrl);

			while (queue.length > 0) {
				let msg = queue.shift();

				send(msg[0], msg[1]);
			}
		};
	}

	setupSocket();

	return {
		on: listen,
		send: send,
	};
})();
