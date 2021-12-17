const Price = require('../models/Price')
const assets = require('../utils/assets')
const asssetDecimal = require('../utils/asssetDecimal')
const CoinGecko = require('coingecko-api/lib/CoinGecko')

module.exports = class CoinGeckoClient {
  _client

  constructor() {
    this._client = new CoinGecko()
  }

  async getPrice() {
    const data = await this._client.coins.markets({ ids: ['bitcoin', 'ethereum', 'near'] })

    return [
      new Price(assets.btc, data.data.find((f) => f.symbol === 'btc').current_price, asssetDecimal.btc),
      new Price(assets.eth, data.data.find((f) => f.symbol === 'eth').current_price, asssetDecimal.eth),
      new Price(assets.near, data.data.find((f) => f.symbol === 'near').current_price, asssetDecimal.near),
    ]
  }
}
