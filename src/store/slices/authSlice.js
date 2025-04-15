import { createSlice } from "@reduxjs/toolkit";

// Safe way to load user data from localStorage
const getInitialUser = () => {
  try {
    const user = localStorage.getItem("userData");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Failed to parse userData:", error);
    return null;
  }
};

const initialState = {
  user: getInitialUser(),
  accessToken: localStorage.getItem("accessToken") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  loading: true, // we'll set it to false after rehydration in App
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken, refreshToken, id, role } = action.payload;
      console.log("🚀🚀🚀🚀🚀🚀🚀 ~ id, role:", action.payload);
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.user = { id, role };

      // persist in localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userData", JSON.stringify({ id, role }));
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userData");
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
