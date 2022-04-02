const Joi = require('joi');
const Router = require('@koa/router');
const CoinController = require('../controllers/coin');
const { validateParams } = require('../../../helpers/validation');

const CoinRouter = {
  schemaGetByCoinCode: Joi.object({
    coinCode: Joi.string().min(3).uppercase().max(5),
  }),

  schemaPutCoin: Joi.object({
    coinName: Joi.string().min(3).uppercase().max(50),
    coinCode: Joi.string().min(3).uppercase().max(5),
  }),

  async getCoinByCode(ctx) {
    const params = {
      coinCode: ctx.params.coinCode,
    };

    const formattedParams = await validateParams(CoinRouter.schemaGetByCoinCode, params);

    ctx.body = await CoinController.getCoinByCode(formattedParams.coinCode);
  },

  async addCoin(ctx) {
    const params = ctx.request.body;
    const formattedParams = await validateParams(CoinRouter.schemaPutCoin, params);
    ctx.body = await CoinController.putNewCoin(formattedParams);
  },

  router() {
    const router = Router();

    /**
     * @api {get} / Get coinCode
     * @apiName coinCode
     * @apiGroup Status
     * @apiDescription Get coinCode
     *
     * @apiSampleRequest /
     *
     */
    router.get('/:coinCode', CoinRouter.getCoinByCode);

    /**
     * @api {put} / Put coin
     * @apiName coin
     * @apiGroup Status
     * @apiDescription Put new coin
     *
     * @apiSampleRequest /
     *
     */
    router.put('/', CoinRouter.addCoin);

    return router;
  },
};

module.exports = CoinRouter;
