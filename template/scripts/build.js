process.env.NODE_ENV = 'production';

require('dotenv').config({
    silent: true
});

var userDevConfig = process.argv[2] === '--dev';
var chalk = require('chalk');
var fs = require('fs-extra');
var path = require('path');
var filesize = require('filesize');
var gzipSize = require('gzip-size').sync;
var rimrafSync = require('rimraf').sync;
var webpack = require('webpack');
var config = require(userDevConfig ? './config/webpack.config.dev' : './config/webpack.config.prod');
var paths = require('./config/paths');
var checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
var recursive = require('recursive-readdir');
var stripAnsi = require('strip-ansi');

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
    process.exit(1);
}

if(userDevConfig) {
    config.output.publicPath = './';
}

// Input: /User/dan/app/build/static/js/main.82be8.js
// Output: /static/js/main.js
function removeFileNameHash(fileName) {
    return fileName
        .replace(paths.appBuild, '')
        .replace(/\/?(.*)(\.\w+)(\.js|\.css)/, (match, p1, p2, p3) => p1 + p3);
}

// Input: 1024, 2048
// Output: "(+1 KB)"
function getDifferenceLabel(currentSize, previousSize) {
    var FIFTY_KILOBYTES = 1024 * 50;
    var difference = currentSize - previousSize;
    var fileSize = !Number.isNaN(difference) ? filesize(difference) : 0;
    if (difference >= FIFTY_KILOBYTES) {
        return chalk.red('+' + fileSize);
    } else if (difference < FIFTY_KILOBYTES && difference > 0) {
        return chalk.yellow('+' + fileSize);
    } else if (difference < 0) {
        return chalk.green(fileSize);
    } else {
        return '';
    }
}

// First, read the current file sizes in build directory.
// This lets us display how much they changed later.
recursive(paths.appBuild, (err, fileNames) => {
    var previousSizeMap = (fileNames || [])
        .filter(fileName => /\.(js|css)$/.test(fileName))
        .reduce((memo, fileName) => {
            var contents = fs.readFileSync(fileName);
            var key = removeFileNameHash(fileName);
            memo[key] = gzipSize(contents);
            return memo;
        }, {});

    // Remove all content but keep the directory so that
    // if you're in it, you don't end up in Trash
    rimrafSync(paths.appBuild + '/*');

    // Start the webpack build
    build(previousSizeMap);

    // Merge with the public folder
    copyPublicFolder();
});

// Print a detailed summary of build files.
function printFileSizes(stats, previousSizeMap) {
    var assets = stats.toJson().assets
        .filter(asset => /\.(js|css)$/.test(asset.name))
        .map(asset => {
            var fileContents = fs.readFileSync(paths.appBuild + '/' + asset.name);
            var size = gzipSize(fileContents);
            var previousSize = previousSizeMap[removeFileNameHash(asset.name)];
            var difference = getDifferenceLabel(size, previousSize);
            return {
                folder: path.join('build', path.dirname(asset.name)),
                name: path.basename(asset.name),
                size: size,
                sizeLabel: filesize(size) + (difference ? ' (' + difference + ')' : '')
            };
        });
    assets.sort((a, b) => b.size - a.size);
    var longestSizeLabelLength = Math.max.apply(null,
        assets.map(a => stripAnsi(a.sizeLabel).length)
    );
    assets.forEach(asset => {
        var sizeLabel = asset.sizeLabel;
        var sizeLength = stripAnsi(sizeLabel).length;
        if (sizeLength < longestSizeLabelLength) {
            var rightPadding = ' '.repeat(longestSizeLabelLength - sizeLength);
            sizeLabel += rightPadding;
        }
        console.log(
            '  ' + sizeLabel +
            '  ' + chalk.dim(asset.folder + path.sep) + chalk.cyan(asset.name)
        );
    });
}

// Print out errors
function printErrors(summary, errors) {
    console.log(chalk.red(summary));
    console.log();
    errors.forEach(err => {
        console.log(err.message || err);
        console.log();
    });
}

// Create the production build and print the deployment instructions.
function build(previousSizeMap) {
    var startTime = Date.now();
    var ticks = 1;
    var timer
    var logProgress = function(){
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(chalk.yellow('已耗时：' + ((Date.now() - startTime) / 1000).toFixed(3) + 's ') + (new Array(ticks).join('+')));
        ticks++;

        timer = setTimeout(logProgress, 400);
    };

    console.log(userDevConfig ? '启动测试环境打包编译...' : '启动生产环境打包压缩...');
    console.log();
    webpack(config).run((err, stats) => {
        clearTimeout(timer);
        console.log();
        console.log();

        if (err) {
            printErrors('编译失败！', [err]);
            process.exit(1);
        }

        if (stats.compilation.errors.length) {
            printErrors('编译失败！', stats.compilation.errors);
            process.exit(1);
        }

        console.log(chalk.green('编译成功！'));
        console.log();

        console.log('gzip后可节省大小:');
        console.log();
        printFileSizes(stats, previousSizeMap);
        console.log();

        var publicPath = config.output.publicPath;
        console.log('项目打包完成，请确保资源已上传到：' + chalk.green(publicPath) + '.');
        console.log();
    });

    logProgress();
}

function copyPublicFolder() {
    fs.copySync(paths.appPublic, paths.appBuild, {
        dereference: true,
        filter: file => {
            var relative = path.relative(paths.appPublic, file);
            var dirname = path.relative(paths.appPublic, path.dirname(file));
            return !paths.pageEntries.find(name => name + '.html' === relative) && dirname !== 'layout';
        }
    });
}

