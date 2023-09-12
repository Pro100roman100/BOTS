const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('ТЕСТОВА КОМАНДА'),
	async execute(interaction) {
		await interaction.reply({ content: 'ВИЙДИ ЗВІДСИ РОЗБІЙНИК', ephemeral: true });
	},
};