const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timecheck')
    .setDescription('Mostra a hora atual do servidor.'),
  async execute(interaction) {
    const now = new Date();
    await interaction.reply(`Horário do servidor: **${now.toISOString()}**`);
  }
};
