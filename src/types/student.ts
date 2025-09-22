import type { ReactNode } from "react";


export interface StudentLayoutProps {
  children: ReactNode;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}
