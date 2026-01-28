const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db.js');

const CARGO_GERENTE = '1423500266220687464';
const CARGO_GERAL = '1458804212942246070';
const CARGO_EXTRA = '1461476895567777813';
const CANAL_DINHEIRO_SUJO = '1465739674483036274';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ação')
    .setDescription('Registrar uma ação in-game')
    .addStringOption(opt =>
      opt.setName('nome')
        .setDescription('Nome da ação realizada')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('dia')
        .setDescription('Dia da ação (formato DD/MM)')
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('ganhos')
        .setDescription('Valor ganho na ação (0 = derrota)')
        .setRequired(true)
    )
    .addAttachmentOption(opt =>
      opt.setName('imagem')
        .setDescription('Foto do depósito (obrigatória se ganhos ≥ 1)')
        .setRequired(false) // ✅ deixa o campo visível no chat
    ),

  async execute(interaction) {
    const canalId = interaction.channelId;
    const membro = interaction.member;
    const nome = interaction.options.getString('nome');
    const dia = interaction.options.getString('dia');
    const ganhos = interaction.options.getInteger('ganhos');
    const imagem = interaction.options.getAttachment('imagem');

    // Verifica canal
    if (canalId !== CANAL_DINHEIRO_SUJO) {
      return interaction.reply({ content: 'Este comando só pode ser usado no canal de dinheiro sujo.', ephemeral: true });
    }

    // Verifica cargo
    const temCargo = membro.roles.cache.has(CARGO_GERENTE) 
                  || membro.roles.cache.has(CARGO_GERAL) 
                  || membro.roles.cache.has(CARGO_EXTRA);
    if (!temCargo) {
      return interaction.reply({ content: 'Você não tem permissão para usar este comando.', ephemeral: true });
    }

    // Verifica imagem obrigatória
    if (ganhos >= 1 && !imagem) {
      return interaction.reply({ content: 'Você precisa anexar uma imagem do depósito para registrar uma vitória.', ephemeral: true });
    }

    // Salva no banco
    db.run(`
      INSERT INTO acoes_registradas (user_id, nome, dia, ganhos, data)
      VALUES (?, ?, ?, ?, ?)
    `, [interaction.user.id, nome, dia, ganhos, Date.now()]);

    const embed = new EmbedBuilder()
      .setTitle('Ação Registrada')
      .setColor(ganhos >= 1 ? '#27ae60' : '#c0392b')
      .setDescription(`Ação registrada com sucesso.`)
      .addFields(
        { name: 'Nome da ação', value: nome, inline: true },
        { name: 'Dia', value: dia, inline: true },
        { name: 'Ganhos', value: `R$ ${ganhos}`, inline: true }
      )
      .setFooter({ text: `Registrado por: ${interaction.user.username}` })
      .setTimestamp();

    const resposta = { embeds: [embed] };

    if (ganhos >= 1 && imagem) {
      resposta.files = [{ attachment: imagem.url, name: 'acao.png' }];
      embed.setImage('attachment://acao.png');
    }

    return interaction.reply(resposta);
  }
};
//***// */