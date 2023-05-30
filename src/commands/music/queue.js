const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Lists the queue"),
  async execute(interaction) {
    let player = interaction.client.players.get(interaction.guild.id);
  },
};
