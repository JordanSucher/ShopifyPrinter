const React = require("react");
const {useState, useEffect} = require("react")
const ProductFiles = require("./ProductFiles.js").default;
const PrintQueue = require("./PrintQueue.js").default;
const PrinterMapping = require("./PrinterMapping.js").default;

export default function Main() {
    return (
        <div className="p-6">
            <ProductFiles />
            <PrinterMapping />
            <PrintQueue />
        </div>
    )
}