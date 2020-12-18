const Token = require('./settings.js').Token;
const CurrencyHelper = require('./CurrencyHelper.js');
const OpenAPI = require('@tinkoff/invest-openapi-js-sdk');
const api = new OpenAPI({
    apiURL: 'https://api-invest.tinkoff.ru/openapi/',
    socketURL: 'wss://api-invest.tinkoff.ru/openapi/md/v1/md-openapi/ws',
    secretToken: Token
});
async function GetPositionsData() {
    var portfolio = (await api.portfolio()).positions
    for(let item of portfolio){
        item.currentSum = item.balance * item.averagePositionPrice.value
        item.commonProfitRUB = item.averagePositionPrice.currency == 'USD' ? await CurrencyHelper.Convert_USD_To_RUB(item.expectedYield.value) : item.expectedYield.value
        item.commonProfitUSD = item.averagePositionPrice.currency == 'RUB' ? await CurrencyHelper.Convert_RUB_To_USD(item.expectedYield.value) : item.expectedYield.value
        item.profitRUB = item.averagePositionPrice.currency == 'RUB' ? item.expectedYield.value : 0
        item.profitUSD = item.averagePositionPrice.currency == 'USD' ? item.expectedYield.value : 0
        item.profitPercent = item.expectedYield.value / item.currentSum
    };

    let report = portfolio.reduce(function (sum, val){
        sum.commonRUB+=val.commonProfitRUB
        sum.commonUSD+=val.commonProfitUSD
        sum.RUB+=val.profitRUB
        sum.USD+=val.profitUSD
        sum.Percent= (sum.Percent + val.profitPercent) / 2
       return sum
    }, {commonRUB: 0,
        commonUSD: 0,
        RUB: 0,
        USD: 0,
        Percent: 0
    })

    return {Data: portfolio, Report: report}
}

async function GetPositionsReport(){
    return (await GetPositionsData()).Report
}



// async function test(){
//     var qqq = await GetPositionsReport()
//     console.log(qqq)
// }
// test()