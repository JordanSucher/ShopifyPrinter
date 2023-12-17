const React = require("react");
const { useState, useEffect } = require("react");
const Dialog = require("@radix-ui/react-dialog");
const { Cross2Icon } = require("@radix-ui/react-icons");

export default function AddProductButton ({getProducts}) {
    const [formError, setFormError] = useState(false)
    const [open, setOpen] = useState(false)



    async function handleSubmit(e) {
        e.preventDefault()
   
        // create printer
        let name = e.target.name.value
        let result = await fetch(`/api/product`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name
            })
        })
       
        getProducts()

        setFormError(false)
        setOpen(false)

    }   

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <button className='SmallButton'>Add Product</button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className='DialogOverlay'/>
                <Dialog.Content className='DialogContent'>
                    <span className='w-full flex justify-between '>
                        <Dialog.Title className='DialogTitle'>Add a new product</Dialog.Title>
                        <Dialog.Close asChild>
                            <Cross2Icon className="rounded-md w-6 h-6 text-gray-500 hover:cursor-pointer hover:bg-slate-200 p-1 self-right" />
                        </Dialog.Close>
                    </span>

                        
                    <form className='flex flex-col items-start gap-2 my-3' onSubmit={handleSubmit}>
                        <label className=''>
                            <span className='self-start'>Product Name</span>
                            <input type="text" name="name" className='input ml-2 border-2 border-gray-500 rounded-md' />
                        </label>
                        <input type="submit" value="Submit" className='SmallButton'/>
                    </form> 

                   
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>                
    )
}