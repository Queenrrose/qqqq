const express = require("express");
const app = express();
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const os = require("os");
const {
  Client,
  Collection,
  Partials,
  GatewayIntentBits,
  EmbedBuilder,
} = require("discord.js");
const config = require("./config.json");
const { createLogger, transports, format } = require("winston");
const { MessageEmbed } = require("discord.js");
const path = require("path");
const fs = require("fs");
const logger = createLogger({
  level: "error",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({
      filename: path.join(__dirname, "Logs", "Errors.json"),
    }),
  ],
});

//====================================

app.get("/", (req, res) => {
  res.send("Hello Express app!");
});

app.listen(3000, () => {
  console.log("server started");
});

app.post("/uptime_devtools", (req, res) => {
  console.log("uptime is run by Developer tools");
  res.send({
    msg: "done uptime",
    access: "by_devtools",
  });
});

app.get("/", function (request, response) {
  response.sendFile(__dirname + "/index.html");
});

app.use("/ping", (req, res) => {
  res.send(new Date());
});

app.listen(9080, () => {
  console.log("Express is ready.".blue.bold);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    //GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Reaction,
    Partials.GuildScheduledEvent,
    Partials.User,
    Partials.ThreadMember,
  ],
  shards: "auto",
  allowedMentions: {
    parse: [],
    repliedUser: false,
  },
});

client.setMaxListeners(25);
require("events").defaultMaxListeners = 25;

client.on("error", (error) => {
  console.error("Discord.js error:", error);
  logger.error("Discord.js error:", error);
});

client.on("warn", (warning) => {
  console.warn("Discord.js warning:", warning);
});

let antiCrashLogged = false;

process.on("unhandledRejection", (reason, p) => {
  if (!antiCrashLogged) {
    console.error("[antiCrash] :: Unhandled Rejection/Catch");
    console.error(reason, p);
    logger.error("[antiCrash] :: Unhandled Rejection/Catch", { reason, p });
    antiCrashLogged = true;
  }
});

process.on("uncaughtException", (err, origin) => {
  if (!antiCrashLogged) {
    console.error("[antiCrash] :: Uncaught Exception/Catch");
    console.error(err, origin);
    logger.error("[antiCrash] :: Uncaught Exception/Catch", { err, origin });
    antiCrashLogged = true;
  }
});

process.on("uncaughtExceptionMonitor", (err, origin) => {
  if (!antiCrashLogged) {
    console.error("[antiCrash] :: Uncaught Exception/Catch (MONITOR)");
    console.error(err, origin);
    logger.error("[antiCrash] :: Uncaught Exception/Catch (MONITOR)", {
      err,
      origin,
    });
    antiCrashLogged = true;
  }
});

module.exports = client;
client.commands = new Collection();
client.events = new Collection();
client.slashCommands = new Collection();
["commands", "events", "slash"].forEach((handler) => {
  require(`./handlers/${handler}`)(client);
});

const commands = client.slashCommands.map(({ execute, ...data }) => data);

// Register slash commands

setTimeout(() => {
  if (!client || !client.user) {
    console.log("Client Not Login, Process Kill");
    process.kill(1);
  } else {
    console.log("Client Login");
  }
}, 5 * 1000 * 60);

client
  .login(config.token || process.env.token)
  .then((bot) => {
    const rest = new REST({ version: "9" }).setToken(
      config.token || process.env.token
    );
    rest
      .put(Routes.applicationCommands(config.clientID), { body: commands })
      .then(() =>
        console.log("Successfully registered application commands globally.")
      )
      .catch(console.error);
  })
  .catch((err) => {
    console.log(err.message);
  });

let commandCount = 0;
let messageCount = 0;
let lastRestart = new Date().toLocaleString();
let unansweredMessages = 0;

/// إضافة الأمر والاستجابة له
client.on("messageCreate", async (message) => {
  messageCount++;

  if (message.author.id !== "1205174578641502208") return; // استبدال YOUR_SPECIFIC_USER_ID بالمعرف الخاص بالشخص المحدد
  if (!message.content.startsWith(config.prefix)) {
    unansweredMessages++;
    return;
  }

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  commandCount++;

  if (command === "stu") {
    let botVoiceChannelsCount = 0;
    let adminGuildsCount = 0;
    let textChannelsCount = 0;
    let voiceChannelsCount = 0;

    const updateStatus = async () => {
      // Reset counts
      botVoiceChannelsCount = 0;
      adminGuildsCount = 0;
      textChannelsCount = 0;
      voiceChannelsCount = 0;

      // Count the number of voice channels the bot is in across all guilds
      client.guilds.cache.forEach((guild) => {
        if (
          guild.members.cache
            .get(client.user.id)
            //.permissions.has("ADMINISTRATOR")
        ) {
          adminGuildsCount++;
        }
        guild.channels.cache.forEach((channel) => {
          if (channel.type === 2) {
            // Voice Channel
            voiceChannelsCount++;
            if (channel.members.has(client.user.id)) {
              botVoiceChannelsCount++;
            }
          }
          if (channel.type === 0) {
            // Text Channel
            textChannelsCount++;
          }
        });
      });

      // Bot uptime
      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor(uptime / 3600) % 24;
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      // Memory usage
      const memoryUsage = process.memoryUsage();
      const memoryUsageMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);

      // Number of users interacting with the bot
      const uniqueUsers = new Set();
      client.guilds.cache.forEach((guild) => {
        guild.members.cache.forEach((member) => {
          if (!member.user.bot) {
            uniqueUsers.add(member.user.id);
          }
        });
      });

      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setThumbnail(
          "https://cdn.discordapp.com/attachments/1239022770285711380/1251067315299155989/381fc22221df76b0d827e1d253d11060.gif?ex=666d3abb&is=666be93b&hm=68efe5d33b9fc55fb7f6dc643cf850f16da3af490b22692ef672389289516d71&"
        )
        .setTitle("Bot status")
        .setImage(
          "https://cdn.discordapp.com/attachments/1239022770285711380/1251067854791512125/183fb7dc262236a6d33603cf53b3759b.gif?ex=666d3b3c&is=666be9bc&hm=c6ba19aab7d1decbe2efd80181641b8984055ad19e317ac14378dcb909a5a24b&"
        )
        .setDescription(
          `**Bot Name:** ${client.user.username}\n**Number of Guilds:** ${client.guilds.cache.size}\n**Number of Voice Channels Bot is in:** ${botVoiceChannelsCount}\n**Number of Text Channels:** ${textChannelsCount}\n**Number of Voice Channels:** ${voiceChannelsCount}\n**Number of Admin Guilds:** ${adminGuildsCount}\n**Number of Unique Users:** ${uniqueUsers.size}\n**Uptime:** ${days}d ${hours}h ${minutes}m ${seconds}s\n**Memory Usage:** ${memoryUsageMB} MB\n**Commands Executed:** ${commandCount}\n**Messages Received:** ${messageCount}\n**Unanswered Messages:** ${unansweredMessages}\n**Last Restart:** ${lastRestart}`
        );
      
      return embed;
    };

    const sendAndUpdateEmbed = async () => {
      const embed = await updateStatus();
      const sentMessage = await message.channel.send({ embeds: [embed] });

      // تحديث الـ embed كل 30 ثانية
      setInterval(async () => {
        const newEmbed = await updateStatus();
        sentMessage.edit({ embeds: [newEmbed] }).catch(console.error);
      }, 10000);
    };

    sendAndUpdateEmbed();

    message.delete().catch(console.error); // حذف الرسالة المستخدمة لتنفيذ الأمر
//========kill=========
  
} else if (command === "kill" && message.author.id === "1205174578641502208") {
    const maintenanceEmbed = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle("Maintenance Alert!")
      .setDescription(
        "The bot is undergoing maintenance. The bot will be suspended for further updates."
      )
      .setTimestamp();

    const channelsData = require("./channel.js");

    channelsData.forEach((data) => {
      const guild = client.guilds.cache.get(data.serverID);
      if (guild) {
        const channel = guild.channels.cache.get(data.channelID);
        if (channel && channel.isTextBased()) {
          channel.send({ embeds: [maintenanceEmbed] }).catch(console.error);
      message.delete().catch(console.error);
          
        }
      }
    });
//========update=========
    
  } else if (
    command === "update" &&
    message.author.id === "1205174578641502208"
  ) {
    const maintenanceEmbed = new EmbedBuilder()
      .setColor("#243ca6")
      .setTitle(`What's new?`)
      .setDescription(
        `1- Fix some problems\n2- Add some new commands\n3- He greets you`
      )
      .setTimestamp();

    const channelsData = require("./channel.js");

    channelsData.forEach((data) => {
      const guild = client.guilds.cache.get(data.serverID);
      if (guild) {
        const channel = guild.channels.cache.get(data.channelID);
        if (channel && channel.isTextBased()) {
          channel.send({ embeds: [maintenanceEmbed] }).catch(console.error);
      message.delete().catch(console.error);
          
        }
      }
    });
    
//========NOTE=========
      } else if (
    command === "note" &&
    message.author.id === "1205174578641502208"
  ) {
    const noteEmbed = new EmbedBuilder()
      .setColor("#91a832")
      .setTitle(`NOTE ⚠`)
      .setDescription(
        `1- Please re-enter the bot to the voice channel\n2- Reset the log channel for bot updates\n3- Check the latest orders through the help command`
      )
      .setTimestamp();

    const channelsData = require("./channel.js");

    channelsData.forEach((data) => {
      const guild = client.guilds.cache.get(data.serverID);
      if (guild) {
        const channel = guild.channels.cache.get(data.channelID);
        if (channel && channel.isTextBased()) {
          channel.send({ embeds: [noteEmbed] }).catch(console.error);
      message.delete().catch(console.error);
          
        }
      }
    });

        
        
        
        


//========REMEMBER=========
  
        
        
    } else if (
    command === "rem" &&
    message.author.id === "1205174578641502208"
  ) {
    const rememberEmbed = new EmbedBuilder()
      .setColor("#91a632")
      .setTitle(`remember !`)
      .setDescription(
        `1- Please re-enter the bot to the voice channel\n2- Reset the log channel for bot updates\n3- Check the latest orders through the help command`
      )
      .setTimestamp();

    const channelsData = require("./channel.js");

    channelsData.forEach((data) => {
      const guild = client.guilds.cache.get(data.serverID);
      if (guild) {
        const channel = guild.channels.cache.get(data.channelID);
        if (channel && channel.isTextBased()) {
          channel.send({ embeds: [rememberEmbed] }).catch(console.error);
      message.delete().catch(console.error);
          
        }
      }
    });
//========res=========
      
  } else if (
    command === "res" &&
    message.author.id === "1205174578641502208"
  ) {
    const restartEmbed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("Restart Alert!")
      .setDescription("The bot has been restarted after maintenance.")
      .setTimestamp();

    const channelsData = require("./channel.js");

    channelsData.forEach((data) => {
      const guild = client.guilds.cache.get(data.serverID);
      if (guild) {
        const channel = guild.channels.cache.get(data.channelID);
        if (channel && channel.isTextBased()) {
          channel.send({ embeds: [restartEmbed] }).catch(console.error);
      message.delete().catch(console.error);
          
        }
      }
    });

    // قم بتنفيذ الإجراءات الإضافية اللازمة لإعادة التشغيل
  } else {
    // إذا لم يتطابق الأمر مع أي من الأوامر الموجودة
 
 }
  //message.delete().catch(console.error); // حذف الرسالة المستخدمة لتنفيذ الأمر
});





  client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    try {
      await reaction.message.react(reaction.emoji);
    } catch (error) {
      console.error('Error reacting to message:', error);
    }
  });

//==========================================================
/*
// إضافة الأمر "log" مع التحقق من تسجيل القناة والسيرفر مسبقًا
client.on("messageCreate", async (message) => {
  if (message.content.startsWith(config.prefix)) {
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "log") {
      // التأكد من أن المستخدم لديه الصلاحيات اللازمة (يمكنك تعديل هذا الشرط حسب احتياجاتك)
      if (message.member.permissions.has("ADMINISTRATOR")) {
        const channelID = message.channel.id;
        const serverID = message.guild.id;

        // فحص ما إذا كانت القناة والسيرفر مسجلة مسبقًا في ملف "channel.js"
        const channelsData = require("./channel.js");

        const isRegistered = channelsData.some((data) => {
          return data.channelID === channelID && data.serverID === serverID;
        });

        if (isRegistered) {
          // إذا كانت القناة والسيرفر مسجلة بالفعل، قم بإرسال رسالة تنبيهية
          message.reply(`القناه التي تحاول تسجيلها مسجلة بالفعاة 🙄`);
        } else {
          // إذا لم تكن القناة والسيرفر مسجلة، قم بتسجيلهما في ملف السجل
          const logData = { channelID, serverID };
          channelsData.push(logData);
          fs.writeFileSync(
            "./channel.js",
            `module.exports = ${JSON.stringify(channelsData, null, 2)};\n`
          );

          // إرسال رسالة تأكيد
          message.reply(
            `تم تسجيل القناه بنجاح سيتم ارسال التحديثات لهذة القناه 🤩`
          );
        }
      } else {
        // في حالة عدم توافر الصلاحيات اللازمة
        message.reply("لا تمتلك الصلاحيات اللازمة لاستخدام هذا الأمر.");
      }
    }
  }
});

//===============================

// إضافة الأمر "log-" لإزالة القناة والسيرفر من ملف السجل
client.on("messageCreate", async (message) => {
  if (message.content.startsWith(config.prefix)) {
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "log-") {
      // التأكد من أن المستخدم لديه الصلاحيات اللازمة (يمكنك تعديل هذا الشرط حسب احتياجاتك)
      if (message.member.permissions.has("ADMINISTRATOR")) {
        const channelID = message.channel.id;
        const serverID = message.guild.id;

        // فحص ما إذا كانت القناة والسيرفر مسجلة في ملف "channel.js"
        const channelsData = require("./channel.js");

        const index = channelsData.findIndex((data) => {
          return data.channelID === channelID && data.serverID === serverID;
        });

        if (index !== -1) {
          // إذا وجدت القناة والسيرفر مسجلة، قم بإزالتهما من ملف السجل
          channelsData.splice(index, 1);
          fs.writeFileSync(
            "./channel.js",
            `module.exports = ${JSON.stringify(channelsData, null, 2)};\n`
          );

          // إرسال رسالة تأكيد
          message.reply(`تم ازالة القناه لن يتم ارسال اي تحديثات للبوت😥`);
        } else {
          // إذا لم تجد القناة والسيرفر مسجلة
          message.reply(`القناه التي تحاول ازالتها ليست مسجلة بالفعل 😶`);
        }
      } else {
        // في حالة عدم توافر الصلاحيات اللازمة
        message.reply("لا تمتلك الصلاحيات اللازمة لاستخدام هذا الأمر.");
      }
    }
  }
});
//=======================================================================
*/
