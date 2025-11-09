const axios = require("axios");

module.exports.config = {
  name: "ffinfo",
  version: "9.6",
  hasPermssion: 0,
  credits: "MOHAMMAD AKASH",
  description: "Premium Free Fire Player Info (Text Style)",
  commandCategory: "Free Fire",
  usages: "[UID]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const uid = args.join(" ").trim();
  if (!uid || isNaN(uid))
    return api.sendMessage("❌ অনুগ্রহ করে একটি সঠিক Free Fire UID দিন!", event.threadID, event.messageID);

  try {
    const { data } = await axios.get(
      `https://mahbub-ullash.cyberbot.top/api/player-info?uid=${uid}`,
      {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
        timeout: 10000
      }
    );

    if (!data || !data.message || !data.message.basicInfo)
      return api.sendMessage("❌ প্লেয়ার পাওয়া যায়নি বা সার্ভার ডাউন!", event.threadID, event.messageID);

    const basic = data.message.basicInfo;
    const profile = data.message.profileInfo || {};
    const clan = data.message.clanBasicInfo || { clanName: "None" };
    const pet = data.message.petInfo || {};
    const winRate =
      basic.totalMatches > 0
        ? ((basic.wins || 0) / basic.totalMatches * 100).toFixed(2)
        : "0.00";

    const text = `
🧾 𝙿𝙻𝙰𝚈𝙴𝚁 𝙳𝙴𝚃𝙰𝙸𝙻𝚂 ─────────────
👤 𝙽𝚊𝚖𝚎   : ${basic.nickname || "Unknown"}
🆔 𝚄𝙸𝙳    : ${basic.accountId || uid}
🌍 𝚁𝚎𝚐𝚒𝚘𝚗 : ${basic.region || "N/A"}
🏅 𝙻𝚎𝚟𝚎𝚕  : ${basic.level || "N/A"}
🎖️ 𝚁𝚊𝚗𝚔   : ${basic.rankingPoints || "N/A"}
🤝 𝙲𝚕𝚊𝚗   : ${clan.clanName || "None"}
🐾 𝙿𝚎𝚝    : ${pet.id || "None"} (𝙻𝚟. ${pet.level || 0})

📊 𝙼𝚊𝚝𝚌𝚑𝚎𝚜 : ${basic.totalMatches || 0}
🏆 𝚆𝚒𝚗𝚜   : ${basic.wins || 0}
📈 𝚆𝚒𝚗𝚁𝚊𝚝𝚎 : ${winRate}%
💎 𝙳𝚒𝚊𝚖𝚘𝚗𝚍𝚜 : ${data.message.diamondCostRes?.diamondCost || "N/A"}
💳 𝙲𝚛𝚎𝚍𝚒𝚝 𝚂𝚌𝚘𝚛𝚎 : ${data.message.creditScoreInfo?.creditScore || "N/A"}
📝 𝚂𝚒𝚐𝚗𝚊𝚝𝚞𝚛𝚎 : ${data.message.socialInfo?.signature || "None"}
───────────────────────────────
✨ 𝙳𝚊𝚝𝚊 𝙿𝚛𝚘𝚟𝚒𝚍𝚎𝚍 𝙱𝚢 : 𝙼𝙾𝙷𝙰𝙼𝙼𝙰𝙳 𝙰𝙺𝙰𝚂𝙷 ✨
`;

    return api.sendMessage(text, event.threadID, event.messageID);

  } catch (e) {
    return api.sendMessage(`⚠️ Error: ${e.message}`, event.threadID, event.messageID);
  }
};
