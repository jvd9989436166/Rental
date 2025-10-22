// Generate a random JWT secret and token
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Generate a random JWT secret
const generateRandomSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Generate a random JWT secret
const JWT_SECRET = generateRandomSecret();
const JWT_REFRESH_SECRET = generateRandomSecret();

console.log('🔐 Generated JWT Secrets:');
console.log('='.repeat(50));
console.log(`JWT_SECRET=${JWT_SECRET}`);
console.log(`JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}`);
console.log('='.repeat(50));

// Generate a sample JWT token
const generateSampleToken = () => {
  const payload = {
    id: '507f1f77bcf86cd799439011', // Sample user ID
    role: 'tenant',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  };

  return jwt.sign(payload, JWT_SECRET);
};

// Generate sample tokens for different user types
const generateTokens = () => {
  const tenantPayload = {
    id: '507f1f77bcf86cd799439011',
    role: 'tenant',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
  };

  const ownerPayload = {
    id: '507f1f77bcf86cd799439012',
    role: 'owner',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
  };

  const adminPayload = {
    id: '507f1f77bcf86cd799439013',
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
  };

  return {
    tenant: jwt.sign(tenantPayload, JWT_SECRET),
    owner: jwt.sign(ownerPayload, JWT_SECRET),
    admin: jwt.sign(adminPayload, JWT_SECRET)
  };
};

// Generate tokens
const tokens = generateTokens();

console.log('\n🎫 Sample JWT Tokens:');
console.log('='.repeat(50));
console.log('Tenant Token:');
console.log(tokens.tenant);
console.log('\nOwner Token:');
console.log(tokens.owner);
console.log('\nAdmin Token:');
console.log(tokens.admin);
console.log('='.repeat(50));

// Verify tokens
console.log('\n✅ Token Verification:');
console.log('='.repeat(50));

try {
  const decodedTenant = jwt.verify(tokens.tenant, JWT_SECRET);
  console.log('Tenant Token Valid:', decodedTenant);
} catch (error) {
  console.log('Tenant Token Invalid:', error.message);
}

try {
  const decodedOwner = jwt.verify(tokens.owner, JWT_SECRET);
  console.log('Owner Token Valid:', decodedOwner);
} catch (error) {
  console.log('Owner Token Invalid:', error.message);
}

try {
  const decodedAdmin = jwt.verify(tokens.admin, JWT_SECRET);
  console.log('Admin Token Valid:', decodedAdmin);
} catch (error) {
  console.log('Admin Token Invalid:', error.message);
}

console.log('\n📝 Add these to your .env file:');
console.log('='.repeat(50));
console.log(`JWT_SECRET=${JWT_SECRET}`);
console.log(`JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}`);
console.log('JWT_EXPIRE=7d');
console.log('JWT_REFRESH_EXPIRE=30d');

export { JWT_SECRET, JWT_REFRESH_SECRET, generateSampleToken, generateTokens };
