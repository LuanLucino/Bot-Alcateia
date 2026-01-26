const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

// Abre o banco local
const db = new sqlite3.Database('./data/farm.db');

// Função util para pegar dados do ranking
function getWeeklyRanking(callback) {
    const query = `
        SELECT userId, username, weeklyTotal
        FROM ranks
        WHERE weeklyTotal > 0
        ORDER BY weeklyTotal DESC
    `;
    db.all(query, (err, rows) => {
        if (err) {
            console.error('[RANKING] Erro ao consultar o banco:', err);
            return callback([]);
        }
        callback(rows);
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ranking')
        .setDescription('Mostra o ranking semanal de farm completo.'),

    async execute(interaction) {
        await interaction.deferReply();

        getWeeklyRanking(async (rows) => {
            if (!rows || rows.length === 0) {
                return interaction.editReply('Nenhum dado registrado esta semana.');
            }

            // Top 3 destacado
            const top3 = rows.slice(0, 3);
            const resto = rows.slice(3);

            let descTop = '';
            top3.forEach((item, i) => {
                const medal = i === 0 ? '🏆' : i === 1 ? '🥈' : '🥉';
                descTop += `${medal} **${item.username}** — \`${item.weeklyTotal}\`\n`;
            });

            let descRest = '';
            resto.forEach((item, i) => {
                descRest += `**${i + 4}.** ${item.username} — \`${item.weeklyTotal}\`\n`;
            });

            const embed = new EmbedBuilder()
                .setTitle('Top Farm Semanal')
                .setColor('#5865F2') // azul gamer
                .setDescription('Ranking completo dos usuários que utilizaram o comando `/farm`.')
                .addFields(
                    { name: 'Top 3', value: descTop || 'Nenhum' },
                    { name: 'Demais Colocados', value: descRest || 'Nenhum' },
                )
                .setFooter({ text: 'Atualizado agora' })
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });
        });
    }
};
