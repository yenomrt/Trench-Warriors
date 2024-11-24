const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cors = require('cors');

const axios = require('axios');
const cheerio = require('cheerio');

//const { Metadata } = require('@metaplex-foundation/mpl-token-metadata');
const { Connection, PublicKey } = require('@solana/web3.js');
const {
        findProgramAddress,
    toPublicKey,
    getMetadataAccount,
    decodeMetadata,
    Metadata,
    Data,
    Creator,
    MetadataKey
  } = require('./metadata');
  

puppeteer.use(StealthPlugin());

const app = express();
const PORT = 3001;

//app.use(cors({
    //origin: 'http://localhost:3000'
//}));
app.use(cors());

app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // You can replace '*' with a specific domain like 'http://localhost:3000'
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });
  

const bs58 = require('bs58'); // Base58 for decoding

const API_KEY = "586264ce-df55-4e09-8f4f-3cf8dd64940e";
const SOLANA_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${API_KEY}`;


app.post('/get-pf-info2', async (req, res) => {
    const { mint } = req.body;

    if (!mint) {
        console.error('No mint address provided');
        return res.status(400).json({ error: 'Token mint address is required' });
    }

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        const url = `https://pump.fun/coin/${mint}`;
        console.log(`Navigating to URL: ${url}`);

        await page.setExtraHTTPHeaders({
            "accept": "application/json, text/plain, */*",
              "accept-language": "en-US,en;q=0.9,ru;q=0.8",
              "if-none-match": "W/\"1f2c7-Fi1D88dgO9HPsLtzsowG/ES5CTk\"",
              "priority": "u=1, i",
              "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
              "sec-ch-ua-arch": "\"x86\"",
              "sec-ch-ua-bitness": "\"64\"",
              "sec-ch-ua-full-version": "\"131.0.6778.86\"",
              "sec-ch-ua-full-version-list": "\"Google Chrome\";v=\"131.0.6778.86\", \"Chromium\";v=\"131.0.6778.86\", \"Not_A Brand\";v=\"24.0.0.0\"",
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-model": "\"\"",
              "sec-ch-ua-platform": "\"Windows\"",
              "sec-ch-ua-platform-version": "\"10.0.0\"",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "cookie": "_ga=GA1.1.917543683.1729617781; cf_clearance=a88Ue571P9KVbsG9kmCGwYaZdgtjze3ucqAp38ujSzM-1732275635-1.2.1.1-BVwaXXZJNhn3YPO9xMnXYWe57AbWqGzprIwM5nOzlSg7FZEMwdjUT6UC61ZhwVX7cg1A7w4P8ZtlkIdzNtqdKruNCnncnYDLRFMvbUCQ8.Qt0vnTG8TgxHjFNwtVEX2Jd.gM3b6x2vYmjUkr.Sth2NbRpRINx1_WKuxukQdRW0VdNga1hU55nYZEZUiDpDjJreOtZ2oWOPW7P233okgZ2MjbYF5ULfR_SHE4E6zPwyqH7YhTrHsB49BgHAg39O3d7AVem3Ax05gnKxKC.Ze1yw3sjd9.c9tnY05O8N9uYqqw0VwkHTEirzTpMM4_NbowD0qfPDgUrFkk6Q2Sm0CFatU5Ug7xnlb_.JYLv2c6CrbcCyUve2r2sFrkCV6mVlL5THEWRA9aSfPLTt_aUtyoHGlSSHv3oV4JCVF07KthqRfTJHRjZs4WxRcRb5q4uz1M; __cf_bm=wCUBZVTVtfqivnuEQwfchNB0Uud2t1CLpu9qUsJgJpw-1732279135-1.0.1.1-SXXk2ZMPvczRq1Nt_0XIGDGsO1wyW4uozu8NZah6SXUrkBJQ2vg5PCtyQ1T9qkXTTiHWVH14hfuNyGXOzYwgAA; _ga_0XM0LYXGC8=GS1.1.1732279224.82.0.1732279224.0.0.0",
              "Referer": "https://pump.fun",
              "Referrer-Policy": "same-origin"
        });
    
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Extract data from the page
        const pageContent = await page.evaluate(() => document.body.innerText);
        //const parsedData = JSON.parse(pageContent);
        //console.log("Parsed data:", parsedData.data);
        console.log("Parsed data:", pageContent);

        await browser.close();
        //res.json(parsedData.data)
    } catch (error) {
        console.error('Error scraping GMGN.ai:', error);
        res.status(500).json({ error: 'Failed to scrape data' });
    }

    

    
});

app.get('/get-pf-info4', async (req, res) => {
    console.log('Gettinf pf info on server');
    const { mint } = req.body;
    if (!mint) {
        console.error('No mint address provided');
        return res.status(400).json({ error: 'Token mint address is required' });
    }

    try {
      const coinData = await fetchCoinData(mint); // Assuming this function fetches and returns the coin data
  
      // Destructure the coinData to separate prevcoins
      const { prevcoins, ...generalInfo } = coinData;
  
      // Generate HTML for general information table
      let generalInfoTable = '<table border="1"><tr>';
      for (let key in generalInfo) {
        generalInfoTable += `<th>${key}</th>`;
      }
      generalInfoTable += '</tr><tr>';
      for (let key in generalInfo) {
        generalInfoTable += `<td>${generalInfo[key]}</td>`;
      }
      generalInfoTable += '</tr></table>';
  
      // Generate HTML for prevcoins table
      let prevcoinsTable = '<table border="1"><tr><th>Previous Coins</th></tr>';
      prevcoins.forEach(coin => {
        prevcoinsTable += `<tr><td>${coin}</td></tr>`;
      });
      prevcoinsTable += '</table>';
  
      // Combine both tables into a single HTML response
      const htmlResponse = `
        <html>
          <head>
            <title>Coin Analysis</title>
          </head>
          <body>
            <h1>Coin Analysis</h1>
            <h2>General Information</h2>
            ${generalInfoTable}
            <h2>Previous Coins</h2>
            ${prevcoinsTable}
          </body>
        </html>
      `;
  
      // Send the HTML response
      res.send(htmlResponse);
    } catch (error) {
      console.error('Error fetching coin data:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  
async function fetchCoinData(mint) {
    try {
      const url = `https://pump.fun/coin/${mint}`;
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
  
      const match = data.match(/{\\"coin\\".*?(\{[^}]*\}|\})*}/s);
  
      if (match) {
        try {
          let jsonString = match[0].replace(/\\"/g, '"');
          console.log(jsonString);
          const jsonData = JSON.parse(jsonString);
          console.log("Parsed JSON Data:", jsonData);
          console.log("Creator:", jsonData.coin.creator);
  
          try {
            const url2 = `https://frontend-api.pump.fun/coins/user-created-coins/${jsonData.coin.creator}?offset=0&limit=20&includeNsfw=false`;
            console.log(url2);
            const data2 = await axios.get(url2);
            console.log(data2.data);
            jsonData.coin.prevcoins = data2.data;
            console.log(1);
            const { prevcoins, ...generalInfo } = jsonData.coin;
            
            // Generate HTML for general information table
            let generalInfoTable = '<table border="1"><tr>';
            for (let key in generalInfo) {
                generalInfoTable += `<th>${key}</th>`;
            }
            generalInfoTable += '</tr><tr>';
            for (let key in generalInfo) {
                generalInfoTable += `<td>${generalInfo[key]}</td>`;
            }
            generalInfoTable += '</tr></table>';
        
            // Generate HTML for prevcoins table
            let prevcoinsTable = '<table border="1"><tr><th>Previous Coins</th></tr>';
            prevcoins.forEach(coin => {
                prevcoinsTable += `<tr><td>${coin}</td></tr>`;
            });
            prevcoinsTable += '</table>';
        
            // Combine both tables into a single HTML response
            const htmlResponse = `
                
                    <h1>Coin Analysis</h1>
                    <h2>General Information</h2>
                    ${generalInfoTable}
                    <h2>Previous Coins</h2>
                    ${prevcoinsTable}
                
            `;
            console.log(htmlResponse);
            // Send the HTML response
            res.send(htmlResponse);
          } catch (error) {
            console.error("Error fetching creator's coins:", error);
          }
  
          // Send the response
          return jsonData;
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  

app.post('/get-pf-info', async (req, res) => {
    const { mint } = req.body;
    
    if (!mint) {
        console.error('No mint address provided');
        return res.status(400).json({ error: 'Token mint address is required' });
    }

    
    (async () => {
        try {
          const url = `https://pump.fun/coin/${mint}`;
          const { data } = await axios.get(url);
          //console.log(data);
          const $ = cheerio.load(data);
      
          const match = data.match(/{\\"coin\\".*?(\{[^}]*\}|\})*}/s);

    
    if (match) {
        
        try {
            jsonString = match[0].replace(/\\"/g, '"');
            console.log(jsonString);
            const jsonData = JSON.parse(jsonString);
            console.log("Parsed JSON Data:", jsonData);
            console.log("Creator:", jsonData.coin.creator);
            try {
                const url2 = `https://frontend-api.pump.fun/coins/user-created-coins/${jsonData.coin.creator}?offset=0&limit=20&includeNsfw=false`;
                console.log(url2);
                data2 = await axios.get(url2);
                console.log(data2.data);
                jsonData.coin.prevcoins = data2.data;
                const { prevcoins, ...generalInfo } = jsonData.coin;
            
                // Generate HTML response with vertical layout tables
                let generalInfoTable = '<table border="1">';
                for (let key in jsonData.coin) {
                if (key !== 'prevcoins') {
                    generalInfoTable += `<tr><th>${key}</th><td>${jsonData.coin[key]}</td></tr>`;
                }
                }
                generalInfoTable += '</table>';

                // Generate HTML for prevcoins table
                let prevcoinsTable = '<table border="1">';
                if (jsonData.coin.prevcoins.length > 0) {
                jsonData.coin.prevcoins.slice(1).forEach((coin, index) => {
                    prevcoinsTable += `<tr><th colspan="2">Previous Coin ${index + 1}</th></tr>`;
                    for (let key in coin) {
                    prevcoinsTable += `<tr><th>${key}</th><td>${coin[key]}</td></tr>`;
                    }
                });
                } else {
                prevcoinsTable += '<tr><th>No previous coins available</th></tr>';
                }
                prevcoinsTable += '</table>';
            
                // Combine both tables into a single HTML response
                const htmlResponse = `
                    
                        <h1>Coin Analysis</h1>
                        <h2>General Information</h2>
                        ${generalInfoTable}
                        <h2>Previous Coins</h2>
                        ${prevcoinsTable}
                    
                `;
                console.log(htmlResponse);
                // Send the HTML response
                res.send(htmlResponse);
            }
            catch (error) {
                console.error("Error parsing JSON:", error);
            }
            //res.json(jsonData)

            // Access specific fields, for example:
            //console.log("Twitter Link:", jsonData.twitter);
        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
        //try {
        //    // Parse the JSON string
        //    jsonData = JSON.parse(match[0]);
        //    console.log("Found JSON data:", jsonData);
        //} catch (error) {
        //    console.error("Error parsing JSON:", error);
        //}
    }
          
          //console.log({ twitter, telegram, website });
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      })();

    

    
});

app.post('/fetch-top-traders2', async (req, res) => {
    const { mint } = req.body;

    if (!mint) {
        console.error('No mint address provided');
        return res.status(400).json({ error: 'Token mint address is required' });
    }

    (async () => {
        try {
          const url = `https://gmgn.ai/defi/quotation/v1/tokens/top_traders/sol/${mint}?orderby=realized_profit&direction=desc`;
          const { data } = await axios.get(url);
          console.log(data);
          const $ = cheerio.load(data);
      
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      })();

    

    
});

app.post('/fetch-top-traders', async (req, res) => {
    const { mint } = req.body;

    if (!mint) {
        console.error('No mint address provided');
        return res.status(400).json({ error: 'Token mint address is required' });
    }

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        const url = `https://gmgn.ai/defi/quotation/v1/tokens/top_traders/sol/${mint}?orderby=realized_profit&direction=desc`;
        console.log(`Navigating to URL: ${url}`);

        await page.setExtraHTTPHeaders({
            "accept": "application/json, text/plain, */*",
              "accept-language": "en-US,en;q=0.9,ru;q=0.8",
              "if-none-match": "W/\"1f2c7-Fi1D88dgO9HPsLtzsowG/ES5CTk\"",
              "priority": "u=1, i",
              "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
              "sec-ch-ua-arch": "\"x86\"",
              "sec-ch-ua-bitness": "\"64\"",
              "sec-ch-ua-full-version": "\"131.0.6778.86\"",
              "sec-ch-ua-full-version-list": "\"Google Chrome\";v=\"131.0.6778.86\", \"Chromium\";v=\"131.0.6778.86\", \"Not_A Brand\";v=\"24.0.0.0\"",
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-model": "\"\"",
              "sec-ch-ua-platform": "\"Windows\"",
              "sec-ch-ua-platform-version": "\"10.0.0\"",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "cookie": "_ga=GA1.1.917543683.1729617781; cf_clearance=a88Ue571P9KVbsG9kmCGwYaZdgtjze3ucqAp38ujSzM-1732275635-1.2.1.1-BVwaXXZJNhn3YPO9xMnXYWe57AbWqGzprIwM5nOzlSg7FZEMwdjUT6UC61ZhwVX7cg1A7w4P8ZtlkIdzNtqdKruNCnncnYDLRFMvbUCQ8.Qt0vnTG8TgxHjFNwtVEX2Jd.gM3b6x2vYmjUkr.Sth2NbRpRINx1_WKuxukQdRW0VdNga1hU55nYZEZUiDpDjJreOtZ2oWOPW7P233okgZ2MjbYF5ULfR_SHE4E6zPwyqH7YhTrHsB49BgHAg39O3d7AVem3Ax05gnKxKC.Ze1yw3sjd9.c9tnY05O8N9uYqqw0VwkHTEirzTpMM4_NbowD0qfPDgUrFkk6Q2Sm0CFatU5Ug7xnlb_.JYLv2c6CrbcCyUve2r2sFrkCV6mVlL5THEWRA9aSfPLTt_aUtyoHGlSSHv3oV4JCVF07KthqRfTJHRjZs4WxRcRb5q4uz1M; __cf_bm=wCUBZVTVtfqivnuEQwfchNB0Uud2t1CLpu9qUsJgJpw-1732279135-1.0.1.1-SXXk2ZMPvczRq1Nt_0XIGDGsO1wyW4uozu8NZah6SXUrkBJQ2vg5PCtyQ1T9qkXTTiHWVH14hfuNyGXOzYwgAA; _ga_0XM0LYXGC8=GS1.1.1732279224.82.0.1732279224.0.0.0",
              "Referer": "https://gmgn.ai/sol/token/4HuSTfcJruukNbhrF9sc5iKrMeGxNBs6XpQ1L2hUpump?tab=traders",
              "Referrer-Policy": "same-origin"
        });
    
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Extract data from the page
        const pageContent = await page.evaluate(() => document.body.innerText);
        const parsedData = JSON.parse(pageContent);
        console.log("Parsed data:", parsedData.data);

        await browser.close();
        res.json(parsedData.data)
    } catch (error) {
        console.error('Error scraping GMGN.ai:', error);
        res.status(500).json({ error: 'Failed to scrape data' });
    }

    

    
});

app.post('/fetch-trader-details', async (req, res) => {
    const { address } = req.body;

    if (!address) {
        console.error('No mint address provided');
        return res.status(400).json({ error: 'Token mint address is required' });
    }

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        const url = `https://gmgn.ai/api/v1/wallet_holdings/sol/${address}?limit=200&orderby=last_active_timestamp&direction=desc&showsmall=true&sellout=true&tx30d=true`;
        console.log(`Navigating to URL: ${url}`);

        await page.setExtraHTTPHeaders({
            "accept": "application/json, text/plain, */*",
              "accept-language": "en-US,en;q=0.9,ru;q=0.8",
              "if-none-match": "W/\"1f2c7-Fi1D88dgO9HPsLtzsowG/ES5CTk\"",
              "priority": "u=1, i",
              "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
              "sec-ch-ua-arch": "\"x86\"",
              "sec-ch-ua-bitness": "\"64\"",
              "sec-ch-ua-full-version": "\"131.0.6778.86\"",
              "sec-ch-ua-full-version-list": "\"Google Chrome\";v=\"131.0.6778.86\", \"Chromium\";v=\"131.0.6778.86\", \"Not_A Brand\";v=\"24.0.0.0\"",
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-model": "\"\"",
              "sec-ch-ua-platform": "\"Windows\"",
              "sec-ch-ua-platform-version": "\"10.0.0\"",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "cookie": "_ga=GA1.1.917543683.1729617781; cf_clearance=a88Ue571P9KVbsG9kmCGwYaZdgtjze3ucqAp38ujSzM-1732275635-1.2.1.1-BVwaXXZJNhn3YPO9xMnXYWe57AbWqGzprIwM5nOzlSg7FZEMwdjUT6UC61ZhwVX7cg1A7w4P8ZtlkIdzNtqdKruNCnncnYDLRFMvbUCQ8.Qt0vnTG8TgxHjFNwtVEX2Jd.gM3b6x2vYmjUkr.Sth2NbRpRINx1_WKuxukQdRW0VdNga1hU55nYZEZUiDpDjJreOtZ2oWOPW7P233okgZ2MjbYF5ULfR_SHE4E6zPwyqH7YhTrHsB49BgHAg39O3d7AVem3Ax05gnKxKC.Ze1yw3sjd9.c9tnY05O8N9uYqqw0VwkHTEirzTpMM4_NbowD0qfPDgUrFkk6Q2Sm0CFatU5Ug7xnlb_.JYLv2c6CrbcCyUve2r2sFrkCV6mVlL5THEWRA9aSfPLTt_aUtyoHGlSSHv3oV4JCVF07KthqRfTJHRjZs4WxRcRb5q4uz1M; __cf_bm=wCUBZVTVtfqivnuEQwfchNB0Uud2t1CLpu9qUsJgJpw-1732279135-1.0.1.1-SXXk2ZMPvczRq1Nt_0XIGDGsO1wyW4uozu8NZah6SXUrkBJQ2vg5PCtyQ1T9qkXTTiHWVH14hfuNyGXOzYwgAA; _ga_0XM0LYXGC8=GS1.1.1732279224.82.0.1732279224.0.0.0",
              "Referer": "https://gmgn.ai/sol/token/4HuSTfcJruukNbhrF9sc5iKrMeGxNBs6XpQ1L2hUpump?tab=traders",
              "Referrer-Policy": "same-origin"
        });
    
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Extract data from the page
        const pageContent = await page.evaluate(() => document.body.innerText);
        const parsedData = JSON.parse(pageContent);
        console.log("Parsed data:", parsedData.data);

        await browser.close();
        res.json(parsedData.data)
    } catch (error) {
        console.error('Error scraping GMGN.ai:', error);
        res.status(500).json({ error: 'Failed to scrape data' });
    }

    

    
});


app.post('/get-wallet-tokens', async (req, res) => {
    const { walletPublicKey } = req.body;

    if (!walletPublicKey) {
        return res.status(400).json({ error: 'Wallet public key is required' });
    }

    try {
        const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(new PublicKey(walletPublicKey), {
            programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        });

        const tokens = [];

        for (const tokenAccount of tokenAccounts.value) {
            const { mint, tokenAmount } = tokenAccount.account.data.parsed.info;
            const balance = tokenAmount.uiAmount;
            const decimals = tokenAmount.decimals;

            if (balance > 0) {
                let name = mint;
                let symbol = 'N/A';
                let imageUrl = null;

                // Fetch metadata for each token
                try {
                    const metadataResponse = await fetch('http://localhost:3001/get-token-metadata', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ mint }),
                    });

                    if (metadataResponse.ok) {
                        const metadata = await metadataResponse.json();
                        name = metadata.name || mint;
                        symbol = metadata.symbol || 'N/A';

                        if (metadata.uri) {
                            const uriResponse = await fetch(metadata.uri);
                            if (uriResponse.ok) {
                                const uriData = await uriResponse.json();
                                if (uriData.image) {
                                    imageUrl = uriData.image;
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error fetching metadata for token:', mint, error);
                }

                tokens.push({ mint, name, symbol, balance, decimals, imageUrl });
            }
        }

        res.json(tokens);
    } catch (error) {
        console.error('Error fetching wallet tokens:', error);
        res.status(500).json({ error: 'Failed to fetch wallet tokens' });
    }
});

app.post('/get-token-metadata', async (req, res) => {
    const { mint } = req.body;

    if (!mint) {
        console.error('Token mint address is missing.');
        return res.status(400).json({ error: 'Token mint address is required' });
    }

    try {
        const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=586264ce-df55-4e09-8f4f-3cf8dd64940e');
        const mintPublicKey = new PublicKey(mint);
        
        let mint_ = await connection.getParsedAccountInfo(
            new PublicKey(mint)
        )
        
        // all the token data is here
        //console.log(mint_.value.data.parsed)
        


        console.log(`Fetching metadata for mint: ${mint}`);

        // Derive Metadata PDA
        const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
        const [metadataPDA] = await PublicKey.findProgramAddress(
            [
                Buffer.from('metadata'),
                METADATA_PROGRAM_ID.toBuffer(),
                mintPublicKey.toBuffer(),
            ],
            METADATA_PROGRAM_ID
        );

        console.log(`Derived metadata PDA: ${metadataPDA.toString()}`);

        // Fetch metadata account info
        const accountInfo = await connection.getAccountInfo(metadataPDA);
        if (accountInfo === null) {
            throw new Error('Metadata account not found');
        }

        // get metadata account that holds the metadata information
        console.log(accountInfo.data);

  // finally, decode metadata

        // Use Buffer to Deserialize Account Data
        const accountData = decodeMetadata(accountInfo.data).data;
        console.log(accountData);
        
        console.log(`Metadata name: ${accountData.name}, symbol: ${accountData.symbol}`);

        res.json({
            name: accountData.name || mint,
            symbol: accountData.symbol || 'N/A',
            uri: accountData.uri || 'N/A',
        });
    } catch (error) {
        console.error('Error fetching metadata:', error);
        res.status(500).json({ error: 'Failed to fetch token metadata' });
    }
});




app.post('/scrape-holders', async (req, res) => {
    const { mint } = req.body;

    if (!mint) {
        return res.status(400).json({ error: 'Token mint address is required' });
    }

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        const url = `https://gmgn.ai/sol/token/${mint}?tab=holders`;
        console.log(`Navigating to URL: ${url}`);
        
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Function to close pop-ups
        async function closePopups(page) {
            try {
                const popupSelector = '.chakra-modal__content-container'; // Update with actual pop-up selector
                if (await page.$(popupSelector)) {
                    console.log('Closing pop-up');
                    await page.click(`${popupSelector} .css-147wlxj`); // Update with the close button selector inside the popup
                }
            } catch (error) {
                console.error('No pop-ups found or error in closing:', error);
            }
        }

        // Attempt to close all pop-ups
        await closePopups(page);


        // Click the Holders button
        //await page.waitForSelector('div.css-j2at52'); // Update with actual selector for the Holders button
        //await page.click('div.css-j2at52');
        //console.log("Clicked on Holders button");

        // Wait for the holders data to be visible (adjust selector accordingly)
        
        // Extract holders information (adjust selectors accordingly)
        const holders = await page.evaluate(() => {
            const holderElements = document.querySelectorAll('.css-1o2kb31 .g-table-row-level-0'); // Adjust selector accordingly
            return Array.from(holderElements).map(el => ({
                address: el.getAttribute('data-row-key') || 'N/A', // Replace 'data-attribute' with the actual attribute name you need
                balance: el.querySelector('.css-dfupkp')?.innerText || 'N/A',
                solbalance: el.querySelector('.css-18nmrxp')?.innerText || 'N/A',
                age: el.querySelector('.css-1yd8cmq')?.innerText || 'N/A'    
            }));
        });

        //console.log('Holders found:', holders);
        await browser.close();
        res.json({ holders });
    } catch (error) {
        console.error('Error scraping GMGN.ai:', error);
        res.status(500).json({ error: 'Failed to scrape data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

function findMetadataPDA(mint) {
    return PublicKey.findProgramAddress(
        [
            Buffer.from("metadata"),
            METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
        ],
        METADATA_PROGRAM_ID
    );
}

function decodeAndLogData(data) {
    const { getCreateMetadataAccountV3InstructionDataSerializer } = require('@metaplex-foundation/mpl-token-metadata');

    const dataSerializer = getCreateMetadataAccountV3InstructionDataSerializer();
    const decodedData = dataSerializer.deserialize(bs58.decode(data));
    return decodedData;
}

