import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { useUsersWorkspace } from '../hooks/useUsersWorkspace'
import { usersApi } from '../services/users.api'
import { rootReducer } from '../../../core/store/root-reducer'
import { toast } from '../../../shared/ui/notifications'

// Mock the API
vi.mock('../services/users.api')
vi.mock('../../../shared/ui/notifications')

// Mock Redux store
const createTestStore = () => {
  return configureStore({
    reducer: rootReducer,
  })
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  React.createElement(Provider, { store: createTestStore(), children })
)

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
      { id: 1, username: 'user1', email: 'user1@example.com', is_active: true },
      { id: 2, username: 'user2', email: 'user2@example.com', is_active: false },
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
      role: 1,
      password: 'password123',
      password_confirm: 'password123',
    }

    const createdUser = { id: 3, ...newUser, is_active: true }
    const mockCreateUser = vi.fn().mockResolvedValue(createdUser)
    vi.mocked(usersApi.createUser).mockImplementation(mockCreateUser)

    const { result } = renderHook(() => useUsersWorkspace(), { wrapper })

    await result.current.submitUser(newUser)

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith(newUser)
      expect(result.current.users).toContain(createdUser)
    })
  })

  it('should handle user editing', async () => {
    const existingUser = { id: 1, username: 'user1', email: 'user1@example.com', is_active: true }
    const updatedUser = { ...existingUser, email: 'updated@example.com' }

    const mockUpdateUser = vi.fn().mockResolvedValue(updatedUser)
    vi.mocked(usersApi.updateUser).mockImplementation(mockUpdateUser)

    const { result } = renderHook(() => useUsersWorkspace(), { wrapper })

    // Start editing
    result.current.startEditUser(1)

    expect(result.current.editingUserId).toBe(1)

    // Submit edit
    await result.current.submitUser(updatedUser)

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith(1, updatedUser)
      expect(result.current.editingUserId).toBeNull()
    })
  })

  it('should handle user deactivation', async () => {
    const userToDeactivate = { id: 1, username: 'user1', email: 'user1@example.com', is_active: true }
    const deactivatedUser = { ...userToDeactivate, is_active: false }

    const mockDeactivateUser = vi.fn().mockResolvedValue(deactivatedUser)
    vi.mocked(usersApi.deactivateUser).mockImplementation(mockDeactivateUser)

    const { result } = renderHook(() => useUsersWorkspace(), { wrapper })

    await result.current.deactivateUser(1)

    await waitFor(() => {
      expect(mockDeactivateUser).toHaveBeenCalledWith(1)
      expect(result.current.lastAction).toEqual({
        type: 'deactivate',
        userId: 1,
        previousState: userToDeactivate,
      })
    })
  })

  it('should handle undo last action', async () => {
    const user = { id: 1, username: 'user1', email: 'user1@example.com', is_active: true }
    const deactivatedUser = { ...user, is_active: false }

    const mockDeactivateUser = vi.fn().mockResolvedValue(deactivatedUser)
    const mockUpdateUser = vi.fn().mockResolvedValue(user)
    vi.mocked(usersApi.deactivateUser).mockImplementation(mockDeactivateUser)
    vi.mocked(usersApi.updateUser).mockImplementation(mockUpdateUser)

    const { result } = renderHook(() => useUsersWorkspace(), { wrapper })

    // Deactivate user
    await result.current.deactivateUser(1)

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

  it('should show success toast on successful operations', async () => {
    const mockToast = vi.fn()
    vi.mocked(toast).mockImplementation(mockToast)

    const newUser = {
      username: 'newuser',
      email: 'newuser@example.com',
      first_name: 'New',
      last_name: 'User',
      role: 1,
      password: 'password123',
      password_confirm: 'password123',
    }

    vi.mocked(usersApi.createUser).mockResolvedValue({ id: 3, ...newUser, is_active: true })

    const { result } = renderHook(() => useUsersWorkspace(), { wrapper })

    await result.current.submitUser(newUser)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'User created successfully',
        type: 'success',
      })
    })
  })

  it('should show error toast on failed operations', async () => {
    const mockToast = vi.fn()
    vi.mocked(toast).mockImplementation(mockToast)

    const error = new Error('API Error')
    vi.mocked(usersApi.createUser).mockRejectedValue(error)

    const { result } = renderHook(() => useUsersWorkspace(), { wrapper })

    const newUser = {
      username: 'newuser',
      email: 'newuser@example.com',
      first_name: 'New',
      last_name: 'User',
      role: 1,
      password: 'password123',
      password_confirm: 'password123',
    }

    await result.current.submitUser(newUser)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to create user',
        type: 'error',
      })
    })
  })
})