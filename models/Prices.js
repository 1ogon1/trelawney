const big = require('big.js')

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
