const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db.js');

const CANAL_DROGAS = '1465744204637667360';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dinheirodroga')
    .setDescription('Registrar depósito de dinheiro sujo vindo da venda de drogas')
    .addIntegerOption(opt =>
      opt.setName('valor')
        .setDescription('Valor do depósito (em R$)')
        .setRequired(true)
    )
    .addAttachmentOption(opt =>
      opt.setName('imagem')
        .setDescription('Foto do depósito (obrigatória)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const canalId = interaction.channelId;
    const membro = interaction.member;
    const valor = interaction.options.getInteger('valor');
    const imagem = interaction.options.getAttachment('imagem');

    // Verifica canal
    if (canalId !== CANAL_DROGAS) {
      return interaction.reply({ content: 'Este comando só pode ser usado no canal de drogas.', ephemeral: true });
    }

    // Verifica imagem obrigatória
    if (!imagem) {
      return interaction.reply({ content: 'Você precisa anexar uma imagem do depósito.', ephemeral: true });
    }

    // Salva no banco
    db.run(`
      INSERT INTO drogas_farmadas (user_id, valor, data)
      VALUES (?, ?, ?)
    `, [interaction.user.id, valor, Date.now()]);

    const embed = new EmbedBuilder()
      .setTitle('Depósito Registrado')
      .setColor('#2ecc71')
      .setDescription(`Depósito registrado com sucesso.`)
      .addFields(
        { name: 'Valor', value: `R$ ${valor.toLocaleString('pt-BR')}`, inline: true },
        { name: 'Usuário', value: `<@${interaction.user.id}>`, inline: true }
      )
      .setImage('attachment://deposito.png')
      .setFooter({ text: `Registrado por: ${interaction.user.username}` })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      files: [{ attachment: imagem.url, name: 'deposito.png' }]
    });
  }
};
