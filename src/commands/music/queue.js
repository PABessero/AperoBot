const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Lists the queue"),
  async execute(interaction) {
    let player = interaction.client.moon.players.get(interaction.guild.id);
    if (!player) {
      return interaction.reply({
        content: "Bot is not playing",
        ephemeral: true,
      });
    }
    if (!player.connected) {
      return interaction.reply({
        content: "Bot is not playing",
        ephemeral: true,
      });
    }
    console.log(player.queue.all);
    const queue = player.queue.all;
    let page = 0;
    let queuePart = queue.slice(0, 9);

    const queueEmbed = new EmbedBuilder()
      .setTitle(`Queue (${page + 1} / ${~~(queue.size / 10)}`)
      .setDescription(`Currently playing: **${player.current.title}**`)
      .setColor("#b734eb");
    for (const part of queuePart) {
      queueEmbed.addFields({ name: part.title, value: part.author });
    }
    interaction.reply({ embeds: [queueEmbed] });
  },
};
