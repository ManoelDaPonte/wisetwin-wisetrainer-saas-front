"use client";
import { userApi } from "./userApi";
import { organizationApi } from "./organizationApi";
import { courseApi } from "./courseApi";

/**
 * Point d'entrée unifié pour tous les services API
 */
export const api = {
  user: userApi,
  organization: organizationApi,
  course: courseApi,
};

export default api;