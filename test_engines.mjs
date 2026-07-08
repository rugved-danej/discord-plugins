
async function testSimplyTranslate(engine) {
    try {
        const res = await fetch(`https://simplytranslate.org/api/translate/?engine=${engine}&from=en&to=es&text=Hello%20World`);
        const data = await res.json();
        console.log(`SimplyTranslate (${engine}):`, data);
    } catch (e) {
        console.log(`SimplyTranslate (${engine}) Failed:`, e.message);
    }
}

async function testLingva() {
    try {
        const res = await fetch(`https://lingva.ml/api/v1/en/es/Hello%20World`);
        const data = await res.json();
        console.log(`Lingva:`, data);
    } catch (e) {
        console.log(`Lingva Failed:`, e.message);
    }
}

async function testReverso() {
    try {
        const res = await fetch(`https://api.reverso.net/translate/v1/translation`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0"
            },
            body: JSON.stringify({
                input: "Hello World",
                from: "eng",
                to: "spa",
                format: "text",
                options: {
                    origin: "reversomobile",
                    sentenceSplitter: true,
                    contextResults: true,
                    languageDetection: true
                }
            })
        });
        const data = await res.json();
        console.log(`Reverso:`, data);
    } catch (e) {
        console.log(`Reverso Failed:`, e.message);
    }
}

async function runTests() {
    await testSimplyTranslate('yandex');
    await testSimplyTranslate('reverso');
    await testSimplyTranslate('iciba');
    await testLingva();
    await testReverso();
}

runTests();
