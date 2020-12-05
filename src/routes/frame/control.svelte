<script>
    let url = '';

    let temp = 0;

    let presets = [
        {
            url: 'http://www.fallingfalling.com/'
        },
        {
            url: 'https://graphics.brettdoyle.art/canvas/bml-traffic/'
        },
        {
            url: 'https://graphics.brettdoyle.art/canvas/rps/'
        },
        {
            url: 'https://graphics.brettdoyle.art/canvas/rps/3'
        },
        {
            url: 'https://graphics.brettdoyle.art/canvas/rps/5'
        },
        {
            url: 'https://www.www.www.brettdoyle.art/lines.html'
        },
        {
            url: 'https://www.www.www.brettdoyle.art/arches.html'
        },
        {
            url: 'https://www.www.www.brettdoyle.art/langtonsAnt.html'
        },
        {
            url: 'https://www.www.www.brettdoyle.art/life_3.html'
        },
        {
            url: 'https://www.www.www.brettdoyle.art/head.html'
        },
    ];
    
    function setUrl() {
        if (typeof Window !== 'undefined') {
            Window.socket.send('frame', {
                url: url
            });
        }
    }

    function presetClick() {
        url = this.getAttribute('data-url');

        setUrl();
    }

    function onInputKey(event) {
        if (event.code.toLowerCase() === 'enter') {
            setUrl();
        }
    }

    function shutdown() {
        if (typeof Window !== 'undefined') {
            Window.socket.send('system', {
                action: 'shutdown'
            });
        }
    }
    function reboot() {
        if (typeof Window !== 'undefined') {
            Window.socket.send('system', {
                action: 'reboot'
            });
        }
    }

    if (typeof Window !== 'undefined') {
        Window.socket.on('stats', function(data) {
            temp = Math.round(data.temp / 1000);
        });
    }
</script>

<style>
    .container {
    }

    .main, .header {
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-end;
        padding: 1em;

        border-bottom: 1px solid black;
    }

    .presets {
        padding: 0;
    }

    input, button {
        padding: 0.5em 1em;

        font-family: 'Anonymous Pro', monospace;

        border: 1px solid black;
        border-radius: 3px;
    }

    button {
        color: #fff;
        background-color: #a22846;
    }

    .header .info {
        margin: 0;

        flex: 0 0 auto;
    }

    .header .actions {
        flex: 1 1 auto;
    }
    .header .actions button {
        margin-right: 1em;
    }

    .main input {
        flex: 1 1 auto;
    }
    .main button {
        flex: 0 0 auto;
        margin-left: 1em;
    }

    .presets button {
        display: block;

        margin: 1em;
    }
</style>

<div class="container">
    <div class="header">
        <div class="actions">
            <button on:click={shutdown}>Power Off</button>
            <button on:click={reboot}>Restart</button>
        </div>
        <p class="info">{temp}°</p>
    </div>

    <div class="main">
        <input type="url" bind:value={url} on:keyup={onInputKey}>
        <button on:click={setUrl}>SET</button>
    </div>
    
    <div class="presets">
        {#each presets as preset}
            {#if preset.name}
                <button on:click={presetClick} data-url={preset.url}>{preset.name}</button>
            {:else}
                <button on:click={presetClick} data-url={preset.url}>{preset.url}</button>
            {/if}
        {/each}
    </div>
</div>
