"use client";

import "./login.css";
import { useEffect } from "react";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  onAuthStateChanged,
  getRedirectResult,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        await getRedirectResult(auth);
      } catch (error) {
        console.error("Redirect error:", error);
      }
    };

    handleRedirect();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      if (window.location.hostname === "localhost") {
        const result = await signInWithPopup(auth, provider);
        if (result.user) {
          router.replace("/");
        }
      } else {
        await signInWithRedirect(auth, provider);
      }
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-logo">
          <svg viewBox="0 0 24 24">
            <path d="M12 3L2 8l10 5 10-5-10-5z" />
            <path d="M2 8v6" />
            <path d="M6 10.5v4.5a6 6 0 0 0 12 0v-4.5" />
          </svg>
        </div>

        <p className="login-eyebrow">Attendance Tracker</p>
        <h1 className="login-title">Track every class.</h1>
        <p className="login-subtitle">
          Monitor attendance across subjects,
          <br />
          get safe-absence alerts before CATs.
        </p>

        <div className="login-divider" />

        <button className="login-google-btn" onClick={handleGoogleLogin}>
          <svg
            className="google-icon"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="login-google-btn-text">Continue with Google</span>
        </button>

        <div className="login-stats">
          <div className="login-stat">
            <span className="login-stat-val">75%</span>
            <span className="login-stat-label">min required</span>
          </div>
          <div className="login-stat">
            <span className="login-stat-val">CAT</span>
            <span className="login-stat-label">safe tracking</span>
          </div>
          <div className="login-stat">
            <span className="login-stat-val">OD</span>
            <span className="login-stat-label">od support</span>
          </div>
        </div>

        <p className="login-footer">
          By continuing you agree to the
          <br />
          <span>Terms of Service</span> & <span>Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
