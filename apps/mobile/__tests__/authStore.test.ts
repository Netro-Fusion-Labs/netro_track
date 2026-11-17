import { useAuthStore } from '../src/features/auth/stores/authStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      lastLoginId: null,
      isMpinVerified: false,
      hasMpin: false,
    });
  });

  it('sets credentials and marks the session authenticated', () => {
    useAuthStore.getState().setCredentials({
      user: {
        id: 'user-1',
        companyId: 'company-1',
        employeeId: 'E001',
        name: 'Field Agent',
        role: 'EMPLOYEE',
        hasMpin: true,
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      loginId: 'E001',
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe('access-token');
    expect(state.user?.companyId).toBe('company-1');
    expect(state.hasMpin).toBe(true);
    expect(state.isMpinVerified).toBe(false);
  });

  it('clears credentials on logout', () => {
    useAuthStore.getState().setCredentials({
      user: {
        id: 'user-1',
        companyId: 'company-1',
        employeeId: 'E001',
        name: 'Field Agent',
        role: 'EMPLOYEE',
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      loginId: 'E001',
    });

    useAuthStore.getState().clearCredentials();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
  });
});
