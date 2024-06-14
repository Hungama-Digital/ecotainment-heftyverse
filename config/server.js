const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const multer = require('multer');
// const helmet = require('helmet');
// const morgan = require('morgan');

class Server {
    constructor() {
        console.log(`inside Server constructor`);
        this.app = express();
        this.setup();
    }

    setup = () => {
        console.log(`inside server setup`);

        // // Set security-related HTTP headers
        // this.app.use(helmet());

        // Enable CORS
        this.app.options('*', cors());
        this.app.use(cors());

        // Enable gzip compression
        this.app.use(compression());

        // Setup body parser with extended limits
        this.app.use(bodyParser.json({ limit: "50mb" }));
        this.app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

        // Setup file upload with multer
        const multerId = multer({
            storage: multer.memoryStorage(),
            limits: {
                fileSize: 100 * 1024 * 1024, // 100MB
            },
        });
        this.app.use(multerId.fields([{ name: "file", maxCount: 10 }]));

        // // Request logging
        // this.app.use(morgan('combined'));

        // Use a router
        const router = require('../routes/route');
        this.app.use('/', router);

        // Default route
        this.app.get('', (req, res) => {
            res.send('ok');
        });

        // Global error handling middleware
        this.app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).send('Something broke!');
        });
    }

    run = (port) => {
        this.server = this.app.listen(port, () => {
            console.log(`listening to port ${port}`);
        });
    }
}

module.exports = Server;
