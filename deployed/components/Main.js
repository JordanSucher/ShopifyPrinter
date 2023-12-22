const React = require("react");
const {useState, useEffect} = require("react")
const ProductFiles = require("./ProductFiles.js").default;
const PrintQueue = require("./PrintQueue.js").default;
const PrinterMapping = require("./PrinterMapping.js").default;

export default function Main() {
    return (
        <div className="mt-4 p-6 text-sm xl:w-2/3 xl:mx-auto">
            <div className="">
                <ProductFiles />
                <PrinterMapping />
            </div>
            <PrintQueue />
        </div>
    )
}