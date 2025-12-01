import { useState } from "react";
import { api, setAuthToken } from "../../api";
import Input from "../../components/Input";
import PrimaryButton from "../../components/PrimaryButton";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("adm");
  const [password, setPassword] = useState("adm");
  const [name, setName] = useState("");
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
  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/register", { name, email, password });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setAuthToken(token);
      onLogin({ token, user });
    } catch (error) {
      const msg = (() => {
        try {
          const data = error?.response?.data;
          if (typeof data === "string") return data;
          if (data?.message) return data.message;
        } catch (e) { void e; }
        return "Falha no cadastro. Verifique os dados e tente novamente.";
      })();
      alert(msg);
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
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="bg-blobs" aria-hidden="true">
        <div className="bg-blob one" />
        <div className="bg-blob two" />
        <div className="bg-blob three" />
        <div className="bg-blob four" />
        <div className="bg-blob five" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, position: "relative", zIndex: 1 }}>

        {mode === "login" ? (
          <div className={loading ? "blur-loading" : ""}
            style={{
              width: 360,
              padding: 24,
              borderRadius: 8,
              background: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>Realizar Login</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>Usuário ou e-mail</label>
                <Input type="text" value={email} onChange={setEmail} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>Senha</label>
                <Input type="password" value={password} onChange={setPassword} />
              </div>
              <PrimaryButton type="submit" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</PrimaryButton>
              <button
                type="button"
                onClick={() => setMode("signup")}
                style={{ marginTop: 8, padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: "#111827", cursor: "pointer" }}
              >
                Realizar cadastro
              </button>
              <button
                type="button"
                onClick={() => setMode("forgot")}
                style={{ fontSize: 12, marginTop: 8, padding: "8px 12px", borderRadius: 6, border: "none", background: "transparent", color: "#111827", cursor: "pointer", textDecoration: "none" }}
              >
                Esqueci minha senha
              </button>
            </form>
          </div>
        ) : mode === "signup" ? (
          <div className={loading ? "blur-loading" : ""}
            style={{
              width: 360,
              padding: 24,
              borderRadius: 8,
              background: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>Criar cadastro</h2>
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>Nome</label>
                <Input type="text" value={name} onChange={setName} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>E-mail</label>
                <Input type="email" value={email} onChange={setEmail} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>Senha</label>
                <Input type="password" value={password} onChange={setPassword} />
              </div>
              <PrimaryButton type="submit" disabled={loading}>{loading ? "Cadastrando..." : "Cadastrar"}</PrimaryButton>
              <button
                type="button"
                onClick={() => setMode("login")}
                style={{ marginTop: 8, padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: "#111827", cursor: "pointer" }}
              >
                Já tenho uma conta
              </button>
            </form>
          </div>
        ) : (
          <div className={loading ? "blur-loading" : ""}
            style={{
              width: 360,
              padding: 24,
              borderRadius: 8,
              background: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>Recuperar senha</h2>
            <ForgotPasswordForm email={email} onCancel={() => setMode("login")} />
          </div>
        )}
      </div>
    </div>
  );
}

function ForgotPasswordForm({ email, onCancel }) {
  const [stage, setStage] = useState("request");
  const [forgotEmail, setForgotEmail] = useState(email || "");
  const [code, setCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [busy, setBusy] = useState(false);

  const requestCode = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/forgot-password", { email: forgotEmail });
      setStage("verify");
      alert("Se existir conta, um código foi enviado para o e-mail informado.");
    } catch (e) { void e; }
    setBusy(false);
  };

  const reset = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/reset-password", { email: forgotEmail, code, password: newPass });
      alert("Senha redefinida com sucesso. Faça login.");
      onCancel?.();
    } catch (err) {
      const msg = (() => {
        try {
          const data = err?.response?.data;
          if (typeof data === "string") return data;
          if (data?.message) return data.message;
        } catch (e) { void e; }
        return "Não foi possível redefinir a senha.";
      })();
      alert(msg);
    }
    setBusy(false);
  };

  if (stage === "request") {
    return (
      <form onSubmit={requestCode} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>E-mail</label>
          <Input type="email" value={forgotEmail} onChange={setForgotEmail} />
        </div>
        <PrimaryButton type="submit" disabled={busy}>{busy ? "Enviando..." : "Enviar código"}</PrimaryButton>
        <button type="button" onClick={onCancel} style={{ marginTop: 8, padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: "#111827", cursor: "pointer" }}>Voltar ao login</button>
      </form>
    );
  }

  return (
    <form onSubmit={reset} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>Código</label>
        <Input type="text" value={code} onChange={setCode} />
      </div>
      <div>
        <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>Nova senha</label>
        <Input type="password" value={newPass} onChange={setNewPass} />
      </div>
      <PrimaryButton type="submit" disabled={busy}>{busy ? "Salvando..." : "Redefinir senha"}</PrimaryButton>
      <button type="button" onClick={() => setStage("request")} style={{ marginTop: 8, padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: "#111827", cursor: "pointer" }}>Voltar</button>
    </form>
  );
}
