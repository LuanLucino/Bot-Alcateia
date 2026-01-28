const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db.js');

const CARGO_GERENTE = '1423500266220687464';
const CARGO_GERAL = '1458804212942246070';
const CARGO_EXTRA = '1461476895567777813';
const CANAL_DINHEIRO_SUJO = '1465739674483036274';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ação')
    .setDescription('Registrar uma ação in-game'),

  async execute(interaction) {
    const canalId = interaction.channelId;
    const membro = interaction.member;

    if (canalId !== CANAL_DINHEIRO_SUJO) {
      return interaction.reply({ content: 'Este comando só pode ser usado no canal de dinheiro sujo.', ephemeral: true });
    }

    const temCargo = membro.roles.cache.has(CARGO_GERENTE) 
                  || membro.roles.cache.has(CARGO_GERAL) 
                  || membro.roles.cache.has(CARGO_EXTRA);
    if (!temCargo) {
      return interaction.reply({ content: 'Você não tem permissão para usar este comando.', ephemeral: true });
    }

    // Cria o modal
    const modal = new ModalBuilder()
      .setCustomId('acaoModal')
      .setTitle('Registrar Ação');

    const nomeInput = new TextInputBuilder()
      .setCustomId('nome')
      .setLabel('Nome da ação')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const diaInput = new TextInputBuilder()
      .setCustomId('dia')
      .setLabel('Dia da ação (DD/MM)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const ganhosInput = new TextInputBuilder()
      .setCustomId('ganhos')
      .setLabel('Ganhos (0 = derrota)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const imagemInput = new TextInputBuilder()
      .setCustomId('imagem')
      .setLabel('Link da imagem (URL)')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(nomeInput),
      new ActionRowBuilder().addComponents(diaInput),
      new ActionRowBuilder().addComponents(ganhosInput),
      new ActionRowBuilder().addComponents(imagemInput),
    );

    await interaction.showModal(modal);
  }
};
