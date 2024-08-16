const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const fs = require("fs");

// تحميل بيانات القنوات المسجلة مسبقًا
let channelsData = [];
try {
  channelsData = require("../../channel.js");
} catch (error) {
  console.error("Failed to load channels data:", error);
}

module.exports = {
  name: "log-",
  description: `Unregister  the current channel for logging updates.
  (Administrator required)`,
  async execute(client, interaction) {
    try {
      // التأكد من أن المستخدم لديه الصلاحيات اللازمة
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: "لا تمتلك الصلاحيات اللازمة لاستخدام هذا الأمر.", ephemeral: true });
      }

      const channelID = interaction.channel.id;
      const serverID = interaction.guild.id;

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
        return interaction.reply({ content: `تم ازالة القناه لن يتم ارسال اي تحديثات للبوت😥` });
      } else {
        // إذا لم تجد القناة والسيرفر مسجلة
        return interaction.reply({ content: `القناه التي تحاول ازالتها ليس مسجلة بالفعل 😶`, ephemeral: true });
      }
    } catch (err) {
      console.log(err);
      return interaction.reply({ content: "حدث خطأ أثناء تنفيذ الأمر. يرجى المحاولة مرة أخرى لاحقًا.", ephemeral: true });
    }
  },
};
