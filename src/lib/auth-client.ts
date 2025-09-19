import { bearer } from "better-auth/plugins";
import { createAuthClient } from "better-auth/react"; // make sure to import from better-auth/react

export const { signIn, signUp, useSession } = createAuthClient({
  plugins: [bearer()],
});
