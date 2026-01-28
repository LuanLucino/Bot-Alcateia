const { SlashCommandBuilder, EmbedBuilder, Collection } = require('discord.js');
const db = require('../database/db.js');

const CARGO_GERENTE = '1423500266220687464';
const CARGO_GERAL = '1458804212942246070';
const CARGO_EXTRA = '1461476895567777813';
const CANAL_DINHEIRO_SUJO = '1465739674483036274';

// Coleção temporária para guardar quem está aguardando imagem
const aguardandoImagem = new Collection();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ação')
    .setDescription('Registrar uma ação in-game')
    .addStringOption(opt =>
      opt.setName('nome').setDescription('Nome da ação realizada').setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('dia').setDescription('Dia da ação (formato DD/MM)').setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('ganhos').setDescription('Valor ganho na ação (0 = derrota)').setRequired(true)
    ),

  async execute(interaction) {
    const canalId = interaction.channelId;
    const membro = interaction.member;
    const nome = interaction.options.getString('nome');
    const dia = interaction.options.getString('dia');
    const ganhos = interaction.options.getInteger('ganhos');

    if (canalId !== CANAL_DINHEIRO_SUJO) {
      return interaction.reply({ content: 'Este comando só pode ser usado no canal de dinheiro sujo.', ephemeral: true });
    }

    const temCargo = membro.roles.cache.has(CARGO_GERENTE) 
                  || membro.roles.cache.has(CARGO_GERAL) 
                  || membro.roles.cache.has(CARGO_EXTRA);
    if (!temCargo) {
      return interaction.reply({ content: 'Você não tem permissão para usar este comando.', ephemeral: true });
    }

    // Salva no banco sem imagem
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

    await interaction.reply({ embeds: [embed] });

    // Se ganhos ≥ 1, pede a imagem
    if (ganhos >= 1) {
      await interaction.followUp({ content: 'Agora envie a imagem do depósito como resposta a esta mensagem.' });

      // Marca que este usuário está aguardando imagem
      aguardandoImagem.set(interaction.user.id, { nome, dia, ganhos });
    }
  }
};

// Listener para capturar attachments
module.exports.listenForImages = (client) => {
  client.on('messageCreate', async (message) => {
    if (!aguardandoImagem.has(message.author.id)) return;
    if (!message.attachments || message.attachments.size === 0) return;

    const dados = aguardandoImagem.get(message.author.id);
    const imagem = message.attachments.first();

    // Atualiza embed
    const embed = new EmbedBuilder()
      .setTitle('Ação Registrada com Imagem')
      .setColor('#27ae60')
      .setDescription(`Imagem anexada com sucesso.`)
      .addFields(
        { name: 'Nome da ação', value: dados.nome, inline: true },
        { name: 'Dia', value: dados.dia, inline: true },
        { name: 'Ganhos', value: `R$ ${dados.ganhos}`, inline: true }
      )
      .setImage(imagem.url)
      .setFooter({ text: `Registrado por: ${message.author.username}` })
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    // Remove da lista de espera
    aguardandoImagem.delete(message.author.id);
  });
};
