const React = require("react");
const { createRoot } = require("react-dom/client");
const Main = require("./components/Main.js").default;
const css = require("./dist/global.css");

const root = createRoot(document.getElementById("app"));

root.render (
    <div class="App">
        <Main />
    </div>    
)

