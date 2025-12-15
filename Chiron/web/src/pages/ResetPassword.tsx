import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
        if (!auth) {
            throw new Error("Firebase Auth not initialized");
        }

        await sendPasswordResetEmail(auth, email);
        setMessage("Password reset email sent! Please check your email.");
        setTimeout(() => navigate("/login"), 3000);
    }   catch (err: any) {
        setError(err.message || "Failed to send email.");
    }   finally {
        setLoading(false);
    }
};



  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Reset Your Password
        </h2>
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
              placeholder="Enter your email"
            />
          </div>

          {message && (
            <p className="text-green-600 text-sm text-center">{message}</p>
          )}
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Email"}
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Remember your password?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}