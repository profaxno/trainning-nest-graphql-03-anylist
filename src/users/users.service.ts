import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';

import { SingupInput } from 'src/auth/dto/singup.input';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateItemInput } from '../items/dto/update-item.input';

@Injectable()
export class UsersService {

  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(singupInput: SingupInput): Promise<User> {
    try{
      const newUser = await this.userRepository.create({
        ...singupInput,
        password: bcrypt.hashSync(singupInput.password, 10)
      });

      await this.userRepository.save(newUser);
      
      return newUser;

    }catch(error){
      
      if(error.code === '23505'){
        throw new BadRequestException(`User already exists ${error.detail}`);
      }

      this.logger.error(error);

      throw new InternalServerErrorException(error);
    }
  }

  async findAll(validRoles: ValidRoles[]): Promise<User[]>{

    if(validRoles.length === 0) 
      return await this.userRepository.find({
        //! TIPS: No es necesario xq tenemos lazy: true en el entity
        // relations: {
        //   lastUpdateBy: true
        // }
      });

    return this.userRepository.createQueryBuilder()
      .andWhere('ARRAY[roles] && ARRAY[:...roles]')
      .setParameter('roles', validRoles)
      .getMany();
  }

  async findOne(id: string): Promise<User> {


    throw new Error('Method not implemented.');
  }

  async findOneByEmail(email: string): Promise<User> {
    
    const user = await this.userRepository.findOneBy({email});
    
    if(!user) throw new NotFoundException(`User not found ${email}`);
    
    return user;
  }

  async findOneById(id: string): Promise<User> {
    
    const user = await this.userRepository.findOneBy({id});
    
    if(!user) throw new NotFoundException(`User not found ${id}`);
    
    return user;
  }

  async update(id: string, updateUserInput: UpdateUserInput, currentUser: User): Promise<User> {

    try{
      let updateUser = await this.userRepository.preload({
        id,
        ...updateUserInput
      })
   
      updateUser.lastUpdateBy = currentUser
      updateUser.password = updateUserInput.password ? bcrypt.hashSync(updateUserInput.password, 10) : updateUser.password,

      await this.userRepository.save(updateUser);

      return updateUser;
    
    }catch(error){
      if(error.code === '23505'){
        throw new BadRequestException(`User already exists ${error.detail}`);
      }

      this.logger.error(error);

      throw new InternalServerErrorException(error);
    }

  }
  
  /* 
  async update(id: string, updateUserInput: UpdateUserInput, currentUser: User): Promise<User> {

    try{
      const user = await this.findOneById(id);

      const userdb = await this.userRepository.preload({
        ...user,
        email: updateUserInput.email ? updateUserInput.email : user.email,
        password: updateUserInput.password ? bcrypt.hashSync(updateUserInput.password, 10) : user.password,
        fullName: updateUserInput.fullName ? updateUserInput.fullName : user.fullName,
        roles: updateUserInput.roles ? updateUserInput.roles : user.roles,
        isActive: updateUserInput.isActive != undefined ? updateUserInput.isActive : user.isActive,
        lastUpdateBy: currentUser
      })
   
      await this.userRepository.save(userdb);

      return userdb;
    
    }catch(error){
      if(error.code === '23505'){
        throw new BadRequestException(`User already exists ${error.detail}`);
      }

      this.logger.error(error);

      throw new InternalServerErrorException(error);
    }

  }
  */

  async block(id: string, currentUser: User): Promise<User> {

    const user = await this.findOneById(id);
    user.lastUpdateBy = currentUser;
    user.isActive = false;

    await this.userRepository.save(user);

    return user;
  }
}
