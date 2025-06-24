import { router } from '../index';
import { secretRouter } from './secret';

export const appRouter = router({
  secret: secretRouter,
});

// Export type definitions
export type AppRouter = typeof appRouter;
