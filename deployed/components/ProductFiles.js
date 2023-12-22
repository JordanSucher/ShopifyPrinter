const React = require("react");
const {useState, useEffect} = require("react")
const {Cross2Icon} = require("@radix-ui/react-icons")
const AddProductButton = require("./AddProductButton.js").default;

export default function ProductFiles() {
    const [columns, setColumns] = useState([]);
    const [data, setData] = useState([]);
    const [fileIds, setFileIds] = useState({});

    const handleChange = (column, value, index) => {
        let newRows = [...data];
        let productId = newRows[index].id
        newRows[index][column] = value;
        setData(newRows)

        console.log("column: ", column)

        if(column == "Product Name") {
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
    }

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

    useEffect(() => {
        getMappings()
    }, [])

    return (
        <div className="w-full min-w-[450px] ">
            <h1 className="font-bold mb-2 text-2xl">Products and Files</h1>
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
                <MappingRule fileIds={fileIds} row={row} columns={columns} rowIndex={index} handleChange={handleChange} getProducts={getMappings} key={index} />
            ))}

            <AddProductButton getProducts={getMappings}/>


        </div>
    )
}

function MappingRule ({row, columns, rowIndex, handleChange, fileIds, getProducts}) {
    useEffect(() => {
        console.log("Row: ", row)
    })

    const [editing, setEditing] = useState(false);

    return (
        <div className="flex w-full gap-2 mb-2"> 
            {columns.map((column, index) => (
                <MappingRuleCell fileIds={fileIds} row={row} column={column} colIndex={index} getProducts={getProducts} handleChange={(column, value) => handleChange(column, value, rowIndex)} />
            ))}
        </div>
    )
}

function MappingRuleCell ({row, column, colIndex, handleChange, fileIds, getProducts}) {
    const [editing, setEditing] = useState(false);
    const [tempValue, setTempValue] = useState(row[column]);
    const [tempFile, setTempFile] = useState(null);

    useEffect(() => {
        if (!tempValue || tempValue == null) {
            setEditing(true)
        }
    }, [tempValue])

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

    const deleteProduct = async () => {
        let response = await fetch(`/api/product?id=${row.id}`, {
            method: 'DELETE'
        })

        getProducts()
    }

    return (
        <div className="bg-white p-2 px-4 w-[300px] grow rounded-lg flex justify-between items-center">
                    
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
                    placeholder={tempValue}
                    onChange={async (e)=>{
                        setTempValue(e.target.files[0].name)
                        setTempFile(await e.target.files[0].arrayBuffer())
                        console.log(e.target.files[0])
                    
                    }
                    }/> 
                    
                    : colIndex == 0 ? row[column] 
                    
                    :   <button
                        className="text-blue-600 underline" 
                        onClick={async ()=>{
                            try {
                                let response = await fetch(`/api/productfile?productId=${row.id}&fileId=${fileIds[column]}`);
                    
                                if (!response.ok) {
                                    throw new Error(`HTTP error! status: ${response.status}`);
                                }
                    
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                
                                // Open the PDF in a new browser tab
                                window.open(url, '_blank');
                    
                                // Optional: Clean up the URL object
                                window.URL.revokeObjectURL(url);
                            } catch (error) {
                                console.error('Error fetching the PDF:', error);
                                // Handle the error (e.g., show an error message)
                            }
                    
                        }}>
                            {row[column]}
                        </button>
                    }
                    
                    <span className="flex items-center">
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

                        {colIndex == 0 && 
                        <Cross2Icon 
                        onClick={deleteProduct}
                        className='w-5 h-5 p-1 m-1 rounded-lg hover:cursor-pointer hover:bg-gray-300' />}

                    </span>
                    

                    
                
                </div>
    )
}