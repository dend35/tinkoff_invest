const fetch = require('node-fetch');
var GetCurrencyCourse = async () => await (await fetch("https://www.cbr-xml-daily.ru/latest.js")).json()

module.exports.Convert_RUB_To_USD = async (num) => {
    let courseUSD = (await GetCurrencyCourse()).rates.USD
    return num * courseUSD  
}

module.exports.Convert_USD_To_RUB = async (num) => {
    let courseUSD = (await GetCurrencyCourse()).rates.USD
    return num / courseUSD  
}