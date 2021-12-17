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

  getBigAverage() {
    const result = []

    Object.keys(this.data).forEach((key) => {
      result.push({
        asset_id: key,
        price: {
          multiplier: getBig(this.data[key].reduce((a, b) => a.multiplier + b.multiplier) / this.data[key].length, this.data[key][0].decimals),
          decimals: this.data[key][0].decimals,
        },
      })
    })

    return result
  }

  getAverage() {
    const result = []

    Object.keys(this.data).forEach((key) => {
      result.push({
        asset_id: key,
        price: {
          multiplier: this.data[key].reduce((a, b) => a.multiplier + b.multiplier) / this.data[key].length,
          decimals: 18,
        },
      })
    })

    return result
  }

  getAverageTriple() {
    const result = []

    Object.keys(this.data).forEach((key) => {
      result.push({
        asset_id: key,
        priceb: {
          multiplier: this.data[key].reduce((a, b) => a.multiplier + b.multiplier) / this.data[key].length,
          decimals: 18,
        },
      })
    })

    return result
  }
}

{
  prices: [
    {
      asset_id: 'RUS',
      price_b: { multiplier: '2', decimals: 7 },
      price_cm: { multiplier: '6', decimals: 7 },
      price_cg: { multiplier: '4', decimals: 7 },
    },
  ]
}
