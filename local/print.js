const { exec } = require('child_process');

function printPDF(printerName) {
    let command;

    let pdfPath = '/Users/jsucher/Library/CloudStorage/Dropbox/shopifyPrinter/test.pdf'

    if (process.platform === 'win32') {
        // For Windows, using SumatraPDF
        command = `SumatraPDF.exe -print-to "${printerName}" "${pdfPath}"`;
    } else {
        // For macOS and Linux, using lp
        command = `lp -d "${printerName}" "${pdfPath}"`;
    }

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
}

module.exports = {
    printPDF
}