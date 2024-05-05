import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemInput, UpdateItemInput } from './dto';
import { Item } from './entities/item.entity';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { PaginationArgs } from 'src/common/dto/pagination.args';
import { SearchArgs } from 'src/common/dto/search.args';

@Injectable()
export class ItemsService {

  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ){}

  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
    const newItem = this.itemsRepository.create({...createItemInput, user});
    await this.itemsRepository.save(newItem);
    return newItem;
  }

  async findAll(user: User, paginationArgs: PaginationArgs, searchArgs: SearchArgs): Promise<Item[]> {

    const {limit, page} = paginationArgs;
    const {search} = searchArgs;

    const queryBuilder = this.itemsRepository.createQueryBuilder()
      .skip((page -1) * limit)
      .take(limit)
      .where(`"userId" = :id`, {id: user.id})

    if(search){
      queryBuilder.andWhere('LOWER(name) like :name', {name: `%${search.toLocaleLowerCase()}%`})
    }

    return queryBuilder.getMany();

    // const items = await this.itemsRepository.find({
    //   skip: (page -1) * limit,
    //   take: limit,
    //   relations: ['user']
    //   ,where: {
    //     user: {id: user.id},
    //     name: Like(`%${search.toLocaleLowerCase()}%`)
    //   }
    // });

    // return items;
  }

  async findOne(id: string, user: User): Promise<Item>{
    const item = await this.itemsRepository.findOneBy({
      id,
      user: {id: user.id}
    });

    if(!item){
      throw new NotFoundException(`Item not found ${id}`);
    }

    return item;
  }

  async update(id: string, updateItemInput: UpdateItemInput, user: User): Promise<Item> {

    await this.findOne(id, user);

    const item = await this.itemsRepository.preload(updateItemInput);

    if(!item){
      throw new NotFoundException(`Item not found ${id}`);
    }

    return this.itemsRepository.save(item);
  }

  async remove(id: string, user: User): Promise<Item> {
    const item = await this.findOne(id, user);

    await this.itemsRepository.remove(item);

    return {...item, id};
  }

  async countItemsByUser(user: User): Promise<number>{
    return await this.itemsRepository.count({
      where: {
        user: {id: user.id}
      }
    });
  }

}
