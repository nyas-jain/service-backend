import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const postgresConfig = (): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: ['src/**/*.entity{.ts,.js}'],
    migrations: ['src/database/migrations/*{.ts,.js}'],
    subscribers: ['src/database/subscribers/*{.ts,.js}'],
    synchronize: process.env.NODE_ENV === 'development', // DISABLE in production!
    logging: process.env.DATABASE_LOGGING === 'true',
    dropSchema: false,
  };
};

export const mongodbConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/khao_db',
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
};
