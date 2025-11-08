const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { createReadStream, unlinkSync, existsSync, mkdirSync } = fs;

const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/rummmmna21/rx-api/main/baseApiUrl.json`
  );
  return base.data.api;
};

module.exports.config = {
  name: "video",
  aliases: ["youtube", "yt"],
  version: "1.0.0",
  hasPermssion: 0,
  credits: "RX x MOHAMMAD AKASH ",
  description: "Download video from YouTube",
  commandCategory: "media",
  usages: "video [video name | YouTube link]\nExample: video despacito",
  cooldowns: 5
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { author, results, messageID } = handleReply;
  if (event.senderID !== author) return;

  const choice = parseInt(event.body);
  if (isNaN(choice) || choice < 1 || choice > results.length) {
    return api.sendMessage("Please reply with a valid number (1–6).", event.threadID);
  }

  const selected = results[choice - 1];
  const tmpFolder = path.join(__dirname, "tmp");
  if (!existsSync(tmpFolder)) mkdirSync(tmpFolder, { recursive: true });

  try {
    await api.unsendMessage(messageID);

    const { data } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${selected.id}&format=mp4`);
    const { title, quality, downloadLink } = data;

    const filePath = path.join(tmpFolder, `${Date.now()}_video.mp4`);
    const res = await axios.get(downloadLink, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, Buffer.from(res.data));

    await api.sendMessage(
      {
        body: `Now Playing: ${title}\nQuality: ${quality}`,
        attachment: createReadStream(filePath)
      },
      event.threadID,
      () => unlinkSync(filePath)
    );
  } catch (err) {
    console.error("Video download error:", err);
    api.sendMessage("Error downloading video (may exceed 26MB).", event.threadID);
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, senderID, messageID } = event;
  const input = args.join(" ").trim();
  const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
  const isYtLink = checkurl.test(input);

  if (!input) {
    return api.sendMessage("Please provide a video name or YouTube link.", threadID, messageID);
  }

  const tmpFolder = path.join(__dirname, "tmp");
  if (!existsSync(tmpFolder)) mkdirSync(tmpFolder, { recursive: true });

  // Direct YouTube link
  if (isYtLink) {
    const videoID = input.match(checkurl)[1];

    try {
      const { data } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${videoID}&format=mp4`);
      const { title, downloadLink } = data;

      const filePath = path.join(tmpFolder, `${Date.now()}_video.mp4`);
      const res = await axios.get(downloadLink, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(res.data));

      return api.sendMessage(
        { body: `${title}`, attachment: createReadStream(filePath) },
        threadID,
        () => unlinkSync(filePath),
        messageID
      );
    } catch (err) {
      console.error(err);
      return api.sendMessage("Failed to fetch video from link.", threadID, messageID);
    }
  }

  // Search by keyword
  let keyWord = input.includes("?feature=share") ? input.replace("?feature=share", "") : input;
  const maxResults = 6;

  try {
    const res = await axios.get(`${await baseApiUrl()}/ytFullSearch?songName=${encodeURIComponent(keyWord)}`);
    const results = res.data.slice(0, maxResults);

    if (!results.length) {
      return api.sendMessage(`No results found for: ${keyWord}`, threadID, messageID);
    }

    let msg = "Choose a video (reply with number 1–6):\n\n";
    const thumbs = [];

    results.forEach((info, i) => {
      msg += `${i + 1}. ${info.title}\nDuration: ${info.time}\nChannel: ${info.channel.name}\n\n`;
      thumbs.push(loadStream(info.thumbnail));
    });

    const allThumbs = await Promise.all(thumbs);

    const infoMsg = await api.sendMessage(
      {
        body: msg + "Reply with the number to download.",
        attachment: allThumbs.filter(Boolean)
      },
      threadID
    );

    global.client.handleReply.push({
      name: this.config.name,
      messageID: infoMsg.messageID,
      author: senderID,
      results
    });

  } catch (err) {
    console.error("Search error:", err);
    api.sendMessage("Error searching for videos.", threadID, messageID);
  }
};

// Helper: Load thumbnail as stream
async function loadStream(url) {
  try {
    const res = await axios.get(url, { responseType: "stream" });
    return res.data;
  } catch {
    return null;
  }
}
