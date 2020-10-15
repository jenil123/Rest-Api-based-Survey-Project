const mongoose=require('mongoose')
const { use } = require('../routes/survey')

const userSchema=new mongoose.Schema({
     name:
     {
         type:String,
        required:true,
        trim:true
     },
     password:{
          type:String,
          required:true,
     }

})

module.exports=mongoose.model('User',userSchema)