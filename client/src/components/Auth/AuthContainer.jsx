import { useState } from "react";
import { AuthLayout } from "./AuthLayout.jsx";
import { ForgotPasswordView } from "./ForgotPasswordView.jsx";
import { LoginView } from "./LoginView.jsx";
import { ResetPasswordView } from "./ResetPasswordView.jsx";
import { SignUpView } from "./SignUpView.jsx";

export function AuthContainer({ onLogin }) {
  const [activeScreen, setActiveScreen] = useState("login");

  return (
    <AuthLayout activeScreen={activeScreen} onNavigate={setActiveScreen}>
      {activeScreen === "login" && (
        <LoginView onLogin={onLogin} onNavigate={setActiveScreen} />
      )}
      {activeScreen === "signup" && (
        <SignUpView onNavigate={setActiveScreen} />
      )}
      {activeScreen === "forgot-password" && (
        <ForgotPasswordView onNavigate={setActiveScreen} />
      )}
      {activeScreen === "reset-password" && (
        <ResetPasswordView onNavigate={setActiveScreen} />
      )}
    </AuthLayout>
  );
}
