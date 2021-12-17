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

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

module.exports = class App {
  _app
  _crone
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

    this._initRoutes()
  }

  _initRoutes() {
    this._app.get('/', async (request, response) => {
      try {
        response.status(200).json('app is running now')
      } catch (e) {
        console.log(e)
        response.status(500).json(e)
      }
    })

    this._app.get('/prices', async (request, response) => {
      try {
        await this._nearClient.init()

        response.status(200).json(await this._getPrices())
      } catch (error) {
        console.log(e)
        response.status(500).json(e)
      }
    })

    this._app.get('/stop', async (request, response) => {
      try {
        if (this._crone) {
          this._crone.stop()
          console.log('=== crone was stoped ===')
        } else {
          return response.status(200).json('app was not started')
        }

        response.status(200).json('app was stoped')
      } catch (e) {
        console.log(e)
        response.status(500).json(e)
      }
    })

    this._app.get('/start', async (request, response) => {
      try {
        if (this._crone) {
          this._crone.start()
        } else {
          await this._nearClient.init()

          this._startCrone()
        }
        console.log('=== cone was started ===')

        response.status(200).json('app was started')
      } catch (e) {
        console.log(e)
        response.status(500).json(e)
      }
    })

    this._app.listen(PORT, async () => {
      console.log(`Server has been started on port: ${PORT}`)
    })
  }

  _startCrone() {
    this._crone = cron.schedule('*/10 * * * * *', async () => {
      console.log('running a task every minute', new Date().toTimeString())
      this._updatePrices()
    })
  }

  _getBig(number, tokendDecimals) {
    return new big(number).mul(new big(10).pow(tokendDecimals)).toFixed().toString()
  }

  async _getPrices() {
    const prices = []
    const binance = await this._binanceClient.getPrices()
    const coinGeco = await this._coinGecoClient.getPrice()
    const coinMarket = await this._coinMaketClient.getPrices()

    Object.keys(assets).forEach((key) => {
      const binanceItem = binance.find((b) => b.asset_id === assets[key])
      const coinGecoItem = coinGeco.find((c) => c.asset_id === assets[key])
      const coinMarketItem = coinMarket.find((c) => c.asset_id === assets[key])

      prices.push({
        asset_id: assets[key],
        price_b: {
          multiplier: this._getBig(binanceItem.price.multiplier, binanceItem.price.decimals),
          decimals: binanceItem.price.decimals,
        },
        price_cm: {
          multiplier: this._getBig(coinMarketItem.price.multiplier, coinMarketItem.price.decimals),
          decimals: coinMarketItem.price.decimals,
        },
        price_cg: {
          multiplier: this._getBig(coinGecoItem.price.multiplier, coinGecoItem.price.decimals),
          decimals: coinGecoItem.price.decimals,
        },
      })
    })

    return prices
  }

  async _updatePrices() {
    await this._nearClient.account.functionCall({
      methodName: 'report_prices_triple',
      contractId: nearConfig.contractName,
      args: { prices: await this._getPrices() },
    })
  }
}
