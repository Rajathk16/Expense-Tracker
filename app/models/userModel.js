const mongoose=require('mongoose');
//schema design
const userSchema=new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true, 
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
},
{timestamps: true,
}
);
//export
const userModel=mongoose.model('User',userSchema);
module.exports=userModel;