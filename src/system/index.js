import { exec } from "child_process";

import { createWriteStream } from "fs";

import * as socket from "./socket";

import * as storage from "./storage";

let stats = {
	unsafeTemp: false,
	temp: 0,
};

let started = false;

let logFile = createWriteStream("log.txt", { flags: "a" });

function log(type, message) {
	logFile.write(
		new Date().toISOString() + "|" + type + "|" + message + "\n"
	);
}

process.on("exit", () => {
	logFile.end();
});

function updateStat(type, callback = false) {
	let cmd = "";

	switch (type) {
		case "temp":
			cmd = "cat /sys/class/thermal/thermal_zone0/temp";
			break;
	}

	if (!cmd) return;

	exec(cmd, (error, stdout, stderr) => {
		switch (stdout) {
			case "temp":
				stdout = parseFloat(stdout);
				break;
		}

		stats[type] = stdout;

		if (callback) {
			callback(stdout);
		}
	});
}

function monitorStats() {
	updateStat("temp");

	socket.send("stats", stats);

	if (stats.temp > storage.get("system.unsafeTemp", 70000)) {
		stats.unsafeTemp = true;

		socket.send("temp-unsafe", {
			temp: stats.temp,
		});
	} else if (
		stats.unsafeTemp &&
		stats.temp < storage.get("system.safeTemp", 65000)
	) {
		stats.unsafeTemp = false;

		socket.send("temp-safe", {
			temp: stats.temp,
		});
	}
}

function getStat(type) {
	return stats[type];
}

function onSystemMessage(message) {
	if (message.action) {
		log("system", "recieved `" + message.action + "` command");

		switch (message.action) {
			//device commands
			case "reboot":
				exec("sudo reboot");
				break;
			case "shutdown":
				exec("sudo shutdown now");
				break;

			//screen commands
			case "rotate":
				if (!message.param) break;

				if (
					message.param === "left" ||
					message.param === "right" ||
					message.param === "normal" ||
					message.param === "inverted"
				) {
					exec(
						"DISPLAY=:0 xrandr --output HDMI-1 --rotate " + message.param,
						(err, stdout, stderr) => {
							if (message.param === "left") {
								socket.send("frame-message", {
									text: "Portrait",
									description: "↓",
								});
							} else if (message.param === "right") {
								socket.send("frame-message", {
									text: "Portrait",
									description: "↑",
								});
							} else if (message.param === "normal") {
								socket.send("frame-message", {
									text: "Landscape",
									description: "→",
								});
							} else if (message.param === "inverted") {
								socket.send("frame-message", {
									text: "Landscape",
									description: "←",
								});
							}

							socket.send("system", {
								rotation: message.param,
							});
						}
					);
				}

				break;
			case "get-rotation":
				exec(
					"DISPLAY=:0 xrandr --query --verbose | grep 'HDMI-1' | cut -d ' ' -f 6",
					(err, stdout, stderr) => {
						if (err) {
							log("system", "unable to get rotation: " + err);

							return;
						}

						socket.send("system", {
							rotation: stdout.trim(),
						});
					}
				);
				break;

			//server commands
			case "restart":
				exec("sudo systemctl restart frame.service");
				break;
			case "stop":
				exec("sudo systemctl stop frame.service");
				break;
			case "reload":
				exec("git pull", (err, stdout, stderr) => {
					if (err) {
						console.error(err);

						socket.send("frame-message", {
							text: "(Reloading) Error!",
							description: "git pull failed",
						});

						return;
					}

					log(
						"system",
						"[reload] git pull: " + stdout.replace("\n", "  ")
					);

					if (stderr) {
						log(
							"system",
							"[reload] git pull error: " + stderr.replace("\n", "  ")
						);
					}

					exec("npm run build", (err, stdout, stderr) => {
						if (err) {
							console.error(err);

							socket.send("frame-message", {
								text: "(Reloading) Error!",
								description: "Build failed",
							});

							return;
						}

						log(
							"system",
							"[reload] sapper build: " + stdout.replace("\n", "  ")
						);

						if (stderr) {
							log(
								"system",
								"[reload] sapper build error: " +
									stderr.replace("\n", "  ")
							);
						}

						exec("sudo systemctl restart frame.service");
					});
				});
				break;
		}
	}
}

function onStorageSet(data) {
	if (Array.isArray(data)) {
		if (data.length === 2 && typeof data[0] === "string") {
			storage.set(data[0], data[1]);

			socket.send("storage-get", {
				key: data[0],
				value: data[1],
			});

			return;
		}

		for (let i = 0; i < data.length; i++) {
			onStorageSet(data[i]);
		}
	} else if (typeof data === "object") {
		storage.set(data.key, data.value);

		socket.send("storage-get", {
			key: data.key,
			value: data.value,
		});
	}
}

function onStorageGet(data) {
	let value;
	let key;

	if (Array.isArray(data)) {
		key = data[0];
		value = data.length >= 2 ? data[1] : undefined;
	} else if (typeof data === "object") {
		key = data.key;
		value = data.value;
	}

	if (key) {
		value = storage.get(key, value);

		socket.send("storage-get", {
			key: key,
			value: value,
		});
	}
}

function start(server) {
	if (started) return;
	started = true;

	socket.loud("frame");

	socket.start(server);

	log("system", "started");

	socket.on("system", onSystemMessage);

	socket.on("storage-set", onStorageSet);
	socket.on("storage-get", onStorageGet);

	setInterval(monitorStats, 3 * 1000);
}

export { getStat, start };
