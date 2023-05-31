const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");

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

    if (player.queue.size === BigInt(0)) {
      return interaction.reply({
        content: "Queue is empty",
        ephemeral: true,
      });
    }
    const queue = player.queue.all;
    let page = 0;
    let maxPage = Math.ceil(queue.length / 10);
    let queuePart = queue.slice(0, 10);

    const firstPage = new ButtonBuilder()
      .setCustomId("firstPage")
      .setLabel("<<")
      .setStyle("Primary");

    const previousPage = new ButtonBuilder()
      .setCustomId("previousPage")
      .setLabel("<-")
      .setStyle("Primary");

    const nextPage = new ButtonBuilder()
      .setCustomId("nextPage")
      .setLabel("->")
      .setStyle("Primary");

    const lastPage = new ButtonBuilder()
      .setCustomId("lastPage")
      .setLabel(">>")
      .setStyle("Primary");

    if (page === 0) {
      // firstPage.setDisabled(true);
      previousPage.setDisabled(true);
    }

    if (page + 1 === maxPage) {
      nextPage.setDisabled(true);
      // lastPage.setDisabled(true);
    }

    const row = new ActionRowBuilder().addComponents(
      firstPage,
      previousPage,
      nextPage,
      lastPage
    );

    const queueEmbed = new EmbedBuilder()
      .setTitle(`Queue (${page + 1} / ${Math.ceil(queue.length / 10)})`)
      .setDescription(`Currently playing: **${player.current.title}**`)
      .setColor("#b734eb");
    for (const part of queuePart) {
      queueEmbed.addFields({ name: part.title, value: part.author });
    }

    if (maxPage === 0) {
      const response = await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Queue (0/0)")
            .setDescription(`Currently playing: **${player.current.title}**`),
        ],
      });
    }
    const response = await interaction.reply({
      embeds: [queueEmbed],
      components: [row],
    });

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 3_600_000,
    });

    collector.on("collect", async (i) => {
      console.log(i);
      const event = i.customId;
      switch (event) {
        case "firstPage":
          page = 0;
          break;
        case "previousPage":
          page -= 1;
          break;
        case "nextPage":
          page += 1;
          break;
        case "lastPage":
          page = maxPage - 1;
          break;
      }
      // firstPage.setDisabled(page === 0);
      previousPage.setDisabled(page === 0);
      nextPage.setDisabled(page + 1 === maxPage);
      lastPage.setDisabled(page + 1 === maxPage);

      queueEmbed
        .setFields()
        .setTitle(`Queue (${page + 1} / ${Math.ceil(queue.length / 10)})`)
        .setDescription(`Currently playing: **${player.current.title}**`);
      queuePart = queue.slice(page * 10, (page + 1) * 10);
      for (const part of queuePart) {
        queueEmbed.addFields({ name: part.title, value: part.author });
      }
      await response.edit({
        embeds: [queueEmbed],
        components: [row],
      });

      await collector.editReply({
        embeds: [queueEmbed],
        components: [row],
      });
    });
  },
};
