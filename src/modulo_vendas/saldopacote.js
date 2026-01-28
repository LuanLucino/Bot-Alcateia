const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db.js');

const CANAL_VENDAS = '1465093834072391812';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('saldopacote')
    .setDescription('Mostra o saldo acumulado das vendas de pacotes'),

  async execute(interaction) {
    if (interaction.channelId !== CANAL_VENDAS) {
      return interaction.reply({ content: 'Este comando só pode ser usado no canal de vendas.', ephemeral: true });
    }

    await interaction.deferReply();

    db.all(`
      SELECT user_id, SUM(valor) AS total
      FROM vendas_pacotes
      GROUP BY user_id
      ORDER BY total DESC
    `, [], async (err, rows) => {
      if (err) {
        console.error(err);
        return interaction.editReply({ content: 'Erro ao consultar saldo de pacotes.' });
      }

      if (!rows || rows.length === 0) {
        return interaction.editReply('Nenhuma venda registrada.');
      }

      const totalGeral = rows.reduce((acc, r) => acc + r.total, 0);

      const texto = rows.map((r, i) =>
        `${i+1}. <@${r.user_id}> — 📦 R$ ${r.total.toLocaleString('pt-BR')}`
      ).join("\n");

      const embed = new EmbedBuilder()
        .setTitle('SALDO DE PACOTES')
        .setDescription(`Total geral: **R$ ${totalGeral.toLocaleString('pt-BR')}**\n\n${texto}`)
        .setColor('#27ae60')
        .setTimestamp()
        .setFooter({ text: 'Saldo acumulado de vendas de pacotes' });

      return interaction.editReply({ embeds: [embed] });
    });
  }
};
