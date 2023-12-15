const React = require("react");
const {useState, useEffect} = require("react")
const MappingRules = require("./MappingRules.js").default;

export default function Main() {
    return (
        <div className="p-6">
            <MappingRules />
        </div>
    )
}