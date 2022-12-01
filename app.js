require("dotenv").config();
require("express-async-errors");

// extra security packages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');

//require cloudinary version 2
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// Swagger
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

//require express
const express = require("express");
const app = express();

const fileUpload = require("express-fileupload");

const connectDB = require("./db/connect");
app.use(fileUpload({ useTempFiles: true }));

// routers
const authRouter = require("./routes/auth");
const itemRouter = require("./routes/item");
const needRouter = require("./routes/need");
const likeRouter = require("./routes/like");
const userRouter = require("./routes/user");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

//use extra security packages
app.use(
    rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
    })
);
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(xss());


app.use('/', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/item", itemRouter);
app.use("/api/v1/need", needRouter);
app.use("/api/v1/like", likeRouter);
app.use("/api/v1/user", userRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 8800;
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URL);
        app.listen(port, () =>
            console.log(`Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.log(error);
    }
};

start();
