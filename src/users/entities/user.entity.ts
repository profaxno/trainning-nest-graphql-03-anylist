import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Item } from '../../items/entities/item.entity';

@Entity({name: 'users'})
@ObjectType()
export class User {

  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  fullName: string;

  @Column({unique: true})
  @Field()
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'text',
    array: true,
    default: ['user']
  })
  @Field(() => [String], {defaultValue: ['user']})
  roles: string[];

  @Column({
    type: 'boolean',
    default: true
  })
  @Field(() => Boolean)
  isActive: boolean;

  @JoinColumn({name: 'lastUpdateBy'})
  @ManyToOne(
    () => User,
    (user) => user.lastUpdateBy,
    {nullable: true, lazy: true}
  )
  @Field(() => User, {nullable: true})
  lastUpdateBy?: User;

  @OneToMany(() => Item, (item) => item.user, {lazy: true})
  //@Field(() => [Item])
  items: Item[];

}
