const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const cors = require('cors');
const bodyPerser = require('body-parser');

app.use(cors({ origin: true }));
app.use(bodyPerser.json());

app.get('/', (req, res) => {
  res.send('Changed to Docker');
});

app.get('/screenshot', async (req, res) => {
  console.log(req.query);
  let { x, y, width, height, clientWidth, clientHeight, Yoffset } = req.query;
  if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) {
    res.status(400).send('Invalid parameters');
    return;
  }

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--single-process', '--no-zygote'],
  });
  const page = await browser.newPage();

  await page.goto(req.headers.referer);
  await page.setViewport({ width: +clientWidth, height: +clientHeight });
  //   await page.evaluate(`window.scrollBy(0, 940)`); // scroll to a height of 1000 pixels
  if (+y < +Yoffset) {
    y = +y + +Yoffset;
  }
  const screenshotBuffer = await page.screenshot({
    clip: { x: +x, y: +y, width: +width, height: +height },
  });

  console.log('🚀 ~ file: app.js:32 ~ app.get ~ screenshotBuffer:', screenshotBuffer);

  res.set('Content-Type', 'image/png');
  res.send(screenshotBuffer);
  // console.log(y, width, height);

  await browser.close();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port 3000');
});
