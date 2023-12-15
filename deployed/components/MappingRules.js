const React = require("react");
const {useState, useEffect} = require("react")

export default function MappingRules() {
    const [columns, setColumns] = useState(['Product Name', 'Cover PDF', 'Book PDF']);
    const [data, setData] = useState([{"Product Name": 'Book 1', "Cover PDF": 'cover1.pdf', "Book PDF": 'book1.pdf'}, {"Product Name": 'Book 2', "Cover PDF": 'cover2.pdf', "Book PDF": 'book2.pdf'}]);

    const handleChange = (column, value, index) => {
        let newRows = [...data];
        newRows[index][column] = value;
        setData(newRows)
    }

    return (
        <div className="w-full">
            <div className="flex w-full gap-2 mb-2">
                {columns.map((column, index) => (
                    <div 
                    className="border-2 border-black p-2 w-[300px] rounded-lg font-bold"
                    key={index}>
                    
                        {column}
                    </div>
                ))}
            </div>

            {data.map((row, index) => (
                <MappingRule row={row} columns={columns} rowIndex={index} handleChange={handleChange} key={index} />
            ))}


        </div>
    )
}

function MappingRule ({row, columns, rowIndex, handleChange}) {
    useEffect(() => {
        console.log("Row: ", row)
    })

    const [editing, setEditing] = useState(false);

    return (
        <div className="flex w-full gap-2 mb-2"> 
            {columns.map((column, index) => (
                <MappingRuleCell row={row} column={column} colIndex={index} handleChange={(column, value) => handleChange(column, value, rowIndex)} />
            ))}
        </div>
    )
}

function MappingRuleCell ({row, column, colIndex, handleChange}) {
    const [editing, setEditing] = useState(false);
    const [tempValue, setTempValue] = useState(row[column]);
    const [tempFile, setTempFile] = useState(null);

    const savePDF = async (arrayBuffer) => {
        let blob = new Blob([arrayBuffer], {type: 'application/pdf'});
        const formData = new FormData();
        formData.append('file', blob, tempValue);

        let response = await fetch('/api/file', {
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
        <div className="border-2 border-black p-2 w-[300px] rounded-lg flex justify-between">
                    
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