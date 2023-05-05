const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

app.use(
  cors({
    origin: true,
  })
);

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.json('Server is Live');
});

app.get('/screenshot', async (req, res) => {
  console.log(req.query);
  let { x, y, width, height, clientWidth, clientHeight, Yoffset, url } = req.query;
  if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) {
    res.status(400).send('Invalid parameters');
    return;
  }

  // Validate URL parameter
  if (!url) {
    res.status(400).send('Missing URL parameter');
    return res.json('Url parameter is missing');
  }

  const browser = await puppeteer.launch({
    executablePath:
      process.env.NODE_ENV === 'production'
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
    args: [
      '--disable-setuid-sandbox',
      '--no-sandbox',
      '--single-process',
      '--no-zygote',
      '--disable-web-security',
      '--disable-features=IsolateOrigins',
      '--disable-site-isolation-trials',
      '--disable-features=BlockInsecurePrivateNetworkRequests',
    ],
  });
  const page = await browser.newPage();

  await page.goto(url);
  await page.setViewport({ width: +clientWidth, height: +clientHeight });
  //   await page.evaluate(`window.scrollBy(0, 940)`); // scroll to a height of 1000 pixels
  if (+y < +Yoffset) {
    y = +y + +Yoffset;
  }
  const screenshotBuffer = await page.screenshot({
    clip: { x: +x, y: +y, width: +width, height: +height },
  });

  res.set('Content-Type', 'image/png');
  res.send(screenshotBuffer);
  // console.log(y, width, height);

  await browser.close();
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is alive on PORT:${PORT}`);
});
