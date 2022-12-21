const minMinuteDelay = 5; // Минимально время в минутах рандома
const maxMinuteDelay = 10; // Максимальное время в минутах рандома
const startHour = 8; // Время начал отправки поста
const endHour = 24; // Время окончания отправки поста

const {logger} = require('./logger');

const util = {
  /**
   * Функция старта функции
   * */
  setRandomInterval: (intervalFunction) => {
    const minDelay = minMinuteDelay * 60000;
    const maxDelay = maxMinuteDelay * 60000;
    const nowHour = new Date().getHours();
    let timeout;
    const timeConversion = (millisecond) => {
      const seconds = (millisecond / 1000).toFixed(1);
      const minutes = (millisecond / (1000 * 60)).toFixed(1);
      const hours = (millisecond / (1000 * 60 * 60)).toFixed(1);
      const days = (millisecond / (1000 * 60 * 60 * 24)).toFixed(1);
      if (seconds < 60) return seconds + " сек";
      else if (minutes < 60) return minutes + " мин";
      else if (hours < 24) return hours + " ч";
      else return days + " д";
    }
    const runInterval = (_delay) => {
      const timeoutFunction = () => {
        intervalFunction();
        runInterval();
      };

      let delay;
      if (_delay) {
        delay = _delay
        logger.logError(`🟡 откладываю пост на: ${timeConversion(delay)}`);
      } else {
        delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
        logger.logError(`🟡 следющий пост через: ${timeConversion(delay)}`)
      }

      timeout = setTimeout(timeoutFunction, delay);
    };
    if (nowHour >= startHour && nowHour <= endHour) {
      runInterval();
    } else {
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 16, 0, 0);
      const delay = next.getTime() - now.getTime()

      runInterval(delay);
    }

    return {
      clear() {
        clearTimeout(timeout)
      }
    };
  },
}
exports.util = util;
