import { Mutation, Resolver } from '@nestjs/graphql';
import { SeedService } from './seed.service';

@Resolver()
export class SeedResolver {
  constructor(private readonly seedService: SeedService) {}

  @Mutation( () => Boolean, {name: "exceuteSeed", description: "seed bd"})
  async excecuteSeed(): Promise<boolean> {
    return this.seedService.excecuteSeed();
  }
}
