const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('flip')
		.setDescription('Підкинути монету'),
	async execute(interaction) {
		await interaction.deferReply();

        var random;
        for(var i = 0; i < 10; i++){
            random += Math.random();
        }
        random /= 10;

        if(random < .5)
		    await interaction.editReply({ content: 'Випав орел'});
        else
		    await interaction.editReply({ content: 'Випала решка'});
	},
};