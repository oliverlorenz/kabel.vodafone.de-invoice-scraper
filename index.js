'use strict';

const puppeteer = require('puppeteer');
const program = require('commander');
const path = require('path');

function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

program
  .option('-u, --username <username>', 'The Username')
  .option('-p, --password <password>', 'The Password')
  .parse(process.argv);

if (!program.username || !program.password) {
  console.log('username and password are required');
  process.exit(1);
}

(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();

  const loginUrl = 'https://kabel.vodafone.de/customerSSO/UI/Login'
  await console.log(`open "${loginUrl}"`);
  await page.goto(loginUrl, {timeout: 60001});
  await page.type('#IDToken1', program.username);
  await page.type('#IDToken2', program.password);
  await delay(3000);

  const loginButtonSelector = 'body > div > div > section > div > div > div:nth-child(1) > div.form > form > a'
  await page.waitForSelector(loginButtonSelector);
  await page.click(loginButtonSelector);
  await console.log(`clicked login`);
  await delay(5000);

  const invoiceUrl = 'https://kabel.vodafone.de/meinkabel/rechnungen/rechnung';
  await console.log(`open "${invoiceUrl}"`);
  await page.goto(invoiceUrl, {timeout: 60003});
  await page.waitForSelector('body > div.main > div:nth-child(4) > section > div > div:nth-child(2) > div > div:nth-child(2) > div:nth-child(5) > div > a', {timeout: 60004});
  await console.log( __dirname + path.sep + 'downloads');
  await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: __dirname + path.sep + 'downloads'});
  await page.click('body > div.main > div:nth-child(4) > section > div > div:nth-child(2) > div > div:nth-child(2) > div:nth-child(5) > div > a');
  await delay(3000);
  await page.goto('https://kabel.vodafone.de/logoutsso');
  await console.log('done');
  await browser.close();
})();
