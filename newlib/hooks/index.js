"use client";

// Hooks utilisateur
export { useUser } from './useUser';
export { useUserStats } from './useUserStats';
export { useAuth } from './useAuth';

// Hooks organisation
export { useOrganization } from './useOrganization';
export { useOrganizationMembers } from './useOrganizationMembers';
export { useOrganizationTags } from './useOrganizationTags';
export { useOrganizationInvitations } from './useOrganizationInvitations';
export { useOrganizationBuilds } from './useOrganizationBuilds';

// Hooks cours et formations
export { useCourses } from './useCourses';
export { useCourse } from './useCourse';
export { useScenario } from './useScenario';

// Hook guide
export { useGuideData } from './useGuideData';

// Hooks contextuels (nouveau système)
export { useContext } from './useContext';
export { useActiveContext } from './useActiveContext';
export { useContextCourses } from './useContextCourses';
export { useContextStats } from './useContextStats';
export { useContextMembers } from './useContextMembers';
export { usePermissions } from './usePermissions';