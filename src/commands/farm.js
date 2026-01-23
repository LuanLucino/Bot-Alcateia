const { SlashCommandBuilder } = require('discord.js');
const db = require('../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('farm')
    .setDescription('Registra seu farm somando ao total.')
    .addIntegerOption(option =>
      option.setName('cogumelo_azul')
        .setDescription('Quantidade farmada de cogumelo azul.')
        .setMinValue(0)
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('semente_azul')
        .setDescription('Quantidade farmada de semente azul.')
        .setMinValue(0)
        .setRequired(true)
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const cog = interaction.options.getInteger('cogumelo_azul');
    const sem = interaction.options.getInteger('semente_azul');

    db.get(`SELECT * FROM users_farm WHERE user_id = ?`, [userId], (err, row) => {
      if (err) {
        console.error(err);
        return interaction.reply('Erro ao acessar o banco de dados.');
      }

      if (!row) {
        // Se não existir cria
        db.run(
          `INSERT INTO users_farm (user_id, cogumelo, semente) VALUES (?, ?, ?)`,
          [userId, cog, sem],
          (err) => {
            if (err) {
              console.error(err);
              return interaction.reply('Erro ao registrar seu farm.');
            }
            return interaction.reply(`Novo registro criado.\nCogumelo Azul: ${cog}\nSemente Azul: ${sem}`);
          }
        );
      } else {
        // Se existir soma
        const newCog = row.cogumelo + cog;
        const newSem = row.semente + sem;

        db.run(
          `UPDATE users_farm SET cogumelo = ?, semente = ? WHERE user_id = ?`,
          [newCog, newSem, userId],
          (err) => {
            if (err) {
              console.error(err);
              return interaction.reply('Erro ao atualizar seu farm.');
            }

            return interaction.reply(
              `Farm atualizado.\nTotal atual:\nCogumelo Azul: ${newCog}\nSemente Azul: ${newSem}`
            );
          }
        );
      }
    });
  }
};
