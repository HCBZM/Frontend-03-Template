var Generator = require('yeoman-generator');

// yo vue "Vue APP"
// npx webpack

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);

        this.argument("appname", { type: String, default: 'Vue APP' });
    }
    installPakeage () {
        const pkgJson = {
            "name": this.options.appname.replace(/\s+/, '-').toLowerCase(),
            "version": "1.0.0",
            "description": "",
            "main": "index.js",
            "scripts": {
                "test": "echo \"Error: no test specified\" && exit 1"
            },
            "keywords": [],
            "author": "",
            "license": "ISC",
            "dependencies": {},
            "devDependencies": {}
        };
        this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);

        this.npmInstall(['vue']);
        this.npmInstall([
            'webpack', 'webpack-cli', 'vue-loader', 'vue-template-compiler', 
            'vue-style-loader', 'css-loader', 'babel-loader', 
            '@babel/core', '@babel/preset-env', 'copy-webpack-plugin'
        ], { 'save-dev': true });
    }

    copyTemplate () {
        this.fs.copyTpl(
            this.templatePath('Hello.vue'),
            this.destinationPath('src/Hello.vue')
        );
        this.fs.copyTpl(
            this.templatePath('main.js'),
            this.destinationPath('src/main.js')
        );
        this.fs.copyTpl(
            this.templatePath('index.html'),
            this.destinationPath('src/index.html'),
            { title: this.options.appname }
        );
        this.fs.copyTpl(
            this.templatePath('webpack.config.js'),
            this.destinationPath('webpack.config.js')
        );
    }
};