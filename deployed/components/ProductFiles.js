const React = require("react");
const {useState, useEffect} = require("react")

export default function ProductFiles() {
    const [columns, setColumns] = useState([]);
    const [data, setData] = useState([]);
    const [fileIds, setFileIds] = useState({});

    const handleChange = (column, value, index) => {
        let newRows = [...data];
        let productId = newRows[index].id
        newRows[index][column] = value;
        setData(newRows)

        const updateProduct = async () => {
            const response = await fetch(`/api/product`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: productId,
                    name: value
                })
            })

            const data = await response.json()
            console.log(data)
        }
        updateProduct()
    }

    useEffect(() => {
        const getMappings = async () => {
            const response = await fetch("/api/mappings")
            const data = await response.json()
            console.log("mappings: ", data)
            let cols = ['Product Name', ...data.files.map(file => file.name)]
            setColumns (cols)
            let tempfileIds = {}
            data.files.forEach(file => {
                tempfileIds[file.name] = file.id
            })
            setFileIds(tempfileIds)
            let prods = data.products.map(product => {
                let obj = {"Product Name": product.name, "id": product.id}
                product.ProductFiles.forEach(file => {
                    obj[file.file.name] = file.displayName
                })
                return obj
            })
            console.log("prods: ", prods)
            setData(prods)
        }

        getMappings()
    }, [])

    return (
        <div className="w-full min-w-[450px] ">
            <h1 className="font-bold mb-2 text-2xl">Files</h1>
            <div className="flex w-full gap-2 mb-2 text-center">
                {columns.map((column, index) => (
                    <div 
                    className="bg-white p-2 w-[300px] grow rounded-lg font-bold"
                    key={index}>
                    
                        {column}
                    </div>
                ))}
            </div>

            {data.map((row, index) => (
                <MappingRule fileIds={fileIds} row={row} columns={columns} rowIndex={index} handleChange={handleChange} key={index} />
            ))}


        </div>
    )
}

function MappingRule ({row, columns, rowIndex, handleChange, fileIds}) {
    useEffect(() => {
        console.log("Row: ", row)
    })

    const [editing, setEditing] = useState(false);

    return (
        <div className="flex w-full gap-2 mb-2"> 
            {columns.map((column, index) => (
                <MappingRuleCell fileIds={fileIds} row={row} column={column} colIndex={index} handleChange={(column, value) => handleChange(column, value, rowIndex)} />
            ))}
        </div>
    )
}

function MappingRuleCell ({row, column, colIndex, handleChange, fileIds}) {
    const [editing, setEditing] = useState(false);
    const [tempValue, setTempValue] = useState(row[column]);
    const [tempFile, setTempFile] = useState(null);

    const savePDF = async (arrayBuffer) => {
        let blob = new Blob([arrayBuffer], {type: 'application/pdf'});
        const formData = new FormData();
        formData.append('file', blob, tempValue);
        formData.append('productId', row.id);
        formData.append('fileId', fileIds[column]);

        let response = await fetch('/api/productfile', {
            method: 'POST',
            body: formData,
        })

        let data = await response.json();
        if (data.success) {
            setEditing(!editing)
            handleChange(column, tempValue);

        }
    }

    return (
        <div className="bg-white p-2 w-[300px] grow rounded-lg flex justify-between">
                    
                    {editing && colIndex == 0? 
                    <input 
                    type="text" 
                    className="w-[90%] bg-gray-200 px-1 rounded-md px-2"
                    name={column}
                    value={tempValue} 
                    onChange={(e)=>setTempValue(e.target.value)} /> 
                    
                    : editing && colIndex > 0 ?
                    <input
                    type="file"
                    className="w-[90%] bg-gray-200 px-1 rounded-md px-2"
                    name={column}
                    onChange={async (e)=>{
                        setTempValue(e.target.files[0].name)
                        setTempFile(await e.target.files[0].arrayBuffer())
                        console.log(e.target.files[0])
                    
                    }
                    }/> 
                    
                    : row[column]}
                    
                    {editing && 
                    <span className="cursor-pointer font-bold text-blue-600 ml-2"
                    onClick={() => setEditing(!editing)}>
                    Cancel
                    </span>
                    }

                    <span 
                    className="cursor-pointer font-bold text-blue-600 ml-2"
                    onClick={() => {
                        if (editing && colIndex == 0) {
                            handleChange(column, tempValue);
                            setEditing(!editing)
                        } else if (editing && colIndex > 0) {
                            // hit api
                            savePDF(tempFile)
                        } else {
                            setEditing(!editing)
                        }
                        }
                        }>
                        {editing ? 'Save' : 'Edit'}
                    </span>

                    
                
                </div>
    )
}