const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('farm')
    .setDescription('Registrar farm semanal.')
    .addIntegerOption(opt =>
      opt.setName('cogumelo')
        .setDescription('Quantidade de cogumelos farmados')
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('semente')
        .setDescription('Quantidade de sementes farmadas')
        .setRequired(true)
    )
    .addAttachmentOption(opt =>
      opt.setName('imagem')
        .setDescription('Print do farm (obrigatório)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const cog = interaction.options.getInteger('cogumelo');
    const sem = interaction.options.getInteger('semente');
    const img = interaction.options.getAttachment('imagem');

    if (!img) {
      return interaction.reply({ content: 'É obrigatório enviar a imagem do farm.', ephemeral: true });
    }

    // Atualiza acumulado semanal
    db.run(`
      INSERT INTO users_farm (user_id, cogumelo, semente)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id)
      DO UPDATE SET
        cogumelo = cogumelo + ?,
        semente = semente + ?
    `,
    [userId, cog, sem, cog, sem],
    err => {
      if (err) {
        console.error(err);
        return interaction.reply({ content: 'Erro ao registrar o farm.', ephemeral: true });
      }

      // Opcional: salva histórico bruto
      db.run(`
        INSERT INTO farm_records (user_id, cogumelo, semente, data)
        VALUES (?, ?, ?, ?)
      `, [userId, cog, sem, Date.now()]);

      const embed = new EmbedBuilder()
        .setTitle('Farm Registrado')
        .setColor('#2ecc71')
        .setDescription(`O farm foi registrado com sucesso.`)
        .addFields(
          { name: 'Cogumelos 🍄', value: `\`${cog}\``, inline: true },
          { name: 'Sementes 🌱', value: `\`${sem}\``, inline: true }
        )
        .setImage('attachment://farm.png')
        .setFooter({ text: `Usuário: ${interaction.user.username}` })
        .setTimestamp();

      return interaction.reply({
        embeds: [embed],
        files: [{ attachment: img.url, name: 'farm.png' }]
      });
    });
  }
};
