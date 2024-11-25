// Creation and configuration of the Express APP
const express = require('express');
const cors = require('cors');

const app = express();
app.set('trust proxy', 1);
app.use(express.json());
app.use(cors());

// Route configuration
// Ex.
app.use('/api', require('./routes/api.routes'));

// Error handler
app.use((err, req, res, next) => {
    console.error('CUSTOM ERROR HANDLER: ', err.stack);

    res
        .status(err.status)
        .json({
            status: err.status,
            title: err.title,
            message: err.message
        });
})

module.exports = app;