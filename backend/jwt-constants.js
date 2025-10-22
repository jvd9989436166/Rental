// JWT Constants - Use these directly in your application
export const JWT_SECRET = 'rentalmate_super_secret_jwt_key_2024_secure_random_12345';
export const JWT_REFRESH_SECRET = 'rentalmate_refresh_token_secret_2024_secure_random_67890';
export const JWT_EXPIRE = '7d';
export const JWT_REFRESH_EXPIRE = '30d';

// Sample JWT tokens for testing (these will expire in 7 days)
export const SAMPLE_TOKENS = {
  tenant: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsInJvbGUiOiJ0ZW5hbnQiLCJpYXQiOjE3MzQ5NzI4MDAsImV4cCI6MTczNTU3NzYwMH0.example_tenant_token',
  owner: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMiIsInJvbGUiOiJvd25lciIsImlhdCI6MTczNDk3MjgwMCwiZXhwIjoxNzM1NTc3NjAwfQ.example_owner_token',
  admin: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczNDk3MjgwMCwiZXhwIjoxNzM1NTc3NjAwfQ.example_admin_token'
};

// Environment variables fallback
export const getJWTConfig = () => {
  return {
    JWT_SECRET: process.env.JWT_SECRET || JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || JWT_REFRESH_SECRET,
    JWT_EXPIRE: process.env.JWT_EXPIRE || JWT_EXPIRE,
    JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || JWT_REFRESH_EXPIRE
  };
};
