import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserResponse, api } from "@/lib/api";
import { ReplenishmentItem, getReplenishmentProducts, filterRecentlySeenProducts } from "@/lib/replenishmentLogic";

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  login: (email: string, userData: UserResponse) => void;
  logout: () => void;
  replenishmentItems: ReplenishmentItem[];
  showReplenishmentNudge: boolean;
  setShowReplenishmentNudge: (show: boolean) => void;
  checkReplenishment: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [replenishmentItems, setReplenishmentItems] = useState<ReplenishmentItem[]>([]);
  const [showReplenishmentNudge, setShowReplenishmentNudge] = useState(false);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedEmail = localStorage.getItem("userEmail");
    const storedUser = localStorage.getItem("user");
    
    if (storedEmail && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("userEmail");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const checkReplenishment = async () => {
    const storedEmail = localStorage.getItem("userEmail");
    if (!storedEmail) return;

    try {
      // Fetch user's order history
      const orders = await api.getOrdersByEmail(storedEmail);
      
      // Get products needing replenishment
      const itemsToReplenish = getReplenishmentProducts(orders);
      
      // Filter out recently seen products
      const filteredItems = filterRecentlySeenProducts(itemsToReplenish);
      
      if (filteredItems.length > 0) {
        setReplenishmentItems(filteredItems);
        // Show nudge after a delay (let user settle in)
        setTimeout(() => {
          setShowReplenishmentNudge(true);
        }, 3000); // 3 seconds after login
      }
    } catch (error) {
      console.log("No orders found or error checking replenishment:", error);
    }
  };

  const login = (email: string, userData: UserResponse) => {
    localStorage.setItem("userEmail", email);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    
    // Check for replenishment after login
    setTimeout(() => {
      checkReplenishment();
    }, 500); // Small delay to ensure state is set
  };

  const logout = () => {
    setUser(null);
    setReplenishmentItems([]);
    setShowReplenishmentNudge(false);
    localStorage.removeItem("userEmail");
    localStorage.removeItem("user");
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    replenishmentItems,
    showReplenishmentNudge,
    setShowReplenishmentNudge,
    checkReplenishment,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
