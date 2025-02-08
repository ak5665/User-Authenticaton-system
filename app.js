require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cookieParser = require("cookie-parser");

// my routes
const userRoutes = require('./routes/user');
const protectedRoute= require('./routes/protected');

//DB Connection
const MONGODB_URI = "mongodb://127.0.0.1:27017/user_auth";

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB Connected Successfully!");
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    console.log("Please make sure MongoDB is running on port 27017");
  });

const app = express();

//Middlewares
app.use(express.static(__dirname));
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));  
app.use(cookieParser());

// Configure CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.method === 'POST') {
    console.log('Request body:', req.body);
  }
  next();
});

mongoose.Promise = global.Promise;

//My Routes
app.use("/user",userRoutes);
app.use("/home",protectedRoute);

app.use("/",(req,res)=>{                 //default route
  res.json({ message: "Welcome to User Authentication System !!" });
})

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

const port = process.env.PORT || 3000;

//Starting a server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});