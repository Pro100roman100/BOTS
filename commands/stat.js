import { SlashCommandBuilder } from 'discord.js';
import SteamAPI from "steamapi";
import { readFile } from 'node:fs';
import config from '../config.json' with {type: 'json'};
const steam = new SteamAPI(config.steamApi);

const bannedGames = ["Cookie Clicker"];

async function getUserSteamId(userId, callback) {

    readFile('./database.json', function (err, data) {
        if (err) throw err;

        var endData = JSON.parse(data);

        var found = false;
        endData.users.forEach(element => {
            if(Number(element.userId) == userId) {
                callback(element.steamId);

                found = true;
            }
        });

        if (!found)
            callback(null);
    });
}

export const data = new SlashCommandBuilder()
    .setName('stat')
    .setDescription('показує статистику гравця')
    .addUserOption(user => user.setName('користувач')
        .setDescription('до кого примінити команду')
        .setRequired(true)
    );
export async function execute(interaction) {
    const target = interaction.options.getUser('користувач');

    try {
        getUserSteamId(target, async (url) => {

            if (url === null) {
                await interaction.reply({
                    content: `Цей користувач не зареєстрований`,
                    ephemeral: true
                });

                return;
            }

            var idPromise = steam.resolve(url);

            idPromise.then(async (result) => {
                const id = result;

                var statPromise = steam.getUserRecentGames(id, 6);
                statPromise.then(async (result) => {
                    const stat = result;

                    steam.getUserSummary(id).then(async (summary) => {

                        var reply = ``;
                        if (stat.length == 0)
                            reply += `Гравець ${summary.nickname} за недавній час не задротив в нічого`;
                        else if (stat.length == 1)
                            reply += `Гравець ${summary.nickname} за недавній час задротив у \n`;
                        else if (stat.length > 1)
                            reply += `Гравець ${summary.nickname} найбільше за недавній час задротив у \n`;

                        let n = 0;
                        stat.forEach(element => {
                            let isBanned = false;
                            bannedGames.forEach(game => {
                                if (element.game.name == game)
                                    isBanned = true;
                            });
                            if (!isBanned && n < 5) {
                                n++;
                                reply += `\n${element.game.name} (${Math.round(element.recentMinutes / 6) / 10}год)${n == 5 ? "" : ", "}\n`;
                            }
                        });

                        await interaction.reply({ content: reply });
                    });
                });
            });
        });
    }
    catch (e) {
        console.log(e);
    }
}