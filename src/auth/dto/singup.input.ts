import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

@InputType()
export class SingupInput {

    @Field()
    @IsEmail()
    email: string;
    
    @Field()
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;
    
    @Field()
    @IsString()
    @IsNotEmpty()
    fullName: string;
}