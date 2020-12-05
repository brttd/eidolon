<script>
    let url = '';

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
</script>

<style>
    .container {
    }

    .main {
        display: flex;
        flex-flow: row nowrap;
        padding: 1em;

        border-bottom: 1px solid black;
    }

    input, button {
        padding: 0.5em 1em;

        font-family: 'Anonymous Pro', monospace;

        border: 1px solid black;
        border-radius: 3px;
    }

    .main input {
        flex: 1 1 auto;
    }
    .main button {
        flex: 0 0 auto;
        margin-left: 1em;
    }

    button {
        color: #fff;
        background-color: #a22846;
    }

    .presets {
        padding: 0;
    }

    .presets button {
        display: block;

        margin: 1em;
    }
</style>

<div class="container">
    <div class="main">
        <input type="url" bind:value={url}>
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
