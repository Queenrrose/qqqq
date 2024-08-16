const { PermissionsBitField } = require("discord.js");
const fs = require("fs");

let channelsData = [];
try {
  channelsData = require("../../channel.js");
} catch (error) {
  console.error("Failed to load channels data:", error);
}

module.exports = {
  name: "log-",
  description:   `Unregister  the current channel for logging updates.
  (Administrator required)`,
  cooldown: 5000,
  async execute(client, message) {
    try {
      // التأكد من أن المستخدم لديه الصلاحيات اللازمة
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply({ content: "لا تمتلك الصلاحيات اللازمة لاستخدام هذا الأمر." });
      }

      const channelID = message.channel.id;
      const serverID = message.guild.id;

      // فحص ما إذا كانت القناة والسيرفر مسجلة مسبقًا
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
        return message.reply({ content: `تم ازالة القناه لن يتم ارسال اي تحديثات للبوت😥` });
      } else {
        // إذا لم تجد القناة والسيرفر مسجلة
        return message.reply({ content: `القناه التي تحاول ازالتها ليس مسجلة بالفعل 😶` });
      }
    } catch (err) {
      console.log(err);
      return message.reply({ content: "حدث خطأ أثناء تنفيذ الأمر. يرجى المحاولة مرة أخرى لاحقًا." });
    }
  },
};
