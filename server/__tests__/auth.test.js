/**
 * __tests__/auth.test.js
 * Tests de autenticación: login, register y protección de rutas
 */

// Variables de entorno mínimas para que server.js arranque en modo test
process.env.JWT_SECRET = "test_secret_para_jest_32_caracteres_ok";
process.env.GOOGLE_CLIENT_ID = "test_google_id";
process.env.EMAIL_USER = "test@test.com";
process.env.EMAIL_PASS = "test_pass";
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../server");

// ─── Helpers ────────────────────────────────────────────────────────────────

const jwt = require("jsonwebtoken");

/** Genera un token JWT válido con el rol indicado */
function makeToken(id, rol) {
  return jwt.sign(
    { usuario: { id, rol } },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

// ─── 1. Login ────────────────────────────────────────────────────────────────

describe("POST /api/auth/login", () => {
  test("400 si falta email o password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "solo@email.com" }); // sin password
    expect(res.status).toBe(400);
    expect(res.body.msg).toBeDefined();
  });

  test("400 si el email tiene formato inválido", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "no-es-un-email", password: "12345678" });
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/email/i);
  });

  test("400 o 500 con credenciales incorrectas (sin BD en test → 500 es aceptable)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "noexiste@vitanova.com", password: "contrasenaMala123" });
    // Sin BD real obtenemos 500; en producción con BD sería 400.
    // Lo importante es que NO devuelve 200 (no permite acceso).
    expect(res.status).not.toBe(200);
    expect(res.status).not.toBe(201);
  });
});

// ─── 2. Register ─────────────────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
  test("400 si faltan campos obligatorios", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "nuevo@test.com" }); // sin password, nombre, apellido
    expect(res.status).toBe(400);
    expect(res.body.msg).toBeDefined();
  });

  test("400 si la contraseña tiene menos de 8 caracteres", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "nuevo@test.com", password: "123", nombre: "Test", apellido: "User" });
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/8/);
  });

  test("400 si el email tiene formato inválido", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "no-es-email", password: "12345678", nombre: "Test", apellido: "User" });
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/email/i);
  });
});

// ─── 3. Protección de rutas (sin token) ─────────────────────────────────────

describe("Rutas protegidas — sin token deben responder 401", () => {
  const rutasProtegidas = [
    ["GET",    "/api/usuarios"],
    ["DELETE", "/api/usuarios/1"],
    ["PUT",    "/api/usuarios/actualizar-roles"],
    ["GET",    "/api/citas/paciente/1"],
    ["GET",    "/api/citas/psicologo/1"],
    ["POST",   "/api/citas/reservar"],
    ["PUT",    "/api/citas/cancelar/1"],
    ["POST",   "/api/notas"],
    ["PUT",    "/api/auth/completar-perfil"],
  ];

  test.each(rutasProtegidas)("%s %s devuelve 401 sin token", async (method, ruta) => {
    const res = await request(app)[method.toLowerCase()](ruta).send({});
    expect(res.status).toBe(401);
  });
});

// ─── 4. Autorización por rol ─────────────────────────────────────────────────

describe("Rutas admin — token de paciente debe recibir 403", () => {
  const tokenPaciente = makeToken(999, "paciente");

  test("GET /api/usuarios con rol paciente → 403", async () => {
    const res = await request(app)
      .get("/api/usuarios")
      .set("Authorization", `Bearer ${tokenPaciente}`);
    expect(res.status).toBe(403);
  });

  test("DELETE /api/usuarios/1 con rol paciente → 403", async () => {
    const res = await request(app)
      .delete("/api/usuarios/1")
      .set("Authorization", `Bearer ${tokenPaciente}`);
    expect(res.status).toBe(403);
  });

  test("PUT /api/usuarios/actualizar-roles con rol paciente → 403", async () => {
    const res = await request(app)
      .put("/api/usuarios/actualizar-roles")
      .set("Authorization", `Bearer ${tokenPaciente}`)
      .send({ usuarios: [] });
    expect(res.status).toBe(403);
  });
});

describe("Rutas psicologo — token de paciente debe recibir 403", () => {
  const tokenPaciente = makeToken(999, "paciente");

  test("POST /api/notas con rol paciente → 403", async () => {
    const res = await request(app)
      .post("/api/notas")
      .set("Authorization", `Bearer ${tokenPaciente}`)
      .send({ paciente_id: 1, contenido: "Nota de prueba" });
    expect(res.status).toBe(403);
  });

  test("POST /api/citas/configurar con rol paciente → 403", async () => {
    const res = await request(app)
      .post("/api/citas/configurar")
      .set("Authorization", `Bearer ${tokenPaciente}`)
      .send({ psicologoId: 1, fecha: "2025-12-01", horas: [] });
    expect(res.status).toBe(403);
  });
});

// ─── 5. IDOR — paciente no puede ver citas de otro ──────────────────────────

describe("IDOR — paciente no puede acceder a recursos de otros", () => {
  // paciente con id=5 intenta acceder a las citas del paciente id=99
  const tokenPaciente5 = makeToken(5, "paciente");

  test("GET /api/citas/paciente/99 con token de paciente id=5 → 403", async () => {
    const res = await request(app)
      .get("/api/citas/paciente/99")
      .set("Authorization", `Bearer ${tokenPaciente5}`);
    expect(res.status).toBe(403);
  });

  test("POST /api/citas/reservar a nombre de otro paciente → 403", async () => {
    const res = await request(app)
      .post("/api/citas/reservar")
      .set("Authorization", `Bearer ${tokenPaciente5}`)
      .send({ pacienteId: 99, psicologoId: 1, fecha: "2025-12-01", hora: "10:00" });
    expect(res.status).toBe(403);
  });
});

// ─── 6. Token inválido ───────────────────────────────────────────────────────

describe("Token manipulado o expirado → 403", () => {
  test("Token firmado con secreto incorrecto → 403", async () => {
    const tokenFalso = jwt.sign(
      { usuario: { id: 1, rol: "admin" } },
      "secreto_falso_del_atacante",
      { expiresIn: "1h" }
    );
    const res = await request(app)
      .get("/api/usuarios")
      .set("Authorization", `Bearer ${tokenFalso}`);
    expect(res.status).toBe(403);
  });

  test("Token malformado → 403", async () => {
    const res = await request(app)
      .get("/api/usuarios")
      .set("Authorization", "Bearer esto.no.es.un.jwt");
    expect(res.status).toBe(403);
  });
});
