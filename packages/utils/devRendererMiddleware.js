const path = require('path');
const fs = require('fs');
const Module = require('module');
const chalk = require('chalk');
const tmp = require('tmp');
const clearConsole = require('./clearConsole');

function devRendererMiddleware(paths, registerSourceMap, spinner) {
    Object.keys(console).forEach((name) => {
        const native = console[name];

        console[name] = (...args) => {
            spinner.clear();
            native(...args);
            spinner.render().start();
        };
    });

    function renderError(res, template, error) {
        res.status(500);
        res.send(template);

        clearConsole();
        console.log();
        spinner.fail(chalk.red('服务端渲染出现了异常:'));
        console.log();
        console.error(error);
    }

    const { appHtml, appNodeBuild, pageEntries, nodeEntries, nodePageEntries } = paths;

    return async (req, res, next) => {
        let cache = {};
        let { webpackStats, fs: memoryFs } = res.locals;
        let entryName = (req.path.split(/\/+/)[1] || 'index').replace(/\.html$/, '');
        let htmlEntryFile = path.join(appNodeBuild, `${entryName}.html`);

        if (!pageEntries[entryName] && !nodePageEntries[entryName]) {
            htmlEntryFile = path.join(appNodeBuild, path.basename(appHtml));
        }

        let indexHtmlTemplate = memoryFs.readFileSync(htmlEntryFile, 'utf8');
        let { name: indexPathname, fd } = tmp.fileSync();

        fs.writeSync(fd, indexHtmlTemplate, 0, 'utf8');

        let cleanup = () => {
            clearMemotyReuqireCache(cache);
            fs.close(fd);
        };

        let handleError = (error = 'Unknown Error') => {
            try {
                // Handle any errors by injecting the stack trace into the rendered
                // HTML.
                if (error && typeof error !== 'string') {
                    let indexHtml = indexHtmlTemplate
                        .replace(/%\w+%/g, '')
                        .replace(
                            '<body>',
                            `<body><pre style="position: relative; z-index: 999999; background: #fff; border: 5px solid red; outline: 5px solid #fff; margin: 5px; padding: 1rem;">${error.stack}</pre>`
                        );

                    renderError(res, indexHtml, error);
                } else {
                    next(error);
                }
            } finally {
                cleanup();
            }
        };

        try {
            let stats = webpackStats.toJson({
                all: false,
                assets: true,
                entrypoints: true
            });
            const node = stats.children[1];
            const jsEntryName = node.entrypoints[entryName]
                ? entryName
                : node.entrypoints.index
                ? 'index'
                : Object.keys(nodeEntries)[0];
            const nodeEntrypoints = node.entrypoints[jsEntryName].assets
                .filter((asset) => new RegExp(`${jsEntryName}\\.js$`).test(asset))
                .map((asset) => path.join(appNodeBuild, asset));

            // Find any source map files, and pass them to the calling app so that
            // it can transform any error stack traces appropriately.
            for (let { name } of node.assets) {
                let pathname = path.join(appNodeBuild, name);

                if (/\.map$/.test(pathname) && memoryFs.existsSync(pathname)) {
                    registerSourceMap(pathname, memoryFs.readFileSync(pathname, 'utf8'));
                }
            }

            const entryExport = requireFromFS(nodeEntrypoints[0], memoryFs, cache);
            const renderer = typeof entryExport === 'function' ? entryExport : entryExport.default;

            if (typeof renderer !== 'function') {
                throw new Error(`${nodeEntrypoints[0]} 必须导出一个renderer函数！`);
            }

            await renderer(indexPathname, req, res);

            cleanup();
        } catch (error) {
            handleError(error);
        }
    };
}

// Stubs the `require()` function within any evaluated code, so that entire
// bundles can be loaded from a memory FS like the one passed in by Webpack.
//
// Based on require-from-string
// MIT License, Copyright (c) Vsevolod Strukchinsky
// https://github.com/floatdrop/require-from-string/blob/d1575a49065eb7a49b86b4de963f04f1a14dfd60/index.js
function requireFromFS(absoluteFilename, fs, cache = {}) {
    if (typeof absoluteFilename !== 'string') {
        throw new Error(`[requireFromFS] filename must be a string, not ${typeof absoluteFilename}`);
    }

    let cached = cache[absoluteFilename];

    if (cached) {
        return cached.exports;
    }

    let moduleDirname = path.dirname(absoluteFilename);
    let moduleExtension = path.extname(absoluteFilename);
    let code = fs.readFileSync(absoluteFilename, 'utf8');

    if (typeof code !== 'string') {
        throw new Error(`[requireFromFS] code must be a string, not ${typeof code}`);
    }

    if (moduleExtension === '.json') {
        code = `module.exports = ${code}`;
    }

    let paths = Module._nodeModulePaths(moduleDirname);
    let parent = module.parent;
    let m = new Module(absoluteFilename, parent);

    m.filename = absoluteFilename;

    m.require = (filename) => {
        if (filename[0] === '.') {
            let resolvedFilename = m.require.resolve(filename);

            return requireFromFS(resolvedFilename, fs, cache);
        }

        return require(filename);
    };

    m.require.resolve = (filename) => {
        if (filename[0] === '.') {
            let resolvedFilename = path.resolve(moduleDirname, filename);

            if (fs.existsSync(resolvedFilename)) {
                return resolvedFilename;
            }

            throw new Error(`Cannot find module '${filename}'`);
        } else {
            return require.resolve(filename);
        }
    };

    m.paths = paths;
    m._compile(code, absoluteFilename);
    cache[absoluteFilename] = m;
    require.cache[absoluteFilename] = m;

    if (parent && parent.children) {
        parent.children.splice(parent.children.indexOf(m), 1);
    }

    return m.exports;
}

function clearMemotyReuqireCache(cache) {
    let keys = Object.keys(cache);

    for (let key of keys) {
        delete cache[key];
        delete require.cache[key];
    }
}

module.exports = devRendererMiddleware;
