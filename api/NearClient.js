const nearAPI = require('near-api-js')
const config = require('../config/config')
const nearConfig = require('../config/nearConfig')

module.exports = class NearClient {
  account

  constructor() {}

  async init() {
    if (!this.account) {
      const keyPair = nearAPI.utils.KeyPair.fromString(config.clientPrivateKey)
      const keyStore = new nearAPI.keyStores.InMemoryKeyStore()
      keyStore.setKey(nearConfig.networkId, config.clientId, keyPair)

      const connect = await nearAPI.connect({
        deps: {
          keyStore,
        },
        ...nearConfig,
      })
      this.account = await connect.account(config.clientId)
    }
  }
}
