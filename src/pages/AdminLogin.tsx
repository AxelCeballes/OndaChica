import { useState } from "react";

export default function AdminLogin({
  onLogin,
  onBack,
}: {
  onLogin: () => void;
  onBack: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === "onda123") {
      setError(false);
      onLogin();
    } else {
      setError(true);
      setPassword("");
    }
  }

  return (
    <div className="min-h-full bg-[#111] flex flex-col items-center justify-center px-4">
      {/* Decorative bg shapes */}
      <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-[#E8143A] opacity-10 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-[#FFD600] opacity-10 translate-x-1/3 translate-y-1/3" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <img src="/logo.png" alt="Onda Chic" className="h-28 w-28 object-contain mx-auto mb-3" />
          <p className="font-fraunces font-black text-3xl leading-none text-[#FAF8F2]">
            ONDA <span className="text-[#E8143A]">CHIC</span>
          </p>
          <p className="font-outfit text-xs uppercase tracking-[0.3em] text-[#FFD600] mt-3">
            Panel de Administración
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#1a1a1a] border border-[#333] p-8"
        >
          <h2 className="font-fraunces font-bold text-xl text-[#FAF8F2] mb-6">Ingresar</h2>

          <div className="mb-4">
            <label className="block font-outfit text-xs uppercase tracking-widest text-[#999] mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="••••••••"
              className="w-full bg-[#111] border border-[#333] text-[#FAF8F2] font-outfit px-4 py-3 focus:outline-none focus:border-[#E8143A] transition-colors placeholder-[#555]"
              autoFocus
            />
            {error && (
              <p className="font-outfit text-xs text-[#E8143A] mt-2">
                Contraseña incorrecta. Intentá de nuevo.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#E8143A] text-white font-outfit font-black text-sm uppercase tracking-widest py-3.5 hover:bg-[#FFD600] hover:text-[#111] transition-colors duration-200 mt-2"
          >
            Entrar
          </button>
        </form>

        <p className="font-outfit text-xs text-[#555] text-center mt-3">
          Contraseña por defecto: <span className="text-[#999]">onda123</span>
        </p>

        <button
          onClick={onBack}
          className="w-full mt-6 font-outfit text-xs text-[#555] hover:text-[#999] transition-colors uppercase tracking-widest text-center"
        >
          ← Volver a la tienda
        </button>
      </div>
    </div>
  );
}
