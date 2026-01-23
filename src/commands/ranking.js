const { SlashCommandBuilder } = require('discord.js');
const db = require('../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ranking')
    .setDescription('Mostra o ranking dos farmers'),

  async execute(interaction) {
    db.all(
      `SELECT user_id, farm_points FROM users ORDER BY farm_points DESC LIMIT 10`,
      (err, rows) => {
        if (err) {
          console.error(err);
          return interaction.reply('Erro ao consultar ranking.');
        }

        if (rows.length === 0) {
          return interaction.reply('Nenhum usuário farmou ainda.');
        }

        const formatted = rows
          .map((r, i) => `${i + 1}. <@${r.user_id}> — ${r.farm_points} pontos`)
          .join('\n');

        return interaction.reply(`Ranking:\n${formatted}`);
      }
    );
  }
};
