const { PermissionsBitField } = require("discord.js");
const fs = require("fs");

let channelsData = [];
try {
  channelsData = require("../../channel.js");
} catch (error) {
  console.error("Failed to load channels data:", error);
}

module.exports = {
  name: "log",
  description: `Register the current channel for logging updates.
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
      const isRegistered = channelsData.some((data) => {
        return data.channelID === channelID && data.serverID === serverID;
      });

      if (isRegistered) {
        // إذا كانت القناة والسيرفر مسجلة بالفعل، قم بإرسال رسالة تنبيهية
        return message.reply({ content: `القناه التي تحاول تسجيلها مسجلة بالفعاة 🙄` });
      } else {
        // إذا لم تكن القناة والسيرفر مسجلة، قم بتسجيلهما في ملف السجل
        const logData = { channelID, serverID };
        channelsData.push(logData);
        fs.writeFileSync(
          "./channel.js",
          `module.exports = ${JSON.stringify(channelsData, null, 2)};\n`
        );

        // إرسال رسالة تأكيد
        return message.reply({ content: `تم تسجيل القناه بنجاح سيتم ارسال التحديثات لهذة القناه 🤩` });
      }
    } catch (err) {
      console.log(err);
      return message.reply({ content: "حدث خطأ أثناء تنفيذ الأمر. يرجى المحاولة مرة أخرى لاحقًا." });
    }
  },
};
