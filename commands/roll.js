import { SlashCommandBuilder } from 'discord.js';
import SteamAPI from "steamapi";
import { readFile } from 'node:fs';
import config from '../config.json' with {type: 'json'};

const steam = new SteamAPI(config.steamApi);

const bannedGames = ["Cookie Clicker","Half-Life","Crossout", "Borderlands 2 RU",
    "Blender","Tom Clancy's Rainbow Six Siege - Test Server","Wallpaper Engine", "Wreckfest Throw-A-Santa + Sneak Peek 2.0"];

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
    .setName('roll')
    .setDescription('вибирає випадкову гру з бібліотеки')
    .addUserOption(user => user.setName('користувач')
        .setDescription('з ким пограти')
        .setRequired(false)
    );
export async function execute(interaction) {
    const target = interaction.user;
    const friendTarget = interaction.options.getUser('користувач');
    var friendGames;

    if (friendTarget !== null)
        try {
            getUserSteamId(friendTarget, async (url) => {

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

                    friendGames = steam.getUserOwnedGames(id, {includeAppInfo: true});
                });
            });
        }
        catch (e) {
            console.log(e);
        }

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

                var getGames = steam.getUserOwnedGames(id, {includeAppInfo: true});
                getGames.then(async (result) => {
                    var games = result;
                    games = games.filter(game => {
                        var banned = false;
                        bannedGames.forEach(bannedGame => {
                            if (game.game.name == bannedGame)
                                banned = true;
                        });
                        return !banned;
                        ;
                    });

                    if (friendTarget !== null) {
                        friendGames.then(async (result) => {
                            const friendGames = result;
                            var combinedGames = [];
                            friendGames.forEach(friendGame => {
                                games.forEach(game => {
                                    if (friendGame.game.name == game.game.name)
                                        combinedGames.push(game);
                                });
                            });
                            //console.log(combinedGames.map(game => { return game.name; }).toString());

                            const random = Math.floor(Math.random() * combinedGames.length);
                            const game = combinedGames[random];

                            var reply = ``;
                            reply += `Карти показують що ${target} з ${friendTarget} хочуть пограти у ${game.game.name}`;

                            await interaction.reply({ content: reply });
                        });
                    }
                    else {
                        const random = Math.floor(Math.random() * games.length);
                        const game = games[random];

                        var reply = ``;
                        reply += `Карти показують що ти хочеш пограти у ${game.game.name}`;

                        await interaction.reply({ content: reply });
                    }
                });
            });
        });
    }
    catch (e) {
        console.log(e);
    }
}