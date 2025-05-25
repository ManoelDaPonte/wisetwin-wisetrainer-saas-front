import { courseApi } from '../api/courseApi';
import { PrismaClient } from '@prisma/client';
import { ValidationError } from '../../middleware/errorHandler';

const prisma = new PrismaClient();

/**
 * Adaptateur pour faire le pont entre l'ancienne API courseService et la nouvelle courseApi
 */
export const courseService = {
  async getAllCourses({ type, organizationId, status }) {
    const where = {};
    
    if (type) where.type = type;
    if (organizationId) where.organizationId = organizationId;
    if (status) where.status = status;
    
    const courses = await prisma.course.findMany({
      where,
      include: {
        organization: true,
        _count: {
          select: {
            users: true,
            modules: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return courses.map(this.formatCourse);
  },

  async getCourseById(courseId) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        organization: true,
        modules: {
          include: {
            scenarios: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      }
    });
    
    if (!course) {
      throw new Error('Course not found');
    }
    
    return this.formatCourse(course);
  },

  async createCourse(data) {
    const course = await prisma.course.create({
      data,
      include: {
        organization: true,
        _count: {
          select: {
            users: true,
            modules: true
          }
        }
      }
    });
    
    return this.formatCourse(course);
  },

  async updateCourse(courseId, data) {
    const course = await prisma.course.update({
      where: { id: courseId },
      data,
      include: {
        organization: true,
        _count: {
          select: {
            users: true,
            modules: true
          }
        }
      }
    });
    
    return this.formatCourse(course);
  },

  async deleteCourse(courseId) {
    await prisma.course.delete({
      where: { id: courseId }
    });
    
    return { success: true };
  },

  async enrollUser(courseId, userId) {
    // Check if already enrolled
    const existing = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });
    
    if (existing) {
      throw new ValidationError('User already enrolled in this course');
    }
    
    // Get course with modules
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            scenarios: true
          }
        }
      }
    });
    
    if (!course) {
      throw new Error('Course not found');
    }
    
    // Create enrollment with modules
    const enrollment = await prisma.userCourse.create({
      data: {
        userId,
        courseId,
        status: 'ACTIVE',
        progress: 0,
        modules: {
          create: course.modules.map(module => ({
            moduleId: module.id,
            progress: 0,
            scenarios: {
              create: module.scenarios.map(scenario => ({
                scenarioId: scenario.id,
                status: 'NOT_STARTED'
              }))
            }
          }))
        }
      },
      include: {
        course: true,
        modules: {
          include: {
            module: true,
            scenarios: {
              include: {
                scenario: true
              }
            }
          }
        }
      }
    });
    
    return enrollment;
  },

  async unenrollUser(courseId, userId) {
    await prisma.userCourse.delete({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });
    
    return { success: true };
  },

  async getUserProgress(courseId, userId) {
    const enrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      include: {
        modules: {
          include: {
            module: true,
            scenarios: {
              include: {
                scenario: true
              }
            }
          }
        }
      }
    });
    
    if (!enrollment) {
      throw new Error('User not enrolled in this course');
    }
    
    return enrollment;
  },

  async updateProgress(courseId, userId, progressData) {
    const { moduleId, scenarioId, progress, score, status } = progressData;
    
    // Update scenario progress if provided
    if (scenarioId) {
      await prisma.userScenario.update({
        where: {
          id: scenarioId
        },
        data: {
          status: status || 'IN_PROGRESS',
          score,
          completedAt: status === 'COMPLETED' ? new Date() : null
        }
      });
    }
    
    // Update module progress if provided
    if (moduleId) {
      await prisma.userModule.update({
        where: {
          id: moduleId
        },
        data: {
          progress
        }
      });
    }
    
    // Update overall course progress
    const enrollment = await prisma.userCourse.update({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      data: {
        progress,
        status: progress === 100 ? 'COMPLETED' : 'ACTIVE',
        completionDate: progress === 100 ? new Date() : null
      },
      include: {
        modules: {
          include: {
            scenarios: true
          }
        }
      }
    });
    
    return enrollment;
  },

  async getScenario(courseId, scenarioId) {
    const scenario = await prisma.scenario.findFirst({
      where: {
        id: scenarioId,
        module: {
          courseId
        }
      },
      include: {
        module: {
          include: {
            course: true
          }
        }
      }
    });
    
    if (!scenario) {
      throw new Error('Scenario not found');
    }
    
    return scenario;
  },

  async saveScenarioAnswers(scenarioId, userId, answers) {
    // Save questionnaire answers
    const result = await prisma.questionnaireResponse.create({
      data: {
        userScenarioId: scenarioId,
        answers,
        submittedAt: new Date()
      }
    });
    
    return result;
  },

  formatCourse(course) {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      type: course.type,
      status: course.status,
      duration: course.duration,
      difficulty: course.difficulty,
      imageUrl: course.imageUrl,
      buildUrl: course.buildUrl,
      organizationId: course.organizationId,
      organizationName: course.organization?.name,
      enrolledCount: course._count?.users || 0,
      modulesCount: course._count?.modules || course.modules?.length || 0,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    };
  }
};