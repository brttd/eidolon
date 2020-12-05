import { exec } from 'child_process';

import * as socket from './socket';

let stats = {
    unsafeTemp: false,
    'temp': 0
};

let started = false;

function updateStat(type, callback = false) {
    let cmd = '';

    switch (type) {
        case 'temp':
            cmd = 'cat /sys/class/thermal/thermal_zone0/temp';
            break;
    }

    if (!cmd) return;

    exec(cmd, (error, stdout, stderr) => {
        switch (stdout) {
            case 'temp':
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
    updateStat('temp');

    if (socket) {
        socket.send('stats', stats);

        if (stats.temp > 70000) {
            stats.unsafeTemp = true;

            socket.send('temp-unsafe', {
                temp: stats.temp
            });
        } else if (stats.unsafeTemp && stats.temp < 65000) {
            stats.unsafeTemp = false;

            socket.send('temp-safe', {
                temp: stats.temp
            });
        }
    }
}

function getStat(type) {
    return stats[type];
}

function start(server) {
    if (started) return;
    started = true;

    socket.start(server);

    socket.on('system', message => {
        if (message.action === 'shutdown') {
            exec('sudo shutdown now');
        }

        if (message.action === 'reboot') {
            exec('sudo reboot');
        }
    })


    setInterval(monitorStats, 3 * 1000);
}

export { getStat, start };