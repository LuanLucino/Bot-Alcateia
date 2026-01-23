const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

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

    const embed = new EmbedBuilder()
      .setColor('#1d6dfa') // Cor temática
      .setTitle('Registro de Farm') // Sem emoji
      .addFields(
        {
          name: 'Cogumelo Azul',
          value: `**${cogumeloAzul} unidades**`,
          inline: true
        },
        {
          name: 'Semente Azul',
          value: `**${sementeAzul} unidades**`,
          inline: true
        }
      )
      .setImage(imagem.url)
      .setFooter({
        text: `Registrado por ${interaction.user.username}`
      })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: false
    });
  }
};
