const express = require("express");
const jwt = require('jsonwebtoken');
const app = express();

const secretVal="L+e[F8+j9^GK>ZJ)3sGg";
const token=jwt.sign({id : '123456'},secretVal)
console.log(token)
app.listen(3409, () => {
    console.log(`server listening on 3409`)
})