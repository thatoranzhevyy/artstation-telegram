require('dotenv').config();

console.log()
const {Telegraf} = require('telegraf');
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const tgSender = {
  /**
   * Личное сообщение
   * */
  sendPrivatePost(data) {
    return bot.telegram.sendMediaGroup(process.env.TELEGRAM_USER_ID, data)
  },
  sendPrivateMassage(msg) {
    bot.telegram.sendMessage(process.env.TELEGRAM_USER_ID, msg);
  },
  sendPost(data) {
    return bot.telegram.sendMediaGroup(process.env.TELEGRAM_GROUP_ID, data)
  }
}

exports.telegram = tgSender;
