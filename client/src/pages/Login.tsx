import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useDispatch, useSelector } from "react-redux";
import { setToken } from "../stores/feature/AuthSclice";
import type { RootState } from "../stores/store";

interface LoginData {
    email: string;
    password: string;
}

const Signin = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const token = useSelector((state: RootState) => state.token.accesstoken);
    const [userData, setUserData] = useState<LoginData>({
        email: "",
        password: "",
    });

    useEffect(() => {
        if (token) {
            navigate("/dashboard");
        }
    }, [token, navigate]);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post("/login", userData);
            dispatch(setToken(res.data.accessToken));
            alert("Signed in successfully!");
            navigate("/dashboard");
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-tr from-blue-50 to-indigo-100 px-4">
            <div className="w-full max-w-md bg-white/85 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20 h-130 flex flex-col justify-between transition-all duration-300 hover:shadow-indigo-200/50">
                <div>
                    <h1 className="text-3xl font-extrabold text-center text-gray-800 tracking-tight">
                        Sign In
                    </h1>
                    <p className="text-center text-gray-500 mt-2 text-sm">
                        Welcome back! Please enter your details.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-center gap-4 mt-6">
                    <input
                        required
                        type="email"
                        name="email"
                        value={userData.email}
                        placeholder="Enter email"
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm transition"
                    />

                    <input
                        required
                        type="password"
                        name="password"
                        value={userData.password}
                        placeholder="Enter password"
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm transition"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg active:scale-[0.98]"
                    >
                        {loading && (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <p className="text-gray-600 text-sm">
                        Create an account?{" "}
                        <Link
                            to="/"
                            className="text-blue-600 font-semibold hover:text-blue-700 transition"
                        >
                            Signup
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signin;