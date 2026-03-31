// frontend/src/core/api/endpoints.ts
export const endpoints = {
  auth: {
    login: "/users/login/",
    me: "/users/me/",
    passwordChange: "/users/password/change/",
    passwordForgot: "/users/password/forgot/",
    passwordReset: "/users/password/reset/",
  },
  dashboard: {
    health: "/core/health/",
  },
  notifications: {
    inbox: "/notifications/",
  },
  trips: {
    list: "/trips/",
    summary: "/trips/summary/",
    detailSummary: (tripId: number) => `/trips/${tripId}/summary/`,
  },
  reports: {
    payrollPeriods: "/payroll/periods/",
    payrollPeriodSummary: (payrollPeriodId: number) => `/reports/payroll/periods/${payrollPeriodId}/summary/`,
    payrollPeriodExport: (payrollPeriodId: number) => `/reports/payroll/periods/${payrollPeriodId}/export/`,
  },
};
