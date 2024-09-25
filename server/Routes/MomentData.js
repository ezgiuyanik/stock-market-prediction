const puppeteer = require('puppeteer');

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bitirme_piyasa'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }
  console.log('Connected to database with connection id ' + connection.threadId);
});


const scrape = async (from,to) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const formattedDate = `${day}.${month}.${year}`;

  

  const url = `https://www.xe.com/currencyconverter/convert/?Amount=1&From=${from}&To=${to}`;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const [element] = await page.$x('//*[@id="__next"]/div[2]/div[2]/section/div[2]/div/main/div/div[2]/div[1]/p[2]/text()[1]');
  const text = await element.getProperty('textContent');
  const textValue = await text.jsonValue();
  console.log(textValue);

  const value = textValue; // burada veritabanına kaydetmek istediğiniz değeri atayın

  const query = `INSERT INTO tbl_dolar (Tarih, Şimdi) VALUES ('${formattedDate}','${value}')`;

    connection.query(query, (err, result) => {
      if (err) throw err;
      console.log('Data inserted successfully');
      connection.end(); // veritabanı bağlantısını kapatın
    });

  await browser.close();
};

scrape('USD','TRY');


