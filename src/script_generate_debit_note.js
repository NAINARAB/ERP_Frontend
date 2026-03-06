const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'Pages', 'CreditNote');
const targetDir = path.join(__dirname, 'Pages', 'DebitNote');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const filesToCopy = [
    'variable.js',
    'manageGeneralInfo.jsx',
    'manageInvolvedStaff.jsx',
    'addProducts.jsx',
    'taxDetails.jsx',
    'manageExpences.jsx',
    { src: 'CreditNoteCreation.jsx', dest: 'DebitNoteCreation.jsx' }
];

const replaceRules = [
    [/CreditNote/g, 'DebitNote'],
    [/creditNote/g, 'debitNote'],
    [/Credit Note/g, 'Debit Note'],
    [/CREDIT_NOTE/g, 'DEBIT_NOTE'],
    [/CR_Id/g, 'DB_Id'],
    [/CR_No/g, 'DB_No'],
    [/CR_Year/g, 'DB_Year'],
    [/CR_Inv_No/g, 'DB_Inv_No'],
    [/CR_Date/g, 'DB_Date'],
    [/CR_St_Id/g, 'DB_St_Id']
];

for (const fileObj of filesToCopy) {
    const srcName = typeof fileObj === 'string' ? fileObj : fileObj.src;
    const destName = typeof fileObj === 'string' ? fileObj : fileObj.dest;

    const srcPath = path.join(sourceDir, srcName);
    const destPath = path.join(targetDir, destName);

    if (fs.existsSync(srcPath)) {
        let content = fs.readFileSync(srcPath, 'utf8');

        for (const [regex, replacement] of replaceRules) {
            content = content.replace(regex, replacement);
        }

        fs.writeFileSync(destPath, content, 'utf8');
        console.log(`Generated ${destName}`);
    } else {
        console.log(`Source file not found: ${srcName}`);
    }
}
