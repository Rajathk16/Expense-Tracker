const mongoose=require('mongoose')
const colors=require('colors')
const connectDb=async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log('Connected to MongoDB and server running on ${mongoose.connection.host}'.bgGreen.white);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};
module.exports=connectDb