const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db.js');

const CANAL_PERMITIDO = '1461496157594189864';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ranking_mensal')
    .setDescription('Exibe o ranking mensal acumulado.'),

  async execute(interaction) {

    if (interaction.channelId !== CANAL_PERMITIDO) {
      return interaction.reply({
        content: `Este comando só pode ser usado no canal correto.`,
        ephemeral: true
      });
    }

    db.all(
      `SELECT user_id, cogumelo, semente, (cogumelo + semente) as total 
       FROM users_farm_monthly 
       ORDER BY total DESC 
       LIMIT 10`,
      [],
      async (err, rows) => {
        if (err) {
          console.error(err);
          return interaction.reply({ content: 'Erro ao consultar ranking mensal.', ephemeral: true });
        }

        if (!rows || rows.length === 0) {
          return interaction.reply({
            content: `Ainda não existem registros no ranking mensal.`,
            ephemeral: false
          });
        }

        let txt = '';
        let pos = 1;

        for (const r of rows) {
          const membro = await interaction.guild.members.fetch(r.user_id).catch(() => null);
          const nome = membro ? (membro.nickname || membro.user.username) : 'Usuário desconhecido';
          txt += `${pos}. **${nome}** — 🍄 ${r.cogumelo} | 🌱 ${r.semente} (Total: ${r.total})\n`;
          pos++;
        }

        const embed = new EmbedBuilder()
          .setColor('#e09522')
          .setTitle('Ranking Mensal Atual')
          .addFields({ name: 'Classificação', value: txt })
          .setTimestamp();

        return interaction.reply({ embeds: [embed], ephemeral: false });
      }
    );
  }
};
