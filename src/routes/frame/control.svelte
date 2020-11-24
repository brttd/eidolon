<script>
    let url = 'http://www.fallingfalling.com/';
    
    function setUrl() {
        if (typeof Window !== 'undefined') {
            Window.socket.send('frame', {
                url: url
            });
        }
    }
</script>

<input type="url" bind:value={url}>
<button on:click={setUrl}>Set</button>