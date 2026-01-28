const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db.js');

const CARGO_GERENTE = '1423500266220687464';
const CARGO_GERAL = '1458804212942246070';
const CANAL_DINHEIRO_SUJO = '1465739674483036274';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('saldo')
    .setDescription('Mostra o saldo acumulado das ações'),

  async execute(interaction) {
    const canalId = interaction.channelId;
    const membro = interaction.member;

    // Verifica canal
    if (canalId !== CANAL_DINHEIRO_SUJO) {
      return interaction.reply({ content: 'Este comando só pode ser usado no canal de dinheiro sujo.', ephemeral: true });
    }

    // Verifica cargo
    const temCargo = membro.roles.cache.has(CARGO_GERENTE) || membro.roles.cache.has(CARGO_GERAL);
    if (!temCargo) {
      return interaction.reply({ content: 'Você não tem permissão para usar este comando.', ephemeral: true });
    }

    // Consulta saldo acumulado
    db.all(`
      SELECT user_id, SUM(ganhos) AS total
      FROM acoes_registradas
      GROUP BY user_id
      ORDER BY total DESC
    `, [], async (err, rows) => {
      if (err) {
        console.error(err);
        return interaction.reply({ content: 'Erro ao consultar saldo.', ephemeral: true });
      }

      if (!rows || rows.length === 0) {
        return interaction.reply('Nenhum registro de ações encontrado.');
      }

      const texto = rows.map((r, i) => {
        return `${i+1}. <@${r.user_id}> — 💰 **R$ ${r.total}**`;
      }).join("\n");

      const embed = new EmbedBuilder()
        .setTitle('SALDO ACUMULADO')
        .setDescription(texto)
        .setColor('#f1c40f')
        .setTimestamp()
        .setFooter({ text: 'Saldo acumulado das ações' });

      return interaction.reply({ embeds: [embed] });
    });
  }
};
