
// Manually defining User to match Prisma schema since generated client is hard to reach/import
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export { }; // Make this a module
