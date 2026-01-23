const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('farm')
    .setDescription('Registrar farm com imagem opcional.')
    .addIntegerOption(option => 
      option.setName('cogumelo_azul')
        .setDescription('Quantidade de Cogumelo Azul.')
        .setRequired(true)
    )
    .addIntegerOption(option => 
      option.setName('semente_azul')
        .setDescription('Quantidade de Semente Azul.')
        .setRequired(true)
    )
    .addAttachmentOption(option =>
      option.setName('imagem')
        .setDescription('Imagem do farm (cole com CTRL+V ou envie).')
        .setRequired(false)
    ),
    
  async execute(interaction) {
    const cog = interaction.options.getInteger('cogumelo_azul');
    const sem = interaction.options.getInteger('semente_azul');
    const img = interaction.options.getAttachment('imagem');

    let msg = `Farm registrado:\nCogumelo Azul: ${cog}\nSemente Azul: ${sem}`;

    if (img) {
      msg += `\nImagem anexada: ${img.url}`;
    }

    return interaction.reply(msg);
  }
};
