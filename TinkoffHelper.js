const Token = require('./settings.js').TinkoffToken;
const CurrencyHelper = require('./CurrencyHelper.js');
const OpenAPI = require('@tinkoff/invest-openapi-js-sdk');
const api = new OpenAPI({
    apiURL: 'https://api-invest.tinkoff.ru/openapi/',
    socketURL: 'wss://api-invest.tinkoff.ru/openapi/md/v1/md-openapi/ws',
    secretToken: Token
});

async function GetPositionsData() {
    var portfolio = (await api.portfolio()).positions
    for (let item of portfolio) {
        item.currentSum = item.balance * item.averagePositionPrice.value
        item.currentSumRUB = item.averagePositionPrice.currency == 'USD' ? await CurrencyHelper.Convert_USD_To_RUB(item.currentSum) : item.currentSum
        item.currentSumUSD = item.averagePositionPrice.currency == 'RUB' ? await CurrencyHelper.Convert_RUB_To_USD(item.currentSum) : item.currentSum
        item.commonProfitRUB = item.averagePositionPrice.currency == 'USD' ? await CurrencyHelper.Convert_USD_To_RUB(item.expectedYield.value) : item.expectedYield.value
        item.commonProfitUSD = item.averagePositionPrice.currency == 'RUB' ? await CurrencyHelper.Convert_RUB_To_USD(item.expectedYield.value) : item.expectedYield.value
        item.profitRUB = item.averagePositionPrice.currency == 'RUB' ? item.expectedYield.value : 0
        item.profitUSD = item.averagePositionPrice.currency == 'USD' ? item.expectedYield.value : 0
        item.profitPercent = item.expectedYield.value / (item.balance * item.averagePositionPrice.value)
    };

    let report = portfolio.reduce(function (sum, val) {
        sum.commonRUB += val.commonProfitRUB
        sum.commonUSD += val.commonProfitUSD
        sum.RUB += val.profitRUB
        sum.USD += val.profitUSD
        sum.currentSumRUB += val.currentSumRUB
        sum.currentSumUSD += val.currentSumUSD
        sum.Percent = (sum.Percent + val.profitPercent) / 2
        return sum
    }, {
        commonRUB: 0,
        commonUSD: 0,
        RUB: 0,
        USD: 0,
        currentSumRUB: 0,
        currentSumUSD: 0,
        Percent: 0
    })

    return { Data: portfolio, Report: report }
}

async function GetPositionsReport(report) {
    if (!report)
        report = (await GetPositionsData()).Report
    let txt = `Активы RUB: ${report.currentSumRUB.toFixed(2)}\n` +
        `Активы USD: ${report.currentSumUSD.toFixed(2)}\n` +
        `Прибыль в RUB: ${report.commonRUB.toFixed(2)}\n` +
        `Прибыль в USD: ${report.commonUSD.toFixed(2)}\n` +
        `Прирост: ${(report.Percent * 100).toFixed(2)}%\n`
    return txt
}

async function GetFullPositionsReport() {
    let data = await GetPositionsData()
    let report = ""
    for (let item of data.Data) {
        report += `${item.name}: $${item.ticker}\n` +
        `🟠 Количество: ${item.balance}\n` +
        `🟡 Стоимость шт.: ${item.averagePositionPrice.value.toFixed(2)}\n` +
        `🟢 Сумма: ${item.currentSum.toFixed(2)} ${item.averagePositionPrice.currency}\n` +
        `🔵 Прирост: ${(item.profitPercent * 100).toFixed(2)}%\n` +
        `🟣 Прибыль: ${item.expectedYield.value} ${item.averagePositionPrice.currency} ${item.expectedYield.value==0? "🟨" : item.expectedYield.value>0 ? "🟩" : "🟥"}\n` +
        `\n`
    }
    report += await GetPositionsReport(data.Report)
    return report
}

module.exports.GetPositionsReport = GetPositionsReport
module.exports.GetFullPositionsReport = GetFullPositionsReport
module.exports.GetPositionsData = GetPositionsData