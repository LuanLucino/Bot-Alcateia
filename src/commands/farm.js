const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('farm')
    .setDescription('Registro de farm do jogador.')
    .addIntegerOption(option =>
      option.setName('cogumelo_azul')
        .setDescription('Quantidade de cogumelo azul farmado.')
        .setMinValue(0)
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('semente_azul')
        .setDescription('Quantidade de semente azul farmada.')
        .setMinValue(0)
        .setRequired(true)
    )
    .addAttachmentOption(option =>
      option.setName('foto')
        .setDescription('Foto do farm (print do inventário).')
        .setRequired(false)
    ),

  async execute(interaction) {
    const cogumelo = interaction.options.getInteger('cogumelo_azul');
    const semente = interaction.options.getInteger('semente_azul');
    const foto = interaction.options.getAttachment('foto');

    let msg = `Farm registrado:\nCogumelo Azul: ${cogumelo}\nSemente Azul: ${semente}`;

    if (foto) {
      msg += `\nFoto: ${foto.url}`;
    }

    return interaction.reply(msg);
  }
};
