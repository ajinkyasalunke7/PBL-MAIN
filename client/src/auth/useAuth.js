// Update client/src/auth/useAuth.js
import useSWR from "swr";
import { api } from "../lib/api";

const token = localStorage.getItem("token");
const fetcher = async (url) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");
  // alert("Token not found");

  try {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
    const response = await api.get("/utils/me");
    return response.data;
  } catch (error) {
    // Clear invalid token
    // localStorage.removeItem("token");
    throw error;
  }
};

export default function useAuth() {
  const { data, error, isLoading, mutate } = useSWR(
    localStorage.getItem("token") ? "/utils/me" : null,
    fetcher
  );

  return {
    user: data,
    isLoading,
    isError: error,
    mutateUser: mutate,
  };
}
