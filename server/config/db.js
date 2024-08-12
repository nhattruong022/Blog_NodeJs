const mongoose=require('mongoose');
const connect=mongoose.connect("mongodb://localhost:27017/Nodejs-Blog");

connect.then(() => {
  console.log('Databased connected successfully');
})
  .catch(() => {
    console.log('Databased can not be connected');
  });
