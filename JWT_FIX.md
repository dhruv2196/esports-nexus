# JWT Secret Key Fix

## Quick Fix

If you're getting the JWT secret key error when signing in, run:

```bash
docker-compose -f docker-compose.microservices.yml restart backend user-service payment-service
```

This will restart the services with the correct JWT secret that's already configured.

## Why This Happens

The HS512 algorithm requires a key of at least 512 bits (64 bytes). The previous JWT secret was too short.

## The Fix Applied

We've updated the JWT secret in `docker-compose.microservices.yml` to:
```
esportsNexusSecretKey2024VeryLongAndSecureKeyThatIsAtLeast512BitsLongForHS512AlgorithmRequirementThisNeedsToBeReallyLongToMeetTheRequirement
```

This secret is 152 characters long, which exceeds the 64-byte requirement.

## For Production

For production environments, you should:

1. Generate a secure random key:
   ```bash
   ./generate-jwt-secret.sh
   ```

2. Store it securely (e.g., in environment variables or a secrets manager)

3. Never commit the actual secret to version control

## Verification

After restarting the services, you can verify they're running:
```bash
docker-compose -f docker-compose.microservices.yml ps
```

Then try signing in again at http://localhost