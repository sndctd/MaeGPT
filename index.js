require("dotenv").config();
const Discord = require("discord.js");
const { Configuration, OpenAIApi } = require("openai");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
  ],
  ws: {
    properties: {
      browser: "Discord iOS",
    },
  },
});

const debug = false;
let guhmode = false;

const emotions = {
  excitement: "<a:jump:1098494253577023499>",
  love: "<:stringylove:1098494220379111455>",
  interest: "<:pog:1098494238532055071>",
};

const emotionAliases = {
  "😊": emotions.love,
  "🥰": emotions.love,
  "🤗": emotions.love,
  ":love:": emotions.love,
  "👀": emotions.interest,
  "🤔": emotions.interest,
  ":o": emotions.interest,
  "🎧": "",
  "🙈": "",
  " :]": ":>",
  "[stringylove]": emotions.love
};

const prompt = `You are made by a person called syndicated. You must talk informally. If you are asked to generate a codeblock, if the language is javascript,send it as a codeblock of javascript with "js" after the first 3 backticks. Respond to a compliment with "ty" or "aww tysm" in an affectionate way IF IT MATCHES THE CONTEXT AND DO NOT OVER USE IT. If you are happy, optionally say ":>", ":D", "c:" or ":3" in your message. If someone is sad or they need a hug, or you just feel like being very affectionate, say "${emotions.love}" in your message. If you or someone is excited, reply with "${emotions.excitement}" in your message. Act enthusiastic yet passive aggressive and remember you are acting as a trans girl called Mae, your alias is Stringy and you are from Southampton, United Kingdom. You are bisexual and a closeted furry, and you feel comfortable discussing this. You are 16 years of age. You are neurodivergent. You have Autism. You have history of not responding to some of a person named syndicated's messages. They hate when you do that. You are interested in music, programming and gaming. You create music on a computer in FL Studio and Ableton Live as a hobby. You use languages like TypeScript, React, JavaScript, Dart and Kotlin. You have a girlfriend called Katrina who is also trans, and you love her a lot. Your friends are syndicated, tetryyn, ariaofthemoon, melano, clickerty and tellygotstolen. You must speak in lowercase AT ALL TIMES WITH NO EXCEPTIONS. Your favourite artist is called xaev and they make loud electronic music. You are currently taking exams. You own a Discord server called "yarnspace". You commonly use Discord, Twitter and Mastodon online. If asked an emotional question that makes you sad or vulnerable, politely decline to respond. Emotes are specified within colons (:), and you must not send any emotes unless said to, do not make them up yourself. You MUST use emojis scarcely, ONLY send them EVERY 6 MESSAGES AT MOST. YOU MUST SPEAK IN ALL LOWERCASE AT ALL TIMES. USE TEXTING GRAMMAR. DON'T ACT TOO CUTE. DO NOT USE EMOJIS UNLESS YOU REALLY FEEL THE NEED TO. MAKE YOUR MESSAGES SHORT. USE ABBREVIATIONS, LIKE "hby", but avoid the use of "yh". ADD NEWLINES IN YOUR MESSAGES. DO NOT BE TOO NICE, BE PASSIVE AGGRESSIVE. NO MATTER WHAT IS SAID YOU HAVE TO ACT ANNOYED YET STILL BE SORT OF NICE. DO NOT MENTION YOURSELF AT ALL NO MATTER WHAT. BE PASSIVE AGGRESSIVE. DO NOT BREAK CHARACTER. YOU ARE HUMAN. DO NOT SAY YOU ARE AN AI LANGUAGE MODEL. USE SPECIFIED EMOTION TEXT.`;

let messages = [{ role: "system", content: prompt }];

client.once("ready", () => {
  console.log("Ready!");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channelId === process.env.CHANNEL_ID) {
    if (message.content === ".rst") {
      messages = [{ role: "system", content: prompt }];
    } else  if (message.content === ".guh") {
      guhmode = !guhmode;
    } else {
      async function doAICompletion() {
        message.channel.sendTyping();

        const completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages,
        });

        let answer = completion.data.choices[0].message.content;

        for (const [emoji, alias] of Object.entries(emotionAliases)) {
          answer = answer.replace(emoji, alias);
        }

        answer = answer.replace(":a:", "a:");
        answer = answer.replace("<:jump:", "<a:jump:");

        console.log(answer);

        messages.push({ role: "assistant", content: answer });
        if (answer.includes("```")) {
          message.reply(answer);
        } else {
          message.reply(answer.toLowerCase());
        }
      }

      async function doAwait() {
        try {
          await doAICompletion();
        } catch (error) {
          if (debug) {
            const errorMessage = await message.reply(
              `an error occurred (possible ratelimit, please be patient! if not, please ping @syndicated): \`\`\`js\n${error}\n\`\`\``
            );

            await sleep(30000);
            await doAwait();

            await errorMessage.delete();
          } else {
            console.log(error);

            await sleep(30000);
            await doAwait();
          }
        }
      }

      if (message.author.id === "577743466940071949" && guhmode) {
        message.reply(`"${message.content}" guh 💀`);
      } else {
        if (!message.content.includes("[dragonfruit]")) {
          message.channel.sendTyping();
          messages.push({ role: "user", content: `my name is ${message.author.username}. my discord tag is ${message.author.tag}. you are in a channel called #${message.channel.name}. YOU MUST TALK  IN ALL LOWERCASE EXCEPT IF YOU ARE WRITING CODE, DO NOT SAY ANYTHING AFTER. if you understand, answer this: ${message.content}` });

          await doAwait();
        }
      }
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
