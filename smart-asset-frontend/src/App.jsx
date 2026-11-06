import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import api from "./services/api";
import Dashboard from "./Dashboard";
import Login from "./Login";

export default function App() {
    const [user, setUser] = useState(null);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem("assetflow-theme") === "dark" ? "dark" : "light";
        } catch {
            return "light";
        }
    });

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        try {
            localStorage.setItem("assetflow-theme", theme);
        } catch {
            // The selected theme still applies for this session if storage is unavailable.
        }
    }, [theme]);

    useEffect(() => {
        api.get("/user")
            .then((response) => {
                setUser(response.data);
            })
            .catch(() => {
                setUser(null);
            })
            .finally(() => {
                setCheckingAuth(false);
            });
    }, []);

    async function handleLogout() {
        try {
            await api.post("/logout");
        } catch (error) {
            console.error("Logout request failed:", error);
        } finally {
            setUser(null);
        }
    }

    if (checkingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f6f8f5] p-4" role="status" aria-live="polite">
                <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-gray-200 bg-white px-8 py-10 text-center shadow-sm">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                        <LoaderCircle className="animate-spin" size={28} />
                    </div>
                    <p className="mt-5 font-semibold text-gray-900">Checking your session</p>
                    <p className="mt-1 text-sm text-gray-500">Getting your workspace ready…</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Login onLogin={setUser} theme={theme} onToggleTheme={() => setTheme((current) => current === "dark" ? "light" : "dark")} />;
    }

    return <Dashboard user={user} onLogout={handleLogout} theme={theme} onToggleTheme={() => setTheme((current) => current === "dark" ? "light" : "dark")} />;
}
