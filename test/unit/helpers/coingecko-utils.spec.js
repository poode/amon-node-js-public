const path = require('path');
const { sequelizeMockingMocha } = require('sequelize-mocking');
const sinon = require('sinon');
const moment = require('moment');
const CoinGecko = require('coingecko-api');

const CoinGeckoUtils = require(path.join(srcDir, '/helpers/coingecko-utils'));
const DB = require(path.join(srcDir, '/modules/db'));

describe('Helpers: CoinGeckoUtils', () => {
  let sandbox = null;

  sequelizeMockingMocha(DB.sequelize, [], { logging: false });

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
  });

  afterEach(async () => {
    sandbox && sandbox.restore();
  });

  it('Get coin id by coin code', async () => {
    const coinId = await CoinGeckoUtils.getCoinIdByCoinCode('BTC');
    expect(coinId).equal('bitcoin');
    const anotherCoinId = await CoinGeckoUtils.getCoinIdByCoinCode();
    expect(anotherCoinId).equal(undefined);
    const notFoundCoin = await CoinGeckoUtils.getCoinIdByCoinCode('XXXXXXXXXXX');
    expect(notFoundCoin).equal(undefined);
  });

  it('Get coin price by coin id', async () => {
    const coinCode = 'BTC';
    const currency = 'USD';
    const lowerCaseCurrency = currency.toLowerCase();
    const lowerCaseCoinCode = coinCode.toLowerCase();
    const fetchSpy = global.chai.spy.on(CoinGeckoUtils, 'getCoinIdByCoinCode');

    expect(CoinGeckoUtils.CoinGeckoClient).instanceof(CoinGecko);
    expect(CoinGeckoUtils.lastUpdated).instanceof(moment);
    expect(Object.keys(CoinGeckoUtils.coinPrice).length).equal(0);

    const coinPrice = await CoinGeckoUtils.getCoinPrice(coinCode);
    expect(typeof coinPrice[lowerCaseCurrency]).equal('number');

    const withInOneHourCoinPrice = await CoinGeckoUtils.getCoinPrice(coinCode, currency);
    expect(withInOneHourCoinPrice).equal(CoinGeckoUtils.coinPrice[lowerCaseCoinCode]);

    const anotherCoinPrice = await CoinGeckoUtils.getCoinPrice(coinCode, currency);
    expect(typeof anotherCoinPrice[lowerCaseCurrency]).equal('number');
    expect(Object.keys(CoinGeckoUtils.coinPrice).length).equal(1);
    expect(Object.keys(CoinGeckoUtils.coinPrice[lowerCaseCoinCode]).length).greaterThan(1);
    expect(typeof CoinGeckoUtils.coinPrice[lowerCaseCoinCode][lowerCaseCurrency]).equal('number');

    const notValidCoinPrice = await CoinGeckoUtils.getCoinPrice();
    expect(notValidCoinPrice).equal(undefined);
    expect(fetchSpy).to.have.been.called.once;

    const time = sinon.useFakeTimers(moment().valueOf() + 60 * 1000 * 61);
    const afterOneHourCoinPrice = await CoinGeckoUtils.getCoinPrice(coinCode, currency);
    expect(afterOneHourCoinPrice).equal(CoinGeckoUtils.coinPrice[lowerCaseCoinCode]);
    expect(fetchSpy).to.have.been.called.nth(2);
    time.restore();

    const notFoundCoinPrice = await CoinGeckoUtils.getCoinPrice('XXXXXXXXXXX');
    expect(notFoundCoinPrice).equal(undefined);

    const notFoundCoinCurrencyPrice = await CoinGeckoUtils.getCoinPrice('XXXXXXXXXXX', 'XXXXXXXXXXX');
    expect(notFoundCoinCurrencyPrice).equal(undefined);
  });
});
