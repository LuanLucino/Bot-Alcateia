const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('farm')
    .setDescription('Registra cogumelo + semente com imagem.')
    .addNumberOption(opt =>
      opt.setName('cogumelo_azul')
        .setDescription('Quantidade de cogumelo azul')
        .setRequired(true)
    )
    .addNumberOption(opt =>
      opt.setName('semente_azul')
        .setDescription('Quantidade de semente azul')
        .setRequired(true)
    )
    .addAttachmentOption(opt =>
      opt.setName('imagem')
        .setDescription('Imagem do farm')
        .setRequired(true)
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const cog = interaction.options.getNumber('cogumelo_azul');
    const sem = interaction.options.getNumber('semente_azul');
    const img = interaction.options.getAttachment('imagem');

    db.run(
      `INSERT INTO farm_records (user_id, cogumelo_azul, semente_azul, data)
       VALUES (?, ?, ?, ?)`,
      [userId, cog, sem, Date.now()],
      (err) => {
        if (err) {
          console.error(err);
          return interaction.reply({ content: 'Erro ao registrar o farm.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
          .setTitle('Farm Registrado')
          .addFields(
            { name: 'Cogumelo Azul', value: `${cog}`, inline: true },
            { name: 'Semente Azul', value: `${sem}`, inline: true }
          )
          .setImage(img.url)
          .setColor('Blue');

        interaction.reply({ embeds: [embed] });
      }
    );
  }
};
