import { useState } from "react";
import axios from "axios";
import { LockKeyhole, Mail, Moon, ShieldCheck, Sun } from "lucide-react";
import api from "./services/api";

export default function Login({ onLogin, theme, onToggleTheme }) {
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(event) {
        setForm({
            ...form,
            [event.target.name]: event.target.value,
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            // Request the CSRF cookie before attempting login.
            await axios.get("/sanctum/csrf-cookie", {
                withCredentials: true,
            });

            // Authenticate through Laravel Sanctum.
            const response = await api.post("/login", form);

            onLogin(response.data.user);
        } catch (err) {
            if (err.response?.status === 401) {
                setError("Invalid email or password.");
            } else if (err.response?.status === 422) {
                setError("Please enter a valid email and password.");
            } else {
                setError(
                    err.response?.data?.message ||
                        "Unable to log in. Please check your connection and try again.",
                );
            }

            console.error("Login failed:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f6f8f5] p-4">
            <button
                type="button"
                onClick={onToggleTheme}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                className="fixed right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50"
            >
                {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                <div className="mb-6 flex justify-center">
                    <div className="rounded-2xl bg-green-100 p-4 text-green-800">
                        <ShieldCheck size={36} />
                    </div>
                </div>

                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Smart Asset Management
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Sign in to manage your organization's assets.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Email address
                        </label>

                        <div className="relative">
                            <Mail
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="admin@smartasset.test"
                                autoComplete="username"
                                required
                                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>

                        <div className="relative">
                            <LockKeyhole
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                            />
                        </div>
                    </div>

                    {error && (
                        <div
                            role="alert"
                            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center rounded-lg bg-green-700 px-4 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="mt-6 text-center text-xs text-gray-400">
                    Secure access to your asset management dashboard.
                </p>
            </div>
        </div>
    );
}