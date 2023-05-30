const {SlashCommandBuilder} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the current song'),
    async execute(interaction) {
        let player = interaction.client.players.get(interaction.guild.id)
        if (!player.connected) {
            return interaction.reply({content: 'Bot is not playing', ephemeral: true})
        }
        if (!interaction.member.voice.channel) return interaction.reply({content: `You are not in a voice channel`, ephemeral: true})
        if (player.voiceChannel !== interaction.member.voice.channel.id) return interaction.reply({content: `You are not in the same voice channel as the bot`, ephemeral: true})
        if (player.queue.size < 1) return interaction.reply({content: `Queue is empty`, ephemeral: true})
        await player.skip().then((res) => {
            if (res) {
            return interaction.reply({content: `Skipped to next song`})}
            else {
                return interaction.reply({content: `Could not skip the song, please contact the bot author`, ephemeral: true})
            }
        })
    }
}