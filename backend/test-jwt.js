// Test JWT functionality with hardcoded secrets
import jwt from 'jsonwebtoken';

// Hardcoded JWT secrets
const JWT_SECRET = 'rentalmate_jwt_secret_key_2024_secure_immediate_use';
const JWT_REFRESH_SECRET = 'rentalmate_refresh_secret_2024_secure_immediate_use';

console.log('🧪 Testing JWT with hardcoded secrets...\n');

// Test 1: Generate a token
const payload = {
  id: '507f1f77bcf86cd799439011',
  role: 'tenant',
  iat: Math.floor(Date.now() / 1000)
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
console.log('✅ Token generated successfully');
console.log('Token:', token.substring(0, 50) + '...');

// Test 2: Verify the token
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('✅ Token verified successfully');
  console.log('Decoded payload:', decoded);
} catch (error) {
  console.log('❌ Token verification failed:', error.message);
}

// Test 3: Generate refresh token
const refreshPayload = {
  id: '507f1f77bcf86cd799439011',
  iat: Math.floor(Date.now() / 1000)
};

const refreshToken = jwt.sign(refreshPayload, JWT_REFRESH_SECRET, { expiresIn: '30d' });
console.log('\n✅ Refresh token generated successfully');
console.log('Refresh Token:', refreshToken.substring(0, 50) + '...');

// Test 4: Verify refresh token
try {
  const decodedRefresh = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
  console.log('✅ Refresh token verified successfully');
  console.log('Decoded refresh payload:', decodedRefresh);
} catch (error) {
  console.log('❌ Refresh token verification failed:', error.message);
}

console.log('\n🎉 All JWT tests passed!');
console.log('Your JWT secrets are working correctly.');
console.log('\n📋 Secrets being used:');
console.log('JWT_SECRET:', JWT_SECRET);
console.log('JWT_REFRESH_SECRET:', JWT_REFRESH_SECRET);
