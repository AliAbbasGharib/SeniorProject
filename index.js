const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://aligharib560:ali12345@cluster0.untugvz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => {
        console.log("connected succufully");
    }).catch((err) => {
        console.log(err)
    })


const authApi = require("./Routes/api");
const app = express();

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
}));

app.use("/api", authApi);
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`I am listening in port ${port}`);
});