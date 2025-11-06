import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { postgresConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { MenuModule } from './modules/menu/menu.module';
import { User } from './database/entities/user.entity';
import { UserProfile } from './database/entities/user-profile.entity';
import { UserAddress } from './database/entities/user-address.entity';
import { Restaurant } from './database/entities/restaurant.entity';
import { MenuItem } from './database/entities/menu-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      ...postgresConfig(),
      entities: [User, UserProfile, UserAddress, Restaurant, MenuItem],
    }),
    AuthModule,
    UsersModule,
    AddressesModule,
    RestaurantsModule,
    MenuModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
