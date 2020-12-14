const Generator = require('yeoman-generator');

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);
    }

    install () {
        const pkgJson = {
            "name": "vue-app",
            "version": "1.0.0",
            "description": "",
            "main": "index.js",
            "scripts": {
                "test": "mocha --require @babel/register",
                "coverage": "nyc mocha",
                "build": "webpack"
            },
            "keywords": [],
            "author": "",
            "license": "ISC",
            "dependencies": {
            },
            "devDependencies": {
            }
        };
        this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);

        this.npmInstall(['vue'], { 'save-dev': false });
        this.npmInstall([
            '@babel/core', '@babel/preset-env', '@babel/register', 
            '@istanbuljs/nyc-config-babel', 'babel-loader', 'babel-plugin-istanbul', 
            'copy-webpack-plugin', 'css-loader', 'mocha', 'nyc', 'style-loader',
            'vue-loader', 'vue-style-loader', 'vue-template-compiler', 'webpack', 'webpack-cli'
        ], { 'save-dev': true });
    }

    copyfile () {
        this.fs.copyTpl(
            this.templatePath('index.html'),
            this.destinationPath('src/index.html')
        );
        this.fs.copyTpl(
            this.templatePath('Hello.vue'),
            this.destinationPath('src/Hello.vue')
        );
        this.fs.copyTpl(
            this.templatePath('main.js'),
            this.destinationPath('src/main.js')
        );

        this.fs.copyTpl(
            this.templatePath('webpack.config.js'),
            this.destinationPath('webpack.config.js')
        );
        this.fs.copyTpl(
            this.templatePath('babel.config.json'),
            this.destinationPath('babel.config.json')
        );
        this.fs.copyTpl(
            this.templatePath('.nyc'),
            this.destinationPath('.nyc')
        );

        this.fs.copyTpl(
            this.templatePath('test.js'),
            this.destinationPath('test/test.js')
        );
    }
};