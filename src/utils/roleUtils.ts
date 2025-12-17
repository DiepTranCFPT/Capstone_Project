/**
 * Thứ tự ưu tiên của các role (cao nhất đến thấp nhất)
 */
const ROLE_PRIORITY: Record<string, number> = {
  ADMIN: 4,
  TEACHER: 3,
  PARENT: 2,
  STUDENT: 1,
};

/**
 * Lấy role có độ ưu tiên cao nhất từ danh sách roles
 * @param roles - Role hoặc mảng roles (có thể là string, string[], hoặc undefined)
 * @returns Role có độ ưu tiên cao nhất hoặc undefined nếu không có
 */
export const getHighestPriorityRole = (
  roles?: string | string[]
): string | undefined => {
  if (!roles) return undefined;

  const rolesArray = Array.isArray(roles) ? roles : [roles];
  if (rolesArray.length === 0) return undefined;

  // Lọc và sắp xếp roles theo độ ưu tiên
  const validRoles = rolesArray
    .map((r) => r.toUpperCase().trim())
    .filter((r) => r && ROLE_PRIORITY[r] !== undefined);

  if (validRoles.length === 0) return undefined;

  // Sắp xếp theo độ ưu tiên (cao nhất trước)
  validRoles.sort((a, b) => {
    const priorityA = ROLE_PRIORITY[a] || 0;
    const priorityB = ROLE_PRIORITY[b] || 0;
    return priorityB - priorityA; // Sắp xếp giảm dần
  });

  return validRoles[0]; // Trả về role có độ ưu tiên cao nhất
};

