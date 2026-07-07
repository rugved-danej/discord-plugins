const text = "Hello\nWorld\nThis is a test.";
const source_lang = "en";
const target_lang = "es";

const testGoogle = async () => {
    const qs = [
        `client=gtx`,
        `sl=${encodeURIComponent(source_lang)}`,
        `tl=${encodeURIComponent(target_lang)}`,
        `dt=t`,
        `q=${encodeURIComponent(text)}`
    ].join("&");

    const API_URL = "https://translate.googleapis.com/translate_a/single?" + qs;

    const response = await fetch(API_URL);
    const data = await response.json();
    console.log("Google Data[0]:", JSON.stringify(data[0]));
    const textSegments = data?.[0]?.map((x) => x?.[0])?.filter(Boolean)?.join("") || "";
    console.log("Google Result:", JSON.stringify(textSegments));
}

const testMyMemory = async () => {
    const API_URL = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|es`;
    const response = await fetch(API_URL);
    const data = await response.json();
    console.log("MyMemory Result:", JSON.stringify(data));
}

testGoogle();
testMyMemory();
