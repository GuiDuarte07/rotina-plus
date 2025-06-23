import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Middleware executado após a verificação de autenticação
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Sempre permitir acesso às rotas de autenticação
        if (pathname === "/login" || pathname === "/register") {
          return true;
        }

        // Para outras rotas, verificar se há token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
