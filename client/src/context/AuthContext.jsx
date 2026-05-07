/**
 * context/AuthContext.jsx
 *
 * Fuente única de verdad para la sesión del usuario.
 * Reemplaza todos los localStorage.getItem("token") / localStorage.getItem("usuario")
 * dispersos por el proyecto.
 *
 * USO:
 *   const { usuario, token, login, logout, loading } = useAuth();
 */

import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

// ─── Helpers de persistencia ────────────────────────────────────────────────
// El token se guarda como respaldo en localStorage SOLO para que las peticiones
// con header Authorization sigan funcionando. La cookie httpOnly del servidor
// es la fuente de autorización real — el backend la verifica primero.
const leerSesion = () => {
  try {
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("usuario");
    const usuario = raw ? JSON.parse(raw) : null;
    if (!token || !usuario) return { token: null, usuario: null };
    return { token, usuario };
  } catch {
    return { token: null, usuario: null };
  }
};

const guardarSesion = (token, usuario) => {
  localStorage.setItem("token", token);
  localStorage.setItem("usuario", JSON.stringify(usuario));
};

const borrarSesion = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
};

// ─── Provider ───────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const inicial = leerSesion();
  const [token, setToken] = useState(inicial.token);
  const [usuario, setUsuario] = useState(inicial.usuario);

  /**
   * login — llama al endpoint, guarda sesión y actualiza contexto.
   * Devuelve { ok, data } para que el componente muestre alertas según el resultado.
   */
  const login = useCallback(async ({ email, password }) => {
    const API_URL = process.env.REACT_APP_API_URL || "";
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ← envía/recibe cookies httpOnly
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, data };

    guardarSesion(data.token, data.user);
    setToken(data.token);
    setUsuario(data.user);
    return { ok: true, data };
  }, []);

  /**
   * loginGoogle — igual que login pero para el flujo de Google OAuth.
   */
  const loginGoogle = useCallback(async (credentialResponse) => {
    const API_URL = process.env.REACT_APP_API_URL || "";
    const res = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token: credentialResponse.credential }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, data };

    guardarSesion(data.token, data.user);
    setToken(data.token);
    setUsuario(data.user);
    return { ok: true, data };
  }, []);

  /**
   * logout — llama al endpoint para que el servidor borre la cookie httpOnly,
   * luego limpia el estado local.
   */
  const logout = useCallback(async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || "";
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // El logout local siempre procede aunque falle la red
    }
    borrarSesion();
    setToken(null);
    setUsuario(null);
  }, []);

  /**
   * actualizarUsuario — para actualizar datos del usuario en el contexto
   * sin cerrar sesión (ej: después de completar perfil).
   */
  const actualizarUsuario = useCallback((nuevosDatos) => {
    setUsuario((prev) => {
      const actualizado = { ...prev, ...nuevosDatos };
      localStorage.setItem("usuario", JSON.stringify(actualizado));
      return actualizado;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ token, usuario, login, loginGoogle, logout, actualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook de consumo ─────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
