const { exec } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const os = require('os');

const localQueue = [];
const pendingQueue = [];
const printingQueue = [];

async function pollQueue() {
    // if there is anything in pending queue, do nothing
    if (pendingQueue.length > 0) {
        return
    }
    // otherwise, if there is anything in localQueue, pop one off and process it
    if (localQueue.length > 0) {
        let item = localQueue.pop();
        pendingQueue.push(item);
        await processQueueItem(item);
    }
}

function getMostRecentInProgressPrintJob() {
    // Needs to be checked on Windows

    return new Promise((resolve, reject) => {
        let command;

        if (os.platform() === 'win32') {
            // Windows command using PowerShell (this is an approximation)
            command = `powershell "Get-WinEvent -LogName 'Microsoft-Windows-PrintService/Operational' | Where-Object { $_.Id -eq 800 } | Select-Object -First 1 | ForEach-Object { $_.Properties[1].Value }"`;
        } else {
            // macOS command using lpstat (modify to match your requirement)
            command = `lpstat | tail -n 1`;
        }

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`Error: ${error.message}`);
                return reject(`Error: ${error.message}`);
            }
            if (stderr) {
                console.log(`Stderr: ${stderr}`);
                return reject(`Stderr: ${stderr}`);
            }

            const jobName = stdout.trim().split('   ')[0];

            // console.log("Most recent print job: " + jobName);
            resolve(jobName);
        });
    });
}

function getRecentlyCompletedPrintJobs() {
    // Needs to be checked on Windows

    return new Promise((resolve, reject) => {
        let command;

        if (os.platform() === 'win32') {
            // Windows command using PowerShell
            command = `powershell "Get-WinEvent -LogName 'Microsoft-Windows-PrintService/Operational' | Where-Object { $_.Id -eq 307 } | Select-Object -First 10 | ForEach-Object { $_.Properties[1].Value }"`;
        } else {
            // macOS command using lpstat
            command = `lpstat -W completed | tail -n 10`;
        }

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`Error: ${error.message}`);
                return reject(`Error: ${error.message}`);
            }
            if (stderr) {
                console.log(`Stderr: ${stderr}`);
                return reject(`Stderr: ${stderr}`);
            }

            let jobNames = stdout.trim().split('\n');

            if (os.platform() !== 'win32') {
                jobNames = jobNames.map((jobName) => {
                    return jobName.split(' ')[0];
                });
            }

            // console.log("recently completed jobs: " + jobNames);
            resolve(jobNames);
        });
    });
}


async function pollPrintingQueue() {
    // if there is nothing in printing queue, do nothing
    if (printingQueue.length > 0) {
        return
    }

    // otherwise, check status of everything in printing queue
    let printJobsGrouped = {}
    
    printingQueue.forEach((item) => {
        if (!printJobsGrouped[item.printJobId]) {
            printJobsGrouped[item.printJobId] = [item.printJobName]
        } else {
            printJobsGrouped[item.printJobId].push(item.printJobName)
        }
    })

    let recentlyCompletedPrintJobs = []
    getRecentlyCompletedPrintJobs()
        .then((result) => {
            recentlyCompletedPrintJobs = result
        })

    Object.keys(printJobsGrouped).forEach(async (key) => {
        let printJobNames = printJobsGrouped[key]
        
        if (recentlyCompletedPrintJobs.includes(printJobNames[0] && recentlyCompletedPrintJobs.includes(printJobNames[1]))) {
            // this print job has been completed. update status in DB and remove from printing queue
            await prisma.printJob.update({
                where : {
                    id: parseInt(key)
                },
                data: {
                    status: 'DONE',
                    updatedAt : new Date()
                }
            })

            printingQueue = printingQueue.filter((item) => {
                return item.printJobId != key
            })
        }
    })

}


async function getLocalFilePath(productId, fileId) {
    try {
            let allProds = await prisma.product.findMany({})
            console.log("allprods: ", allProds)

            // first, get the productfile
            let productFile = await prisma.productFile.findUnique({
                where: {
                    productId_fileId: {
                        productId: parseInt(productId),
                        fileId: parseInt(fileId)
                    }
                }
            })
        
            // if localFilePath is not null, return it
            if (productFile.localFilePath ) {
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


async function processQueueItem(item) {
    // this function takes a queue item, prints each file associated with it, and adds to the printing queue so we can check for completion.
    // afterwards, it updates the status of the item to printing and removes it from the pending queue


    //update the status to pending
    await prisma.printJob.update({
        where: {
            id: item.id
        },
        data: {
            status: 'PENDING'
        }
    })

    // get printer mappings
    let printermaps = await prisma.printer.findMany({
        include: {
            files: true
        }
    })

    // get the relevant filePaths

    let product = await prisma.product.findFirst({
        where: {
            name: item.productName
        },
        include: {
            ProductFiles: true
        }
    })

    printermaps.forEach(printermap => {
        console.log("printermap: ", printermap)
        printermap.files.forEach(file => {
            console.log("file: ", file)
        })
    })

    console.log("product: ", product)
    product.ProductFiles.forEach(productfile => {
        console.log("productfile: ", productfile)
    })


    // for each file to print
    let promises = product.ProductFiles.map(async productfile => {

        // figure out the appropriate printer, filepath
        let fileId = productfile.fileId

        let lastUsedPrinter = await prisma.file.findFirst({
            where: {
                id: fileId
            },
            include: {
                latestPrinterUsed: true
            }
        })

        lastUsedPrinter = lastUsedPrinter.latestPrinterUsed

        let printers = printermaps.filter(printermap => printermap.files.some(file => file.fileId == fileId))
        let printer = printers[0]

        if (printers.length > 1) {
            printer = printers.filter(printer => printer.name == lastUsedPrinter.name)[0]
        }

        let filepath = await getLocalFilePath(product.id, fileId);

        console.log("fileId: ", fileId)
        console.log("printerName: ", printer.name)
        console.log("filepath: ", filepath)

        // print it - to the appropriate printer
        printPDF(printer.name, filepath);

        // get the print job name - PLACEHOLDER
        let printJobName = "temp";
        getMostRecentInProgressPrintJob()
            .then((result) => {
                printJobName = result;
            })

        // add an item to the printing queue
        printingQueue.push({
            printJobName: printJobName,
            printJobId: item.id
        })


        // update the files with the last printer used
        await prisma.file.update({
            where: {
                id: fileId
            },
            data: {
                latestPrinterUsedId: printer.id
            }
        })

        // continue
        return true
    
    })

    await Promise.all(promises)

    // update the status to printing
    await prisma.printJob.update({
        where: {
            id: item.id
        },
        data: {
            status: 'PRINTING'
        }
    })

    pendingQueue.pop();
}

// let item = {
//     id: 6,
//     productName: "test",
// }

// processQueueItem(item)



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


function startPolling(interval = 3000) {
    setInterval(pollQueue, interval);
    setInterval(pollPrintingQueue, interval);

    console.log('Polling started!')
}


module.exports = {
    localQueue,
    startPolling
}