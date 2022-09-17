<script>
	import { slide } from "svelte/transition";
	import { cubicOut, cubicIn } from "svelte/easing";

	const message = {
		active: false,

		text: "",
		description: "",
	};

	let messageTimeout = false;

	let src = "https://graphics.brettdoyle.art/glsl/color/";

	let playlist = [];
	let recentlyPlayed = [];
	let playlistTime = 0;
	let defaultPlaylistTime = 60;

	let displayUrl = "";
	let displayUrlMain = "";

	let loading = true;

	let paused = false;
	let tempUnsafe = false;
	let temp = 0;

	let rotatePos = "top left";
	let rotateOptions = [
		"top left",
		"top right",
		"bottom left",
		"bottom right",
	];

	function updateDisplayUrl() {
		displayUrl = src.replace("http://", "").replace("https://", "");
		displayUrlMain = "";

		if (
			displayUrl.split("/").length > 0 &&
			displayUrl.indexOf("/") !== displayUrl.length - 1
		) {
			displayUrl = displayUrl.split("/");
			displayUrlMain = displayUrl.pop();

			if (displayUrlMain === "") {
				displayUrlMain += displayUrl.pop();
			}

			displayUrl = displayUrl.join("/");
			displayUrl += "/";
		} else {
			displayUrlMain = displayUrl.replace("/", "");
			displayUrl = "";
		}
	}

	function setLoading(bool) {
		rotatePos = rotateOptions[~~(Math.random() * rotateOptions.length)];

		loading = bool;
	}

	function setMessage(data) {
		rotatePos = rotateOptions[~~(Math.random() * rotateOptions.length)];

		message.text = data.text;

		if (data.description) {
			message.description = data.description;
		} else {
			message.description = "";
		}

		message.active = true;

		if (messageTimeout) {
			clearTimeout(messageTimeout);
		}

		messageTimeout = setTimeout(() => {
			rotatePos = rotateOptions[~~(Math.random() * rotateOptions.length)];

			message.active = false;

			messageTimeout = false;
		}, 1000 * 3);
	}

	function load(url) {
		if (src === url) return;

		setLoading(true);

		setTimeout(() => {
			src = url;
			updateDisplayUrl();
		}, 300);
	}

	function processPlaylist() {
		if (playlistTime === 0) return;
		if (playlist.length === 0) return;

		let next = ~~(Math.random() * playlist.length);

		while (recentlyPlayed.includes(playlist[next])) {
			next = (next + 1) % playlist.length;

			if (playlist[next] === src) {
				next = (next + 1) % playlist.length;
			}
		}

		load(playlist[next]);

		if (playlist.length > 3) {
			recentlyPlayed.push(playlist[next]);
		}

		if (recentlyPlayed.length > ~~(playlist.length / 3 + 0.5)) {
			recentlyPlayed.length = ~~(playlist.length / 3 + 0.5);
		}

		setTimeout(processPlaylist, playlistTime * 1000);
	}

	if (typeof Window !== "undefined") {
		Window.socket.on("frame", function (data) {
			if (data.paused === true) {
				paused = true;
			} else if (data.paused === false) {
				setLoading(true);

				paused = false;
			}

			if (data.playlist === true) {
				if (playlistTime === 0) {
					playlistTime = defaultPlaylistTime;

					processPlaylist();
				}
			} else {
				playlistTime = 0;
			}

			if (data.url && data.url !== src) {
				load(data.url);
			}
		});

		Window.socket.on("frame-message", setMessage);

		Window.socket.on("temp-unsafe", function (data) {
			tempUnsafe = true;
		});
		Window.socket.on("temp-safe", function (data) {
			setLoading(true);

			tempUnsafe = false;
		});

		Window.socket.on("stats", function (data) {
			temp = Math.round(data.temp / 1000);
		});

		Window.socket.on("storage-get", function (data) {
			if (data.key === "presets") {
				playlist = [];

				for (let i = 0; i < data.value.length; i++) {
					playlist.push(data.value[i].url);
				}

				recentlyPlayed = [];
			} else if (data.key === "playlist-time") {
				defaultPlaylistTime = data.value;

				if (playlistTime !== 0) {
					playlistTime = defaultPlaylistTime;
				}
			}
		});

		Window.socket.send("storage-get", { key: "presets", value: playlist });
		Window.socket.send("storage-get", {
			key: "playlist-time",
			value: defaultPlaylistTime,
		});
	}

	function onFrameLoad() {
		setLoading(false);
	}

	updateDisplayUrl();

	function rotate(node, params) {
		let dir = 90;

		if (params.origin === "top right" || params.origin === "bottom left") {
			dir = -90;
		}

		return {
			delay: params.delay || 0,
			duration: params.duration || 400,
			easing: params.easing || cubicOut,
			css: (t, u) =>
				`transform: rotate(${u * dir}deg); transform-origin: ${
					params.origin
				}`,
		};
	}
</script>

<svelte:head>
	<title>Frame</title>
	<style>
		html,
		body {
			overflow: hidden;

			cursor: none;
		}
	</style>
</svelte:head>

{#if paused}
	<div
		class="loader pause"
		in:rotate={{
			delay: 0,
			duration: 500,
			easing: cubicOut,
			origin: rotatePos,
		}}
		out:rotate={{
			delay: 200,
			duration: 600,
			easing: cubicIn,
			origin: rotatePos,
		}}
	>
		<div class="text">
			<p class="main">Paused</p>
		</div>
	</div>
{:else if tempUnsafe}
	<div
		class="loader temp"
		in:rotate={{
			delay: 0,
			duration: 500,
			easing: cubicOut,
			origin: rotatePos,
		}}
		out:rotate={{
			delay: 200,
			duration: 600,
			easing: cubicIn,
			origin: rotatePos,
		}}
	>
		<div class="text">
			<p class="main">Paused</p>
			<p class="url"><span class="url-main">{temp}</span>°</p>
		</div>
	</div>
{:else}
	<iframe title="Frame" {src} on:load={onFrameLoad} />

	{#if loading}
		<div
			class="loader"
			in:rotate={{
				delay: 0,
				duration: 500,
				easing: cubicOut,
				origin: rotatePos,
			}}
			out:rotate={{
				delay: 100,
				duration: 600,
				easing: cubicIn,
				origin: rotatePos,
			}}
		>
			<div class="text">
				<p class="main">Loading</p>
				<p class="url">
					{displayUrl}<span class="url-main">{displayUrlMain}</span>
				</p>
			</div>
		</div>
	{/if}
{/if}

{#if message.active}
	<div
		class="loader message"
		in:rotate={{
			delay: 0,
			duration: 500,
			easing: cubicOut,
			origin: rotatePos,
		}}
		out:rotate={{
			delay: 0,
			duration: 600,
			easing: cubicIn,
			origin: rotatePos,
		}}
	>
		<div class="text">
			<p class="main">{message.text}</p>
			{#if message.description}
				<p class="url">
					<span class="url-main">{message.description}</span>
				</p>
			{/if}
		</div>
	</div>
{/if}

<style>
	iframe,
	.loader {
		display: block;

		margin: 0;
		padding: 0;

		width: 100%;
		width: 100vw;

		height: 100%;
		height: 100vh;

		outline: none;
		border: none;

		cursor: none;
		pointer-events: none;
	}

	.loader {
		display: flex;
		flex-flow: column nowrap;
		align-items: center;
		justify-content: center;

		position: absolute;

		top: 0;
		left: 0;
		right: 0;
		bottom: 0;

		transform-origin: bottom right;

		background-color: #101014;
		color: #fff;
	}
	.loader::before {
		content: "x";
		display: block;

		position: absolute;
		top: 0;
		bottom: 0;
		left: -100%;
		right: -100%;
		width: 300%;
		height: 100%;

		z-index: -1;

		background-color: #101014;
		color: transparent;
	}
	.loader.temp {
		background-color: #a22846;
	}
	.loader.pause,
	.loader.temp {
		z-index: 10;
	}

	.loader .text {
		display: block;

		margin: 0;
		padding: 1em;

		font-size: 32px;
		font-size: 48px;
		font-weight: 100;
		text-align: center;
	}
	.loader .text .main,
	.loader .text .url {
		display: block;
		margin: 0;
	}
	.loader .text .main {
		margin-bottom: 0.5em;
	}

	.loader .text .url {
		color: rgba(255, 255, 255, 0.6);

		font-size: 26px;
		/*font-family: 'Anonymous Pro', monospace; */
	}
	.loader .text .url-main {
		color: rgb(255, 255, 255);
	}
</style>
