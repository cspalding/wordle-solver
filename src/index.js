const { getNextGuess } = require('./wordUtils');
const { 
    startGame, 
    enterGuess, 
    getResults,
    copySquares,
} = require('./pageUtils');

const main = async () => {
    const { page, browser } = await startGame();

    const guesses = new Set();
    const hits = new Set();
    
    const toExclude = []
    const toIncludeNotAt = [];
    const toIncludeAt = [];

    for (let i = 0; i < 6; i++) {
        const guess = getNextGuess({
            unique: !i,
            toExclude,
            toIncludeNotAt,
            toIncludeAt,
        });

        guesses.add(guess);
        await enterGuess(page, guess);
        const results = await getResults(page, i);
        
        if (results.every(r => r === 'correct')) break;

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

    const squares = await copySquares(page);
    const guessList = [...guesses].map(g => g.toUpperCase()).join('\n');
    console.log(`${guessList}\n\n${squares}`);

    await browser.close();
};

main();
