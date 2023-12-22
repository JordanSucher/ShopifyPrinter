const React = require("react");
const { useState, useEffect } = require("react");
const Dialog = require("@radix-ui/react-dialog");
const { Cross2Icon } = require("@radix-ui/react-icons");

export default function AddPrinterButton ({getPrinters, printers}) {
    const [formError, setFormError] = useState(false)
    const [open, setOpen] = useState(false)
    const [localPrinters, setLocalPrinters] = useState([])

    const getLocalPrinters = async () => {
        let localps = await fetch('http://localhost:3001/printers', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })

        localps = await localps.json()    
        localps = localps.filter((printer) => !printers.map(p=>p.name).includes(printer))
        console.log("localprinters: ", localps)
        console.log("printers",printers)
        setLocalPrinters(localps)
    }
    
    useEffect(()=>{
        getLocalPrinters()
    }, [printers])


    async function handleSubmit(e) {
        e.preventDefault()
   
        // create printer
        let name = e.target.name.value
        let result = await fetch(`/api/printer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name
            })
        })
       
        getPrinters()
        getLocalPrinters()

        setFormError(false)
        setOpen(false)

    }   

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <button className='SmallButton'>Add Printer</button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className='DialogOverlay'/>
                <Dialog.Content className='DialogContent'>
                    <span className='w-full flex justify-between '>
                        <Dialog.Title className='DialogTitle'>Add a new printer</Dialog.Title>
                        <Dialog.Close asChild>
                            <Cross2Icon className="rounded-md w-6 h-6 text-gray-500 hover:cursor-pointer hover:bg-slate-200 p-1 self-right" />
                        </Dialog.Close>
                    </span>

                        
                    <form className='flex flex-col items-start gap-2 my-3' onSubmit={handleSubmit}>
                        <label className=''>
                            <span className='self-start'>Printer Name</span>
                            <select name="name" className='input ml-2 border-2 border-gray-500 rounded-md'>
                                {localPrinters.map((printer) => (
                                    <option key={printer} value={printer}>{printer}</option>
                                ))}
                            </select>
                        </label>
                        <input type="submit" value="Submit" className='SmallButton'/>
                    </form> 

                   
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>                
    )
}