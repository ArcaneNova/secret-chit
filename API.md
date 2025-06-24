# SecretChit API Documentation

SecretChit uses tRPC for type-safe API calls between the frontend and backend. This document outlines the available API endpoints and their usage.

## Authentication

Authentication is handled via NextAuth.js. The application provides Google, GitHub, and Email authentication providers.

### Session Management

Sessions are JWT-based and contain the user ID. Session data is accessible in tRPC procedures via the context.

## tRPC Endpoints

### Secret Router

#### `secret.create`

Creates a new secret.

**Input:**
```typescript
{
  text: string;            // Required: The secret content
  expiresIn: number;       // Required: Expiration time in minutes
  oneTime: boolean;        // Required: Whether the secret should be deleted after viewing
  password?: string;       // Optional: Password to protect the secret
}
```

**Output:**
```typescript
{
  id: string;              // The secret's unique ID
  expiresAt: Date;         // When the secret will expire
  url: string;             // The full URL to access the secret
}
```

**Security:**
- Rate limited
- Encrypts the secret text before storage
- Hashes the password if provided

#### `secret.getById`

Retrieves a secret by its ID.

**Input:**
```typescript
{
  id: string;              // Required: The secret's ID
  password?: string;       // Optional: The password if the secret is protected
}
```

**Output:**
```typescript
{
  text: string;            // The decrypted secret content
  expiresAt: Date;         // When the secret will expire
  oneTime: boolean;        // Whether this is a one-time secret
  requiresPassword: boolean; // Whether the secret requires a password
}
```

**Security:**
- Rate limited
- Verifies password if required
- Deletes the secret after viewing if it's a one-time secret
- Returns error if expired or already viewed (for one-time secrets)

#### `secret.getMySecrets`

Lists secrets created by the authenticated user.

**Input:**
```typescript
{
  search?: string;         // Optional: Search term to filter secrets
}
```

**Output:**
```typescript
Array<{
  id: string;              // The secret's ID
  createdAt: Date;         // When the secret was created
  expiresAt: Date;         // When the secret will expire
  status: 'active' | 'viewed' | 'expired'; // Status of the secret
  oneTime: boolean;        // Whether it's a one-time secret
  hasPassword: boolean;    // Whether it's password protected
}>
```

**Security:**
- Requires authentication
- Only returns secrets created by the requesting user

#### `secret.delete`

Deletes a secret.

**Input:**
```typescript
{
  id: string;              // Required: The ID of the secret to delete
}
```

**Output:**
```typescript
{
  success: boolean;        // Whether the deletion was successful
}
```

**Security:**
- Requires authentication
- Verifies the user owns the secret before deletion

## Error Handling

All API endpoints return typed errors that include:

- `UNAUTHORIZED`: User is not authenticated
- `FORBIDDEN`: User doesn't have permission for the action
- `NOT_FOUND`: Resource doesn't exist
- `EXPIRED`: Secret has expired
- `UNAUTHORIZED_ACCESS`: Password required or incorrect
- `ALREADY_VIEWED`: One-time secret has been viewed
- `TOO_MANY_REQUESTS`: Rate limit exceeded

## Rate Limiting

Rate limiting is implemented on sensitive endpoints to prevent abuse:

- Creating secrets: 10 requests per 5 minutes
- Accessing secrets: 20 requests per 5 minutes

## Data Security

- Secrets are encrypted with AES-256-GCM before storage
- Passwords are hashed with bcrypt
- All API calls require CSRF protection
- Database connection is TLS encrypted

## Client Usage Example

```typescript
// Example of creating a secret
const { data } = await trpc.secret.create.mutate({
  text: "My sensitive information",
  expiresIn: 60, // 1 hour
  oneTime: true,
  password: "optional-password"
});

// Example of retrieving a secret
const { data } = await trpc.secret.getById.query({
  id: "secret-id",
  password: "if-required"
});
```
