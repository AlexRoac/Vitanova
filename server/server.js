const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const usuariosRoutes = require("./routes/usuarios"); 
app.use("/api", usuariosRoutes); 


app.get("/", (req, res) => {
  res.json({ mensaje: "Backend funcionando" });
});

app.listen(5000, () => {
  console.log("Servidor en http://localhost:5000");
});