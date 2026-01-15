import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      salesId: number;
      role: string;
      department: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    salesId: number;
    role: string;
    department: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    salesId?: number;
    role?: string;
    department?: string;
  }
}
