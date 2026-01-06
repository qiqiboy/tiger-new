/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const path = require('path');
const chalk = require('chalk');
const stripAnsi = require('strip-ansi');
const codeFrame = require('@babel/code-frame').codeFrameColumns;
const table = require('text-table');

const cwd = process.cwd();

const emitErrorsAsWarnings = process.env.NODE_ENV === 'development' && process.env.ESLINT_NO_DEV_ERRORS === 'true';

function isError(message) {
    if (message.fatal || message.severity === 2) {
        return true;
    }
    return false;
}

function getRelativePath(filePath) {
    return path.relative(cwd, filePath);
}

function formatter(results) {
    let output = '\n';
    let hasErrors = false;
    let reportContainsErrorRuleIDs = false;
    let reportContainsWarnRuleIDs = false;
    let errorCount = 0;
    let warningCount = 0;
    let fixableCount = 0;

    results.forEach(result => {
        let messages = result.messages;
        let source = result.source;
        let filePath = result.filePath;
        if (messages.length === 0) {
            return;
        }

        errorCount += result.errorCount;
        warningCount += result.warningCount;
        fixableCount += result.fixableErrorCount + result.fixableWarningCount;

        messages = messages.map(message => {
            let messageType;
            if (isError(message) && !emitErrorsAsWarnings) {
                messageType = 'error';
                hasErrors = true;

                if (message.ruleId) {
                    reportContainsErrorRuleIDs = true;
                }
            } else {
                messageType = 'warn';

                if (message.ruleId) {
                    reportContainsWarnRuleIDs = true;
                }
            }

            let line = message.line || 0;
            if (message.column) {
                line += ':' + message.column;
            }
            let position = chalk.bold('Line ' + line + ':');

            let frame = '';

            if (filePath && message.message.indexOf(filePath) === -1 && source && message.line) {
                frame += '\n ';
                frame += chalk.gray(filePath + ':' + line) + '\n';
                frame += codeFrame(
                    source,
                    {
                        start: { line: message.line, column: message.column },
                        end: { line: message.endLine || message.line, column: message.endColumn || message.column }
                    },
                    { highlightCode: true, linesAbove: 1, linesBelow: 1 }
                );
            }

            return [
                '',
                position,
                messageType,
                message.message.replace(/\.$/, ''),
                chalk.underline(message.ruleId || ''),
                frame
            ];
        });

        // if there are error messages, we want to show only errors
        if (hasErrors) {
            messages = messages.filter(m => m[2] === 'error');
        }

        // add color to rule keywords
        messages.forEach((m, index) => {
            m[4] = m[2] === 'error' ? chalk.red(m[4]) : chalk.yellow(m[4]);

            if (index !== messages.length - 1) {
                // Avoid \n being ignored
                m[5] += chalk.gray('\n');
            }

            m.splice(2, 1);
        });

        let outputTable = table(messages, {
            align: ['l', 'l', 'l'],
            stringLength(str) {
                return stripAnsi(str).length;
            }
        });

        // print the filename and relative path
        output += `${getRelativePath(result.filePath)}\n`;

        // print the errors
        output += `${outputTable}\n\n`;
    });

    if (reportContainsErrorRuleIDs) {
        output += '搜索相关' + chalk.underline(chalk.red('关键词')) + '以了解更多关于错误产生的原因';
    } else if (reportContainsWarnRuleIDs) {
        output += '搜索相关' + chalk.underline(chalk.yellow('关键词')) + '以了解更多关于警告产生的原因';
    }

    output += chalk.grey(
        '（ESlint: ' +
            chalk.bold(errorCount) +
            '个错误，' +
            chalk.bold(warningCount) +
            '个警告，其中' +
            chalk.bold(fixableCount) +
            '个可自动修复）'
    );

    return output;
}

module.exports = formatter;
