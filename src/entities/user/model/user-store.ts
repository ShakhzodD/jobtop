"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCurrentUser } from "../api/get-current-user";
import type { CurrentUser } from "./types";

type UserStore = {
  user: CurrentUser | null;
  status: "idle" | "loading" | "ready";
  loadUser: (force?: boolean) => Promise<CurrentUser | null>;
  setUser: (user: CurrentUser | null) => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      status: "idle",
      loadUser: async (force = false) => {
        if (!force && get().status === "ready") return get().user;
        if (get().status === "loading") return get().user;

        set({ status: "loading" });
        try {
          const user = await getCurrentUser();
          set({ user, status: "ready" });
          return user;
        } catch {
          set({ user: null, status: "ready" });
          return null;
        }
      },
      setUser: (user) => set({ user, status: "ready" }),
    }),
    {
      name: "jobtop-user",
      partialize: ({ user }) => ({ user }),
    },
  ),
);
