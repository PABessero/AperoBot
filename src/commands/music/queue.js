const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Lists the queue"),
  async execute(interaction) {
    let player = interaction.client.moon.players.get(interaction.guild.id);
    if (!player.connected) {
      return interaction.reply({
        content: "Bot is not playing",
        ephemeral: true,
      });
    }
    console.log(player.queue.all);
  },
};
