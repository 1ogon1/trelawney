const Price = require('../models/Price')
const assets = require('../utils/assets')
const config = require('../config/config')
const CoinMarketCap = require('coinmarketcap-api')
const asssetDecimal = require('../utils/asssetDecimal')

module.exports = class CoinMarketClient {
  _client

  constructor() {
    this._client = new CoinMarketCap(config.coinMarketApiKey)
  }

  async getPrices() {
    const data = await this._client.getQuotes({ symbol: 'BTC,ETH,NEAR' })

    return [
      new Price(assets.btc, data.data.BTC.quote.USD.price, asssetDecimal.btc),
      new Price(assets.eth, data.data.ETH.quote.USD.price, asssetDecimal.eth),
      new Price(assets.near, data.data.NEAR.quote.USD.price, asssetDecimal.near),
    ]
  }
}
