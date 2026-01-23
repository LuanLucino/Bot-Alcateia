const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ranking')
    .setDescription('Exibe o ranking dos farms.')
    .addStringOption(option =>
      option
        .setName('tipo')
        .setDescription('Selecione o tipo de ranking')
        .setRequired(true)
        .addChoices(
          { name: 'Cogumelo Azul', value: 'cogumelo' },
          { name: 'Semente Azul', value: 'semente' }
        )
    ),

  async execute(interaction) {
    const tipo = interaction.options.getString('tipo');
    const coluna = tipo === 'cogumelo' ? 'cogumelo' : 'semente';
    const emoji = tipo === 'cogumelo' ? '🍄' : '🌱';
    const titulo = tipo === 'cogumelo' ? 'Ranking - Cogumelo Azul' : 'Ranking - Semente Azul';

    db.all(`SELECT user_id, ${coluna} FROM users_farm ORDER BY ${coluna} DESC LIMIT 10`, [], async (err, rows) => {
      if (err) {
        console.error(err);
        return interaction.reply({ content: 'Erro ao consultar o ranking.', ephemeral: true });
      }

      if (!rows || rows.length === 0) {
        return interaction.reply({
          content: `Ainda não existem registros para o ranking de **${tipo}**.`,
          ephemeral: false
        });
      }

      // Montar ranking formatado
      let rankingTexto = '';
      let pos = 1;

      for (const r of rows) {
        const user = await interaction.client.users.fetch(r.user_id).catch(() => null);
        const nome = user ? user.username : 'Usuário desconhecido';
        rankingTexto += `${pos}. ${emoji} **${nome}** — **${r[coluna]}**\n`;
        pos++;
      }

      const embed = new EmbedBuilder()
        .setColor('#1d6dfa')
        .setTitle(titulo)
        .setDescription('Top 10 maiores pontuações registradas.')
        .addFields({
          name: `Classificação`,
          value: rankingTexto
        })
        .setFooter({ text: `Solicitado por ${interaction.user.username}` })
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: false });
    });
  }
};
