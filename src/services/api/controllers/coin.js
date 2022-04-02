const errors = require('../../../helpers/errors');
const coingeckoUtils = require('../../../helpers/coingecko-utils');
const Models = require('../../../models/pg');

const CoinController = {
  async getCoinByCode(coinCode) {
    const coin = await Models.Coin.findByCoinCode(coinCode);

    errors.assertExposable(coin, 'unknown_coin_code');
    const currency = 'USD';
    const price = await coingeckoUtils.getCoinPrice(coinCode, currency);
    const { name, code } = coin.filterKeys();
    return { name, code, price: price[currency.toLowerCase()] };
  },

  async putNewCoin({ coinName, coinCode }) {
    let coin = await Models.Coin.findByCoinCode(coinCode);
    errors.assertExposable(!coin, 'bad_params');
    coin = await Models.Coin.create({ name: coinName, code: coinCode });

    return coin.filterKeys();
  },
};

module.exports = CoinController;
