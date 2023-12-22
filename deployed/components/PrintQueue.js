const React = require("react");
const {useState, useEffect} = require("react")
const Pagination = require ('@mui/material/Pagination').default
const Stack = require('@mui/material/Stack').default

export default function PrintQueue() {
    const [printContinuously, setPrintContinuously] = useState(false);
    const [queue, setQueue] = useState([]);
    const [page, setPage] = useState(1)
    const [checked, setChecked] = useState({})
    const [allChecked, setAllChecked] = useState(false)
    const [deletePrimed, setDeletePrimed] = useState(false) 
    const [paginatedQueue, setPaginatedQueue] = useState([])
    const [numPages, setNumPages] = useState(1)

    useEffect(() => {
        setPaginatedQueue(queue.slice((page - 1) * 25, page * 25))
    }, [queue, page])

    useEffect(() => {
        setAllChecked(false)
    }, [page])

    const getQueue = async () => {
        const response = await fetch("/api/queue")
        const data = await response.json()
        setQueue(data)
        console.log("queue: ", data)
    }

    useEffect(() => {
        getQueue()

        setPaginatedQueue(queue.slice(0, 25))
        setNumPages(Math.ceil(queue.length / 25))
    }, [])

    useEffect(() => {
        // add polling
        const refreshQueue = setInterval(() => {
            console.log("refreshing queue")
            getQueue()
        }, 5000)
        

        return () => clearInterval(refreshQueue)
    }, [])


    const printNext = async () => {
        await fetch('/api/print', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'howmany': 1
            })
        })

        // update queue data
        getQueue()
    }


    const toggleAll = (bool) => {
        let newChecked = {}
        paginatedQueue.forEach((item) => {
            newChecked[item.id] = bool
        })
        setChecked(newChecked)
        setAllChecked(bool)
    }

    const printSelected = async () => {
        let ids = Object.keys(checked).filter((id) => checked[id])
        if (ids.length > 0) {
            await fetch('/api/print', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'ids': ids
                })
            })
        }
        getQueue()
    }

    const deleteSelected = async () => {
        let ids = Object.keys(checked).filter((id) => checked[id])
        if (ids.length > 0) {
            await fetch('/api/removefromqueue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'ids': ids
                })
            })
        }
        getQueue()
    }

    return (
        <div className="mb-6 mt-6 min-w-[450px]">
            <span className="flex gap-4 items-center">
                <h1 className="font-bold text-2xl">Queue</h1>
                <Pagination 
                page={page}
                onChange={(event, page) => setPage(page)}
                count={numPages} 
                size="small"
                color="primary" 
                variant="outlined" 
                shape="rounded" 
                sx={{
                '& .MuiPaginationItem-root': {
                    color: 'white', // For the text color of each pagination item
                    borderColor: 'white', // For the outline of each pagination item
                },
                }}/>
            </span>
            <table>
                <thead>
                    <tr>
                        <th>
                            <input value={allChecked} checked={allChecked} onChange={() => toggleAll(!allChecked)} type="checkbox" />
                        </th>
                        <th>ID</th>
                        <th>Order ID</th>
                        <th>Product Name</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th>Updated At</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedQueue.map((item) => (
                        <tr key={item.id}>
                            <td>
                                <input checked={checked[item.id]} value={checked[item.id]} onChange={() => {setChecked({ ...checked, [item.id]: !checked[item.id] }); setAllChecked(false) }} type="checkbox" />
                            </td>
                            <td>{item.id}</td>
                            <td>{item.orderId}</td>
                            <td>{item.productName}</td>
                            <td>{item.status}</td>
                            <td>{item.createdAt}</td>
                            <td>{item.updatedAt}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex gap-2">
                <button 
                onClick={printNext}
                className='SmallButton'>
                    Print Next
                </button>
                
                <button 
                className='SmallButton'
                onClick={printSelected}
                >
                    Print Selected
                </button>
                
                {!deletePrimed && <button
                className='SmallButton !bg-red-500 hover:!bg-red-600 active:!bg-red-700'
                onClick={() => {if(Object.values(checked).includes(true)) setDeletePrimed(true)}}
                >
                    Delete Selected
                </button>}

                {deletePrimed && 
                <button
                className='SmallButton !bg-red-500 hover:!bg-red-600 active:!bg-red-700'
                onClick={deleteSelected}
                >
                    Are you sure?
                </button>
                }

                {deletePrimed &&
                <button
                className='SmallButton !bg-white !text-black'
                onClick={() => setDeletePrimed(false)}
                >
                    Cancel
                </button>}
                



            
            </div>

        </div>
    )
}