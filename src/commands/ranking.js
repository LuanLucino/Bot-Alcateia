const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db.js');

const CANAL_PERMITIDO = '1461496157594189864';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ranking')
    .setDescription('Exibe o ranking combinado de Cogumelo Azul e Semente Azul.'),

  async execute(interaction) {

    if (interaction.channelId !== CANAL_PERMITIDO) {
      return interaction.reply({
        content: `Este comando só pode ser usado no canal correto.`,
        ephemeral: true
      });
    }

    db.all(
      `SELECT user_id, cogumelo, semente, (cogumelo + semente) as total 
       FROM users_farm 
       ORDER BY total DESC 
       LIMIT 10`,
      [],
      async (err, rows) => {
        if (err) {
          console.error(err);
          return interaction.reply({ content: 'Erro ao consultar o ranking.', ephemeral: true });
        }

        if (!rows || rows.length === 0) {
          return interaction.reply({
            content: `Ainda não existem registros para o ranking.`,
            ephemeral: false
          });
        }

        let textoRanking = '';
        let pos = 1;

        for (const r of rows) {
          const membro = await interaction.guild.members.fetch(r.user_id).catch(() => null);

          const nome = membro
            ? (membro.nickname || membro.user.username)
            : 'Usuário desconhecido';

          textoRanking += `${pos}. **${nome}** — 🍄 ${r.cogumelo} | 🌱 ${r.semente} (Total: ${r.total})\n`;

          pos++;
        }

        const embed = new EmbedBuilder()
          .setColor('#1d6dfa')
          .setTitle('Ranking Geral')
          .setDescription('Top 10 somando Cogumelo Azul + Semente Azul.')
          .addFields({
            name: 'Classificação',
            value: textoRanking
          })
          .setFooter({ text: `Solicitado por ${interaction.user.username}` })
          .setTimestamp();

        return interaction.reply({ embeds: [embed], ephemeral: false });
      }
    );
  }
};
