const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const cors = require('cors');
const os = require('os');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const { localQueue } = require('./poller.js');

supabase
    .channel('schema-db-changes')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'PrintJob' }, (payload) => {
        console.log('Change received!', payload);
        // when a job is updated to QUEUED, add it to localQueue
        if (payload.new.status == 'QUEUED') {
            localQueue.push(payload.new)
        }
    })
    .subscribe();


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
    
            // console.log(stdout); // Full output
            // console.log(result); // Extracted printer names
            res.send(result); // Send the result back in response
        });

    } catch(e) {
        console.log(e)
    }
})


module.exports = app