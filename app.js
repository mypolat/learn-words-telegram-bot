const {config} = require('dotenv');
const tb = require('node-telegram-bot-api');
const cj = require('cron').CronJob;

config();

const commonWords = require('./data/common-words.js');

const token = process.env.TELEGRAM_TOKEN || 'TOKEN';
const groupChatId = process.env.TELEGRAM_GROUP_ID;

const bot = new tb(token, {polling: true});

let usedIdList = [];
let wordCount = 10;

function sendNewWords(cId) {
    const chatId = groupChatId || cId;

    let dailyWordList = [];
    for (let i = 0; i < ((commonWords.length - usedIdList.length) < wordCount ? (commonWords.length - usedIdList.length) : wordCount); i++) {
        let rand = 0;
        do {
            rand = Math.floor(Math.random() * commonWords.length);
        }
        while (usedIdList.length > 0 && usedIdList.indexOf(rand) != -1);

        usedIdList.push(rand);
        dailyWordList.push(commonWords[rand]);
    }

    bot.sendMessage(chatId, `You've learned ${usedIdList.length} words 👍`);
    bot.sendMessage(chatId, dailyWordList.join('\n').toString());
}

bot.onText(/\/send/, (msg, match) => {
    console.log(msg.chat.id);
    sendNewWords(msg.chat.id);
});

bot.onText(/\/reset/, (msg, match) => {
    const chatId = groupChatId || msg.chat.id;
    usedIdList = [];
    bot.sendMessage(chatId, `Has Been Reset 👍`);
});

var job = new cj('0 10 * * *', function() {
    sendNewWords(groupChatId);
}, null, true, 'Europe/Istanbul');
job.start();