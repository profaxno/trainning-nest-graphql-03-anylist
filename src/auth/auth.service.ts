import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { AuthResponse } from './types/auth-response.type';
import { UsersService } from '../users/users.service';
import { SingupInput, LoginInput } from './dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ){}

    async signup(singupInput: SingupInput): Promise<AuthResponse> {

        const user = await this.usersService.create(singupInput);

        const token = this.getJwtToken(user.id);
        
        return {
            user,
            token
        }
    }

    async login(loginInput: LoginInput): Promise<AuthResponse> {
        
        const {email, password} = loginInput;
        const user = await this.usersService.findOneByEmail(email);
        
        if(!bcrypt.compareSync(password, user.password)){
            throw new BadRequestException('Invalid credentials');
        }

        const token = this.getJwtToken(user.id);

        return {
            user,
            token
        }
    }

    async validateUser(id: string): Promise<User> {

        const user = await this.usersService.findOneById(id);

        if(!user.isActive) {
            throw new UnauthorizedException('User is inactive, talk with an admin');
        }
        
        delete user.password;

        return user;
    }

    revalidateToken(user: User): AuthResponse {

        const token = this.getJwtToken(user.id);

        return {
            user,
            token
        }
    }

    private getJwtToken(id: string) {
        return this.jwtService.sign({id});
    }

}
