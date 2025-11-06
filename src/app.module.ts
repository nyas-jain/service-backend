import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { postgresConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { User } from './database/entities/user.entity';
import { UserProfile } from './database/entities/user-profile.entity';
import { UserAddress } from './database/entities/user-address.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      ...postgresConfig(),
      entities: [User, UserProfile, UserAddress],
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
