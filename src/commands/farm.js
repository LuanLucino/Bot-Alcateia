const { SlashCommandBuilder } = require('discord.js');
const db = require('../database/db.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('farm')
    .setDescription('Registrar farm semanal.')
    .addStringOption(opt =>
      opt.setName('cogumelo')
        .setDescription('Quantidade de cogumelos farmados')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('semente')
        .setDescription('Quantidade de sementes farmadas')
        .setRequired(true)
    )
    .addAttachmentOption(opt =>
      opt.setName('imagem')
        .setDescription('Print do farm (opcional)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const cog = interaction.options.getString('cogumelo');
    const sem = interaction.options.getString('semente');
    const img = interaction.options.getAttachment('imagem');

    // Salvar no ranking semanal
    db.run(`
      INSERT INTO users_farm (user_id, cogumelo, semente)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id)
      DO UPDATE SET
        cogumelo = cogumelo + ?,
        semente = semente + ?
    `,
    [userId, cog, sem, cog, sem],
    err => {
      if (err) {
        console.error(err);
        return interaction.reply({ content: 'Erro ao registrar.', ephemeral: true });
      }

      let texto = `Farm registrado com sucesso.\nCogumelos: **${cog}**\nSementes: **${sem}**`;

      if (img) {
        return interaction.reply({
          content: texto,
          files: [img.url]
        });
      } else {
        return interaction.reply(texto);
      }
    });
  }
};
