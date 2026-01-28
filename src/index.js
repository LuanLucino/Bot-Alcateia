require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const db = require('./database/db.js');
const rankingAnnouncements = require('./utils/rankingAnnouncements.js');
const acaoSaldoAnnouncements = require('./modulo_acao_saldo/acaoSaldoAnnouncements.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

client.commands = new Collection();

// Carrega comandos da pasta commands (parte 1 - farm/ranking)
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

// Carrega comandos da pasta modulo_acao_saldo (parte 2 - ação/saldo)
const acaoPath = path.join(__dirname, 'modulo_acao_saldo');
const acaoFiles = fs.readdirSync(acaoPath).filter(f => f.endsWith('.js'));

for (const file of acaoFiles) {
  const command = require(path.join(acaoPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

client.once('ready', () => {
  console.log(`[ONLINE] Logado como ${client.user.tag}`);

  // inicia os cron jobs
  rankingAnnouncements(client);      // parte 1
  acaoSaldoAnnouncements(client);    // parte 2
});

client.on('interactionCreate', async (interaction) => {
  // Executa comandos normais
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      return interaction.reply({ content: 'Erro ao executar o comando.', ephemeral: true });
    }
  }

  // Listener para o modal de ação
  if (interaction.isModalSubmit() && interaction.customId === 'acaoModal') {
    const nome = interaction.fields.getTextInputValue('nome');
    const dia = interaction.fields.getTextInputValue('dia');
    const ganhos = parseInt(interaction.fields.getTextInputValue('ganhos'), 10);
    const imagem = interaction.fields.getTextInputValue('imagem');

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

    if (imagem) embed.setImage(imagem);

    return interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.DISCORD_TOKEN);
