
import { z } from 'zod';
export const loginSchema = z.object({
  email: z.string().email('Please input valid email'),
  password: z.string().min(1, 'Please input your password'),
});