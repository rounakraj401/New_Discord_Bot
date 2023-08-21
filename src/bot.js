require("dotenv").config();
const axios = require("axios");
//import  OpenAIApi from 'openai';
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  organization: process.env.OPENAI_ORG,
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: ["CHANNEL", "MESSAGE", "REACTION"],
});

const PREFIX = "$";
client.on("ready", () => {
  console.log(`${client.user.tag} has logged in`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  else if(message.content.startsWith('#'))
  {
    try {
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {role: "system", content: "You are a helpful assistant who responds succinctly"},
            {role: "user", content: message.content}
        ],
      });

    const content = response.data.choices[0].message;
    return message.reply(content);

  } catch (err) {
    return message.reply(
      "As an AI robot, I errored out."
    );
  }
  }
   else if (message.content.startsWith(PREFIX)) {
    const [CMD_NAME, ...args] = message.content
      .trim()
      .substring(PREFIX.length)
      .split(/\s+/);

    if (CMD_NAME === "kick") {
      if (!message.member.permissions.has("KICK_MEMBERS"))
        return message.reply("You do not have permission to use that command");
      if (args.length === 0) return message.reply("Please provide an ID");
      const member = message.guild.members.cache.get(args[0]);
      if (member) {
        member
          .kick()
          .then((member) => message.channel.send(`${member} is kicked.`))
          .catch((err) =>
            message.channel.send(
              "I do not have permission to kick that user :("
            )
          );
      } else {
        message.channel.send("That member was not found");
      }
    } else if (CMD_NAME === "ban") {
      if (!message.member.permissions.has("BAN_MEMBERS"))
        return message.reply("You do not have permission to use that command");
      if (args.length === 0) return message.reply("Please provide an ID");
      try {
        const member = message.guild.members.cache.get(args[0]);
        if (member) {
          const user = await message.guild.members.ban(args[0]);
          message.channel.send("User banned succesfully");
          console.log(user);
        } else {
          message.channel.send("That member was not found");
        }
      } catch (err) {
        // console.log(err);
        message.channel.send("An error occured");
      }
    } else if (CMD_NAME === "inspire") {
      axios({
        method: "get",
        url: "https://api.api-ninjas.com/v1/quotes?category=happiness",
        headers: {
          "X-Api-Key": process.env.API_KEY,
        },
        contentType: "application/json",
      }).then((response) => {
        var data = response.data[0];
        message.channel.send(data.quote);
      });
    }
  }
});

client.login(process.env.DISCORDJS_BOT_TOKEN);
