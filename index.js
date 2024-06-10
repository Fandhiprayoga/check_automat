
const puppeteer = require('puppeteer');
const cron = require('node-cron');
const TelegramBot = require('node-telegram-bot-api'); 
require('dotenv').config();

const url = process.env.URL;
const selector = process.env.SELECTOR
const bot_token = process.env.BOT_TOKEN;
const chatid= process.env.CHATID;

const bot = new TelegramBot(bot_token, { polling: true });

async function takeScreenshot(url) {
    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(url);
  
      await page.waitForSelector('body');
  
      // Buat timestamp
      const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
      const filename = `screenshot-${timestamp}.png`;
  
      await page.screenshot({ path: 'ss/'+filename, fullPage: true });
  
      await browser.close();
      console.log(`Screenshot berhasil disimpan ke ${filename}`);

      bot
        .sendPhoto(process.env.CHATID, 'ss/'+filename)
        .then((msg) => {
          console.log("Gambar terkirim:", msg.photo[0].file_id);
        })
        .catch((error) => {
          console.error("Gagal mengirim gambar:", error);
        });

    } catch (error) {
      console.error('Terjadi kesalahan:', error);
    }
  }

async function checkElementExists(url, selector) {
    try {
        const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'], });
        const page = await browser.newPage();
        await page.goto(url);

        const element = await page.$(selector);

        if (element) {
            console.log(`Website aman !`);

            bot.sendMessage(chatid, 'Igracias terpantau aman 🆗')
            .then((msg) => {
                console.log('Pesan terkirim:', msg.text);
            })
            .catch((error) => {
                console.error('Gagal mengirim pesan:', error);
            });
            // takeScreenshot(url)
        } else {

            bot.sendMessage(chatid, 'Ada indikasi website mengalami serangan 🚨')
            .then((msg) => {
                console.log('Pesan terkirim:', msg.text);
            })
            .catch((error) => {
                console.error('Gagal mengirim pesan:', error);
            });

            takeScreenshot(url)
            console.log(`ada indikasi website mengalami serangan !`);

        }

        await browser.close();
    } catch (error) {
        console.error('Terjadi kesalahan:', error);
    }
}


// Menjalankan tugas setiap menit
cron.schedule('* * * * *', () => {
    // console.log('Tugas cron dijalankan setiap menit!');
    // Tambahkan kode tugas Anda di sini
    checkElementExists(url, selector);
});
