const mongoose = require('mongoose');
const { tallySchema } = require('./schema');
const port = 8081; 

const uri = "mongodb+srv://ramadhenuvinati:Vinati12@cluster0.kf8j23p.mongodb.net/<database_name>?retryWrites=true&w=majority";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("Connection established with MongoDB Atlas");
})
.catch(err => {
  console.error("Error while connecting to MongoDB Atlas:", err);
});

const collection_connection = mongoose.model('covidtally', tallySchema);

exports.connection = collection_connection;