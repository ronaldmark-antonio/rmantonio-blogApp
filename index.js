const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");

const port = 4000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(cors());

//MongoDB database
mongoose.connect("mongodb+srv://admin:admin@b561-antonio.qm1y7tb.mongodb.net/blogAppAPI?retryWrites=true&w=majority&appName=B561-Antonio", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'));

//Routes Middleware
const postRoutes = require("./routes/post");
const userRoutes = require("./routes/user");

app.use("/posts", postRoutes);
app.use("/users", userRoutes);


if(require.main === module){
	app.listen(process.env.PORT || 4000, () => {
	    console.log(`API is now online on port ${ process.env.PORT || 4000 }`)
	});
}

module.exports = {app,mongoose};