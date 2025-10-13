import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User } from "@shared/schema";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user exists in localStorage
    const storedUser = localStorage.getItem("gardenCatalogUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoading(false);
    } else {
      // Create a demo user for the MVP
      fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Garden Enthusiast",
          email: `user-${Date.now()}@gardencatalog.app`,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const error = await res.text();
            throw new Error(`Failed to create user: ${error}`);
          }
          return res.json();
        })
        .then((newUser) => {
          setUser(newUser);
          localStorage.setItem("gardenCatalogUser", JSON.stringify(newUser));
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Failed to create user:", error);
          setIsLoading(false);
        });
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
