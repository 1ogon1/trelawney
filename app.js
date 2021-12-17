const big = require('big.js')
const cron = require('node-cron')
const express = require('express')
const PORT = process.env.PORT || 4200
const assets = require('./utils/assets')
const NearClient = require('./api/NearClient')
const nearConfig = require('./config/nearConfig')
const BinanceClient = require('./api/BinanceClient')
const CoinGecoClient = require('./api/CoinGeckoClient')
const CoinMarketClient = require('./api/CoinMarketClient')

const app = express()
console.log({ nearConfig })
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

module.exports = class App {
  _app
  _nearClient
  _binanceClient
  _coinGecoClient
  _coinMaketClient

  constructor() {
    this._app = express()

    this._nearClient = new NearClient()
    this._binanceClient = new BinanceClient()
    this._coinGecoClient = new CoinGecoClient()
    this._coinMaketClient = new CoinMarketClient()

    this.init()
  }

  init() {
    this._app.use(express.urlencoded({ extended: true }))
    this._app.use(express.json())

    this._app.get('/', async (request, response) => {
      try {
        await this._nearClient.init()
        // await this.updatePrices()

        cron.schedule('*/10 * * * * *', async () => {
          console.log('running a task every minute', new Date().toTimeString())
          this.updatePrices()
        })

        response.status(200).json({
          binance: await this._binanceClient.getPrices(),
          coinGeco: await this._coinGecoClient.getPrice(),
          coinMarket: await this._coinMaketClient.getPrices(),
        })
      } catch (e) {
        console.log(e)
        response.status(500).json(e)
      }
    })

    this._app.get('/updatePrice', async (request, response) => {
      try {
      } catch (error) {
        console.log(e)
        response.status(500).json(e)
      }
    })

    this._app.listen(PORT, async () => {
      console.log(`Server has been started on port: ${PORT}`)
    })
  }

  getBig(number, tokendDecimals) {
    const test = new big(number).mul(new big(10).pow(tokendDecimals)).toFixed().toString()
    console.log({ number, test })
    return test
  }

  async updatePrices() {
    console.log('updatePrices')
    const binance = await this._binanceClient.getPrices()
    const coinGeco = await this._coinGecoClient.getPrice()
    const coinMarket = await this._coinMaketClient.getPrices()
    const prices = []

    console.log({
      binance,
      coinGeco,
      coinMarket,
    })

    Object.keys(assets).forEach((key) => {
      const binanceItem = binance.find((b) => b.asset_id === assets[key])
      const coinGecoItem = coinGeco.find((c) => c.asset_id === assets[key])
      const coinMarketItem = coinMarket.find((c) => c.asset_id === assets[key])

      console.log({
        binanceItem,
        coinGecoItem,
        coinMarketItem,
      })
      prices.push({
        asset_id: assets[key],
        price_b: {
          multiplier: this.getBig(binanceItem.price.multiplier, binanceItem.price.decimals),
          decimals: binanceItem.price.decimals,
        },
        price_cm: {
          multiplier: this.getBig(coinMarketItem.price.multiplier, coinMarketItem.price.decimals),
          decimals: coinMarketItem.price.decimals,
        },
        price_cg: {
          multiplier: this.getBig(coinGecoItem.price.multiplier, coinGecoItem.price.decimals),
          decimals: coinGecoItem.price.decimals,
        },
      })
    })

    await this._nearClient.account.functionCall({
      methodName: 'report_prices_triple',
      contractId: nearConfig.contractName,
      args: { prices },
    })
  }
}
