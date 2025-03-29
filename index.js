/*
        Domain-Unchained, src of the discord bot, that uses gemini api to generate messages
        Copyright (C) 2025  BalazsManus

        This program is free software: you can redistribute it and/or modify
        it under the terms of the GNU Affero General Public License as
        published by the Free Software Foundation, either version 3 of the
        License, or (at your option) any later version.

        This program is distributed in the hope that it will be useful,
        but WITHOUT ANY WARRANTY; without even the implied warranty of
        MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
        GNU Affero General Public License for more details.

        You should have received a copy of the GNU Affero General Public License
        along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/


// async main thread hell yeah
async function main() {
    const log = require('./utils/betterLogs');
    log("Starting Domain-Unchained", 'info');
    global.dirname = __dirname;
    const initData = require('./utils/initData');
    await initData(); // init stuff that will be used by the bot

    require('./utils/webui'); // fire up webui
    // imports
    const {Events} = require("discord.js");
    const {promptLoader, model} = require('./initializers/geminiClient');
    const messageHandler = require('./eventHandlers/messageHandler');
    const checkForLegacyCommands = require('./eventHandlers/checkForLegacyCommands');
    const state = require('./initializers/state');
    const botReady = require('./functions/botReady');

    // initialize stuff inside async thingy
    let discordClientReady = false;
    const discordClient = require('./initializers/botClient');
    discordClient.once(Events.ClientReady, () => {
        discordClientReady = true;
    });
    // wait for client to finish auth
    while (!discordClientReady) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // announce commands to servers
    const announceCommands = require('./commands/setCommands');
    await announceCommands(discordClient);

    const geminiModel = await model();
    // ha jol megy minden akkor siman kiolvasom historyt statebol
    const generateHistory = require('./initializers/historyCreator');
    await generateHistory();

    global.geminiSession = promptLoader(geminiModel, state.history);

    await botReady(discordClient);

    discordClient.on(Events.MessageCreate, async message => {
        // noinspection JSUnresolvedReference
        await messageHandler(
            message,
            discordClient,
            global.geminiSession
        )

        await checkForLegacyCommands(
            message,
            discordClient
        )
    });

    discordClient.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;

        // noinspection JSUnresolvedReference
        const command = discordClient.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            // skizofrenias az intellijm, pont mint en
            // noinspection JSCheckFunctionSignatures,JSDeprecatedSymbols
            await interaction.reply({
                content: 'Nem sikerült futtatni a parancsot.',
                flags: [
                    "Ephemeral"
                ]
            });
        }
    });

}

main().then();