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
        { name: '🌱 /farm', value: 'Executa o comando de farm (ganhos automáticos)', inline: false },
        { name: '🏆 /ranking', value: 'Mostra o ranking dos jogadores baseado nos ganhos', inline: false },
        { name: 'ℹ️ /ajuda', value: 'Exibe esta lista de comandos', inline: false },
        { name: '⚠️ Comandos exclusivos da gerência', value: 'Somente cargos de Gerência e acima podem usar:', inline: false },
        { name: '📌 /ação', value: 'Registrar uma ação in-game (nome, dia, ganhos, imagem opcional)', inline: false },
        { name: '💰 /saldo', value: 'Mostra o saldo acumulado das ações registradas', inline: false }
      )
      .setFooter({ text: 'Use os comandos no canal correto e com as permissões adequadas.' })
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
