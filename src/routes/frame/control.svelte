<script>
    const actions = [
        {
            icon: 'power-off',

            execute: () => {
                if (typeof Window !== 'undefined') {
                    Window.socket.send('system', {
                        action: 'shutdown'
                    });
                }
            }
        },
        {
            icon: 'redo-alt',

            execute: () => {
                if (typeof Window !== 'undefined') {
                    Window.socket.send('system', {
                        action: 'reboot'
                    });
                }
            }
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
            icon: 'sync-alt',

            execute: () => {
                if (typeof Window !== 'undefined') {
                    Window.socket.send('system', {
                        action: 'reload'
                    });
                }
            }
        },
        {
            icon: 'sign-out-alt',

            execute: () => {
                if (typeof Window !== 'undefined') {
                    Window.socket.send('system', {
                        action: 'stop'
                    });
                }
            }
        }
    ];

    const system = {
        rotation: 'normal'
    };

    const rotations = [
        {
            rotation: 'inverted',
            icon: 'caret-square-left',
        },
        {
            rotation: 'right',
            icon: 'caret-square-up',
        },
        {
            rotation: 'normal',
            icon: 'caret-square-right',
        },
        {
            rotation: 'left',
            icon: 'caret-square-down',
        },
    ];

    let temp = 0;

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

    function setRotation(rotation) {
        if (typeof Window !== 'undefined') {
            Window.socket.send('system', {
                action: 'rotate',
                param: rotation
            });
        }
    
    }

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

    if (typeof Window !== 'undefined') {
        Window.socket.on('stats', function(data) {
            temp = Math.round(data.temp / 1000);
        });

        Window.socket.on('system', function(data) {
            system.rotation = data.rotation;
        });

        Window.socket.send('system', { action: 'get-rotation' });
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

<svelte:head>
    <script src="https://kit.fontawesome.com/47fe49e724.js" crossorigin="anonymous"></script>
</svelte:head>

<div class="container">
    <div class="header">
        <div class="actions">
            {#each actions as action}
                {#if action.icon}
                    <button on:click={action.execute}><i class="fas fa-{action.icon} fa-fw"></i></button>
                {:else}
                    <button on:click={action.execute}>{action.label}</button>
                {/if}
            {/each}

            {#each rotations as option}
                {#if option.rotation === system.rotation}
                    <button on:click={() => {setRotation(option.rotation)}}><i class="fas fa-{option.icon} fa-fw"></i></button>
                {:else}
                    <button class="inactive" on:click={() => {setRotation(option.rotation)}}><i class="fas fa-{option.icon} fa-fw"></i></button>
                {/if}
            {/each}
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
                <button on:click={presetClick} data-url={preset.url}><span>{preset.name}</span></button>
            {:else}
                <button on:click={presetClick} data-url={preset.url}><span>{preset.url}</span></button>
            {/if}
        {/each}
    </div>
</div>
