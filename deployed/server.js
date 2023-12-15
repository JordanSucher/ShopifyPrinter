const express = require('express')
const path = require('path')
const fs = require('fs')
const app = express()
const bodyParser = require('body-parser')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Files will be temporarily saved to 'uploads' folder


app.use(express.static(path.join(__dirname, '.', 'dist')))
app.use(bodyParser.json({limit: '50mb'}))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'))
})

app.post('/api/file', upload.single('file'), (req, res) => {
    console.log(req.file) 
    let pdf = req.file
    let filename = pdf.originalname

    if (!filename || !pdf) {
        return res.status(400).send('Filename and PDF content are required');
    }

    fs.rename(pdf.path, `./deployed/dist/${filename}`, function(err) {
        if(err) {
            res.status(500).send('Error saving PDF file');
            return console.log(err);
        } else {
            console.log("The file was saved!");
            res.json({success: true});
        }
    })
})

app.use('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'))
})

app.listen(8000, () => {
    console.log('listening on port 8000')
})