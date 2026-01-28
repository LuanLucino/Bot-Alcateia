const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db.js');

const CANAL_VENDAS = '1465093834072391812';
const CARGO_GERENTE = '1423500266220687464';
const CARGO_GERAL   = '1458804212942246070';
const CARGO_EXTRA   = '1461476895567777813';

const VALOR_PACOTE = 35000;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('venda')
    .setDescription('Registrar venda de pacotes')
    .addIntegerOption(opt =>
      opt.setName('quantidade')
        .setDescription('Quantidade de pacotes vendidos')
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('passaporte')
        .setDescription('Número do passaporte')
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('desconto')
        .setDescription('Desconto aplicado (%)')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('dia')
        .setDescription('Dia da venda (DD/MM)')
        .setRequired(true)
    )
    .addAttachmentOption(opt =>
      opt.setName('imagem')
        .setDescription('Foto obrigatória do depósito')
        .setRequired(true)
    ),

  async execute(interaction) {
    const canalId = interaction.channelId;
    const membro = interaction.member;

    // Verifica canal
    if (canalId !== CANAL_VENDAS) {
      return interaction.reply({ content: 'Este comando só pode ser usado no canal de vendas.', ephemeral: true });
    }

    // Verifica cargos
    const permitido = [CARGO_GERENTE, CARGO_GERAL, CARGO_EXTRA].some(c => membro.roles.cache.has(c));
    if (!permitido) {
      return interaction.reply({ content: 'Você não tem permissão para usar este comando.', ephemeral: true });
    }

    await interaction.deferReply();

    const quantidade = interaction.options.getInteger('quantidade');
    const passaporte = interaction.options.getInteger('passaporte');
    const desconto   = interaction.options.getInteger('desconto');
    const dia        = interaction.options.getString('dia');
    const imagem     = interaction.options.getAttachment('imagem');

    // Cálculo do valor
    const valorBruto = quantidade * VALOR_PACOTE;
    const valorFinal = Math.round(valorBruto - (valorBruto * (desconto / 100)));

    // Salva no banco
    db.run(`
      INSERT INTO vendas_pacotes (user_id, quantidade, passaporte, desconto, valor, dia, data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [interaction.user.id, quantidade, passaporte, desconto, valorFinal, dia, Date.now()]);

    const embed = new EmbedBuilder()
      .setTitle('Venda Registrada')
      .setColor('#f1c40f')
      .setDescription(`Venda registrada com sucesso.`)
      .addFields(
        { name: 'Quantidade', value: `${quantidade}`, inline: true },
        { name: 'Passaporte', value: `${passaporte}`, inline: true },
        { name: 'Desconto', value: `${desconto}%`, inline: true },
        { name: 'Valor Final', value: `R$ ${valorFinal.toLocaleString('pt-BR')}`, inline: true },
        { name: 'Dia', value: dia, inline: true },
        { name: 'Usuário', value: `<@${interaction.user.id}>`, inline: true }
      )
      .setImage('attachment://venda.png')
      .setFooter({ text: `Registrado por: ${interaction.user.username}` })
      .setTimestamp();

    return interaction.editReply({
      embeds: [embed],
      files: [{ attachment: imagem.url, name: 'venda.png' }]
    });
  }
};
