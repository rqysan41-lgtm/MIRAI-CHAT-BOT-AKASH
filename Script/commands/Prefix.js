module.exports.config = {
  name: "prefix",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Mohammad Akash",
  description: "Display the bot's prefix and owner info",
  commandCategory: "Information",
  usages: "",
  cooldowns: 5
};

module.exports.handleEvent = async ({ event, api, Threads }) => {
  const { threadID, messageID, body } = event;
  if (!body) return;

  const dataThread = await Threads.getData(threadID);
  const data = dataThread.data || {};
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const prefix = threadSetting.PREFIX || global.config.PREFIX;

  const triggerWords = [
    "prefix", "mprefix", "mpre", "bot prefix", "what is the prefix", "bot name",
    "how to use bot", "bot not working", "bot is offline", "prefx", "prfix",
    "perfix", "bot not talking", "where is bot", "bot dead", "bots dead",
    "what prefix", "freefix", "what is bot", "what prefix bot",
    "how use bot", "where are the bots", "where prefix"
  ];

  const lowerBody = body.toLowerCase();
  if (triggerWords.includes(lowerBody)) {
    const msg = `
› 𝙿𝚁𝙴𝙵𝙸𝚇 𝙸𝙽𝙵𝙾 ‹

➤ 𝙶𝚕𝚘𝚋𝚊𝚕 𝙿𝚛𝚎𝚏𝚒𝚡 : [ ${global.config.PREFIX} ]
➤ 𝙱𝚘𝚡 𝙿𝚛𝚎𝚏𝚒𝚡    : [ ${prefix} ]

› 𝙱𝙾𝚃 𝙾𝚆𝙽𝙴𝚁 ‹

➤ 𝙼𝚘𝚑𝚊𝚖𝚖𝚊𝚍 𝙰𝚔𝚊𝚜𝚑
    `;
    return api.sendMessage(msg, threadID);
  }
};

module.exports.run = async ({ event, api }) => {
  return api.sendMessage("Type 'prefix' or similar to get the bot info.", event.threadID);
};
