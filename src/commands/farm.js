const { SlashCommandBuilder, Attachment } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('farm')
    .setDescription('Registrar um farm com valores e imagem.')
    .addIntegerOption(option =>
      option
        .setName('cogumelo_azul')
        .setDescription('Quantidade de Cogumelo Azul.')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('semente_azul')
        .setDescription('Quantidade de Semente Azul.')
        .setRequired(true)
    )
    .addAttachmentOption(option =>
      option
        .setName('imagem')
        .setDescription('Anexe uma imagem referente ao farm.')
        .setRequired(true)
    ),

  async execute(interaction) {
    const cogumeloAzul = interaction.options.getInteger('cogumelo_azul');
    const sementeAzul = interaction.options.getInteger('semente_azul');
    const imagem = interaction.options.getAttachment('imagem');

    return interaction.reply({
      content:
        `Registro de farm recebido:\n` +
        `Cogumelo Azul: ${cogumeloAzul}\n` +
        `Semente Azul: ${sementeAzul}\n` +
        `Imagem: ${imagem.url}`,
      ephemeral: false
    });
  }
};
