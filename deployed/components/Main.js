const React = require("react");
const {useState, useEffect} = require("react")
const ProductFiles = require("./ProductFiles.js").default;
const PrintQueue = require("./PrintQueue.js").default;
const PrinterMapping = require("./PrinterMapping.js").default;

export default function Main() {

    const [localHostRunning, setLocalHostRunning] = useState(true)

    useEffect(() => {
        const checkIfLocalHost = async () => {
            try {
                const response = await fetch("http://localhost:3001/printers", {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                })
    
                const data = await response.json()
            } catch (error) {
                setLocalHostRunning(false)
            }
        }

        checkIfLocalHost()
    }, [])

    return (
        <div className="mt-4 p-6 text-sm xl:w-2/3 xl:mx-auto">
            <div className="">
                {!localHostRunning && <div className="text-right w-full text-red-500 font-bold text-md">Local server not running on this computer</div>}
                <ProductFiles />
                <PrinterMapping />
            </div>
            <PrintQueue />
        </div>
    )
}