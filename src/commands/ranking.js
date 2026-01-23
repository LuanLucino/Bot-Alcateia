const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const sqlite3 = require("sqlite3").verbose();
const path = require("node:path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ranking")
    .setDescription("Exibe o ranking separado de cogumelos e sementes."),

  async execute(interaction) {
    const db = new sqlite3.Database(path.join("data", "farm.db"));

    // Ranking de Cogumelos
    const rankingCog = await new Promise((resolve, reject) => {
      db.all(
        "SELECT user_id, cogumelo AS total FROM users_farm ORDER BY total DESC",
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Ranking de Sementes
    const rankingSem = await new Promise((resolve, reject) => {
      db.all(
        "SELECT user_id, semente AS total FROM users_farm ORDER BY total DESC",
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    const textoCog =
      rankingCog.length > 0
        ? rankingCog
            .map((row, i) => `**${i + 1}.** <@${row.user_id}> - ${row.total}`)
            .join("\n")
        : "Nenhum registro ainda.";

    const textoSem =
      rankingSem.length > 0
        ? rankingSem
            .map((row, i) => `**${i + 1}.** <@${row.user_id}> - ${row.total}`)
            .join("\n")
        : "Nenhum registro ainda.";

    const embedCog = new EmbedBuilder()
      .setTitle("Ranking de Cogumelos")
      .setDescription(textoCog)
      .setColor("Blue");

    const embedSem = new EmbedBuilder()
      .setTitle("Ranking de Sementes")
      .setDescription(textoSem)
      .setColor("Green");

    await interaction.reply({ embeds: [embedCog, embedSem], ephemeral: false });

    db.close();
  },
};
