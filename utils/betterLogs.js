/*
        Domain-Unchained, src of the discord bot, that uses gemini api to generate messages
        Copyright (C) 2025 Anchietae
*/

const state = require('../initializers/state');

const logMeta = {
    "info": { symbol: "", cssClass: "log-info" },
    "infoWarn": { symbol: "⚠", cssClass: "log-info-warn" },
    "warn": { symbol: "⚠", cssClass: "log-warn" },
    "error": { symbol: "X", cssClass: "log-error" },
    "ignorableErr": { symbol: "..?", cssClass: "log-ignorable-err" }
};

// https://colors.sh/
const colors = {
    "info": "\u001b[38;5;33m",
    "infoWarn": "\u001b[38;5;16m\u001b[48;5;7m",
    "warn": "\u001b[38;5;208m",
    "error": "\u001b[38;5;15m\u001b[48;5;160m",
    "ignorableErr": "\u001b[38;5;16m\u001b[48;5;7m",
    // reserved
    "reset": "\u001b[0m"
};

const symbols = {
    "info": "",
    "infoWarn": "⚠",
    "warn": "⚠",
    "error": "X",
    "ignorableErr": "..?"
}

// köszönöm szépen gemini a segítséget, hogy hogy kell intellij function kommentet írni
/**
 * Szexin loggol konzolra.\
 * Csak azert csinaltam mert nem tetszett a console.log
 *
 * @param {string} message - üzenet
 * @param {string} [type="info"] - (`info`, `infoWarn`, `warn`, `error`, `ignorableErr`)
 * @param {string} [thread="index.js"] - forrás
 *
 * @example
 * log("szia"); // alap infó, ami "index.js"-ből "jön"
 * log("jaj ne", "warn"); // "index.js"-ből jövő warn
 * log("rósz hiba", "error", "kettospontharom.js"); // hiba specifikus forrásból
 */
function log(message, type = "info", thread = "index.js") {
    console.log(`\r\x1b[K${colors[type]}${symbols[type]}[${thread.toUpperCase()}]: ${message}${colors.reset}`);

    const timestamp = formatHour(new Date());
    const logEntry = {
        timestamp: timestamp,
        type: type,
        thread: thread.toUpperCase(),
        message: message,
        symbol: logMeta[type]?.symbol || '',
        cssClass: logMeta[type]?.cssClass || 'log-info'
    }
    state.logs.push(logEntry);
    if (state.logs.length > 100) {
        state.logs.shift();
    }
}

function formatHour(date) {
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    return `${hour}:${minute}`;
}

module.exports = log;