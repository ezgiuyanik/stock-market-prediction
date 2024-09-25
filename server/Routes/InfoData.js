const express = require('express');
const mysql = require('mysql2');

const cors = require('cors');
const app = express();

app.use(cors({
  origin: '*'
}));

const connectiondata = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bitirme_data',
  multipleStatements: true
});

connectiondata.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database!');
});

app.get("/tables/:tableName", (req, res) => {
  const tableName = req.params.tableName;
  const realTableName = `tbl_${tableName}`;

  connectiondata.query(`SELECT * FROM ${realTableName}`, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return;
    }
    
    // Verileri JSON formatında gönder
    res.send(JSON.stringify(results));
  });
});


app.get('/tables', (req, res) => {
  connectiondata.query('SHOW TABLES', (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).send('Internal server error');
    }
    
    const tableNames = results.map(result => result[`Tables_in_${connectiondata.config.database}`]);
    const lastValues = {};
    let remainingQueries = tableNames.length;

    tableNames.forEach(tableName => {
      connectiondata.query(`SELECT Açılış FROM ${tableName} ORDER BY Tarih DESC LIMIT 1`, (error, results) => {
        if (error) {
          console.error(error);
          return res.status(500).send('Internal server error');
        }

        lastValues[tableName] = results[0].Açılış;

        remainingQueries--;
        if (remainingQueries === 0) {
          
          const lastValuesArray = [];
          tableNames.forEach(tableName => {
            const lastValueObj = {
              tableName: tableName,
              lastValue: lastValues[tableName]
            };
            lastValuesArray.push(lastValueObj);
          });
          res.send(lastValuesArray);

        }
      });
    });
  });
});



  app.get ('/scrape/:tableName', async (req, res) => {
    const tableName = req.params.tableName;
    const convertedName = tableName.toUpperCase() + ".IS";
    const databaseTableName = `tbl_${tableName}`;
    const url = `https://finance.yahoo.com/quote/${convertedName}/`;

    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(url);

      const elementXPath = '//*[@id="quote-header-info"]/div[3]/div[1]/div/fin-streamer[1]';
  
        const text = await page.$x(elementXPath);
        const anlik = await page.evaluate(el => el.textContent, text[0]);
        
        console.log('anlik:', anlik);
        
        await browser.close();
      } catch (error) {
        console.error('Hata:', error);
      }
    });


      //ÇALIŞAN SON HALİ		
    //tüm tabloların isimlerinin çekilmesi
      //tablolardan her gün saat 6'da veri kazıma
      //verileri veritabanına yazma işlemleri


    // Gerekli modüllerin import edilmesi
    const cron = require('node-cron');
    const puppeteer = require('puppeteer');

    // Express uygulamasının oluşturulması

    app.use(express.json());

    // Veritabanı bağlantısı

    // Veri güncellendi uyarısı için bir nesne
    const updatedData = {};

    // POST isteği ile veri kazıma endpoint'inin tanımlanması
    app.post('/scrape-database/:tableName', async (req, res) => {
    const tableName = req.params.tableName;

    try {
      await scrapeDatabase(tableName);
      res.json({ success: true });
    } catch (error) {
      console.error('Hata:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
    });

    // Her gün saat 18.00'da veri kazıma işlemini başlatan cron job'ın tanımlanması
    cron.schedule('15 16 * * *', async () => {
    try {
      const tableNames = await getTableNames();
      for (const tableName of tableNames) {
        try {
          await scrapeDatabase(tableName);
          console.log(`"${tableName}" tablosu için veri kazıma işlemi tamamlandı.`);
        } catch (error) {
          console.error(`"${tableName}" tablosu için hata:`, error);
        }
      }
    } catch (error) {
      console.error('Hata var:', error);
    }
    });

  // Veri kazıma fonksiyonu
  async function scrapeDatabase(tableName) {
  const convertedName = tableName.toUpperCase() + ".IS";
  const databaseTableName = `tbl_${tableName}`;

  const url = `https://finance.yahoo.com/quote/${convertedName}/history?p=${convertedName}`;

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    await page.waitForNavigation();  // Sayfanın tamamen yüklenmesini bekleyin

    const tarihXPath = '//*[@id="Col1-1-HistoricalDataTable-Proxy"]/section/div[2]/table/tbody/tr[1]/td[1]/span';
    const açılışXPath = '//*[@id="Col1-1-HistoricalDataTable-Proxy"]/section/div[2]/table/tbody/tr[1]/td[2]/span';
    const yüksekXPath = '//*[@id="Col1-1-HistoricalDataTable-Proxy"]/section/div[2]/table/tbody/tr[1]/td[3]/span';
    const düşükXPath = '//*[@id="Col1-1-HistoricalDataTable-Proxy"]/section/div[2]/table/tbody/tr[1]/td[4]/span';
    const kapanışXPath = '//*[@id="Col1-1-HistoricalDataTable-Proxy"]/section/div[2]/table/tbody/tr[1]/td[5]/span';
    const adjcloseXPath = '//*[@id="Col1-1-HistoricalDataTable-Proxy"]/section/div[2]/table/tbody/tr[1]/td[6]/span';
    const hacimXPath = '//*[@id="Col1-1-HistoricalDataTable-Proxy"]/section/div[2]/table/tbody/tr[1]/td[6]/span';

    const tarihElementHandle = await page.$x(tarihXPath);
    const açılışElementHandle = await page.$x(açılışXPath);
    const yüksekElementHandle = await page.$x(yüksekXPath);
    const düşükElementHandle = await page.$x(düşükXPath);
    const kapanışElementHandle = await page.$x(kapanışXPath);
    const adjcloseElementHandle = await page.$x(adjcloseXPath);
    const hacimElementHandle = await page.$x(hacimXPath);

    //Value değerlerini al
    const tarihValue = await page.evaluate(el => el.textContent, tarihElementHandle[0]);
    const açılışValue = await page.evaluate(el => el.textContent, açılışElementHandle[0]);
    const yüksekValue = await page.evaluate(el => el.textContent, yüksekElementHandle[0]);
    const düşükValue = await page.evaluate(el => el.textContent, düşükElementHandle[0]);
    const kapanışValue = await page.evaluate(el => el.textContent, kapanışElementHandle[0]);
    const adjcloseValue = await page.evaluate(el => el.textContent, adjcloseElementHandle[0]);
    const hacimValue = await page.evaluate(el => el.textContent, hacimElementHandle[0]);

    const hacimValueWithoutCommas = hacimValue.replace(/,/g, '');
    const hacimIntValue = parseInt(hacimValueWithoutCommas);
    await browser.close();

    const formattedTarih = formatDate(tarihValue);
    const checkQuery = `SELECT COUNT(*) AS count FROM ${databaseTableName} WHERE Tarih = ?`;
    const checkValues = [formattedTarih];
    
    connectiondata.query(checkQuery, checkValues, (error, results) => {
      if (error) {
        console.error('Hata:', error);
      } else {
        const rowCount = results[0].count;
        if (rowCount > 0) {
          // Veri güncellendi uyarısı için kontrol
          updatedData[tableName] = true;
          console.log(`"${tableName}" tablosunda güncelleme yapıldı.`);
        } else {
          // Yeni veri ekleme işlemi
          const insertQuery = `INSERT INTO ${databaseTableName} (Tarih, Açılış, Yüksek, Düşük, Kapanış, AdjClose, Hacim) VALUES (?, ?, ?, ?, ?, ?, ?)`;
          const insertValues = [formattedTarih, açılışValue, yüksekValue, düşükValue, kapanışValue, adjcloseValue, hacimIntValue];
    
          connectiondata.query(insertQuery, insertValues, (insertError, insertResults) => {
            if (insertError) {
              console.error('Hata:', insertError);
            } else {
              console.log(`"${tableName}" tablosu için veri eklendi.`);
            }
          });
        }
      }
    });
  } catch (error) {
    console.error(`"${tableName}" tablosu için hata:`, error);
  }
  }


    // Tablo isimlerini getiren fonksiyon
    async function getTableNames() {
    return new Promise((resolve, reject) => {
      connectiondata.query('SHOW TABLES', (error, results) => {
        if (error) {
          reject(error);
        } else {
          const tableNames = results.map(row => {
            const tableName = Object.values(row)[0];
            return tableName.replace('tbl_', ''); // "tbl_" kısmını kaldır
          });
          resolve(tableNames);
        }
      });
    });
    }

      // Tarihi formatlayan fonksiyon
      function formatDate(dateString) {
      const months = {
        January: '01',
        February: '02',
        March: '03',
        April: '04',
        May: '05',
        Jun: '06',
        July: '07',
        August: '08',
        September: '09',
        October: '10',
        November: '11',
        December: '12'
      };

      const tarihParts = dateString.split(' ');
      const month = months[tarihParts[0]];
      const day = tarihParts[1].replace(',', '');
      const year = tarihParts[2];
      const formattedTarih = `${year}-${month}-${day}`;

      return formattedTarih;
      }


      app.listen(3002, () => console.log('Server started on port 3002'));

