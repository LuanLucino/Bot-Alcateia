const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db.js');

const CANAL_PERMITIDO = '1461496157594189864';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('farm')
    .setDescription('Registrar um farm com valores e imagem.')
    .addIntegerOption(option =>
      option
        .setName('cogumelo_azul')
        .setDescription('Quantidade de Cogumelo Azul.')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('semente_azul')
        .setDescription('Quantidade de Semente Azul.')
        .setRequired(true)
    )
    .addAttachmentOption(option =>
      option
        .setName('imagem')
        .setDescription('Anexe uma imagem referente ao farm.')
        .setRequired(true)
    ),

  async execute(interaction) {

    if (interaction.channelId !== CANAL_PERMITIDO) {
      return interaction.reply({
        content: `Este comando só pode ser usado no canal correto.`,
        ephemeral: true
      });
    }

    const membro = interaction.guild.members.cache.get(interaction.user.id);
    const nome = membro ? (membro.nickname || interaction.user.username) : interaction.user.username;

    const userId = interaction.user.id;
    const cogAdd = interaction.options.getInteger('cogumelo_azul');
    const semAdd = interaction.options.getInteger('semente_azul');
    const imagem = interaction.options.getAttachment('imagem');

    db.get(`SELECT * FROM users_farm WHERE user_id = ?`, [userId], (err, row) => {
      if (err) {
        console.error(err);
        return interaction.reply({ content: 'Erro ao acessar o banco de dados.', ephemeral: true });
      }

      if (row) {
        const newCog = row.cogumelo + cogAdd;
        const newSem = row.semente + semAdd;

        db.run(
          `UPDATE users_farm SET cogumelo = ?, semente = ? WHERE user_id = ?`,
          [newCog, newSem, userId]
        );

        enviarEmbed(interaction, nome, cogAdd, semAdd, newCog, newSem, imagem.url, false);

      } else {
        db.run(
          `INSERT INTO users_farm (user_id, cogumelo, semente) VALUES (?, ?, ?)`,
          [userId, cogAdd, semAdd]
        );

        enviarEmbed(interaction, nome, cogAdd, semAdd, cogAdd, semAdd, imagem.url, true);
      }
    });
  }
};

function enviarEmbed(interaction, nome, addCog, addSem, totalCog, totalSem, img, primeiroRegistro) {
  const embed = new EmbedBuilder()
    .setColor('#1d6dfa')
    .setTitle('Registro de Farm')
    .setDescription(primeiroRegistro ? 'Primeiro registro salvo no sistema.' : 'Valores cumulativos atualizados.')
    .addFields(
      {
        name: 'Cogumelo Azul',
        value: `🍄 Adicionado: **${addCog}**\nTotal: **${totalCog}**`,
        inline: true
      },
      {
        name: 'Semente Azul',
        value: `🌱 Adicionado: **${addSem}**\nTotal: **${totalSem}**`,
        inline: true
      }
    )
    .setImage(img)
    .setFooter({ text: `Registrado por ${nome}` })
    .setTimestamp();

  return interaction.reply({ embeds: [embed], ephemeral: false });
}
