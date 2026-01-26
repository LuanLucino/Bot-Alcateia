const { SlashCommandBuilder } = require('discord.js');
const db = require('../database/db.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('farm')
    .setDescription('Registra o valor farmado na semana.')
    .addNumberOption(opt =>
      opt.setName('valor')
        .setDescription('Valor real farmado')
        .setRequired(true)
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const valor = interaction.options.getNumber('valor');

    db.run(
      `INSERT INTO users_farm (user_id, valor)
      VALUES (?, ?)
      ON CONFLICT(user_id)
      DO UPDATE SET valor = valor + ?`,
      [userId, valor, valor],
      (err) => {
        if (err) {
          console.error(err);
          return interaction.reply({ content: 'Erro ao registrar seu farm.', ephemeral: true });
        }
        return interaction.reply(`Registrado: R$ ${valor.toFixed(2)} no ranking semanal.`);
      }
    );
  }
};
