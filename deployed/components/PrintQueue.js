const React = require("react");
const {useState, useEffect} = require("react")

export default function PrintQueue() {
    const [printContinuously, setPrintContinuously] = useState(false);

    const [data, setData] = useState([{
        id: 1,
        order_id: 1,
        product_name: "Product 1",
        status: "pending",
        created_at: "2022-01-01",
        updated_at: "2022-01-01"
    }, {
        id: 2,
        order_id: 2,
        product_name: "Product 2",
        status: "pending",
        created_at: "2022-01-01",
        updated_at: "2022-01-01"
    }]);



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
                    {data.map((item) => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.order_id}</td>
                            <td>{item.product_name}</td>
                            <td>{item.status}</td>
                            <td>{item.created_at}</td>
                            <td>{item.updated_at}</td>
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

            </div>

        </div>
    )
}