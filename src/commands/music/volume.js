const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Set the volume on the bot side")
    .addIntegerOption((option) =>
      option
        .setName("volume")
        .setDescription("Volume in %")
        .setMinValue(0)
        .setMaxValue(100)
        .setRequired(true)
    ),
  async execute(interaction) {
    let player = interaction.client.moon.players.get(interaction.guild.id);
    let volume = interaction.options.getInteger("volume");

    if (!player.connected) {
      return interaction.reply({
        content: "Bot is not playing",
        ephemeral: true,
      });
    }

    if (player.voiceChannel !== interaction.member.voice.channel.id)
      return interaction.reply({
        content: `You are not in the same voice channel as the bot`,
        ephemeral: true,
      });

    if (!interaction.member.voice.channel)
      return interaction.reply({
        content: `You are not in a voice channel`,
        ephemeral: true,
      });

    await player.setVolume(volume);
    await interaction.reply({ content: `Set bot volume to ${volume}%` });
  },
};
