const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db.js');

const CANAL_DROGAS = '1465744204637667360';
const META_SEMANAL = 1500000;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('saldodrogas')
    .setDescription('Mostra o total farmado com pacotes de drogas'),

  async execute(interaction) {
    if (interaction.channelId !== CANAL_DROGAS) {
      return interaction.reply({ content: 'Este comando só pode ser usado no canal de drogas.', ephemeral: true });
    }

    await interaction.deferReply();

    db.all(`
      SELECT user_id, SUM(valor) AS total
      FROM drogas_farmadas
      GROUP BY user_id
      ORDER BY total DESC
    `, [], async (err, rows) => {
      if (err) {
        console.error(err);
        return interaction.editReply({ content: 'Erro ao consultar saldo.' });
      }

      if (!rows || rows.length === 0) {
        return interaction.editReply('Nenhum registro de farm de drogas encontrado.');
      }

      const totalGeral = rows.reduce((acc, r) => acc + r.total, 0);
      const progresso = ((totalGeral / META_SEMANAL) * 100).toFixed(1);

      const texto = rows.map((r, i) =>
        `${i+1}. <@${r.user_id}> — 💊 R$ ${r.total.toLocaleString('pt-BR')}`
      ).join("\n");

      const embed = new EmbedBuilder()
        .setTitle('SALDO DE DROGAS')
        .setDescription(`Meta semanal: **R$ 1.500.000**\nFarmado até agora: **R$ ${totalGeral.toLocaleString('pt-BR')}**\nProgresso: **${progresso}%**\n\n${texto}`)
        .setColor('#e74c3c')
        .setTimestamp()
        .setFooter({ text: 'Farm de drogas semanal' });

      return interaction.editReply({ embeds: [embed] });
    });
  }
};
