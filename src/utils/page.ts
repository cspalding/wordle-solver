import playwright, { Page, Browser } from 'playwright';

const WORDLE_URL = 'https://www.powerlanguage.co.uk/wordle/';

export const startGame = async (): Promise<{ page: Page, browser: Browser }> => {
    const browser = await playwright.chromium.launch({ headless: false });
    const context = await browser.newContext();
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    const page = await context.newPage();
    await page.goto(WORDLE_URL);
    await page.click('.close-icon');
    return { page, browser };
};

type Result = 'correct' | 'present' | 'absent';

export const enterGuess = async (
    page: Page, 
    guess: string, 
    i: number,
):  Promise<Result[]> => {
    await page.type('#game', guess);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    const rows = await page.$$('game-row');
    const tiles = await rows[i].$$('game-tile');
    return Promise.all(tiles.map(t => t.getAttribute('evaluation') as Promise<Result>));
};

export const copySquares = async (page: Page): Promise<string> => {
    await page.click('#share-button');
    return page.evaluate(() => navigator.clipboard.readText());
};
