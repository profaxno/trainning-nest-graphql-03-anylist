import { createParamDecorator, ExecutionContext, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { Context, GqlExecutionContext } from "@nestjs/graphql";
import { ValidRoles } from '../enums/valid-roles.enum';
import { User } from 'src/users/entities/user.entity';


export const CurrentUser = createParamDecorator(
    (validRoles: ValidRoles[] = [], context: ExecutionContext) => {
        const ctx = GqlExecutionContext.create(context);
        const user: User = ctx.getContext().req.user;

        if(!user) {
            throw new InternalServerErrorException('User not found (request) - make sure that we used the AuthGuard');
        }

        if(validRoles.length === 0) return user;

        for (const role of user.roles) {
            if(validRoles.includes(ValidRoles[role])) {
                return user;
            }    
        }

        
        throw new ForbiddenException(`User ${user.email} need a valid role [${validRoles}]`);
    }
)