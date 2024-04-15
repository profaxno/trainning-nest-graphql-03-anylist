import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

@InputType()
export class LoginInput {

    @Field()
    @IsEmail()
    email: string;
    
    @Field()
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;
    
}