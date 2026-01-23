const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "ranking",
    description: "Mostra os rankings de cogumelo e semente",
    execute(client, message, args, db) {

        // Busca os dados no DB
        const cogumelos = db.get("cogumelos") || [];
        const sementes = db.get("sementes") || [];

        const rankCog = cogumelos
            .sort((a, b) => b.quantidade - a.quantidade)
            .map((item, index) => `**${index+1}.** <@${item.userId}> - ${item.quantidade}`)
            .join("\n");

        const rankSem = sementes
            .sort((a, b) => b.quantidade - a.quantidade)
            .map((item, index) => `**${index+1}.** <@${item.userId}> - ${item.quantidade}`)
            .join("\n");

        const embedCog = new EmbedBuilder()
            .setTitle("Ranking - Cogumelo")
            .setDescription(rankCog || "Nenhum registro ainda.")
            .setColor("Blue");

        const embedSem = new EmbedBuilder()
            .setTitle("Ranking - Semente")
            .setDescription(rankSem || "Nenhum registro ainda.")
            .setColor("Green");

        message.reply({ embeds: [embedCog, embedSem] });
    }
};
