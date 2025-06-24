# tRPC Usage Guide and Cron Job Documentation

## Using tRPC Endpoints

### 1. Getting a Secret by ID

The `secret.getById` endpoint requires an ID parameter. Here's how to use it correctly:

```typescript
// Example in a React component
import { trpc } from '@/app/_trpc/client';

// Wrong usage - this will cause an error
// trpc.secret.getById.useQuery(); // Error: id is required

// Correct usage with required id parameter
const { data, isLoading, error } = trpc.secret.getById.useQuery({
  id: "your-secret-id-here"
});

// With optional password parameter
const { data, isLoading, error } = trpc.secret.getById.useQuery({
  id: "your-secret-id-here",
  password: "optional-password-if-required"
});
```

### 2. Common tRPC Errors

- **ID Not Provided**: Make sure to always provide an `id` parameter when calling `getById`.
- **Invalid ID**: The provided ID must exist in the database.
- **Expired Secret**: If the secret has expired, you'll receive a 'FORBIDDEN' error.
- **Password Required**: If the secret requires a password and none is provided, the `requiresPassword` field will be `true` and the `text` field will be `null`.
- **Invalid Password**: If an incorrect password is provided, you'll receive an 'UNAUTHORIZED' error.
- **Already Viewed**: One-time secrets that have been viewed cannot be accessed again.

## Cron Job for Cleaning Expired Secrets

The application includes a cron job for automatically cleaning up expired secrets.

### How It Works

1. **Job Function**: `cleanupExpiredSecrets()` in `src/server/jobs/cleanupExpiredSecrets.ts` removes all secrets whose `expiresAt` date is in the past.

2. **API Endpoint**: `/api/cron/cleanup` can be called to trigger the cleanup job. This endpoint is protected by a secret token.

3. **Vercel Cron Integration**: The job is configured to run every hour using Vercel's Cron functionality (defined in `vercel.json`).

### Environment Configuration

Add the following to your `.env` file:

```
CRON_SECRET="your-random-secret-key-here"
```

### Manual Triggering

You can manually trigger the cleanup job using:

```bash
curl -X POST https://yourdomain.com/api/cron/cleanup \
  -H "Authorization: Bearer your-cron-secret-key-here"
```

### Alternative Cron Setup Options

1. **External Cron Service**:
   - Use services like EasyCron, Cronitor, or Upstash to call your API endpoint at regular intervals.

2. **Self-hosted**:
   - Configure a cron job on your own server:
   ```cron
   0 * * * * curl -X POST https://yourdomain.com/api/cron/cleanup -H "Authorization: Bearer your-cron-secret-key-here"
   ```

3. **Other Providers**:
   - Railway: Use a separate service with a scheduled task
   - AWS: Use CloudWatch Events/EventBridge with Lambda
   - GCP: Use Cloud Scheduler

## Troubleshooting

If you encounter issues with the cron job:

1. Check the logs in your hosting platform
2. Verify that the CRON_SECRET environment variable is correctly set
3. Ensure your database connection is working properly
4. Try manually triggering the job to see if it works correctly

For tRPC call issues:

1. Check that you're providing all required parameters
2. Inspect network requests for detailed error messages
3. Ensure your client is correctly set up with the tRPC provider
