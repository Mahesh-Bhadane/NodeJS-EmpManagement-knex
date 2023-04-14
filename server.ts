import express from "express";
import authRouter from './src/routers/authRouter';
import projectRouter from './src/routers/projectRouter'
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/auth',authRouter );
app.use('/api/projects',projectRouter)


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
