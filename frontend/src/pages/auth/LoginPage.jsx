import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaLock, FaUserShield } from "react-icons/fa";
import { login as loginRequest } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/common/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await loginRequest({ email, password });
      login(res.data);
      toast.success("Signed in successfully");
      navigate(res.data.user.role === "admin" ? "/admin" : "/chef");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="grid min-h-screen place-items-center bg-black px-5 text-white">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.07] p-7 shadow-glow backdrop-blur">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary-500 to-gold-500 text-2xl">
          <FaUserShield />
        </div>
        <h1 className="mt-6 text-4xl font-black">Staff Login</h1>
        <p className="mt-2 text-white/55">Secure JWT access for Admin and Chef dashboards.</p>
        <p className="mt-2 text-sm text-white/40">Use your assigned staff credentials. Default demo account: admin@restaurant.com / admin123.</p>
        <label className="mt-6 block">
          <span className="text-sm text-white/60">Email</span>
          <input className="input-field mt-2" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="name@company.com" />
        </label>
        <label className="mt-4 block">
          <span className="text-sm text-white/60">Password</span>
          <div className="relative mt-2">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
            <input className="input-field pl-11" value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" placeholder="Your password" />
          </div>
        </label>
        <Button className="mt-6 w-full" loading={loading}>Sign In</Button>
      </form>
    </section>
  );
}
