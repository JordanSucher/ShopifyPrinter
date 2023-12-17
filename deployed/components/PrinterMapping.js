const React = require("react");
const {useState, useEffect} = require("react")
const {Cross2Icon} = require("@radix-ui/react-icons")
const AddPrinterButton = require("./AddPrinterButton.js").default;
const AttachFileButton = require("./AttachFileButton.js").default;

export default function PrinterMapping() {

    const [printers, setPrinters] = useState([]);

    const handleUnassign = async (e, printer, file) => {
        // unassign file
        const response = await fetch(`/api/printermapping`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileId: file.id,
                printerId: null
            })
        })

        getPrinters()
    }

    const handleDelete = async (printer) => {
        // delete printer
        const response = await fetch(`/api/printer?id=${printer.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        getPrinters()
    }

    const getPrinters = async () => {
        const response = await fetch("/api/printers")
        const data = await response.json()
        setPrinters(data)
    }

    useEffect(() => {   
        getPrinters()
    }, [])

    return (
        <div className="min-w-[450px] my-6 ">
            <h1 className="font-bold text-2xl mb-2">Printers</h1>
            <div className="flex w-full gap-2 flex-col mb-2">
                {printers.map(printer => (
                    <span key={printer.id} className="flex grow items-center">
                        <div key={printer.id} className="flex grow bg-white p-4 rounded-lg justify-between items-center min-w-[400px]">
                            <p className="font-bold">{printer.name}</p>
                            {printer.files.map(file => (
                                <span className="flex items-center">
                                    <p key={file.id}>{file.name}</p>
                                    <Cross2Icon className='w-5 h-5 p-1 m-1 rounded-lg hover:cursor-pointer hover:bg-gray-300' 
                                    onClick={(e)=>handleUnassign(e, printer, file)}/>
                                </span>
                            ))}
                            {/* <button className="SmallButton">Attach File</button> */}
                            <span className="flex items-center">
                                <AttachFileButton printer={printer} getPrinters={getPrinters}/>
                                <Cross2Icon 
                                onClick={(e) => handleDelete(printer)}
                                className='w-7 h-7 p-1 m-1 rounded-lg hover:cursor-pointer hover:bg-gray-300' />
                            </span>
                        </div>
                    </span>
                ))}
            </div>
            <AddPrinterButton getPrinters={getPrinters}/>
            
        </div>
    )
}