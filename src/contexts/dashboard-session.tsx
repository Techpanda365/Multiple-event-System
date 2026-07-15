"use client";

import { createContext, useContext } from "react";

export type DashboardUser = {
  id: string;
  name?: string | null;
  email?: string;
  role?: string;
  phone?: string | null;
  image?: string | null;
};

const DashboardSessionContext = createContext<DashboardUser | null>(null);

export function DashboardSessionProvider({
  user,
  children,
}: {
  user: DashboardUser;
  children: React.ReactNode;
}) {
  return (
    <DashboardSessionContext.Provider value={user}>
      {children}
    </DashboardSessionContext.Provider>
  );
}

export function useDashboardSession() {
  return useContext(DashboardSessionContext);
}
