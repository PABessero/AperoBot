const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// TODO: Check why Playlist dont work

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Add a song to the queue")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Song Name or Link")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!interaction.member.voice.channel)
      return interaction.reply({
        content: `you are not on a voice channel`,
        ephemeral: true,
      });
    let query = interaction.options.getString("query");
    let player = interaction.client.moon.players.create({
      guildId: interaction.guild.id,
      voiceChannel: interaction.member.voice.channel.id,
      textChannel: interaction.channel.id,
      autoPlay: true,
    }); //creating a player
    if (!player.connected)
      player.connect({
        setDeaf: true,
        setMute: false,
      }); // if the player is not connected it will connect to the voice channel
    let res = await interaction.client.moon.search(query); // will do a search on the video informed in the query
    if (res.loadType === "LOAD_FAILED") {
      return interaction.reply({
        content: `:x: Load failed. `,
      }); //if there is an error when loading the tracks, it informs that there is an error
    } else if (res.loadType === "NO_MATCHES") {
      return interaction.reply({
        content: `:x: No matches!`,
      }); // nothing was found
    }
    if (res.loadType === "PLAYLIST_LOADED") {
      interaction.reply({
        content: `${res.playlistInfo.name} this playlist has been added to the waiting list`,
      });
      for (const track of res.tracks) {
        //if it's a playlist it will merge all the tracks and add it to the queue
        player.queue.add(track);
      }
    } else {
      player.queue.add(res.tracks[0]);
      const songEmbed = new EmbedBuilder().setTitle("Added").addFields({
        name: res.tracks[0].title,
        value: res.tracks[0].author,
      });
      interaction.reply({
        embeds: [songEmbed],
      });
    }
    if (!player.playing) await player.play();
  },
};
