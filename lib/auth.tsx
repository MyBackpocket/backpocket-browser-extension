import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth as useClerkAuth,
} from "@clerk/chrome-extension";
import { createContext, type ReactNode, useContext } from "react";

const MOCK_AUTH_MODE = import.meta.env.VITE_BACKPOCKET_AUTH_MODE === "mock";
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

/**
 * Mock auth context for development without Clerk
 */
interface MockAuthContextValue {
  getToken: () => Promise<string>;
  isSignedIn: boolean;
  userId: string;
}

const MockAuthContext = createContext<MockAuthContextValue | null>(null);

function MockAuthProvider({ children }: { children: ReactNode }) {
  const value: MockAuthContextValue = {
    getToken: async () => "mock-token",
    isSignedIn: true,
    userId: "mock-user-dev",
  };

  return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>;
}

/**
 * Unified auth hook that works with both Clerk and mock mode
 */
export function useAuth() {
  const mockContext = useContext(MockAuthContext);

  // In mock mode, use the mock context
  if (MOCK_AUTH_MODE) {
    if (!mockContext) {
      throw new Error("useAuth must be used within AuthProvider");
    }
    return mockContext;
  }

  // Otherwise use Clerk's useAuth
  // biome-ignore lint/correctness/useHookAtTopLevel: MOCK_AUTH_MODE is a compile-time constant, so hook order is deterministic
  return useClerkAuth();
}

/**
 * Unified auth provider that uses Clerk or mock mode based on env
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  if (MOCK_AUTH_MODE) {
    console.log("[Backpocket] Running in mock auth mode");
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }

  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="error-view">
        <p>Missing Clerk publishable key.</p>
        <p>
          <small>Check your .env file or use VITE_BACKPOCKET_AUTH_MODE=mock</small>
        </p>
      </div>
    );
  }

  return <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>{children}</ClerkProvider>;
}

/**
 * Show children only when signed in (or always in mock mode)
 */
export function AuthenticatedView({ children }: { children: ReactNode }) {
  if (MOCK_AUTH_MODE) {
    return <>{children}</>;
  }

  return <SignedIn>{children}</SignedIn>;
}

/**
 * Show children only when signed out (never in mock mode)
 */
export function UnauthenticatedView({ children }: { children: ReactNode }) {
  if (MOCK_AUTH_MODE) {
    return null;
  }

  return <SignedOut>{children}</SignedOut>;
}

/**
 * Re-export Clerk components for use in non-mock mode
 */
export { SignInButton, UserButton };

/**
 * Check if we're in mock auth mode
 */
export const isMockAuth = MOCK_AUTH_MODE;
