const express = require('express');
const bodyParser = require('body-parser');
const { printPDF } = require('./print');

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send(`<b>Printer API is running :)</b>`);
})

app.post('/print', (req, res) => {
    const { printerName } = req.body;

    if (!printerName) {
        return res.status(400).send('Missing pdfPath or printerName');
    }

    try {
        printPDF(printerName);
        res.send('Print job has been sent.');
    } catch (error) {
        res.status(500).send('Error processing the print job');
    }
});

const port = 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
