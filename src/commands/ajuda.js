const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ajuda')
    .setDescription('Lista todos os comandos disponíveis e suas descrições'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📖 Lista de Comandos')
      .setColor('#3498db')
      .setDescription('Aqui estão os comandos disponíveis no bot:')
      .addFields(
        // Comandos Farm
        { name: '🌱 /farm', value: 'Executa o comando de farm (ganhos automáticos)', inline: false },
        { name: '🏆 /ranking', value: 'Mostra o ranking dos jogadores baseado nos ganhos', inline: false },
        { name: 'ℹ️ /ajuda', value: 'Exibe esta lista de comandos', inline: false },

        // Exclusivos da gerência
        { name: '⚠️ Comandos exclusivos da gerência', value: 'Somente cargos de Gerência e acima podem usar:', inline: false },
        { name: '📌 /ação', value: 'Registrar uma ação in‑game (nome, dia, ganhos, imagem opcional)', inline: false },
        { name: '💰 /saldo', value: 'Mostra o saldo acumulado das ações registradas', inline: false },

        // Módulo Drogas
        { name: '💊 Módulo Drogas (meta semanal R$ 1.500.000)', value: 'Comandos abertos a todos os membros:', inline: false },
        { name: '📥 /dinheirodroga', value: 'Registrar depósito de dinheiro sujo vindo da venda de drogas (valor + imagem)', inline: false },
        { name: '📊 /saldodrogas', value: 'Mostra o saldo acumulado e progresso da meta semanal', inline: false },
        { name: '🏆 /rankingdroga', value: 'Exibe o ranking dos membros que mais farmaram drogas', inline: false }
      )
      .setFooter({ text: 'Use os comandos no canal correto e com as permissões adequadas.' })
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
