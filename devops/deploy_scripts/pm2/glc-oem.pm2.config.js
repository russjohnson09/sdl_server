let script = __dirname + './../../../index.js';

module.exports = {
    apps: [
        {
            name: 'glc-oem',
            "script": script,
            min_uptime: "1m",
            max_restarts: "10",
            restart_delay: (1000 * 10), //ten second delay for restarts
            "kill_timeout": (1000 *  60), //ten seconds to complete exiting
            "listen_timeout": 1000 * 60, //five seconds to start up

            //any non-sensitive environment variables should be stored here
            env: {
            },
        }
    ]

};