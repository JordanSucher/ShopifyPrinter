const express = require('express')
const path = require('path')
const fs = require('fs')
const app = express()
const bodyParser = require('body-parser')
const busboy = require('busboy');
const { Readable } = require('stream');
const {prisma} = require('./prisma')

app.use(express.static(path.join(__dirname, '.', 'dist')))
app.use(bodyParser.json({limit: '50mb'}))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'))
})

app.post('/api/orders', async (req, res) => {
    const order = req.body
    const lineItems = order["line_items"]

    for (let i = 0; i < lineItems.length; i++) {

        if (lineItems[i].requires_shipping == 'true') {
                const data = {
                    sku: lineItems[i].sku,
                    productName: lineItems[i].name,
                    lineItemId: lineItems[i].id,
                    orderId: order.id,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }

                for (let j = 0; j < lineItems[i].quantity; j++) {
                    await prisma.PrintJob.create({
                        data
                    })
                }

        }
    }

    res.json({success: true})
})

app.get('/api/productfile', async (req, res) => {
    try {
        let productId = parseInt(req.query.productId);
        let fileId = parseInt(req.query.fileId);

        let productFile = await prisma.ProductFile.findUnique({
            where: {
                productId_fileId: {
                    productId: productId,
                    fileId: fileId
                }
            }
        });

        if (!productFile || !productFile.data) {
            return res.status(404).send('File not found');
        }

        const fileBuffer = Buffer.from(productFile.data);

        // Set headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="download.pdf"');

        // Send the file
        res.send(fileBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving the file');
    }
});

app.post('/api/productfile', (req, res) => {
    console.log("req.body: ", req.body)
    let productId;
    let fileId;
    const bb = busboy({ headers: req.headers });
    bb.on('file', (fieldname, file, filename) => {
        let buffers = [];

        file.on('data', (data) => {
            buffers.push(data);
        });

        bb.on('field', (fieldname, val) => {
            if (fieldname === 'productId') {
                productId = val;
            } else if (fieldname === 'fileId') {
                fileId = val;
            }
        });

        file.on('end', async () => {
            const pdfBuffer = Buffer.concat(buffers);

            try {
                // Insert into PostgreSQL database (example using Prisma)
                
                let productFile = await prisma.ProductFile.findUnique({
                    where: {
                        productId_fileId: {
                            productId: parseInt(productId),
                            fileId: parseInt(fileId)
                        }
                    }
                })

                if (productFile) {
                    await prisma.ProductFile.update({
                        where: {
                            productId_fileId: {
                                productId: parseInt(productId),
                                fileId: parseInt(fileId)
                            }
                        },
                        data: {
                            data: pdfBuffer
                        }
                    })
                }

                else {
                    await prisma.ProductFile.create({
                        data: {
                            displayName: filename.filename,
                            data: pdfBuffer,
                            productId: parseInt(productId),
                            fileId: parseInt(fileId)
                        }
                    });
                }
                
                console.log("The file was saved in the database!");
                res.json({ success: true });
            } catch (err) {
                console.error(err);
                res.status(500).send('Error saving PDF file in the database');
            }
        });
    });

    bb.on('finish', () => {
        console.log('Done parsing form!');
    });

    req.pipe(bb);

})

app.post('/api/printer', async (req, res) => {
    let printerId = req.body.id
    let printerName = req.body.name

    try {
        if (!printerId) {
            // creating a new printer
            let printer = await prisma.printer.create({
                data: {
                    name: printerName
                }
            })
        }
        else {
            // updating an existing printer
            let printer = await prisma.printer.update({
                where: {
                    id: printerId
                },
                data: {
                    name: printerName
                }
            })
        }
        res.json({success: true})
    } catch (error) {
        console.log(error)
        res.status(500).send('Error saving printer');
    }
})

app.delete('/api/product', async (req, res) => {
    // get from url params
    let productId = req.query.id
    console.log("productId: ", productId)

    try {
        let product = await prisma.product.delete({
            where: {
                id: parseInt(productId)
            }
        })
        res.json({success: true})
    }
    catch (error) {
        console.log(error)
        res.status(500).send('Error deleting product');
    }
})

app.delete('/api/printer', async (req, res) => {
    // get from url params
    let printerId = req.query.id

    try {
        let printer = await prisma.printer.delete({
            where: {
                id: parseInt(printerId)
            }
        })
        res.json({success: true})
    } catch (error) {
        console.log(error)
        res.status(500).send('Error deleting printer');
    }
})

app.get('/api/printers', async (req, res) => {
    let printers = await prisma.printer.findMany({
        include: {
            files: true
        }
    })
    res.json(printers)
})

app.post('/api/product', async (req, res) => {
    let productId = req.body.id
    let productName = req.body.name

    try {
        if (!productId) {
            // creating a new product
            let product = await prisma.product.create({
                data: {
                    name: productName
                }
            })
        }
        else {
            // updating an existing product
            let product = await prisma.product.update({
                where: {
                    id: productId
                },
                data: {
                    name: productName
                }
            })
        }
        res.json({success: true})
    }
    catch (error) {
        console.log(error)
        res.status(500).send('Error saving product');
    }
})

app.post('/api/printermapping', async (req, res) => {
    let fileId = req.body.fileId
    let printerId = req.body.printerId
    let file

    try {
        if (!printerId || printerId == null) {
            file = await prisma.file.update({
                where: {
                    id: fileId
                },
                data: {
                    printer : {
                        disconnect: true
                    }
                }
            })
        } else {
            file = await prisma.file.update({
                where: {
                    id: parseInt(fileId)
                },
                data: {
                    printer: {
                        connect: {
                            id: parseInt(printerId)
                        }
                    }
                }
            })
        }

        res.json(file)
    } catch (error) {
        console.log(error)
        res.status(500).send('Error saving product: ' + error);
    }
})


app.get('/api/files', async (req, res) => {

    const files = await prisma.file.findMany({
        include: {
            printer: true
        }
    })
    res.json(files)
})

app.get('/api/mappings', async (req, res) => {

    const products = await prisma.product.findMany({
        include: {
            ProductFiles: {
                include: {
                    file: true
                }
            }
        }
    })

    const files = await prisma.file.findMany({
        include: {
            ProductFiles: true,
            printer: true
        }
    })

    const printers = await prisma.printer.findMany()

    res.json({
        products,
        files,
        printers
    })
})

app.use('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'))
})

app.listen(8000, () => {
    console.log('listening on port 8000')
})