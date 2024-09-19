import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({ where: { username } });
  }

  async createOrUpdate(email: string, username: string): Promise<User> {
    let user = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (user) {
      // Update existing user
      user.email = email;
      user.username = username;
    } else {
      // Create new user
      user = this.userRepository.create({ email, username });
    }

    return this.userRepository.save(user);
  }
}
