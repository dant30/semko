import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import { useUserForm } from '../hooks/useUserForm';
import { usersApi } from '../services/users.api';
import { rootReducer } from '@/core/store/root-reducer';

const navigateMock = vi.fn();
const showToastMock = vi.fn();

vi.mock('@/core/contexts/useNotifications', () => ({
  useNotifications: () => ({
    showToast: showToastMock,
  }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

const mockFetchRoles = vi.fn();
const mockFetchUser = vi.fn();
const mockCreateUser = vi.fn();

vi.mock('../services/users.api', () => ({
  usersApi: {
    fetchRoles: mockFetchRoles,
    fetchUser: mockFetchUser,
    createUser: mockCreateUser,
  },
}));

const createTestStore = () =>
  configureStore({
    reducer: rootReducer,
  });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={createTestStore()}>{children}</Provider>
);

describe('useUserForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchRoles.mockResolvedValue([]);
    mockFetchUser.mockResolvedValue(null);
  });

  it('should validate required fields before submit', async () => {
    const { result } = renderHook(() => useUserForm(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(usersApi.createUser).not.toHaveBeenCalled();
    expect(result.current.error).toBe('Please correct the highlighted fields.');
    expect(result.current.fieldErrors.username).toBe('Username is required.');
    expect(result.current.fieldErrors.email).toBe('Email is required.');
    expect(result.current.fieldErrors.first_name).toBe('First name is required.');
    expect(result.current.fieldErrors.last_name).toBe('Last name is required.');
    expect(result.current.fieldErrors.password).toBe('Password is required.');
    expect(result.current.fieldErrors.password_confirm).toBe('Please confirm the password.');
  });

  it('should validate password confirmation mismatch', async () => {
    const { result } = renderHook(() => useUserForm(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.updateField('username', 'jdoe');
      result.current.updateField('email', 'jdoe@example.com');
      result.current.updateField('first_name', 'John');
      result.current.updateField('last_name', 'Doe');
      result.current.updateField('password', 'Password123');
      result.current.updateField('password_confirm', 'Password321');
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(mockCreateUser).not.toHaveBeenCalled();
    expect(result.current.fieldErrors.password_confirm).toBe('Passwords must match.');
    expect(result.current.error).toBe('Please correct the highlighted fields.');
  });

  it('should submit successfully when form is valid', async () => {
    mockCreateUser.mockResolvedValue({ id: 1 });

    const { result } = renderHook(() => useUserForm(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.updateField('username', 'jdoe');
      result.current.updateField('email', 'jdoe@example.com');
      result.current.updateField('first_name', 'John');
      result.current.updateField('last_name', 'Doe');
      result.current.updateField('password', 'Password123');
      result.current.updateField('password_confirm', 'Password123');
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(mockCreateUser).toHaveBeenCalled();
    expect(showToastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'User created' })
    );
    expect(navigateMock).toHaveBeenCalledWith('/app/users');
  });
});
