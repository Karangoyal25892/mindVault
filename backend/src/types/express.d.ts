import { JwtPayload } from 'jsonwebtoken';
import { AuthPayload } from './auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & AuthPayload;
    }
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
export { };

