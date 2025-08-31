import axios from "axios";
import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_bACKEND_URL || "http://localhost:5000";
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Add loading state

  // Set axios header when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const checkAuth = async () => {
    if (!token) {
      setIsCheckingAuth(false);
      return;
    }

    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      } else {
        // Token is invalid, clear it
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Clear invalid token
      localStorage.removeItem("token");
      setToken(null);
      setAuthUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message);
        connectSocket(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    toast.success("Logged out successfully");
  };

  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

const connectSocket = (userData) => {
  if (!userData || !userData._id) return;

  // Always disconnect existing socket first
  if (socket) {
    socket.disconnect();
    setSocket(null);
  }

  const newSocket = io(backendUrl, {
    query: { userId: userData._id },
    transports: ['websocket'],
    forceNew: true, // This ensures a fresh connection
  });

  setSocket(newSocket);

  newSocket.on("getOnlineUsers", (userIds) => {
    
    setOnlineUsers(userIds);
  });

  newSocket.on("disconnect", () => {
    
    // Don't clear online users immediately, let server handle it
  });

  newSocket.on("connect", () => {
   
  });

  newSocket.on("connect_error", (error) => {
   
  });
};

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
    isCheckingAuth, // Add this to show loading state
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};