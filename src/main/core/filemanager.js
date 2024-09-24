const fs = require('fs');
const path = require('path');

// log.error('Error: net::ERR_CERT_COMMON_NAME_INVALID');

export default class FileManager {

    #options
    #templatesFolder;
    /**
     * Constructs an Options instance.
     * @param {string} optionsPath - Path to the options file. Defaults to "../core/options.json".
     */
    constructor(options) {
        this.#options = options;
        try {
            this.#templatesFolder = this.#options.getOption('files.templateFolder')
        }
        catch {
            try {
                fs.mkdirSync(`${process.env.APPDATA}/docx-template-filler/templates/`, { recursive: true });
                this.#options.setOption('files.templateFolder', `${process.env.APPDATA}/docx-template-filler/templates/`)
                this.#templatesFolder = `${process.env.APPDATA}/docx-template-filler/templates/`;
            } catch (err) {
                throw new Error("Error occurred at FileManager constructor: " + err);
            }
        }
    }

    getTemplates() {
        const templates = {};
        try {
            const files = fs.readdirSync(this.#templatesFolder);
            files.forEach(file => {
                const filePath = path.join(this.#templatesFolder, file);
                if (path.extname(file) === '.docx') {
                    templates[file] = filePath;
                }
            });
        } catch (error) {
            console.error('Error reading template folder:', error);
        }
        return templates;
    }

    getSeries() {
        const series = {};
        try {
            const files = fs.readdirSync(this.#templatesFolder);
            files.forEach(file => {
                const filePath = path.join(this.#templatesFolder, file);
                if (path.extname(file) === '.json') {
                    try {
                        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

                        if (data.DTF === true) {
                            series[file] = filePath;
                        }
                    } catch (error) {
                        console.error(`Error reading or parsing JSON file ${file}:`, error);
                    }
                }
            });

        } catch (error) {
            console.error('Error reading series folder:', error);
        }

        return series;
    }
}

module.exports = FileManager;
