import { useAppState } from "../context/AppStateContext";

/**
 * Custom React hook to simplify role-checking and authorization guards.
 * 
 * @returns {Object} Helper attributes and active role setters
 */
export function useRole() {
  const { userRole, setUserRole } = useAppState();

  const isFan = userRole === "fan";
  const isStaff = userRole === "staff";
  const isOrganizer = userRole === "organizer";
  const isAdmin = userRole === "admin";

  const isStaffOrAbove = userRole === "staff" || userRole === "organizer" || userRole === "admin";
  const isOrganizerOrAbove = userRole === "organizer" || userRole === "admin";
  const isAdminOrStaff = userRole === "admin" || userRole === "staff";

  return {
    userRole,
    setUserRole,
    isFan,
    isStaff,
    isOrganizer,
    isAdmin,
    isStaffOrAbove,
    isOrganizerOrAbove,
    isAdminOrStaff
  };
}
