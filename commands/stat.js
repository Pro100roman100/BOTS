const { SlashCommandBuilder } = require('discord.js');
const SteamAPI = require('steamapi');
const fs = require('node:fs');
const { steamApi } = require('C:\\UA_Rozvidka\\config.json');
const steam = new SteamAPI(steamApi);

const bannedGames = ["Cookie Clicker"];

async function getUserSteamId(userId, callback) {

    fs.readFile('C:\\UA_Rozvidka\\database.json', function (err, data) {
        if (err) throw err;

        endData = JSON.parse(data);

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

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stat')
		.setDescription('показує статистику гравця')
        .addUserOption( user =>
            user.setName('користувач')
			.setDescription('до кого примінити команду')
			.setRequired(true)
        ),
	async execute(interaction) {
		const target = interaction.options.getUser('користувач');
        
        try {
            getUserSteamId(target, async url => {

                if(url === null) {
                    await interaction.reply({
                        content: `Цей користувач не зареєстрований`,
                        ephemeral: true
                    })

                    return;
                }

                var idPromise = steam.resolve(url);

                idPromise.then(async result => {
                    const id = result;
                
                    var statPromise = steam.getUserRecentGames(id, 6);
                    statPromise.then(async result => {
                        const stat = result;

                        steam.getUserSummary(id).then(async summary => {
                        
                            var reply = ``;
                            if (stat.length == 0)
                                reply += `Гравець ${summary.nickname} за недавній час не задротив в нічого`;
                            else if (stat.length == 1)
                                reply += `Гравець ${summary.nickname} за недавній час задротив у \n`;
                            else if (stat.length > 1)
                                reply += `Гравець ${summary.nickname} найбільше за недавній час задротив у \n`;
    
                            let n = 0;
                            stat.forEach(element => {
                                isBanned = false;
                                bannedGames.forEach(game => {
                                    if (element.name == game)
                                        isBanned = true
                                });
                                if (!isBanned && n < 5) {
                                    n++;
                                    reply += `\n${element.name} (${Math.round(element.playTime2 / 6) / 10}год)${n == 5 ? "" : ", "}\n`;
                                }
                            });

                            await interaction.reply({ content: reply});
                        });
                    });
                });
            });
        }
        catch(e) {
            console.log(e);
        }
	},
};