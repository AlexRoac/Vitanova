const express = require("express");
const cors = require("cors");
require("dotenv").config(); // Asegúrate de que esté aquí también

const app = express();

// Configura CORS para aceptar tu URL de Vercel en el futuro
app.use(cors({
  origin: [process.env.FRONTEND_URL || "http://localhost:3000", 'https://vitanova.vercel.app'],
  credentials: true
}));

app.use(express.json());

// Tus rutas se quedan igual
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
const usuariosRoutes = require("./routes/usuarios"); 
app.use("/api", usuariosRoutes); 
const notasRoutes = require('./routes/notas');
app.use('/api/notas', notasRoutes);
const disponibilidadRoutes = require('./routes/disponibilidad');
app.use('/api/disponibilidad', disponibilidadRoutes);
const citasRoutes = require('./routes/citas');
app.use('/api/citas', citasRoutes);

app.get("/", (req, res) => {
  res.json({ mensaje: "Backend funcionando en la nube" });
});

// USAR process.env.PORT es obligatorio para Railway
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});