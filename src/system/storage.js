import { readFile, writeFile } from "fs";

const file = {
	path: "storage.json",

	writing: false,
	needsWrite: false,
};

let data = {};

function read() {
	readFile(file.path, "utf8", (err, str) => {
		if (err) {
			return console.error(err);
		}

		try {
			data = JSON.parse(str);
		} catch (err) {
			console.error(err);
		}
	});
}

function write() {
	if (file.writing) {
		file.needsWrite = true;

		return;
	}

	file.writing = true;

	writeFile(file.path, JSON.stringify(data), "utf8", (err) => {
		if (err) {
			return console.error(err);
		}

		file.writing = false;

		if (file.needsWrite) {
			file.needsWrite = false;

			write();
		}
	});
}

function getLayer(source, key, create = false) {
	let i = key.indexOf(".");

	if (i === -1) {
		return source;
	}

	let layer = key.substr(0, i);
	key = key.substr(i + 1);

	if (typeof source[layer] === "object") {
		return getLayer(source[layer], key, create);
	}

	if (create) {
		source[layer] = {};

		return getLayer(source[layer], key, create);
	}
}

function lastKey(key) {
	return key.substr(key.lastIndexOf(".") + 1);
}

function get(key, value) {
	let layer = getLayer(data, key, true);

	let last = lastKey(key);

	if (layer.hasOwnProperty(last)) {
		return layer[last];
	}

	if (value !== undefined) {
		return set(key, value);
	}
}

function set(key, value) {
	let layer = getLayer(data, key, true);

	key = lastKey(key);

	layer[key] = value;

	write();

	return value;
}

read();

export { get, set };
