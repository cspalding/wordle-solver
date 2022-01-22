const playwright = require('playwright');
const { getNextGuess } = require('./wordUtils');

const WORDLE_URL = 'https://www.powerlanguage.co.uk/wordle/';

const main = async () => {
    const browser = await playwright.chromium.launch({ headless: false });
    const context = await browser.newContext();
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    const page = await context.newPage();
    await page.goto(WORDLE_URL);
    await page.click('.close-icon');

    const hits = new Set();
    const toExclude = []
    const toIncludeNotAt = [];
    const toIncludeAt = [];

    let answer = '';

    for (let i = 0; i < 6; i++) {
        const guess = getNextGuess({
            unique: !i,
            toExclude,
            toIncludeNotAt,
            toIncludeAt,
        });

        await page.type('#game', guess);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);

        const rows = await page.$$('game-row');
        const tiles = await rows[i].$$('game-tile');
        const results = await Promise.all(
            tiles.map(t => t.getAttribute('evaluation')),
        );
        
        if (results.every(r => r === 'correct')) {
            answer = guess;
            break;
        }

        results.forEach((result, i) => {
            const l = guess[i];
            
            switch (result) {
                case 'absent': 
                    if (!hits.has(l)) toExclude.push(l);
                    break;
                case 'present': 
                    toIncludeNotAt.push([i, l]);
                    hits.add(l);
                    break;
                case 'correct':
                    toIncludeAt.push([i, l]);
                    hits.add(l);
                    break;
            }
        });
    }

    await page.click('#share-button');
    const squares = await page.evaluate(() => navigator.clipboard.readText());
    await browser.close();
    
    console.log(`Answer: "${answer.toUpperCase()}"\n\n${squares}`);
};

main();
