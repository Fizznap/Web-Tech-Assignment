const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const referencePdfs = {
    exp1: path.join(__dirname, 'reference', 'EXPERIMENT 1 _ HTML (Aditi).pdf'),
    exp2: path.join(__dirname, 'reference', 'EXPERMIENT 2 (Aditi).pdf'),
    exp3: path.join(__dirname, 'reference', 'EXPERIMENT 3 (Aditi).pdf'),
    exp4: path.join(__dirname, 'reference', 'EXPERIMENT 4 (Aditi).pdf'),
    exp5: path.join(__dirname, 'reference', 'EXPERIMENT 5(Aditi).pdf'),
    exp6: path.join(__dirname, 'reference', 'EXPERIMENT 6 (Aditi).pdf'),
    exp7: path.join(__dirname, 'reference', 'EXPERIMENT 7 ( Aditi ).pdf')
};

async function checkPdfs() {
    for (const [key, filePath] of Object.entries(referencePdfs)) {
        if (fs.existsSync(filePath)) {
            const data = await pdfParse(fs.readFileSync(filePath));
            console.log(`\n\n--- ${key} ---\n`);
            console.log(data.text.substring(0, 1500));
        } else {
            console.log(`Missing: ${filePath}`);
        }
    }
}
checkPdfs();
