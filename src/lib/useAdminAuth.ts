import { useState, useEffect } from "react";
import { api } from "@/lib/axios";

interface AdminRole {
  id: string;
  name: string;
  departmentScope: string | null;
}

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
}

interface AdminAuth {
  user: AdminUser | null;
  roles: AdminRole[];
  permissions: string[];
  loading: boolean;
  authorized: boolean;
  error: string | null;
}

export const useAdminAuth = (): AdminAuth => {
  const [state, setState] = useState<AdminAuth>({
    user: null,
    roles: [],
    permissions: [],
    loading: true,
    authorized: false,
    error: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setState((s) => ({ ...s, loading: false, error: "Not authenticated" }));
      return;
    }

    const fetchAdminProfile = async () => {
      try {
        const res = await api.get("/api/v1/admin/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setState({
          user: res.data.user,
          roles: res.data.roles,
          permissions: res.data.permissions,
          loading: false,
          authorized: true,
          error: null,
        });
      } catch (err: any) {
        const status = err?.response?.status;
        setState({
          user: null,
          roles: [],
          permissions: [],
          loading: false,
          authorized: false,
          error: status === 403 ? "No admin access" : status === 401 ? "Not authenticated" : "Failed to verify",
        });
      }
    };

    fetchAdminProfile();
  }, []);

  return state;
};

export const hasPermission = (permissions: string[], required: string): boolean => {
  return permissions.includes(required);
};

export const hasAnyPermission = (permissions: string[], required: string[]): boolean => {
  return required.some((p) => permissions.includes(p));
};