'use strict';

module.exports = {
  async up(query, transaction) {
    const sql = `
      ALTER TABLE "Coin" ALTER COLUMN "code" SET NOT NULL;
      ALTER TABLE "Coin" ALTER COLUMN "name" SET NOT NULL;
      CREATE UNIQUE INDEX "unique_code" ON "Coin"("code");
    `;
    await transaction.sequelize.query(sql, { raw: true, transaction });
  },

  async down(query, transaction) {
    const sql = `
      ALTER TABLE "Coin" ALTER COLUMN "code" DROP NOT NULL;
      ALTER TABLE "Coin" ALTER COLUMN "name" DROP NOT NULL;
      DROP INDEX "unique_code";
    `;
    await transaction.sequelize.query(sql, { raw: true, transaction });
  },
};
