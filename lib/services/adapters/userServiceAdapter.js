import { userApi } from '../api/userApi';
import { PrismaClient } from '@prisma/client';
import { BlobServiceClient } from '@azure/storage-blob';

const prisma = new PrismaClient();

/**
 * Adaptateur pour faire le pont entre l'ancienne API userService et la nouvelle userApi
 */
export const userService = {
  async initializeUser({ auth0Id, email, name, picture }) {
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { auth0Id },
      include: {
        organizations: {
          include: {
            organization: true
          }
        }
      }
    });

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING
    );

    if (!user) {
      // Generate unique container name
      const containerName = `user-${
        name ? name.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'user'
      }-${auth0Id.slice(-6)}`;
      
      const containerClient = blobServiceClient.getContainerClient(containerName);

      // Create container
      await containerClient.createIfNotExists({
        access: 'container'
      });

      // Create user
      user = await prisma.user.create({
        data: {
          auth0Id,
          email,
          name,
          azureContainer: containerName
        },
        include: {
          organizations: {
            include: {
              organization: true
            }
          }
        }
      });
    } else {
      // Verify Azure container exists
      if (user.azureContainer) {
        const containerClient = blobServiceClient.getContainerClient(user.azureContainer);
        const containerExists = await containerClient.exists();
        
        if (!containerExists) {
          await containerClient.createIfNotExists({
            access: 'container'
          });
        }
      }
    }

    return this.formatUser(user);
  },

  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organizations: {
          include: {
            organization: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return this.formatUser(user);
  },

  async getUserByAuth0Id(auth0Id) {
    const user = await prisma.user.findUnique({
      where: { auth0Id },
      include: {
        organizations: {
          include: {
            organization: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return this.formatUser(user);
  },

  async updateUser(userId, data) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      include: {
        organizations: {
          include: {
            organization: true
          }
        }
      }
    });

    return this.formatUser(user);
  },

  async deleteUser(userId) {
    // TODO: Delete Azure container
    await prisma.user.delete({
      where: { id: userId }
    });

    return { success: true };
  },

  async getUserStats(userId) {
    const stats = await prisma.userStatistics.findUnique({
      where: { userId }
    });

    if (!stats) {
      // Create default stats
      return await prisma.userStatistics.create({
        data: {
          userId,
          totalTrainings: 0,
          completedTrainings: 0,
          totalTime: 0,
          averageScore: 0
        }
      });
    }

    return stats;
  },

  async getUserCourses(userId, status = null) {
    const where = { userId };
    if (status) {
      where.status = status;
    }

    const courses = await prisma.userCourse.findMany({
      where,
      include: {
        course: true,
        modules: {
          include: {
            scenarios: true
          }
        }
      },
      orderBy: {
        enrollmentDate: 'desc'
      }
    });

    return courses;
  },

  formatUser(user) {
    return {
      id: user.id,
      auth0Id: user.auth0Id,
      email: user.email,
      name: user.name,
      azureContainer: user.azureContainer,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      organizations: user.organizations.map(membership => ({
        id: membership.organization.id,
        name: membership.organization.name,
        role: membership.role,
        azureContainer: membership.organization.azureContainer
      }))
    };
  }
};