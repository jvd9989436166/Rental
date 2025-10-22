// Quick JWT Token Generator - Run this to get a working token
import jwt from 'jsonwebtoken';

// Use this secret directly in your code
const SECRET = 'rentalmate_quick_jwt_secret_2024_immediate_use';

// Generate a token for testing
const generateToken = (userId, role = 'tenant') => {
  return jwt.sign(
    { 
      id: userId, 
      role: role,
      iat: Math.floor(Date.now() / 1000)
    },
    SECRET,
    { expiresIn: '7d' }
  );
};

// Generate tokens for different users
const tokens = {
  tenant: generateToken('507f1f77bcf86cd799439011', 'tenant'),
  owner: generateToken('507f1f77bcf86cd799439012', 'owner'),
  admin: generateToken('507f1f77bcf86cd799439013', 'admin')
};

console.log('🚀 Quick JWT Tokens Generated:');
console.log('='.repeat(60));
console.log('SECRET:', SECRET);
console.log('='.repeat(60));
console.log('TENANT TOKEN:');
console.log(tokens.tenant);
console.log('='.repeat(60));
console.log('OWNER TOKEN:');
console.log(tokens.owner);
console.log('='.repeat(60));
console.log('ADMIN TOKEN:');
console.log(tokens.admin);
console.log('='.repeat(60));

// Verify the tokens work
console.log('\n✅ Token Verification:');
try {
  const decoded = jwt.verify(tokens.tenant, SECRET);
  console.log('✅ Tenant token is valid:', decoded);
} catch (error) {
  console.log('❌ Token verification failed:', error.message);
}

console.log('\n📋 Add this to your .env file:');
console.log(`JWT_SECRET=${SECRET}`);
console.log('JWT_EXPIRE=7d');

export { SECRET, generateToken, tokens };
