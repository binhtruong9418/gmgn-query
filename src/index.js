const { connect } = require('puppeteer-real-browser')
const fs = require("fs");

const HOLDING_DATA_URL = "https://gmgn.ai/api/v1/wallet_holdings/sol";
const sendLog = (message) => {
    console.log(`[${new Date().toLocaleString()}] ${message}`);
}

const saveFile = async = (listToken) => {
    const data = JSON.stringify(listToken, null, 2);
    fs.writeFileSync("src/data.json", data, 'utf8');
    sendLog("Data has been written to file");
}

const getUrl = async () => {
    const configFile = fs.readFileSync("src/config.json");
    const config = JSON.parse(configFile);
    let url = HOLDING_DATA_URL;
    url += `/${config.address}?`;
    delete config.address;
    for(let i = 0; i < Object.keys(config).length; i++) {
        const key = Object.keys(config)[i];
        url += `${key}=${config[key]}`;
        if(i < Object.keys(config).length - 1) {
            url += "&";
        }
    }

    return url;
}

const main = async () => {
    const {browser, page} = await connect({
        headless: false,
        defaultViewport: null,
        args: [],
        turnstile: true,
        disableXvfb: false,
    })

    const dataUrl = await getUrl();
    await page.goto(dataUrl, {
        waitUntil: "networkidle2",
        timeout: 60000
    });

    const response = await page.waitForResponse(
        (response) => response.url().includes(dataUrl),
        { timeout: 60000 }
    );

    const jsonData = await response.json();
    const holdingData = jsonData?.data?.holdings;

    // save data to file
    await saveFile(holdingData);

    // close browser
    await browser.close();
}

main()
    .then(() => {
        sendLog("Done");
    })
    .catch((error) => {
        console.error(`Error: ${error}`);
    })