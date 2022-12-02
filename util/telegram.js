const {Telegraf} = require('telegraf');
const bot = new Telegraf('1489066598:AAE7n6ILaQ_-gMZ9usA4QIKzLwmiTdaIFXQ');

const tgSender = {
  /**
   * Личное сообщение
   * */
  sendPrivateMassage(msg) {
    bot.telegram.sendMessage(888799838, msg);
  },
  sendPost(data) {
    return bot.telegram.sendMediaGroup(-1001868760290, data)
  }
}

exports.telegram = tgSender;
