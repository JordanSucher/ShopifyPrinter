const express = require('express');
const bodyParser = require('body-parser');
const { printPDF, getLocalFilePath, pullSomeOffTheQueue } = require('./print');
const { exec } = require('child_process');
const cors = require('cors');
const os = require('os');



const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send(`<b>Printer API is running :)</b>`);
})

app.get('/printers', (req, res) => {
    try {
        let command
        let pattern

        if (os.platform() === 'win32') {
            // Windows: Use PowerShell or WMIC to get printer names
            command = `wmic printer get name`;
            pattern = /^(.*?)\s*$/gm; // Adjusted pattern for Windows output
        } else {
            // Unix-like (Linux, macOS): Use lpstat
            command = `lpstat -v`;
            pattern = /device for (.*?):/g;
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
    
            // Using match to extract printer names and map to capture just the name
            let result = [];
            let match;
            while ((match = pattern.exec(stdout)) !== null) {
                result.push(match[1]); // match[1] is the captured group with the printer name
            }
    
            console.log(stdout); // Full output
            console.log(result); // Extracted printer names
            res.send(result); // Send the result back in response
        });

    } catch(e) {
        console.log(e)
    }
})

app.post('/print', async (req, res) => {
    const { howmany } = req.body;    
    
    try {
        pullSomeOffTheQueue(howmany);
        res.send('Print job has been sent.');
    } catch (error) {
        res.status(500).send('Error processing the print job');
    }
});


app.get('/printjobstatuses', async (req, res) => {

    res.send('Print job statuses');
})

const port = 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
