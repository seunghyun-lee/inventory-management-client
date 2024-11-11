export const USER_ROLES = {
    ADMIN: '관리자',
    EMPLOYEE: '직원',
    VIEWER: '조회자',
    RESIGNED: '퇴사',
    PENDING: '대기'
};

export const ACTIVE_ROLES = [USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE, USER_ROLES.VIEWER];

export const hasEditPermission = (role) => {
    return [USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE].includes(role);
};

export const isAdmin = (role) => {
    return role === USER_ROLES.ADMIN;
};