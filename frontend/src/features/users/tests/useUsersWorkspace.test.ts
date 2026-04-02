import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { useUsersWorkspace } from '../hooks/useUsersWorkspace'
import { usersApi } from '../services/users.api'
import { rootReducer } from '../../../core/store/root-reducer'
import type { UserRecord } from '../types/user'

// Mock complete UserRecord for testing
const createMockUser = (overrides?: Partial<UserRecord>): UserRecord => ({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  phone_number: '+1234567890',
  is_active: true,
  is_staff: false,
  must_change_password: false,
  date_joined: '2023-01-01T00:00:00Z',
  last_login: '2023-01-02T00:00:00Z',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  role: { id: 1, name: 'User', code: 'user' },
  ...overrides,
})

// Mock the API
vi.mock('../services/users.api')

// Mock Redux store
const createTestStore = () => {
  return configureStore({
    reducer: rootReducer,
  })
}

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(Provider, { store: createTestStore(), children })

describe('useUsersWorkspace', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useUsersWorkspace(), { wrapper })

    expect(result.current.users).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.editingUserId).toBeNull()
    expect(result.current.lastAction).toBeNull()
  })

  it('should fetch users on mount', async () => {
    const mockUsers = [
      createMockUser({ id: 1, username: 'user1', email: 'user1@example.com', is_active: true }),
      createMockUser({ id: 2, username: 'user2', email: 'user2@example.com', is_active: false }),
    ]

    const mockFetchUsers = vi.fn().mockResolvedValue(mockUsers)
    vi.mocked(usersApi.fetchUsers).mockImplementation(mockFetchUsers)

    const { result } = renderHook(() => useUsersWorkspace(), { wrapper })

    await waitFor(() => {
      expect(mockFetchUsers).toHaveBeenCalled()
      expect(result.current.users).toEqual(mockUsers)
    })
  })

  it('should handle user creation', async () => {
    const newUser = {
      username: 'newuser',
      email: 'newuser@example.com',
      first_name: 'New',
      last_name: 'User',
      phone_number: '',
      role_id: 1,
      password: 'password123',
      password_confirm: 'password123',
      is_active: true,
      is_staff: false,
      must_change_password: false,
    }

    const createdUser = createMockUser({ id: 3, username: 'newuser', email: 'newuser@example.com', first_name: 'New' })
    const mockCreateUser = vi.fn().mockResolvedValue(createdUser)
    vi.mocked(usersApi.createUser).mockImplementation(mockCreateUser)

    const { result } = renderHook(() => useUsersWorkspace(), { wrapper })

    result.current.setUserForm(newUser)
    await result.current.submitUser()

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith(newUser)
      expect(result.current.users).toContain(createdUser)
    })
  })

  it('should handle user editing', async () => {
    const existingUser = createMockUser({ id: 1, username: 'user1', email: 'user1@example.com', is_active: true })
    const updatedUser = createMockUser({ ...existingUser, email: 'updated@example.com' })

    const mockUpdateUser = vi.fn().mockResolvedValue(updatedUser)
    vi.mocked(usersApi.updateUser).mockImplementation(mockUpdateUser)

    const { result } = renderHook(() => useUsersWorkspace(), { wrapper })

    // Start editing
    result.current.startEditUser(existingUser)

    expect(result.current.editingUserId).toBe(1)

    // Submit edit
    await result.current.submitUser()

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith(1, expect.any(Object))
      expect(result.current.editingUserId).toBeNull()
    })
  })

  it('should handle user deactivation', async () => {
    const userToDeactivate = createMockUser({ id: 1, username: 'user1', email: 'user1@example.com', is_active: true })
    const deactivatedUser = createMockUser({ ...userToDeactivate, is_active: false })

    const mockDeactivateUser = vi.fn().mockResolvedValue(deactivatedUser)
    vi.mocked(usersApi.deactivateUser).mockImplementation(mockDeactivateUser)

    const { result } = renderHook(() => useUsersWorkspace(), { wrapper })

    await result.current.deactivateUser(1)

    await waitFor(() => {
      expect(mockDeactivateUser).toHaveBeenCalledWith(1)
      expect(result.current.lastAction?.type).toEqual('deactivate')
    })
  })

  it('should handle undo last action', async () => {
    const user = createMockUser({ id: 1, username: 'user1', email: 'user1@example.com', is_active: true })
    const deactivatedUser = createMockUser({ ...user, is_active: false })

    const mockDeactivateUser = vi.fn().mockResolvedValue(deactivatedUser)
    const mockUpdateUser = vi.fn().mockResolvedValue(user)
    vi.mocked(usersApi.deactivateUser).mockImplementation(mockDeactivateUser)
    vi.mocked(usersApi.updateUser).mockImplementation(mockUpdateUser)

    const { result } = renderHook(() => useUsersWorkspace(), { wrapper })

    // Deactivate user
    await result.current.deactivateUser(user.id)

    await waitFor(() => {
      expect(result.current.lastAction?.type).toBe('deactivate')
    })

    // Undo action
    await result.current.undoLastAction()

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith(1, user)
      expect(result.current.lastAction).toBeNull()
    })
  })
})