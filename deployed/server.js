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

    console.log("received order webhook")
    const order = req.body
    const lineItems = order["line_items"]

    console.log("length of line items", lineItems.length)

    try {
        for (let i = 0; i < lineItems.length; i++) {
            console.log("Requires shipping?", lineItems[i]["requires_shipping"], lineItems[i]["requires_shipping"] == 'true' || lineItems[i]["requires_shipping"] == true)

    
            if (lineItems[i]["requires_shipping"] == 'true' || lineItems[i]["requires_shipping"] == true) {
                    console.log("starting order processing")
                    console.log("lineItemId: ", lineItems[i]["id"])

                    const data = {
                        sku: lineItems[i].sku,
                        productName: lineItems[i].name,
                        lineItemId: toString(lineItems[i]["id"]),
                        orderId: toString(order.id),
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }

                    console.log("data for print job", data)
                    
                    let q = parseInt(lineItems[i].quantity);
                    for (let j = 0; j < q; j++) {
                        console.log("Adding print job")
                        await prisma.PrintJob.create({
                            data
                        })
                    }
    
            }
        }
    
        res.json({success: true})
    } catch (error) {
        console.error(error, error.message);
        res.status(500).send('Error saving PDF file in the database');
    }
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
                            data: pdfBuffer,
                            localFilePath: null
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

app.post('/api/print', async (req, res) => {
    let howmany = req.body.howmany
    let ids = req.body.ids

    try {
    
        if (howmany && howmany > 0) {
            // that many off the queue get flipped to QUEUED
            let jobs = await prisma.PrintJob.findMany({
                where: {
                    status: 'NONE'
                },
                orderBy: {
                    createdAt: 'asc'
                },
                take: parseInt(howmany)
            })
        
            await prisma.PrintJob.updateMany({
                where: {
                    id: {
                        in: jobs.map(job => job.id)
                    }
                },
                data: {
                    status: 'QUEUED'
                }
            })
        
            res.json({success: true})
        }

        else {
            // all ids get flipped to QUEUED
            ids = ids.map(id => parseInt(id))

            await prisma.PrintJob.updateMany({
                where: {
                    id: {
                        in: ids
                    }
                },
                data: {
                    status: 'QUEUED'
                }
            })

            res.json({success: true})
        }

    } catch (error) {
        console.log(error)
        res.status(500).send('Error printing');
    }

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
            files: {
                include: {
                    file: true
                }
            }
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

app.post('/api/removefromqueue', async (req, res) => {
    let ids = req.body.ids
    ids = ids.map(id => parseInt(id))
    try {
        await prisma.printJob.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        })
        res.json({success: true})
    } catch (error) {
        console.log(error)
        res.status(500).send('Error removing from queue');
    }
})

app.get('/api/queue', async (req, res) => {
    try{ 

        const oneDayAgo = new Date(new Date().setDate(new Date().getDate() - 1));


        let queue = await prisma.printJob.findMany({
            where: {
                NOT: [
                    {
                        AND: [
                            {
                                status: 'DONE',
                            },
                            {
                                updatedAt: {
                                    lt: oneDayAgo,
                                },
                            },
                        ],
                    },
                ],
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    
        res.json(queue)
    } catch (error) {
        console.log(error)
        res.status(500).send('Error getting queue');
    }
})

app.delete('/api/printermapping', async (req, res) => {
    let fileId = req.query.fileId
    let printerId = req.query.printerId

    try {
        await prisma.FilePrinterMappings.delete({
            where: {
                fileId_printerId: {
                    fileId: parseInt(fileId),
                    printerId: parseInt(printerId)
                }
            }
        })
        res.json({success: true})
    } catch (error) {
        console.log(error)
        res.status(500).send('Error deleting printer mapping');
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

            await prisma.FilePrinterMappings.create({
                data: {
                    fileId: parseInt(fileId),
                    printerId: parseInt(printerId)
                }
            })

            file = await prisma.file.update({
                where: {
                    id: parseInt(fileId)
                },
                data: {
                    printers: {
                        connect: {
                            fileId_printerId: {
                                fileId: parseInt(fileId),
                                printerId: parseInt(printerId)
                            }
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
            printers: true
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
            printers: true
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