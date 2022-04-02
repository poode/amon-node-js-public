const CoinGecko = require('coingecko-api');
const moment = require('moment');

const CoinGeckoClient = new CoinGecko();

module.exports = {
  CoinGeckoClient,
  lastUpdated: moment(),
  coinPrice: {},
  /**
   *
   * @param coinCode {string}
   * @returns {Promise<id|undefined>}
   */
  async getCoinIdByCoinCode(coinCode) {
    if (!coinCode) return;
    const { data: coinList } = await CoinGeckoClient.coins.list();
    const coin = coinList.find((coin) => coin.symbol.toLowerCase() === coinCode.toLowerCase());
    if (!coin) return;
    return coin.id;
  },

  /**
   *
   * @param coinCode {string}
   * @param currency {string}
   * @returns {Promise< {[currency]?: number} | undefined>}
   */
  async getCoinPrice(coinCode, currency) {
    if (!coinCode) return;
    const currentTime = moment(new Date());
    const lowerCaseCoinCode = coinCode.toLowerCase();
    const diffInMinutes = currentTime.diff(this.lastUpdated, 'minutes');
    const coinPrice =
      this.coinPrice[lowerCaseCoinCode] ||
      (currency && this.coinPrice[lowerCaseCoinCode] && this.coinPrice[lowerCaseCoinCode][currency.toLowerCase()]);
    if (diffInMinutes < 60 && coinPrice) return coinPrice;
    const coinId = await this.getCoinIdByCoinCode(coinCode);
    if (!coinId) return;
    const { data: coin } = await CoinGeckoClient.coins.fetch(coinId);
    this.lastUpdated = moment(coin.market_data.last_updated);
    if (currency) {
      const lowerCaseCurrency = currency.toLowerCase();
      const price = coin.market_data.current_price[lowerCaseCurrency];
      if (!price) return;
      this.coinPrice[lowerCaseCoinCode] = { [lowerCaseCurrency]: price };
      return this.coinPrice[lowerCaseCoinCode];
    }

    this.coinPrice[lowerCaseCoinCode] = coin.market_data.current_price;
    return coin.market_data.current_price;
  },
};
