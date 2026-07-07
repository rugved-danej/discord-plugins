const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/Swift Translate/ig, "Next Translator");
    content = content.replace(/swift-translate/ig, "next-translator");
    content = content.replace(/Swift Translator/ig, "Next Translator");
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated", filePath);
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.json') || fullPath.endsWith('.md')) {
            replaceInFile(fullPath);
        }
    }
}

replaceInFile('manifest.json');
replaceInFile('README.md');
walk('src');
