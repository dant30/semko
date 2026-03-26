import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { useRolesWorkspace } from '../hooks/useRolesWorkspace'
import { rolesApi } from '../services/roles.api'
import { rootReducer } from '../../../core/store/root-reducer'
import { toast } from '../../../shared/ui/notifications'
import type { RoleRecord } from '../types/role'

// Mock complete RoleRecord for testing
const createMockRole = (overrides?: Partial<RoleRecord>): RoleRecord => ({
  id: 1,
  name: 'Test Role',
  code: 'test_role',
  description: 'A test role',
  permissions: [],
  ...overrides,
})

// Mock the API
vi.mock('../services/roles.api')
vi.mock('../../../shared/ui/notifications')

// Mock Redux store
const createTestStore = () => {
  return configureStore({
    reducer: rootReducer,
  })
}

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(Provider, { store: createTestStore(), children })

describe('useRolesWorkspace', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useRolesWorkspace(), { wrapper })

    expect(result.current.roles).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.editingRoleId).toBeNull()
  })

  it('should fetch roles on mount', async () => {
    const mockRoles = [
      createMockRole({ id: 1, name: 'Administrator', code: 'ADMIN', permissions: ['viewUsers', 'manageUsers'] }),
      createMockRole({ id: 2, name: 'User', code: 'USER', permissions: ['viewUsers'] }),
    ]

    const mockFetchRoles = vi.fn().mockResolvedValue(mockRoles)
    vi.mocked(rolesApi.fetchRoles).mockImplementation(mockFetchRoles)

    const { result } = renderHook(() => useRolesWorkspace(), { wrapper })

    await waitFor(() => {
      expect(mockFetchRoles).toHaveBeenCalled()
      expect(result.current.roles).toEqual(mockRoles)
    })
  })

  it('should handle role creation', async () => {
    const newRole = {
      name: 'Manager',
      code: 'MGR',
      description: 'Management access',
      permissions: 'viewUsers,manageUsers',
    }

    const createdRole = createMockRole({ id: 3, name: 'Manager', code: 'MGR', description: 'Management access' })
    const mockCreateRole = vi.fn().mockResolvedValue(createdRole)
    vi.mocked(rolesApi.createRole).mockImplementation(mockCreateRole)

    const { result } = renderHook(() => useRolesWorkspace(), { wrapper })

    await result.current.submitRole(newRole)

    await waitFor(() => {
      expect(mockCreateRole).toHaveBeenCalledWith(newRole)
      expect(result.current.roles).toContain(createdRole)
    })
  })

  it('should handle role editing', async () => {
    const existingRole = createMockRole({ id: 1, name: 'Administrator', code: 'ADMIN', permissions: ['viewUsers'] })
    const updatedRole = createMockRole({ ...existingRole, description: 'Updated description' })

    const mockUpdateRole = vi.fn().mockResolvedValue(updatedRole)
    vi.mocked(rolesApi.updateRole).mockImplementation(mockUpdateRole)

    const { result } = renderHook(() => useRolesWorkspace(), { wrapper })

    // Start editing
    result.current.startEditRole(existingRole)

    expect(result.current.editingRoleId).toBe(1)

    // Submit edit
    await result.current.submitRole(updatedRole)

    await waitFor(() => {
      expect(mockUpdateRole).toHaveBeenCalledWith(1, updatedRole)
      expect(result.current.editingRoleId).toBeNull()
    })
  })

  it('should handle role deletion', async () => {
    const roleToDelete = createMockRole({ id: 1, name: 'Test Role', code: 'TEST' })

    const mockDeleteRole = vi.fn().mockResolvedValue(undefined)
    vi.mocked(rolesApi.deleteRole).mockImplementation(mockDeleteRole)

    const { result } = renderHook(() => useRolesWorkspace(), { wrapper })

    await result.current.deleteRole(roleToDelete)

    await waitFor(() => {
      expect(mockDeleteRole).toHaveBeenCalledWith(1)
      expect(result.current.roles).not.toContain(roleToDelete)
    })
  })

  it('should show success toast on successful operations', async () => {
    const mockToast = vi.fn()
    vi.mocked(toast).mockImplementation(mockToast)

    const newRole = {
      name: 'Manager',
      code: 'MGR',
      description: 'Management access',
      permissions: 'viewUsers',
    }

    vi.mocked(rolesApi.createRole).mockResolvedValue(createMockRole({ id: 3, name: 'Manager', code: 'MGR', description: 'Management access' }))

    const { result } = renderHook(() => useRolesWorkspace(), { wrapper })

    await result.current.submitRole(newRole)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Role created successfully',
        type: 'success',
      })
    })
  })

  it('should show error toast on failed operations', async () => {
    const mockToast = vi.fn()
    vi.mocked(toast).mockImplementation(mockToast)

    const error = new Error('API Error')
    vi.mocked(rolesApi.createRole).mockRejectedValue(error)

    const { result } = renderHook(() => useRolesWorkspace(), { wrapper })

    const newRole = {
      name: 'Manager',
      code: 'MGR',
      description: 'Management access',
      permissions: 'viewUsers',
    }

    await result.current.submitRole(newRole)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to create role',
        type: 'error',
      })
    })
  })
})