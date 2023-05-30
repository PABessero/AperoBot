const {
  Client,
  Collection,
  GatewayIntentBits,
  EmbedBuilder,
} = require("discord.js"); //importing discord.js library
const { MoonlinkManager } = require("moonlink.js");
const path = require("path"); // importing moonlink.js package
const fs = require("node:fs");
const { token } = require("./config.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
}); //creating a client for the bot

client.commands = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

//------- (package configuration) ----------//
client.moon = new MoonlinkManager(
  [
    {
      host: "localhost",
      port: 2333,
      secure: false,
      password: "youshallnotpass",
    },
  ],
  {
    /* Option */
  },
  (guild, sPayload) => {
    client.guilds.cache.get(guild).shard.send(JSON.parse(sPayload));
  }
);
client.moon.on("nodeCreate", (node) => {
  console.log(`${node.host} was connected`);
}); //emit to the console the node was connected to
client.moon.on("trackStart", async (player, track) => {
  const songEmbed = new EmbedBuilder().setTitle("Now Playing").addFields({
    name: track.title,
    value: track.author,
  });
  if (track.artworkUrl) {
    songEmbed.setImage(track.artworkUrl);
  }
  client.channels.cache.get(player.textChannel).send({ embeds: [songEmbed] }); //when the player starts it will send a message to the channel where the command was executed
});

client.on("ready", () => {
  client.moon.init(client.user.id); //initializing the package
});
client.on("raw", (data) => {
  client.moon.packetUpdate(data); //this will send to the package the information needed for the package to work properly
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.log(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

client.login(token).then(() => {
  // TODO: Check why application name is null
  console.log(`Bot logged in as ${client.application.name}`);
});
