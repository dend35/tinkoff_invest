const TelegramHelper = require('./TelegramHelper.js');
const TinkoffHelper = require('./TinkoffHelper.js');


async function Main(){
    TelegramHelper.Start()
    TelegramHelper.SendMessage(await TinkoffHelper.GetPositionsReport())
    setInterval(async ()=>TelegramHelper.SendMessage(await TinkoffHelper.GetPositionsReport()), 3600000)
}

Main()