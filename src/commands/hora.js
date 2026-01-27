const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hora')
    .setDescription('Mostra a hora atual do servidor e do Brasil.'),

  async execute(interaction) {
    const nowLocal = new Date();
    const nowSP = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'full',
      timeStyle: 'long'
    }).format(new Date());

    return interaction.reply(
      `**Hora local do servidor:** ${nowLocal.toISOString()}\n` +
      `**Hora em São Paulo:** ${nowSP}`
    );
  }
};
