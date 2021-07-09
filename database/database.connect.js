const mongoose = require('mongoose');
const mySecret = process.env['DATABASE_PASSWORD']

const dbConnect = () => {
  mongoose.connect(`mongodb+srv://joyan11:${mySecret}@cluster0.4n12u.mongodb.net/socialmedia?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }).then(() => console.log("MongoDB connected")).catch((err) => console.error(err))
}

module.exports = { dbConnect };