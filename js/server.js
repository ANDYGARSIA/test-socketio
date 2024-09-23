const express = require('express')
const app = express()
const PORT = 4000
const time = Date.now();

app.get('/home', (req, res) => {
    res.status(200).json('Welcome, your app is working well, server started at ' + time);
})


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Export the Express API
module.exports = app