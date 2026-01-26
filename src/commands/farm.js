const { SlashCommandBuilder } = require('discord.js');
const db = require('../db');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('farm')
    .setDescription('Adicionar valores de cogumelo e semente + imagem')
    .addNumberOption(opt =>
      opt.setName('cogumelo')
        .setDescription('Quantidade de cogumelo')
        .setRequired(true))
    .addNumberOption(opt =>
      opt.setName('semente')
        .setDescription('Quantidade de semente')
        .setRequired(true))
    .addAttachmentOption(opt =>
      opt.setName('imagem')
        .setDescription('Upload da imagem')
        .setRequired(true)),
    
  async execute(interaction) {
    const userId = interaction.user.id;
    const cogumelo = interaction.options.getNumber('cogumelo');
    const semente = interaction.options.getNumber('semente');
    const imagem = interaction.options.getAttachment('imagem');
    const timestamp = Date.now();

    if (!imagem.contentType.startsWith('image/')) {
      return interaction.reply({ content: 'Envie um arquivo de imagem válido.', ephemeral: true });
    }

    db.run(
      `INSERT INTO farm_records (user_id, cogumelo_azul, semente_azul, data)
       VALUES (?, ?, ?, ?)`,
      [userId, cogumelo, semente, timestamp],
      err => {
        if (err) {
          console.error('Erro ao salvar DB:', err);
          return interaction.reply('Erro ao registrar no banco de dados.');
        }

        const embed = {
          title: 'Registro de Farm',
          fields: [
            { name: 'Cogumelo Azul', value: String(cogumelo), inline: true },
            { name: 'Semente Azul', value: String(semente), inline: true }
          ],
          image: { url: imagem.url },
          color: 0x0099ff,
          footer: { text: `Registrado por ${interaction.user.username}` },
          timestamp: new Date()
        };

        interaction.reply({ embeds: [embed] });
      }
    );
  }
};
