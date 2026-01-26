const { SlashCommandBuilder } = require('discord.js');
const db = require('../database/db.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('farm')
    .setDescription('Registra farm com dois produtos e envia imagem.')
    .addNumberOption(opt =>
      opt.setName('cogumelo_azul')
        .setDescription('Quantidade de cogumelos azuis')
        .setRequired(true)
    )
    .addNumberOption(opt =>
      opt.setName('semente_azul')
        .setDescription('Quantidade de sementes azuis')
        .setRequired(true)
    )
    .addAttachmentOption(opt =>
      opt.setName('foto')
        .setDescription('Imagem referente ao farm')
        .setRequired(false)
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const cogumelo = interaction.options.getNumber('cogumelo_azul');
    const semente = interaction.options.getNumber('semente_azul');
    const foto = interaction.options.getAttachment('foto');

    if (
      cogumelo === null || semente === null ||
      isNaN(cogumelo) || isNaN(semente)
    ) {
      return interaction.reply({ content: 'Valores inválidos.', ephemeral: true });
    }

    // Ajuste o cálculo conforme sua regra
    const totalValor = (cogumelo * 1.5) + (semente * 2.0);

    db.run(
      `INSERT INTO users_farm (user_id, valor)
       VALUES (?, ?)
       ON CONFLICT(user_id)
       DO UPDATE SET valor = valor + ?`,
      [userId, totalValor, totalValor],
      async (err) => {
        if (err) {
          console.error(err);
          return interaction.reply({ content: 'Erro ao registrar seu farm.', ephemeral: true });
        }

        const texto =
          `Farm registrado.\n` +
          `Cogumelos Azuis: **${cogumelo}**\n` +
          `Sementes Azuis: **${semente}**\n\n` +
          `Total adicionado ao ranking: **R$ ${totalValor.toFixed(2)}**`;

        if (foto) {
          return interaction.reply({
            content: texto,
            files: [foto.url] // apenas envia a foto, não salva
          });
        } else {
          return interaction.reply(texto);
        }
      }
    );
  }
};
