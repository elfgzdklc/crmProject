const express = require('express')
const next = require('next')
const hostname = 'localhost'
const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({dev, hostname, port})
const handle = app.getRequestHandler()
const fileUpload = require("express-fileupload")

app.prepare().then(() => {
    const server = express()
    server.use(express.json())
    server.use(express.urlencoded({extended: true}));
    server.use(fileUpload({
        createParentPath: true,
        safeFileNames: true,
        uriDecodeFileNames: true,
        preserveExtension: true,
        useTempFiles: true,
        tempFileDir: './public/uploads/temp/',
        uploadTimeout: 0
    }));

    const profileRouter = require("./profile");
    server.all("*", profileRouter);

    const dashboardRouter = require("./dashboard");
    server.all("*", dashboardRouter);

    const announcementsRouter = require("./announcements");
    server.all("*", announcementsRouter);

    server.all('*', (req, res) => {
        return handle(req, res)
    })

    server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`)
    })
})
