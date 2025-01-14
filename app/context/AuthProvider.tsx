import { useSegments, useRouter } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  name: string;
  id: string;
  token?: string;
};

type AuthType = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthType>({
  user: null,
  setUser: () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

function useProtectedRoute(user: User | null) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";
    if (!user && !inAuthGroup) {
      router.replace("/login");
    } else if (user && inAuthGroup) {
      if (user.name === "cadastrar") {
        router.replace("/cadastrar");
      } else {
        router.replace("/(tabs)/(feed)");
      }
    }
  }, [user, segments]);
}

export function AuthProvider({ children }: { children: JSX.Element }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  useProtectedRoute(user);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };

    loadUser();
  }, []);

  const saveUser = async (userData: Partial<User> | null) => {
    if (userData) {
      if (!userData.id) {
        console.error("User ID is missing");
        return;
      }

      const user: User = {
        name: userData.name || "",
        id: userData.id,
        token: userData.token,
      };

      await AsyncStorage.setItem("user", JSON.stringify(user));
      setUser(user);
    } else {
      await AsyncStorage.removeItem("user");
      setUser(null);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("user");
    setUser(null);
  };

  const authContext: AuthType = {
    user,
    setUser: saveUser,
    logout,
  };

  return <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>;
}
