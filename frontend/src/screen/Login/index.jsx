import { useState } from "react";
import { api, setAuthToken } from "../../api";
import Input from "../../components/Input";
import PrimaryButton from "../../components/PrimaryButton";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("adm");
  const [password, setPassword] = useState("adm");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/login", { email, password });
      const { token, user } = res.data;

      // salva no localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setAuthToken(token);

      onLogin({ token, user });
    } catch (error) {
      console.error("Erro no login:", error);
      alert("Falha no login. Verifique usuário/e-mail e senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        fontFamily: "system-ui",
      }}
    >
      <div className={loading ? "blur-loading" : ""}
        style={{
          width: 320,
          padding: 24,
          borderRadius: 8,
          background: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>Login</h2>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <div>
            <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>
              Usuário ou e-mail
            </label>
            <Input type="text" value={email} onChange={setEmail} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>
              Senha
            </label>
            <Input type="password" value={password} onChange={setPassword} />
          </div>

          <PrimaryButton type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}
