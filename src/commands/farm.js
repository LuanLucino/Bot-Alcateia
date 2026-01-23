const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('farm')
    .setDescription('Farma recursos para você mesmo.'),

  async execute(interaction) {
    // Aqui você definirá a lógica de farm
    return interaction.reply(`Você farmou 1 ponto.`);
  }
};
