const DEFAULT = 0
const TEST = 1

function Branch(type) {
    let branch = ""
    switch(type) {
        case DEFAULT: {
            branch = "default"
            break
        }
        case TEST: {
            branch = "debug"
            break
        }
    }
    return branch
}

function ReadAccountData() {
    const file = require('fs');
    const raw = file.readFileSync("./Screeps-Info.json");
    return JSON.parse(raw)
}

module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-screeps');
    const account_info = ReadAccountData();

    const branch = Branch(Number.parseInt(grunt.option("branch")))

    grunt.initConfig({
        screeps: {
            options: {
                email: account_info.Email,
                token: account_info.Token,
                branch: branch,
            },
            dist: {
                src: ["./js/*.js"]
            }
        }
    })
}