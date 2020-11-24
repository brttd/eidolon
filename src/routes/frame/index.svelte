<script>
    import { slide } from 'svelte/transition';
    import { cubicOut, cubicIn } from 'svelte/easing';
    
    let src = 'http://www.fallingfalling.com';

    let displayUrl = src.replace('http://', '').replace('https://', '');

    let loading = true;

    if (typeof Window !== 'undefined') {
        Window.socket.on('frame', function(data) {
            if (data.url && data.url !== src) {
                loading = true;

                setTimeout(() => {
                    src = data.url;
                }, 300);
            }
        });
    }

    function onFrameLoad() {
        loading = false;

        console.log('loaded!');
    }
</script>

<style>
	iframe, .loader {
        display: block;

        margin: 0;
        padding: 0;

        width: 100%;
        width: 100vw;

        height: 100%;
        height: 100vh;

        outline: none;
        border: none;
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

        background-color: #6cc04a;
        color: #fff;
    }

    .loader .text {
        display: block;

        margin: 0;
        padding: 1em;

        font-size: 32px;
        text-align: center;
    }
    .loader .text .main, .loader .text .url {
        display: block;
    }

    .loader .text .url {
        opacity: 0.8;

        font-size: 24px;
        font-family: 'Anonymous Pro', monospace;
    }
</style>

<svelte:head>
    <title>Frame</title>
    <style>
        html, body {
            overflow: hidden;
        }
    </style>
</svelte:head>

<iframe title="Frame" {src} on:load={onFrameLoad}></iframe>

{#if loading}
<div class="loader" in:slide="{{delay: 0, duration: 300, easing: cubicOut }}" out:slide="{{delay: 0, duration: 600, easing: cubicIn }}">
    <p class="text">
        <span class="main">loading</span>
        <span class="url">{displayUrl}</span>
    </p>
</div>
{/if}