const Joi = require('joi');
const path = require('path');
const dotenv = require('dotenv');

// Load .env from repo root as fallback for local dev
dotenv.config();

// Normalize CLIENT_URL: allow hostnames without scheme (e.g. project-94-two.vercel.app)
if (process.env.CLIENT_URL && !/^https?:\/\//i.test(process.env.CLIENT_URL)) {
  const scheme = process.env.NODE_ENV === 'production' ? 'https://' : 'http://';
  process.env.CLIENT_URL = `${scheme}${process.env.CLIENT_URL}`;
}

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development','production','test').default('development'),
  PORT: Joi.number().default(5000),
  MONGODB_URI: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  CLIENT_URL: Joi.string().uri().empty('').default('http://localhost:5173'),
  CLOUDINARY_CLOUD_NAME: Joi.string().allow('').optional(),
  CLOUDINARY_API_KEY: Joi.string().allow('').optional(),
  CLOUDINARY_API_SECRET: Joi.string().allow('').optional()
}).unknown();

const { value: env, error } = schema.validate(process.env, { abortEarly: false });
if (error) {
  console.error('❌ Environment validation error:');
  error.details.forEach(d => console.error(` - ${d.message}`));
  // Fail fast in production or development to avoid unpredictable behavior
  throw new Error('Environment validation failed');
}

module.exports = {
  NODE_ENV: env.NODE_ENV,
  PORT: env.PORT,
  MONGODB_URI: env.MONGODB_URI,
  JWT_SECRET: env.JWT_SECRET,
  CLIENT_URL: env.CLIENT_URL,
  CLOUDINARY: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET
  }
};
