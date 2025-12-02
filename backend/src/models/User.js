import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';

export class User {
  static async create(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        name: data.name || data.username,
        kelasId: data.kelasId
      }
    });
    return user;
  }

  static async findAll() {
    return await prisma.user.findMany();
  }

  static async findById(id) {
    return await prisma.user.findUnique({
      where: { id }
    });
  }

  static async findByUsername(username) {
    return await prisma.user.findUnique({
      where: { username }
    });
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
  }

  static async update(id, data) {
    return await prisma.user.update({
      where: { id },
      data
    });
  }

  static async delete(id) {
    try {
      await prisma.user.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  static sanitize(user) {
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export class ResetToken {
  static async create(userId, token) {
    return await prisma.resetToken.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + 3600000) // 1 hour
      }
    });
  }

  static async findByToken(token) {
    const resetToken = await prisma.resetToken.findUnique({
      where: { token }
    });
    
    if (!resetToken) return null;
    
    if (new Date() > resetToken.expiresAt) {
      await this.delete(resetToken.id);
      return null;
    }
    
    return resetToken;
  }

  static async delete(id) {
    try {
      await prisma.resetToken.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  static async deleteByUserId(userId) {
    await prisma.resetToken.deleteMany({
      where: { userId }
    });
  }
}
