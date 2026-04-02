import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { RolesPage } from '../pages/RolesPage'
import { rolesApi } from '../services/roles.api'
import { rootReducer } from '../../../core/store/root-reducer'
import type { RoleRecord } from '../types/role'

// Mock dependencies
vi.mock('../services/roles.api')
vi.mock('../../../core/permissions', () => ({
  usePermissions: () => ({
    hasPermission: (permission: string) => permission.includes('Roles'), // Mock all role permissions as true
  }),
}))

// Mock Redux store
const createTestStore = () => {
  return configureStore({
    reducer: rootReducer,
  })
}

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(Provider, { store: createTestStore(), children:
    React.createElement(MemoryRouter, { children })
  })

describe('RolesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render roles page with title', () => {
    render(<RolesPage />, { wrapper })

    expect(screen.getByText('Roles Management')).toBeInTheDocument()
  })

  it('should display loading state initially', () => {
    render(<RolesPage />, { wrapper })

    expect(screen.getByText('Loading roles...')).toBeInTheDocument()
  })

  it('should display roles table when data loads', async () => {
    const mockRoles = [
      {
        id: 1,
        name: 'Administrator',
        code: 'ADMIN',
        description: 'Full system access',
        permissions: ['viewUsers', 'manageUsers', 'viewRoles', 'manageRoles'],
      },
      {
        id: 2,
        name: 'User',
        code: 'USER',
        description: 'Basic user access',
        permissions: ['viewUsers'],
      },
    ]

    vi.mocked(rolesApi.fetchRoles).mockResolvedValue(mockRoles)

    render(<RolesPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Administrator')).toBeInTheDocument()
      expect(screen.getByText('User')).toBeInTheDocument()
    })
  })

  it('should display summary cards', async () => {
    const mockRoles = [
      { id: 1, name: 'Admin', code: 'ADMIN', permissions: ['viewUsers'] },
      { id: 2, name: 'User', code: 'USER', permissions: [] },
      { id: 3, name: 'Manager', code: 'MGR', permissions: ['viewUsers', 'manageUsers'] },
    ]

    vi.mocked(rolesApi.fetchRoles).mockResolvedValue(mockRoles)

    render(<RolesPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Total Roles')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument() // Total
      expect(screen.getByText('System Roles')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument() // System (assuming ADMIN is system)
      expect(screen.getByText('Permissioned Roles')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument() // With permissions
      expect(screen.getByText('No-Permission Roles')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument() // Without permissions
    })
  })

  it('should allow creating a new role', async () => {
    const user = userEvent.setup()
    const mockRoles: RoleRecord[] = []
    const newRole = {
      id: 3,
      name: 'Manager',
      code: 'MGR',
      description: 'Management role',
      permissions: ['viewUsers', 'manageUsers'],
    }

    vi.mocked(rolesApi.fetchRoles).mockResolvedValue(mockRoles)
    vi.mocked(rolesApi.createRole).mockResolvedValue(newRole)

    render(<RolesPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Create Role')).toBeInTheDocument()
    })

    // Fill out the form
    await user.type(screen.getByLabelText(/name/i), 'Manager')
    await user.type(screen.getByLabelText(/code/i), 'MGR')
    await user.type(screen.getByLabelText(/description/i), 'Management role')

    // Use the manager preset for fewer typing errors
    await user.click(screen.getByRole('button', { name: /manager/i }))

    // Submit
    await user.click(screen.getByRole('button', { name: /create role/i }))

    await waitFor(() => {
      expect(rolesApi.createRole).toHaveBeenCalledWith({
        name: 'Manager',
        code: 'MGR',
        description: 'Management role',
        permissions: 'users.view_user',
      })
    })
  })

  it('should allow editing an existing role', async () => {
    const user = userEvent.setup()
    const mockRoles = [
      {
        id: 1,
        name: 'Administrator',
        code: 'ADMIN',
        description: 'Full access',
        permissions: ['viewUsers'],
      },
    ]

    const updatedRole = {
      ...mockRoles[0],
      description: 'Updated description',
    }

    vi.mocked(rolesApi.fetchRoles).mockResolvedValue(mockRoles)
    vi.mocked(rolesApi.updateRole).mockResolvedValue(updatedRole)

    render(<RolesPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Administrator')).toBeInTheDocument()
    })

    // Click edit button
    await user.click(screen.getByRole('button', { name: /edit/i }))

    // Update description
    const descriptionInput = screen.getByDisplayValue('Full access')
    await user.clear(descriptionInput)
    await user.type(descriptionInput, 'Updated description')

    // Submit
    await user.click(screen.getByRole('button', { name: /update role/i }))

    await waitFor(() => {
      expect(rolesApi.updateRole).toHaveBeenCalledWith(1, expect.objectContaining({
        description: 'Updated description',
      }))
    })
  })

  it('should allow deleting a role', async () => {
    const user = userEvent.setup()
    const mockRoles = [
      {
        id: 1,
        name: 'Test Role',
        code: 'TEST',
        description: 'Test role',
        permissions: [],
      },
    ]

    vi.mocked(rolesApi.fetchRoles).mockResolvedValue(mockRoles)
    vi.mocked(rolesApi.deleteRole).mockResolvedValue(undefined)

    render(<RolesPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Test Role')).toBeInTheDocument()
    })

    // Click delete button
    await user.click(screen.getByRole('button', { name: /delete/i }))

    await waitFor(() => {
      expect(rolesApi.deleteRole).toHaveBeenCalledWith(1)
    })
  })

  it('should search roles', async () => {
    const user = userEvent.setup()
    const mockRoles = [
      { id: 1, name: 'Administrator', code: 'ADMIN', description: 'Full access', permissions: [] },
      { id: 2, name: 'User', code: 'USER', description: 'Basic access', permissions: [] },
    ]

    vi.mocked(rolesApi.fetchRoles).mockResolvedValue(mockRoles)

    render(<RolesPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Administrator')).toBeInTheDocument()
      expect(screen.getByText('User')).toBeInTheDocument()
    })

    // Search for admin
    const searchInput = screen.getByPlaceholderText(/search roles/i)
    await user.type(searchInput, 'admin')

    await waitFor(() => {
      expect(screen.getByText('Administrator')).toBeInTheDocument()
      expect(screen.queryByText('User')).not.toBeInTheDocument()
    })
  })

})