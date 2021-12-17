module.exports = class Price {
  constructor(assetId, multiplier, decimals) {
    this.asset_id = assetId
    this.price = { multiplier, decimals }
  }
}
