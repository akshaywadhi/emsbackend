import mongoose from 'mongoose'



export const connectDB = async () => {

  try{
const connect = await mongoose.connect(process.env.MONGO_URI)
console.log(`Database Connected : ${connect.connection.host}`)
  }
  catch(err){
console.log("MongoDB Connection Error :",err)
  }
}