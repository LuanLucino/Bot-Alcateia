const { SlashCommandBuilder } = require('discord.js');
const db = require('../db');

function formatRanking(rows) {
  if (rows.length === 0) return 'Nenhum registro encontrado.';

  const medalhas = ['🥇', '🥈', '🥉'];

  return rows.map((r, i) => {
    const medalha = medalhas[i] || '•';
    return `${medalha} <@${r.user_id}> | Cogumelo: ${r.total_cog} | Semente: ${r.total_sem}`;
  }).join('\n');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ranking')
    .setDescription('Consultar rankings')
    .addStringOption(opt =>
      opt.setName('tipo')
        .setDescription('Escolha o tipo de ranking')
        .setRequired(true)
        .addChoices(
          { name: 'Semanal', value: 'semanal' },
          { name: 'Mensal', value: 'mensal' }
        )),

  async execute(interaction) {
    const tipo = interaction.options.getString('tipo');
    const now = new Date();
    let inicio;

    if (tipo === 'semanal') {
      const day = now.getDay();
      inicio = new Date(now);
      inicio.setDate(now.getDate() - day);
      inicio.setHours(0,0,0,0);
    } else {
      inicio = new Date(now.getFullYear(), now.getMonth(), 1, 0,0,0,0);
    }

    db.all(`
      SELECT user_id,
      SUM(cogumelo_azul) AS total_cog,
      SUM(semente_azul) AS total_sem
      FROM farm_records
      WHERE data >= ?
      GROUP BY user_id
      ORDER BY total_cog DESC, total_sem DESC
    `, [inicio.getTime()], (err, rows) => {

      if (err) {
        console.error(err);
        return interaction.reply('Erro ao consultar ranking.');
      }

      const embed = {
        title: `Ranking ${tipo === 'semanal' ? 'Semanal' : 'Mensal'}`,
        description: formatRanking(rows),
        color: 0xffcc00,
        timestamp: new Date()
      };

      interaction.reply({ embeds: [embed] });
    });
  }
};
