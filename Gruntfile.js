function ReadAccountData() {
    const file = require('fs');
    const raw = file.readFileSync("./Screeps-Info.json");
    return JSON.parse(raw)
}

module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-screeps');
    const account_info = ReadAccountData();

    grunt.initConfig({
        screeps: {
            options: {
                email: account_info.Email,
                token: account_info.Token,
                branch: 'default',
            },
            dist: {
                src: ["./js/*.js"]
            }
        }
    })
}