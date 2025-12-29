import logoImg from "@/assets/img/Backpocket-Logo-128.png";
import { SaveForm } from "../../components/SaveForm";
import {
  AuthenticatedView,
  AuthProvider,
  isMockAuth,
  SignInButton,
  UnauthenticatedView,
  UserButton,
} from "../../lib/auth";
import "./App.css";

function SignedOutView() {
  return (
    <div className="auth-prompt">
      <div className="logo-container">
        <img src={logoImg} alt="Backpocket" className="logo" />
        <h1>Backpocket</h1>
      </div>
      <p>Sign in to save links</p>
      <SignInButton mode="modal">
        <button type="button" className="sign-in-button">
          Sign In
        </button>
      </SignInButton>
    </div>
  );
}

function SignedInView() {
  return (
    <div className="main-view">
      <header className="header">
        <div className="header-left">
          <img src={logoImg} alt="Backpocket" className="header-logo" />
          <h1>Backpocket</h1>
        </div>
        {isMockAuth ? (
          <div className="mock-user-badge" title="Mock auth mode">
            🧪
          </div>
        ) : (
          <UserButton />
        )}
      </header>
      <SaveForm />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="popup">
        <UnauthenticatedView>
          <SignedOutView />
        </UnauthenticatedView>
        <AuthenticatedView>
          <SignedInView />
        </AuthenticatedView>
      </div>
    </AuthProvider>
  );
}
