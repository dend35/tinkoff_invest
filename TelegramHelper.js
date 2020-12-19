const Settings = require('./settings.js');
const TinkoffHelper = require('./TinkoffHelper.js');
var Telegraf = require('telegraf')
const bot = new Telegraf(Settings.TelegramToken)

function Start(){
    var menu = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Отчет', callback_data: 'rep'}, { text: 'Пока ничего', callback_data: 'rep' }]
            ]
        }
    };
    bot.on('sticker', (ctx) => ctx.reply('Ненадо ломать бота'))
    bot.start(async (ctx) => await ctx.reply("Меню", menu))
    
    bot.action('rep', async (ctx) => {
        await ctx.reply(await TinkoffHelper.GetPositionsReport(), menu)
    })
    bot.command('rep', async (ctx) => {
        await ctx.reply(await TinkoffHelper.GetPositionsReport(), menu)
    })
    bot.launch()
}

function SendMessage(text){
    bot.telegram.sendMessage(Settings.TelegramUser, text)
}

module.exports.Start = Start
module.exports.SendMessage = SendMessage