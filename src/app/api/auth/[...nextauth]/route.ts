import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// NextAuth.js handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };