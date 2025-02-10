import { useSegments, useRouter } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  name: string;
  id: string;
  token?: string;
  latitude?: number;
  longitude?: number;
};

type AuthType = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  setLocation: (latitude: number, longitude: number) => Promise<void>;
  getLocation: () => Promise<{ latitude: number, longitude: number } | null>;
};

const AuthContext = createContext<AuthType>({
  user: null,
  setUser: () => {},
  logout: async () => {},
  setLocation: async () => {},
  getLocation: async () => null,
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
        latitude: userData.latitude,
        longitude: userData.longitude,
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

  const setLocation = async (latitude: number, longitude: number) => {
    if (user) {
      const updatedUser = { ...user, latitude, longitude };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const getLocation = async () => {
    return user ? { latitude: user.latitude ?? 0, longitude: user.longitude ?? 0 } : null;
  };

  const authContext: AuthType = {
    user,
    setUser: saveUser,
    logout,
    setLocation,
    getLocation,
  };

  return <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>;
}
