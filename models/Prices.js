const big = require('big.js')

function getBig(number, tokendDecimals) {
  return new big(number).mul(new big(10).pow(tokendDecimals)).toFixed()
}

module.exports = class Prices {
  data = {}
  constructor() {}

  addPrice(price) {
    if (!this.data[price.asset_id]) {
      this.data[price.asset_id] = []
    }
    this.data[price.asset_id].push({ ...price.price })
  }

  addPrices(prices) {
    prices.forEach(this.addPrice)
  }
}
