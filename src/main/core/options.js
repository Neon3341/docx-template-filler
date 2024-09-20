const fs = require('fs');
const { ipcMain } = require('electron');
const path = require('path');
const log = require('electron-log');

// log.error('Error: net::ERR_CERT_COMMON_NAME_INVALID');

export default class Options {
    #options;
    #optionsPath;

    /**
     * Constructs an Options instance.
     * @param {string} optionsPath - Path to the options file. Defaults to "../core/options.json".
     */
    constructor(optionsPath = `${process.env.APPDATA}/docx-template-filler/options.json`) {
        this.#optionsPath = optionsPath;
        this.#options = {};
        this.#readOptions();
    }

    #readOptions() {

        try {
            const data = fs.readFileSync(this.#optionsPath, 'utf8');
            this.#options = JSON.parse(data);
        } catch (err) {
            if (err.code === 'ENOENT') {
                // File doesn't exist, create a new one
                this.#createDirAndWrite();
            } else {
                throw new Error(`Failed to read options file: ${err}`);
            }
        }
    }

    #writeOptions() {
        try {
            fs.writeFileSync(this.#optionsPath, JSON.stringify(this.#options, null, 2));
        } catch (err) {
            throw new Error(`Failed to write options file: ${err}`);
        }
    }
    #createDirAndWrite() {
        const directory = path.dirname(this.#optionsPath);
        try {
            fs.mkdirSync(directory, { recursive: true }); // Ensure directory creation
            this.#writeOptions(); // Now write the options file
        } catch (err) {
            throw new Error(`Failed to create directory and write options file: ${err}`);
        }
    }

    // setupIPC() {
    //     ipcMain.handle('getOption', (event, name) => {
    //         if(this.issetOption(name) !== false){
    //             return this.getOption(name);
    //         } else {
    //             return false;
    //         }

    //     });
    // }

    /**
     * Checks if the specified option exists.
     * @param {string} name - The name of the option (e.g., 'paths.cyberpunk2077').
     * @returns {boolean} True if the option exists, false otherwise.
     */
    issetOption(name) {
        const parts = name.split('.');
        let current = this.#options;

        for (let i = 0; i < parts.length; i++) {
            if (current && current.hasOwnProperty(parts[i])) {
                current = current[parts[i]];
            } else {
                return false;
            }
        }

        return true;
    }


    /**
     * Retrieves the value of the specified option.
     * @param {string} name - The name of the option (e.g., 'paths.cyberpunk2077').
     * @returns {*} The value of the option.
     * @throws {Error} If the option does not exist.
     */
    getOption(name) {
        this.#readOptions();
        const parts = name.split('.');
        let current = this.#options;

        for (let i = 0; i < parts.length; i++) {
            if (parts[i] in current) {
                current = current[parts[i]];
            } else {
                throw new Error(`Unknown options key: ${name}`);
            }
        }

        return current;
    }


    /**
     * Sets the value of the specified option.
     * @param {string} name - The name of the option (e.g., 'paths.cyberpunk2077').
     * @param {*} value - The value to set.
     * @returns {boolean} True if the option was set successfully.
     */
    setOption(name, value) {
        const parts = name.split('.');
        let current = this.#options;

        for (let i = 0; i < parts.length - 1; i++) {
            if (!(parts[i] in current)) {
                current[parts[i]] = {};
            }
            current = current[parts[i]];
        }

        current[parts[parts.length - 1]] = value;
        this.#writeOptions();
        return true;
    }

    updateOptions() {
        this.#readOptions();
        return true;
    }
}

module.exports = Options;
