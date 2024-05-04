import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { SEED_USERS, SEED_ITEMS } from './data/seed-data';
import { ItemsService } from 'src/items/items.service';

@Injectable()
export class SeedService {

    private isProd: boolean;

    constructor(
        private readonly configService: ConfigService,

        @InjectRepository(Item)
        private readonly itemRepository: Repository<Item>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly usersService: UsersService,

        private readonly itemService: ItemsService
    ){
        this.isProd = configService.get('ENV') === 'prod'
    }

    async excecuteSeed(): Promise<boolean> {
        if(this.isProd){
            throw new ForbiddenException('cannot run seed in prod');
        }

        await this.itemRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();

        await this.userRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();

        let users = [];

        for (const user of SEED_USERS) {
            users.push(await this.usersService.create(user));
        }

        let user: User = users[0];

        for (const item of SEED_ITEMS) {
            await this.itemService.create(item, user)
        }

        return true;
    }

    
}
