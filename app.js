require("dotenv").config();
require("express-async-errors");

const fileUpload = require("express-fileupload");

// extra security packages
const cors = require("cors");

const express = require("express");
const app = express();

//require cloudinary version 2
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const connectDB = require("./db/connect");

// routers
const authRouter = require("./routes/auth");
const itemRouter = require("./routes/item");
const needRouter = require("./routes/need");
const likeRouter = require("./routes/like");
const userRouter = require("./routes/user");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.use(express.json());
app.use(cors());
app.use(fileUpload({ useTempFiles: true }));

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
