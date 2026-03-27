import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { UsersPage } from '../pages/UsersPage'
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

// Mock dependencies
vi.mock('../services/users.api')
vi.mock('../../../shared/ui/notifications')
vi.mock('../../../core/permissions', () => ({
  usePermissions: () => ({
    hasPermission: (permission: string) => permission.includes('Users'), // Mock all user permissions as true
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


describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render users page with title', () => {
    render(<UsersPage />, { wrapper })

    expect(screen.getByText('Users Management')).toBeInTheDocument()
  })

  it('should display loading state initially', () => {
    render(<UsersPage />, { wrapper })

    expect(screen.getByText('Loading users...')).toBeInTheDocument()
  })

  it('should display users table when data loads', async () => {
    const mockUsers = [
      createMockUser({ id: 1, username: 'admin', email: 'admin@example.com', first_name: 'Admin', is_staff: true }),
      createMockUser({ id: 2, username: 'user', email: 'user@example.com', first_name: 'Regular', is_active: false }),
    ]

    vi.mocked(usersApi.fetchUsers).mockResolvedValue(mockUsers)

    render(<UsersPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
      expect(screen.getByText('user')).toBeInTheDocument()
    })
  })

  it('should display summary cards', async () => {
    const mockUsers = [
      createMockUser({ id: 1, username: 'admin', is_active: true, is_staff: true }),
      createMockUser({ id: 2, username: 'user', is_active: false, is_staff: false }),
    ]

    vi.mocked(usersApi.fetchUsers).mockResolvedValue(mockUsers)

    render(<UsersPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument() // Total
      expect(screen.getByText('Active Users')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument() // Active
      expect(screen.getByText('Inactive Users')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument() // Inactive
      expect(screen.getByText('Staff Users')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument() // Staff
    })
  })

  it('should allow creating a new user', async () => {
    const user = userEvent.setup()
    const mockUsers: UserRecord[] = []
    const newUser = createMockUser({ id: 3, username: 'newuser', email: 'newuser@example.com', first_name: 'New' })

    vi.mocked(usersApi.fetchUsers).mockResolvedValue(mockUsers)
    vi.mocked(usersApi.createUser).mockResolvedValue(newUser)

    render(<UsersPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Create User')).toBeInTheDocument()
    })

    // Fill out the form
    await user.type(screen.getByLabelText(/username/i), 'newuser')
    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com')
    await user.type(screen.getByLabelText(/first name/i), 'New')
    await user.type(screen.getByLabelText(/last name/i), 'User')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')

    // Select role (assuming it's a select)
    const roleSelect = screen.getByLabelText(/role/i)
    await user.selectOptions(roleSelect, '2')

    // Submit
    await user.click(screen.getByRole('button', { name: /create user/i }))

    await waitFor(() => {
      expect(usersApi.createUser).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'newuser@example.com',
        first_name: 'New',
        last_name: 'User',
        role: 2,
        password: 'password123',
        password_confirm: 'password123',
      })
    })
  })

  it('should allow editing an existing user', async () => {
    const user = userEvent.setup()
    const mockUser = createMockUser({ id: 1, username: 'admin', email: 'admin@example.com', first_name: 'Admin' })
    const mockUsers = [mockUser]

    const updatedUser = createMockUser({ ...mockUser, email: 'updated@example.com' })

    vi.mocked(usersApi.fetchUsers).mockResolvedValue(mockUsers)
    vi.mocked(usersApi.updateUser).mockResolvedValue(updatedUser)

    render(<UsersPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
    })

    // Click edit button
    await user.click(screen.getByRole('button', { name: /edit/i }))

    // Update email
    const emailInput = screen.getByDisplayValue('admin@example.com')
    await user.clear(emailInput)
    await user.type(emailInput, 'updated@example.com')

    // Submit
    await user.click(screen.getByRole('button', { name: /update user/i }))

    await waitFor(() => {
      expect(usersApi.updateUser).toHaveBeenCalledWith(1, expect.objectContaining({
        email: 'updated@example.com',
      }))
    })
  })

  it('should allow deactivating a user', async () => {
    const user = userEvent.setup()
    const adminUser = createMockUser({ id: 1, username: 'admin', email: 'admin@example.com', first_name: 'Admin', is_staff: true })
    const mockUsers = [adminUser]

    const deactivatedUser = createMockUser({ ...adminUser, is_active: false })

    vi.mocked(usersApi.fetchUsers).mockResolvedValue(mockUsers)
    vi.mocked(usersApi.deactivateUser).mockResolvedValue(deactivatedUser)

    render(<UsersPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
    })

    // Click deactivate button
    await user.click(screen.getByRole('button', { name: /deactivate/i }))

    await waitFor(() => {
      expect(usersApi.deactivateUser).toHaveBeenCalledWith(1)
    })
  })

  it('should allow undoing the last action', async () => {
    const user = userEvent.setup()
    const adminUser = createMockUser({ id: 1, username: 'admin', email: 'admin@example.com', first_name: 'Admin', is_staff: true })
    const mockUsers = [adminUser]

    vi.mocked(usersApi.fetchUsers).mockResolvedValue(mockUsers)
    vi.mocked(usersApi.deactivateUser).mockResolvedValue(undefined)
    vi.mocked(usersApi.updateUser).mockResolvedValue(adminUser)

    render(<UsersPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
    })

    // Deactivate user
    await user.click(screen.getByRole('button', { name: /deactivate/i }))

    await waitFor(() => {
      expect(screen.getByText('Undo Last Action')).toBeInTheDocument()
    })

    // Click undo
    await user.click(screen.getByRole('button', { name: /undo last action/i }))

    await waitFor(() => {
      expect(usersApi.updateUser).toHaveBeenCalledWith(1, expect.any(Object))
    })
  })

  it('should filter users by active status', async () => {
    const user = userEvent.setup()
    const mockUsers = [
      createMockUser({ id: 1, username: 'admin', email: 'admin@example.com', is_active: true }),
      createMockUser({ id: 2, username: 'user', email: 'user@example.com', is_active: false }),
    ]

    vi.mocked(usersApi.fetchUsers).mockResolvedValue(mockUsers)

    render(<UsersPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
      expect(screen.getByText('user')).toBeInTheDocument()
    })

    // Check active only filter
    const activeOnlyCheckbox = screen.getByLabelText(/active only/i)
    await user.click(activeOnlyCheckbox)

    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
      expect(screen.queryByText('user')).not.toBeInTheDocument()
    })
  })

  it('should search users', async () => {
    const user = userEvent.setup()
    const mockUsers = [
      createMockUser({ id: 1, username: 'admin', email: 'admin@example.com', is_active: true }),
      createMockUser({ id: 2, username: 'user', email: 'user@example.com', is_active: true }),
    ]

    vi.mocked(usersApi.fetchUsers).mockResolvedValue(mockUsers)

    render(<UsersPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
      expect(screen.getByText('user')).toBeInTheDocument()
    })

    // Search for admin
    const searchInput = screen.getByPlaceholderText(/search users/i)
    await user.type(searchInput, 'admin')

    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
      expect(screen.queryByText('user')).not.toBeInTheDocument()
    })
  })
})