const { exec } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');


async function getLocalFilePath(productId, fileId) {

    try {

            let allProds = await prisma.product.findMany({})
            console.log("allprods: ", allProds)
            // first, get the productfile
            let productFile = await prisma.ProductFile.findUnique({
                where: {
                    productId_fileId: {
                        productId: parseInt(productId),
                        fileId: parseInt(fileId)
                    }
                }
            })
        
            // if localFilePath is not null, return it
            if (productFile.localFilePath) {
                return productFile.localFilePath;
            }
        
            // if localFilePath is null, persist file to local, save localFilePath to db, and return localFilePath
            let bytearray = productFile.data
            let buffer = Buffer.from(bytearray);
            // save to local
            let name = `${productId}_${fileId}.pdf`
            let localpath = `./files/${name}`
            fs.writeFileSync(localpath, buffer);
            // get absolute path
            let absolutePath = path.resolve(localpath);

            await prisma.productFile.update({
                where: {
                    productId_fileId: {
                        productId: parseInt(productId),
                        fileId: parseInt(fileId)
                    }
                },
                data: {
                    localFilePath: absolutePath
                }
            })

            return absolutePath;
        
    } catch (error) {
        console.log(error)
        return false
    }


}

async function pullSomeOffTheQueue(howmany) {
    // get the first n items from the queue
    let items = await prisma.printJob.findMany({
        take: parseInt(howmany),
        where: {
            status: 'QUEUED'
        },
        orderBy: {
            createdAt: 'asc'
        }
    })

    // for each item, update the status to printing
    for (let item of items) {
        await prisma.printJob.update({
            where: {
                id: item.id
            },
            data: {
                status: 'PENDING'
            }
        })
    }

    // get printer mappings
    let printermaps = await prisma.printer.findMany({
        include: {
            files: true
        }
    })

    // get the relevant filePaths
    console.log("items: ", items.map(item => item.productName))

    let files = await prisma.product.findMany({
        where: {
            name: {
                in : items.map(item => item.productName)
            }
        },
        include: {
            ProductFiles: true
        }
    })

    console.log("printermaps: ", printermaps)
    console.log("files: ", files)



    // for each item to process
        // print it - to the appropriate printer
        // save the job name to the database
        // continue

    // update the files with the last printer used


    // const { printerName, productId, fileId } = req.body;

    // let filepath = await getLocalFilePath(productId, fileId);
    // console.log("filepath", filepath)

    // printPDF(printerName, filepath);
    // res.send('Print job has been sent.');

}

function printPDF(printerName, pdfPath) {
    let command;

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
    printPDF,
    getLocalFilePath,
    pullSomeOffTheQueue
}