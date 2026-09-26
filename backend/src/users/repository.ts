import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/orm/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export default class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  public async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
