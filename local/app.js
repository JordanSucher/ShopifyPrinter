const app = require('./server.js')
const { startPolling } = require('./poller.js');


// Start the local server

const port = 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Start polling for print jobs

startPolling(3000);