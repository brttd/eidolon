<script>
	import { fly } from "svelte/transition";

	const actions = [
		{
			icon: "power-off",

			execute: () => {
				if (typeof Window !== "undefined") {
					Window.socket.send("system", {
						action: "shutdown",
					});
				}
			},
		},
		{
			icon: "redo-alt",

			execute: () => {
				if (typeof Window !== "undefined") {
					Window.socket.send("system", {
						action: "reboot",
					});
				}
			},
		},
		/*
        {
            icon: 'sync-alt',

            execute: () => {
                if (typeof Window !== 'undefined') {
                    Window.socket.send('system', {
                        action: 'restart'
                    });
                }
            }
        },
        */
		{
			icon: "sync-alt",

			execute: () => {
				if (typeof Window !== "undefined") {
					Window.socket.send("system", {
						action: "reload",
					});
				}
			},
		},
		{
			icon: "sign-out-alt",

			execute: () => {
				if (typeof Window !== "undefined") {
					Window.socket.send("system", {
						action: "stop",
					});
				}
			},
		},
	];

	const system = {
		rotation: "normal",

		temp: 0,

		safeTemp: 50,
		unsafeTemp: 70,
	};

	const rotations = [
		{
			rotation: "inverted",
			icon: "caret-square-left",
		},
		{
			rotation: "right",
			icon: "caret-square-up",
		},
		{
			rotation: "normal",
			icon: "caret-square-right",
		},
		{
			rotation: "left",
			icon: "caret-square-down",
		},
	];

	let frame = {
		url: "",
		paused: false,
		playlist: false,
		playlistTime: 60,
	};
	let lastSafePlaylistTime = frame.playlistTime;

	let presets = [];

	function setRotation(rotation) {
		if (typeof Window !== "undefined") {
			Window.socket.send("system", {
				action: "rotate",
				param: rotation,
			});
		}
	}

	function setPaused(paused) {
		frame.paused = paused;

		if (typeof Window !== "undefined") {
			Window.socket.send("frame", {
				paused: frame.paused,
			});
		}
	}

	function setPlaylist(playlist) {
		frame.playlist = playlist;

		if (typeof Window !== "undefined") {
			Window.socket.send("frame", {
				playlist: frame.playlist,
			});
		}
	}

	function setUrl(url) {
		frame.url = url;

		if (typeof Window !== "undefined") {
			Window.socket.send("frame", {
				url: frame.url,
			});
		}
	}

	function addPreset() {
		presets.push({ url: frame.url });

		if (typeof Window !== "undefined") {
			Window.socket.send("storage-set", {
				key: "presets",
				value: presets,
			});
		}
	}

	function presetClick() {
		setUrl(this.getAttribute("data-url"));
	}

	function presetDelete() {
		let url = this.getAttribute("data-url");

		for (let i = presets.length - 1; i >= 0; i--) {
			if (presets[i].url === url) {
				presets.splice(i, 1);
			}
		}

		presets = presets;

		if (typeof Window !== "undefined") {
			Window.socket.send("storage-set", {
				key: "presets",
				value: presets,
			});
		}
	}

	function onInputKey(event) {
		if (event.code.toLowerCase() === "enter") {
			setUrl(frame.url);
		}
	}

	function onPlaylistTimeChange(event) {
		if (isFinite(frame.playlistTime) && frame.playlistTime > 0) {
			Window.socket.send("storage-set", {
				key: "playlist-time",
				value: frame.playlistTime,
			});

			lastSafePlaylistTime = frame.playlistTime;
		} else if (event.code.toLowerCase() !== "backspace") {
			frame.playlistTime = lastSafePlaylistTime;
		}
	}

	if (typeof Window !== "undefined") {
		Window.socket.on("stats", function (data) {
			system.temp = Math.round(data.temp / 1000);
		});

		Window.socket.on("frame", function (data) {
			if (typeof data.url === "string") {
				frame.url = data.url;
			}

			if (typeof data.paused === "string") {
				frame.paused = data.paused;
			}
		});

		Window.socket.on("system", function (data) {
			system.rotation = data.rotation;
		});

		Window.socket.on("storage-get", function (data) {
			switch (data.key) {
				case "presets":
					presets = data.value;
					break;

				case "playlist-time":
					if (frame.playlistTime !== data.value) {
						frame.playlistTime = data.value;
					}

					break;

				case "system.unsafeTemp":
					system.unsafeTemp = data.value;
					break;

				case "system.safeTemp":
					system.safeTemp = data.value;
					break;
			}
		});

		Window.socket.send("system", { action: "get-rotation" });
		Window.socket.send("storage-get", { key: "presets", value: presets });
		Window.socket.send("storage-get", {
			key: "playlist-time",
			value: frame.playlistTime,
		});
	}
</script>

<svelte:head>
	<script
		src="https://kit.fontawesome.com/47fe49e724.js"
		crossorigin="anonymous"></script>
</svelte:head>

<div class="container">
	<div class="header">
		<div class="actions">
			{#each actions as action}
				{#if action.icon}
					<button on:click={action.execute}
						><i class="fas fa-{action.icon} fa-fw" /></button
					>
				{:else}
					<button on:click={action.execute}>{action.label}</button>
				{/if}
			{/each}

			<span class="seperator" />

			{#if frame.paused}
				<button
					on:click={() => {
						setPaused(false);
					}}><i class="fas fa-pause-circle fa-fw" /></button
				>
			{:else}
				<button
					class="inactive"
					on:click={() => {
						setPaused(true);
					}}><i class="fas fa-pause-circle fa-fw" /></button
				>
			{/if}

			{#if frame.playlist}
				<button
					on:click={() => {
						setPlaylist(false);
					}}><i class="fas fa-fast-forward fa-fw" /></button
				>
			{:else}
				<button
					class="inactive"
					on:click={() => {
						setPlaylist(true);
					}}><i class="fas fa-fast-forward fa-fw" /></button
				>
			{/if}

			<input
				type="number"
				min="1"
				bind:value={frame.playlistTime}
				on:keyup={onPlaylistTimeChange}
			/>

			<span class="seperator" />

			{#each rotations as option}
				{#if option.rotation === system.rotation}
					<button
						on:click={() => {
							setRotation(option.rotation);
						}}><i class="fas fa-{option.icon} fa-fw" /></button
					>
				{:else}
					<button
						class="inactive"
						on:click={() => {
							setRotation(option.rotation);
						}}><i class="fas fa-{option.icon} fa-fw" /></button
					>
				{/if}
			{/each}

			<!-- TODO: Add pointer toggle - enable / disable pointer-events: none; -->
		</div>
		<p class="info">{system.temp}°</p>
	</div>

	<div class="main">
		<input type="url" bind:value={frame.url} on:keyup={onInputKey} />
		<button
			on:click={() => {
				setUrl(frame.url);
			}}><i class="fas fa-sign-in-alt fa-fw" /></button
		>
		<button on:click={addPreset}
			><i class="fas fa-cloud-download-alt fa-fw" /></button
		>
	</div>

	<div class="presets">
		{#each presets as preset (preset.url)}
			<div class="preset">
				<button
					in:fly={{ x: -50, duration: 100 }}
					out:fly={{ x: 50, duration: 200 }}
					on:click={presetDelete}
					class="inactive delete-btn"
					data-url={preset.url}><i class="fas fa-trash fa-fw" /></button
				>

				{#if preset.name}
					<button
						in:fly={{ x: -50, duration: 100 }}
						out:fly={{ x: 50, duration: 200 }}
						on:click={presetClick}
						data-url={preset.url}><span>{preset.name}</span></button
					>
				{:else}
					<button
						in:fly={{ x: -50, duration: 100 }}
						out:fly={{ x: 50, duration: 200 }}
						on:click={presetClick}
						data-url={preset.url}><span>{preset.url}</span></button
					>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.container {
	}

	.main,
	.header {
		display: flex;
		flex-flow: row nowrap;
		justify-content: flex-end;
		padding: 1em;

		border-bottom: 1px solid black;
	}

	.presets {
		padding: 0;
	}

	input,
	button {
		padding: 0.5em 1em;

		font-family: "Anonymous Pro", monospace;

		border: 1px solid black;
		border-radius: 3px;
	}

	button {
		padding: 0.5em;

		color: #fff;
		background-color: #a22846;
	}
	button.inactive {
		color: #a22846;
		background-color: #fff;
	}
	button span {
		padding: 0 0.5em;
	}

	.header .info {
		margin: 0;

		flex: 0 0 auto;
	}

	.header .actions {
		flex: 1 1 auto;

		margin-bottom: -1em;
	}
	.header .actions button,
	.header .actions input {
		margin-right: 1em;
		margin-bottom: 1em;
	}
	.header .actions .seperator {
		height: 100%;

		border-right: 1px solid black;

		margin-right: 1em;
	}

	.header .actions input {
		max-width: 8ch;
	}

	.main input {
		flex: 1 1 auto;
	}
	.main button {
		flex: 0 0 auto;
		margin-left: 1em;
	}

	.presets .preset {
		margin: 1em 0;
	}

	.presets button {
		display: inline-block;

		margin: 0 1em;
	}
	.presets .delete-btn {
		margin-right: 0;
	}
</style>
