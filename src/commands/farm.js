const { SlashCommandBuilder } = require('discord.js');
const db = require('../database/db.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('farm')
    .setDescription('Farma recursos para você mesmo.'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const now = new Date().toISOString();

    // Verificar se existe
    db.get(
      `SELECT farm_points FROM users WHERE user_id = ?`,
      [userId],
      (err, row) => {
        if (err) {
          console.error(err);
          return interaction.reply({ content: 'Erro no banco de dados.', ephemeral: true });
        }

        if (!row) {
          // Criar registro
          db.run(
            `INSERT INTO users (user_id, farm_points, updated_at) VALUES (?, ?, ?)`,
            [userId, 1, now],
            (errInsert) => {
              if (errInsert) {
                console.error(errInsert);
                return interaction.reply({ content: 'Erro ao registrar usuário.', ephemeral: true });
              }
              return interaction.reply(`Você farmou 1 ponto. Total: 1`);
            }
          );
        } else {
          // Atualizar existente
          const newTotal = row.farm_points + 1;
          db.run(
            `UPDATE users SET farm_points = ?, updated_at = ? WHERE user_id = ?`,
            [newTotal, now, userId],
            (errUpdate) => {
              if (errUpdate) {
                console.error(errUpdate);
                return interaction.reply({ content: 'Erro ao atualizar pontos.', ephemeral: true });
              }
              return interaction.reply(`Você farmou 1 ponto. Total: ${newTotal}`);
            }
          );
        }
      }
    );
  }
};
