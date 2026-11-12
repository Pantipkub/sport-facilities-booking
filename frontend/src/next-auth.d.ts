import type { Role } from "@/types";

declare module "next-auth" {
  interface Session {
    user: { id: string; name: string; email: string; role: Role; token: string };
  }
  // shape of `data` from POST /auth/login
  interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    token: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    token: string;
  }
}
