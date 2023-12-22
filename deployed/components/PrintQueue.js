const React = require("react");
const {useState, useEffect} = require("react")

export default function PrintQueue() {
    const [printContinuously, setPrintContinuously] = useState(false);
    const [queue, setQueue] = useState([]);

    useEffect(() => {
        const getQueue = async () => {
            const response = await fetch("/api/queue")
            const data = await response.json()
            setQueue(data)
            console.log("queue: ", data)
        }
        getQueue()
    }, [])


    const testPrint = async () => {
        console.log("test print")
        await fetch('http://localhost:3001/print', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'printerName': 'Test Printer'
            })
        })
    }


    return (
        <div className="mb-6 mt-6 min-w-[450px]">
            <h1 className="font-bold text-2xl">Queue</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Order ID</th>
                        <th>Product Name</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th>Updated At</th>
                    </tr>
                </thead>
                <tbody>
                    {queue.map((item) => (
                        <tr key={item.id}>
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
                {!printContinuously && <button className='SmallButton'>Print Next</button> }
                
                {!printContinuously && 
                <button 
                className='SmallButton'
                onClick={() => setPrintContinuously(true)}>
                    Start Printing Continuously
                </button> }
                
                {printContinuously && 
                <button 
                onClick={() => setPrintContinuously(false)}
                className='SmallButton'>
                    Stop Printing
                </button> }
{/* 
                <button
                className='SmallButton'>
                    Test Print
                </button> */}

            </div>

        </div>
    )
}