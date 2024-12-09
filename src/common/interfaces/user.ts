import { User } from '@prisma/client';

export type UserData = {
  name: string;
  email: string;
  id: string;
  role: string;
  image: string | null;
};
export interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    email: string;
  };
}
