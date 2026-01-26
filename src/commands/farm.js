const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const db = require('../database/db.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('farm')
    .setDescription('Registra farm com dois produtos.')
    .addNumberOption(opt =>
      opt.setName('cogumelo_azul')
        .setDescription('Quantidade de cogumelos azuis')
        .setRequired(true)
    )
    .addNumberOption(opt =>
      opt.setName('semente_azul')
        .setDescription('Quantidade de sementes azuis')
        .setRequired(true)
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const cogumelo = interaction.options.getNumber('cogumelo_azul');
    const semente = interaction.options.getNumber('semente_azul');

    if (
      cogumelo === null || semente === null ||
      isNaN(cogumelo) || isNaN(semente)
    ) {
      return interaction.reply({ content: 'Valores inválidos.', ephemeral: true });
    }

    // Exemplo de cálculo final (ajuste conforme quiser)
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

        // Enviar imagem ao final
        const file = new AttachmentBuilder('./src/assets/farm.png'); // coloque sua imagem neste caminho

        return interaction.reply({
          content:
            `Farm registrado.\n` +
            `Cogumelos Azuis: **${cogumelo}**\n` +
            `Sementes Azuis: **${semente}**\n\n` +
            `Total adicionado ao ranking: **R$ ${totalValor.toFixed(2)}**`,
          files: [file]
        });
      }
    );
  }
};
