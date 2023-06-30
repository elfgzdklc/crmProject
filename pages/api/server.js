const express = require('express')
const next = require('next')
const hostname = 'localhost'
const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({dev, hostname, port})
const handle = app.getRequestHandler()
const fileUpload = require("express-fileupload")
const dashboardRouter = require("./dashboard");

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
    /* Custom queries */
    // const accountRouter = require("./login");
    // server.all("*", accountRouter);
    /* Custom queries */

    // const departmentRouter = require("./definitions/departments-management");
    // server.all("*", departmentRouter);

    // const logRouter = require("./definitions/transaction-logs");
    // server.all("*", logRouter);

    // const permissionRouter = require("./definitions/authority-management");
    // server.all("*", permissionRouter);

    // const categoryRouter = require("./definitions/category-management");
    // server.all("*", categoryRouter);

    // const staffRouter = require("./staff/staffManagement");
    // server.all("*", staffRouter);

    // const customers = require("./customer-management/customers");
    // server.all("*", customers);
    //
    // const customerCategories = require("./customer-management/customer-categories");
    // server.all("*", customerCategories);
    //
    // const potentialCustomers = require("./customer-management/potential-customers");
    // server.all("*", potentialCustomers);

    // const custom = require("./custom");
    // server.all("*", custom);

    //const brandRouter = require("./productManagement/brands");
    //server.all("*", brandRouter);

    //const productRouter = require("./productManagement/products");
    //server.all("*", productRouter);

    //const productCategoriesRouter = require("./productManagement/product-categories");
    //server.all("*", productCategoriesRouter);


     const profileRouter = require("./profile");
     server.all("*", profileRouter);

    // const agendaRouter = require("./agenda");
    // server.all("*", agendaRouter)

    const dashboardRouter = require("./dashboard");
    server.all("*", dashboardRouter);


    // const reportsRouter=require("./reports");
    // server.all("*",reportsRouter);
    const announcementsRouter=require("./announcements");
    server.all("*",announcementsRouter);
    // const requests = require("./definitions/requests");
    // server.all("*", requests);

    // const customerOffical = require("./customer-management/customer-official");
    // server.all("*", customerOffical);

    //const salesRouter = require("./sales");
    //server.all("*", salesRouter);

    // const staffRouter = require("./logistic/staff/");
    // server.all("*", staffRouter);

    /* Custom queries */
   // const allPurchases = require("./purchases/all-purchases");
   // server.all("*", allPurchases);

  //  const purchase = require("./purchases/purchase");
  //  server.all("*", purchase);

    //const settings = require("./settings");
    //server.all("*", settings);

    // const allAfterSalesServices = require("./after-sales-service/all-after-sales-service");
    // server.all("*", allAfterSalesServices);
    //
    // const afterSalesServiceCreate = require("./after-sales-service/create-after-sales-service");
    // server.all("*", afterSalesServiceCreate);

    server.all('*', (req, res) => {
        return handle(req, res)
    })

    server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`)
    })
})
