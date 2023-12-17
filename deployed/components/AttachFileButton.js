const React = require("react");
const { useState, useEffect } = require("react");
const Dialog = require("@radix-ui/react-dialog");
const { Cross2Icon } = require("@radix-ui/react-icons");
const SelectSearch = require("react-select-search").default;

export default function AttachFileButton ({printer, getPrinters}) {
    const [formError, setFormError] = useState(false)
    const [open, setOpen] = useState(false)

    const [files, setFiles] = useState([])
    const [selected, setSelected] = useState()


    const getFiles = async () => {
        const response = await fetch("/api/files")
        const data = await response.json()
        console.log("files", data)
        setFiles(data)
    }

    useEffect(() => {
        getFiles()
    }, [])

    async function handleSubmit(e) {
        e.preventDefault()

        if (!selected) {
            setFormError(true)
            return
        }
   
        // attach file
        let fileId = selected
        let result = await fetch(`/api/printermapping`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileId: fileId,
                printerId: printer.id
            })
        })
       
        getPrinters()
        setFormError(false)
        setOpen(false)


    }   

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <button className='SmallButton'>Attach File</button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className='DialogOverlay'/>
                <Dialog.Content className='DialogContent'>
                    <span className='w-full flex justify-between '>
                        <Dialog.Title className='DialogTitle'>Attach a file</Dialog.Title>
                        <Dialog.Close asChild>
                            <Cross2Icon className="rounded-md w-6 h-6 text-gray-500 hover:cursor-pointer hover:bg-slate-200 p-1 self-right" />
                        </Dialog.Close>
                    </span>

                        
                    <form className='flex flex-col items-start gap-2 my-3' onSubmit={handleSubmit}>
                        <label className=''>
                            <span className='self-start'>Select a file</span>
                            <select name="file" value={selected} className='input ml-2 border-2 border-gray-500 rounded-md' onChange={e => setSelected(e.target.value)}>
                                <option value="">Select a file</option>
                                {files.map(file => (
                                    <option key={file.id} value={file.id}>{file.name}</option>
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