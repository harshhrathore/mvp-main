// Load environment variables before any other imports
const path = require('path');
const envPath =
  process.env.NODE_ENV === 'production' ? '.env' : path.resolve(__dirname, '../../.env');
require('dotenv').config({ path: envPath });
