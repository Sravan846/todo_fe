import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRefreshTokenMutation } from "../store/api/apiSlice";
import { setCredentials, setLoading, logout } from "../store/slices/authSlice";
import { jwtDecode } from 'jwt-decode';
import { toast } from "react-toastify";

export default function AppInitializer({ children }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  const [refreshToken] = useRefreshTokenMutation();
  useEffect(() => {
    const restoreSession = async () => {
      const storedAccessToken = localStorage.getItem("accessToken");
      const storedRefreshToken = localStorage.getItem("refreshToken");

      if (storedAccessToken && storedRefreshToken) {
        try {
          const decoded = jwtDecode(storedAccessToken);
          if (decoded.exp * 1000 > Date.now()) {
            dispatch(
              setCredentials({
                accessToken: storedAccessToken,
                refreshToken: storedRefreshToken,
              })
            );
          } else {
            const result = await refreshToken({
              refreshToken: storedRefreshToken,
            }).unwrap();
            dispatch(
              setCredentials({
                accessToken: result.accessToken,
                refreshToken: storedRefreshToken,
              })
            );
          }
        } catch (error) {
          toast.error("Session expired. Please log in again.");
          dispatch(logout());
        }
      }
      dispatch(setLoading(false));
    };

    restoreSession();
  }, [dispatch, refreshToken]);
  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return children;
}
