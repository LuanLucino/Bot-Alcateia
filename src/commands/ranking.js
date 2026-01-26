const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/farm.db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ranking')
        .setDescription('Mostra o ranking semanal'),

    async execute(interaction) {
        await interaction.deferReply();

        db.all(`
            SELECT user_id, cogumelo, semente
            FROM users_farm
            ORDER BY (cogumelo + semente) DESC
        `, [], (err, rows) => {
            if (err) {
                console.error(err);
                return interaction.editReply('Erro ao consultar ranking semanal.');
            }

            if (!rows || rows.length === 0) {
                return interaction.editReply('Nenhum dado registrado esta semana.');
            }

            let top = rows.map((r, i) => {
                const medal = i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
                return `${medal} <@${r.user_id}> — Cog: **${r.cogumelo}** | Sem: **${r.semente}**`;
            }).join('\n');

            const embed = new EmbedBuilder()
                .setTitle('RANKING SEMANAL')
                .setDescription(top)
                .setColor('#3498db')
                .setTimestamp()
                .setFooter({ text: 'Ranking semanal' });

            return interaction.editReply({ embeds: [embed] });
        });
    }
};
