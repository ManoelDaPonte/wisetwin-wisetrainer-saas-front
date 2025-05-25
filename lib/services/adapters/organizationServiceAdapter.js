import { organizationApi } from '../api/organizationApi';
import { PrismaClient } from '@prisma/client';
import { BlobServiceClient } from '@azure/storage-blob';
import { ValidationError } from '../../middleware/errorHandler';

const prisma = new PrismaClient();

/**
 * Adaptateur pour faire le pont entre l'ancienne API organizationService et la nouvelle organizationApi
 */
export const organizationService = {
  async createOrganization(ownerId, { name, description, azureContainer }) {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: ownerId }
    });

    if (!user) {
      throw new ValidationError('User not found');
    }

    // Create Azure container if needed
    if (azureContainer) {
      const blobServiceClient = BlobServiceClient.fromConnectionString(
        process.env.AZURE_STORAGE_CONNECTION_STRING
      );
      const containerClient = blobServiceClient.getContainerClient(azureContainer);
      
      await containerClient.createIfNotExists({
        access: 'container'
      });
    }

    // Create organization with owner
    const organization = await prisma.organization.create({
      data: {
        name,
        description,
        azureContainer,
        members: {
          create: {
            userId: ownerId,
            role: 'OWNER'
          }
        }
      },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });

    return this.formatOrganization(organization);
  },

  async getOrganization(orgId) {
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        members: {
          include: {
            user: true
          }
        },
        tags: true
      }
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    return this.formatOrganization(organization);
  },

  async updateOrganization(orgId, data) {
    const organization = await prisma.organization.update({
      where: { id: orgId },
      data,
      include: {
        members: {
          include: {
            user: true
          }
        },
        tags: true
      }
    });

    return this.formatOrganization(organization);
  },

  async deleteOrganization(orgId) {
    // TODO: Delete Azure container
    await prisma.organization.delete({
      where: { id: orgId }
    });

    return { success: true };
  },

  async getUserOrganizations(userId) {
    const memberships = await prisma.organizationMember.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            members: true,
            tags: true
          }
        }
      }
    });

    return memberships.map(m => ({
      ...this.formatOrganization(m.organization),
      role: m.role
    }));
  },

  async addMember(orgId, email, role = 'MEMBER') {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new ValidationError('User not found with this email');
    }

    // Check if already member
    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: user.id
        }
      }
    });

    if (existingMember) {
      throw new ValidationError('User is already a member');
    }

    // Add member
    const member = await prisma.organizationMember.create({
      data: {
        organizationId: orgId,
        userId: user.id,
        role
      },
      include: {
        user: true
      }
    });

    return this.formatMember(member);
  },

  async updateMember(orgId, memberId, { role }) {
    const member = await prisma.organizationMember.update({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: memberId
        }
      },
      data: { role },
      include: {
        user: true
      }
    });

    return this.formatMember(member);
  },

  async removeMember(orgId, memberId) {
    // Check if last owner
    const owners = await prisma.organizationMember.count({
      where: {
        organizationId: orgId,
        role: 'OWNER'
      }
    });

    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: memberId
        }
      }
    });

    if (owners === 1 && member?.role === 'OWNER') {
      throw new ValidationError('Cannot remove the last owner');
    }

    await prisma.organizationMember.delete({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: memberId
        }
      }
    });

    return { success: true };
  },

  async createInvitation(orgId, { email, role = 'MEMBER', invitedBy }) {
    const invitation = await prisma.organizationInvitation.create({
      data: {
        organizationId: orgId,
        email,
        role,
        invitedBy,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    // TODO: Send email invitation

    return invitation;
  },

  async getInvitations(orgId) {
    const invitations = await prisma.organizationInvitation.findMany({
      where: { organizationId: orgId },
      include: {
        inviter: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return invitations;
  },

  formatOrganization(org) {
    return {
      id: org.id,
      name: org.name,
      description: org.description,
      azureContainer: org.azureContainer,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
      membersCount: org.members?.length || 0,
      tagsCount: org.tags?.length || 0
    };
  },

  formatMember(member) {
    return {
      id: member.user.id,
      email: member.user.email,
      name: member.user.name,
      role: member.role,
      joinedAt: member.createdAt
    };
  }
};