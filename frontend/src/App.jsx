import { useState } from "react";
import Login from "./screen/Login/index";
import Home from "./screen/Home/index";
import Dashboard from "./screen/Dashboard/index";
import UsersPage from "./screen/UsersPage/index";
import Sidebar from "./components/Sidebar";
import { theme } from "./theme";
import "./styles.css";
import { setAuthToken } from "./api";

export default function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      const user = JSON.parse(userStr);
      setAuthToken(token);
      return { token, user };
    }
    return { token: null, user: null };
  });
  const [page, setPage] = useState("home");

  const handleLogin = ({ token, user }) => {
    setAuth({ token, user });
    setPage("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ token: null, user: null });
    setAuthToken(null);
    setPage("home");
  };

  if (!auth.token) {
    return <Login onLogin={handleLogin} />;
  }

  const isAdmin = auth.user?.is_admin;

  return (
    <div
      style={{
        fontFamily: "system-ui",
        display: "flex",
        minHeight: "100vh",
        background: theme.colors.gray,
      }}
    >
      <Sidebar
        items={[
          { key: "home", label: "Tickets" },
          { key: "dashboard", label: "Dashboard" },
          ...(isAdmin ? [{ key: "users", label: "Usuários" }] : []),
        ]}
        activeKey={page}
        onSelect={(key) => setPage(key)}
        user={auth.user}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1, padding: "24px 0 0 24px", minWidth: 0, marginLeft: theme.layout.sidebarWidth }}>
        {page === "home" && <Home />}
        {page === "dashboard" && <Dashboard />}
        {page === "users" && isAdmin && <UsersPage />}
      </main>
    </div>
  );
}
