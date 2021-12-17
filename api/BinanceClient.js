const Price = require('../models/Price')
const assets = require('../utils/assets')
const config = require('../config/config')
const Binance = require('node-binance-api')
const assetDecimal = require('../utils/asssetDecimal')

module.exports = class BinanceClient {
  _assets = {
    btc: 'BTCUSDT',
    eth: 'ETHUSDT',
    near: 'NEARUSDT',
  }

  _client

  constructor() {
    this._client = new Binance().options({
      APIKEY: config.binance.apikey,
      APISECRET: config.binance.privateKey,
    })
  }

  async getPrices() {
    const BTCData = await this._client.futuresQuote(this._assets.btc)
    const ETHData = await this._client.futuresQuote(this._assets.eth)
    const NEARData = await this._client.futuresQuote(this._assets.near)

    return [
      new Price(assets.btc, BTCData.bidPrice, assetDecimal.btc),
      new Price(assets.eth, ETHData.bidPrice, assetDecimal.eth),
      new Price(assets.near, NEARData.bidPrice, assetDecimal.near),
    ]
  }
}
