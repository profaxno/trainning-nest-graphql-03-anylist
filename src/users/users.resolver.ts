import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Int, ID, ResolveField, Parent } from '@nestjs/graphql';

import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UpdateUserInput } from './dto/update-user.input';
import { validRolesArgs } from './dto/roles.arg';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { ItemsService } from 'src/items/items.service';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly itemService: ItemsService
  ) {}

  @Query(() => [User], { name: 'users' })
  findAll(
    @Args() validRoles: validRolesArgs, 
    @CurrentUser([ValidRoles.admin]) currentUser
  ): Promise<User[]>{
    console.log({currentUser});
    return this.usersService.findAll(validRoles.roles);
  }

  @Query(() => User, { name: 'user' })
  findOne(
    @Args('id', {type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser([ValidRoles.admin]) currentUser  
  ): Promise<User> {
    console.log({currentUser});
    return this.usersService.findOneById(id);
  }

  @Mutation(() => User, { name: 'updateUser' })
  updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser([ValidRoles.admin]) currentUser
  ): Promise<User> {
    return this.usersService.update(updateUserInput.id, updateUserInput, currentUser);
  }

  @Mutation(() => User)
  blockUser(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser([ValidRoles.admin]) currentUser  
  ): Promise<User> {
    return this.usersService.block(id, currentUser);
  }

  @ResolveField(() => Int, { name: 'itemsCount' })
  async count(
    @CurrentUser([ValidRoles.admin]) currentUser,
    @Parent() user: User,
  ): Promise<number> {
    return this.itemService.countItemsByUser(user);
  }

}
