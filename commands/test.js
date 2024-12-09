import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('test')
	.setDescription('ТЕСТОВА КОМАНДА');
export async function execute(interaction) {
	await interaction.reply({ content: 'ВИЙДИ ЗВІДСИ РОЗБІЙНИК', ephemeral: true });
}