const mongoose = require('mongoose');
const productList  = require('./productList');
const Product = require('../models/productModel')
const dotenv = require('dotenv');


dotenv.config()
const url = "mongodb+srv://mopidevisurya001:Mongodb003@cluster0.ewbxs5f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
// console.log(url)

//mongoose connection
mongoose.connect(url)
  
    .then((e) => {
        console.log('mongoose connected succesfully........')
    })
    .catch((e) => {
      console.log(e)
        console.log("Connection FAILED")
    })

const addProducts = async (productList) => {
    try {
        await Product.deleteMany({})
        for(let i=0; i<productList.length; i++) {
            const {productNumber,productname, img1,img2,img3,img4, price, count, size,category,code} = productList[i]
            const product = new Product({productNumber : productNumber,productname : productname, img1 : img1,img2 : img2,img3 : img3,img4 : img4, price : price, count : count, size : size,category : category,code : code})
            await product.save()
        }
    }
    catch(err){
        console.log(err.message);
    }
}

addProducts(productList)
.then(() => {
    console.log('Products added')
    mongoose.connection.close()
})
.catch((err) => {
    console.log(err.message)
})