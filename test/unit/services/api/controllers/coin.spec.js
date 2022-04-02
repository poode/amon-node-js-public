const path = require('path');
const sinon = require('sinon');
const sequelizeMockingMocha = require('sequelize-mocking').sequelizeMockingMocha;

const CoinController = require(path.join(srcDir, '/services/api/controllers/coin'));
const DB = require(path.join(srcDir, 'modules/db'));

const getCoin = (ticker) => {
  if (ticker === 'AMN')
    return {
      coinCode: 'AMN',
      coinName: 'Amon',
    };
  else
    return {
      coinCode: 'BTC',
      coinName: 'Bitcoin',
    };
};

describe('Controller: Coin', () => {
  let sandbox = null;

  sequelizeMockingMocha(DB.sequelize, [path.resolve('test/mocks/coins.json')], { logging: false });

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox && sandbox.restore();
  });

  describe('getCoinByCode', () => {
    it('should get coin by code', async () => {
      const coinCode = 'BTC';
      const coin = await CoinController.getCoinByCode(coinCode);

      expect(coin.code).to.eq(coinCode);
      expect(typeof coin.price).to.eq('number');
      expect(Object.keys(coin).length).to.eq(3);
    });

    it('should fail get coin by code', async () => {
      expect(CoinController.getCoinByCode(getCoin('AMN').coinCode)).to.be.rejectedWith(Error, 'unknown_coin_code');
    });

    it('should put coin', async () => {
      const coin = getCoin('AMN');
      const coinResult = await CoinController.putNewCoin(coin);
      expect(Object.keys(coinResult).length).to.eq(3);

      delete coinResult.id;
      expect(coinResult).to.deep.equal({ name: coin.coinName, code: coin.coinCode });
    });

    it('should fail to put new coin', () => {
      expect(CoinController.putNewCoin(getCoin('BTC'))).to.be.rejectedWith(Error, 'bad_params');
    });
  });
});
