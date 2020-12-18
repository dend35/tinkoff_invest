const Token = require('./settings.js').Token;
const CurrencyHelper = require('./CurrencyHelper.js');
const OpenAPI = require('@tinkoff/invest-openapi-js-sdk');
const api = new OpenAPI({
    apiURL: 'https://api-invest.tinkoff.ru/openapi/',
    socketURL: 'wss://api-invest.tinkoff.ru/openapi/md/v1/md-openapi/ws',
    secretToken: Token
});
async function main() {
    var portfolio = (await api.portfolio()).positions
    for(let item of portfolio){
        item.yieldSum = item.lots * item.expectedYield.value
        item.currentSum = item.lots * item.averagePositionPrice.value
        item.commonProfitRUB = item.averagePositionPrice.currency == 'USD' ? await CurrencyHelper.Convert_USD_To_RUB(item.currentSum - item.yieldSum) : item.currentSum - item.yieldSum
        item.commonProfitUSD = item.averagePositionPrice.currency == 'RUB' ? await CurrencyHelper.Convert_RUB_To_USD(item.currentSum - item.yieldSum) : item.currentSum - item.yieldSum
    };
    let totalProfit = portfolio.reduce(function (sum, val){
        sum.RUB+=val.commonProfitRUB
        sum.USD+=val.commonProfitUSD
       return sum
    }, {RUB: 0, USD: 0})
    console.log(totalProfit)
}

main()



// async function test(){
//     var qqq = await CurrencyHelper.Convert_USD_To_RUB(1)
//     console.log(qqq)
// }
// test()