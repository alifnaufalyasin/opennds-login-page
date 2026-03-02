'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Stack,
  Text,
  Card,
  Table,
  Flex,
  useDisclosure,
  Dialog,
  Field,
  Badge,
} from '@chakra-ui/react'

interface User {
  id: number
  username: string
  first_login: string | null
  last_login: string | null
  expired_time: string | null
  expiration_duration: string | null
  created_at: string
}

export function AdminPanel() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  
  // Create/Edit user state
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [expiredTime, setExpiredTime] = useState<string>('')
  const [expirationMode, setExpirationMode] = useState<'duration' | 'absolute'>('duration')
  const [expirationDuration, setExpirationDuration] = useState<string>('1day')
  
  // Bulk generation state
  const [bulkCount, setBulkCount] = useState(10)
  const [bulkPrefix, setBulkPrefix] = useState('user')
  const [bulkDuration, setBulkDuration] = useState('1day')
  
  // Password change state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Dialog states
  const { open: openUserDialog, onOpen: onOpenUserDialog, onClose: onCloseUserDialog } = useDisclosure()
  const { open: openBulkDialog, onOpen: onOpenBulkDialog, onClose: onCloseBulkDialog } = useDisclosure()
  const { open: openDeleteDialog, onOpen: onOpenDeleteDialog, onClose: onCloseDeleteDialog } = useDisclosure()
  const { open: openPasswordDialog, onOpen: onOpenPasswordDialog, onClose: onClosePasswordDialog } = useDisclosure()
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/verify')
        if (response.ok) {
          setIsAuthenticated(true)
          fetchUsers()
        } else {
          router.push('/admin/login')
        }
      } catch (err) {
        console.error('Auth check failed:', err)
        router.push('/admin/login')
      } finally {
        setCheckingAuth(false)
      }
    }
    
    checkAuth()
  }, [router])

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      const data = await response.json()
      
      if (response.ok) {
        setUsers(data.users)
      } else {
        setError(data.error || 'Failed to fetch users')
      }
    } catch (err) {
      setError('Failed to fetch users')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  // Handle password change
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters')
      return
    }
    
    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        onClosePasswordDialog()
        setNewPassword('')
        setConfirmPassword('')
        setError('')
      } else {
        setError(data.error || 'Failed to change password')
      }
    } catch (err) {
      setError('Failed to change password')
      console.error(err)
    }
  }

  // Open create user dialog
  const handleCreate = () => {
    setEditingUser(null)
    setUsername('')
    setPassword('')
    setExpiredTime('')
    setExpirationMode('duration')
    setExpirationDuration('1day')
    onOpenUserDialog()
  }

  // Open edit user dialog
  const handleEdit = (user: User) => {
    setEditingUser(user)
    setUsername(user.username)
    setPassword('')
    // If user has expiration_duration, use duration mode, otherwise use absolute mode
    if (user.expiration_duration) {
      setExpirationMode('duration')
      setExpirationDuration(user.expiration_duration)
    } else {
      setExpirationMode('absolute')
      setExpiredTime(user.expired_time ? new Date(user.expired_time).toISOString().slice(0, 16) : '')
    }
    onOpenUserDialog()
  }

  // Save user (create or update)
  const handleSaveUser = async () => {
    try {
      const method = editingUser ? 'PUT' : 'POST'
      const body: Record<string, unknown> = {
        username,
        password: password || undefined,
      }
      
      // If duration mode, send expiration_duration
      // If absolute mode, send expired_time
      if (expirationMode === 'duration') {
        body.expiration_duration = expirationDuration === 'infinite' ? null : expirationDuration
        // Set expired_time to null only when:
        // 1. Creating a new user (!editingUser), OR
        // 2. Editing a user who hasn't logged in yet (!editingUser.first_login), OR
        // 3. Admin explicitly sets to infinite (expirationDuration === 'infinite')
        // Otherwise, preserve the existing expired_time for logged-in users
        if (!editingUser || !editingUser.first_login || expirationDuration === 'infinite') {
          body.expired_time = null
        }
      } else {
        body.expired_time = expiredTime ? new Date(expiredTime).toISOString() : null
        body.expiration_duration = null
      }
      
      if (editingUser) {
        body.id = editingUser.id
      }
      
      const response = await fetch('/api/users', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        onCloseUserDialog()
        fetchUsers()
      } else {
        setError(data.error || 'Failed to save user')
      }
    } catch (err) {
      setError('Failed to save user')
      console.error(err)
    }
  }

  // Delete user confirmation
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    onOpenDeleteDialog()
  }

  // Delete user
  const handleDelete = async () => {
    if (!userToDelete) return
    
    try {
      const response = await fetch(`/api/users?id=${userToDelete.id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        onCloseDeleteDialog()
        setUserToDelete(null)
        fetchUsers()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete user')
      }
    } catch (err) {
      setError('Failed to delete user')
      console.error(err)
    }
  }

  // Reset user expiration
  const handleResetExpiration = async (userId: number) => {
    try {
      const response = await fetch(`/api/users?id=${userId}&action=reset-expiration`, {
        method: 'PATCH',
      })
      
      const data = await response.json()
      
      if (response.ok) {
        fetchUsers()
      } else {
        setError(data.error || 'Failed to reset expiration')
      }
    } catch (err) {
      setError('Failed to reset expiration')
      console.error(err)
    }
  }

  // Generate bulk users
  const handleBulkGenerate = async () => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          count: bulkCount,
          prefix: bulkPrefix,
          duration: bulkDuration,
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        onCloseBulkDialog()
        fetchUsers()
      } else {
        setError(data.error || 'Failed to generate users')
      }
    } catch (err) {
      setError('Failed to generate users')
      console.error(err)
    }
  }

  // Format date
  const formatDate = (date: string | null) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleString()
  }

  // Check if expired
  const isExpired = (expiredTime: string | null) => {
    if (!expiredTime) return false
    return new Date(expiredTime) < new Date()
  }

  // Get expiry status
  const getExpiryStatus = (user: User) => {
    // User has expiration_duration but hasn't logged in yet
    if (user.expiration_duration && !user.first_login && user.expiration_duration !== 'infinite') {
      return <Badge colorScheme="yellow">Pending first login</Badge>
    }
    
    // User with infinite expiration or no expiration set
    if (!user.expired_time) {
      return <Badge colorScheme="green">Infinite</Badge>
    }
    
    // Check if expired
    if (isExpired(user.expired_time)) {
      return <Badge colorScheme="red">Expired</Badge>
    }
    
    return <Badge colorScheme="blue">Active</Badge>
  }

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      {checkingAuth ? (
        <Container maxW="container.xl">
          <Text>Checking authentication...</Text>
        </Container>
      ) : !isAuthenticated ? (
        <Container maxW="container.xl">
          <Text>Redirecting to login...</Text>
        </Container>
      ) : (
        <Container maxW="container.xl">
          <Stack gap={6}>
            <Flex justify="space-between" align="center">
              <Heading size="2xl">User Management</Heading>
              <Flex gap={2}>
                <Button onClick={onOpenPasswordDialog}>
                  Change Password
                </Button>
                <Button colorScheme="blue" onClick={handleCreate}>
                  Add User
                </Button>
                <Button colorScheme="green" onClick={onOpenBulkDialog}>
                  Generate Users
                </Button>
                <Button colorScheme="red" onClick={handleLogout}>
                  Logout
                </Button>
              </Flex>
            </Flex>

          {error && (
            <Box bg="red.50" border="1px" borderColor="red.200" p={3} borderRadius="md">
              <Text color="red.600">{error}</Text>
              <Button size="sm" mt={2} onClick={() => setError('')}>Dismiss</Button>
            </Box>
          )}

          <Card.Root>
            <Card.Body>
              {loading ? (
                <Text>Loading users...</Text>
              ) : users.length === 0 ? (
                <Text>No users found. Create one to get started!</Text>
              ) : (
                <Box overflowX="auto">
                  <Table.Root variant="outline" size="sm">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader>ID</Table.ColumnHeader>
                        <Table.ColumnHeader>Username</Table.ColumnHeader>
                        <Table.ColumnHeader>First Login</Table.ColumnHeader>
                        <Table.ColumnHeader>Last Login</Table.ColumnHeader>
                        <Table.ColumnHeader>Expired Time</Table.ColumnHeader>
                        <Table.ColumnHeader>Status</Table.ColumnHeader>
                        <Table.ColumnHeader>Actions</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {users.map((user) => (
                        <Table.Row key={user.id}>
                          <Table.Cell>{user.id}</Table.Cell>
                          <Table.Cell fontWeight="medium">{user.username}</Table.Cell>
                          <Table.Cell>{formatDate(user.first_login)}</Table.Cell>
                          <Table.Cell>{formatDate(user.last_login)}</Table.Cell>
                          <Table.Cell>
                            {user.expiration_duration && !user.first_login ? (
                              `${user.expiration_duration} (from first login)`
                            ) : user.expired_time ? (
                              formatDate(user.expired_time)
                            ) : (
                              'Infinite'
                            )}
                          </Table.Cell>
                          <Table.Cell>{getExpiryStatus(user)}</Table.Cell>
                          <Table.Cell>
                            <Flex gap={2} wrap="wrap">
                              <Button size="sm" onClick={() => handleEdit(user)}>
                                Edit
                              </Button>
                              {user.expiration_duration && user.expiration_duration !== 'infinite' && user.first_login && (
                                <Button 
                                  size="sm" 
                                  colorScheme="yellow" 
                                  onClick={() => handleResetExpiration(user.id)}
                                  title="Reset expiration - user will get a fresh period on next login"
                                >
                                  Reset
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                colorScheme="red" 
                                onClick={() => handleDeleteClick(user)}
                              >
                                Delete
                              </Button>
                            </Flex>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>
              )}
            </Card.Body>
          </Card.Root>
        </Stack>

        {/* Create/Edit User Dialog */}
        <Dialog.Root open={openUserDialog} onOpenChange={onCloseUserDialog}>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>
                  {editingUser ? 'Edit User' : 'Create User'}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap={4}>
                  <Field.Root>
                    <Field.Label>Username</Field.Label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                    />
                  </Field.Root>
                  
                  <Field.Root>
                    <Field.Label>
                      Password {editingUser && '(leave empty to keep current)'}
                    </Field.Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                    />
                  </Field.Root>
                  
                  <Field.Root>
                    <Field.Label>Expiration Mode</Field.Label>
                    <select
                      value={expirationMode}
                      onChange={(e) => setExpirationMode(e.target.value as 'duration' | 'absolute')}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        width: '100%',
                        fontSize: '14px'
                      }}
                    >
                      <option value="duration">Duration from first login (Recommended)</option>
                      <option value="absolute">Absolute date/time</option>
                    </select>
                    <Field.HelperText>
                      Duration mode: Expiration starts when user logs in for the first time
                    </Field.HelperText>
                  </Field.Root>
                  
                  {expirationMode === 'duration' ? (
                    <Field.Root>
                      <Field.Label>Expiration Duration</Field.Label>
                      <select
                        value={expirationDuration}
                        onChange={(e) => setExpirationDuration(e.target.value)}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          width: '100%',
                          fontSize: '14px'
                        }}
                      >
                        <option value="1hour">1 Hour</option>
                        <option value="12hours">12 Hours</option>
                        <option value="1day">1 Day</option>
                        <option value="3days">3 Days</option>
                        <option value="1week">1 Week</option>
                        <option value="1month">1 Month</option>
                        <option value="infinite">Infinite</option>
                      </select>
                      <Field.HelperText>
                        User will expire this duration after their first login
                      </Field.HelperText>
                    </Field.Root>
                  ) : (
                    <Field.Root>
                      <Field.Label>Expired Time (leave empty for infinite)</Field.Label>
                      <Input
                        type="datetime-local"
                        value={expiredTime}
                        onChange={(e) => setExpiredTime(e.target.value)}
                      />
                      <Field.HelperText>
                        User will expire at this specific date and time
                      </Field.HelperText>
                    </Field.Root>
                  )}
                </Stack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button onClick={onCloseUserDialog}>Cancel</Button>
                <Button colorScheme="blue" onClick={handleSaveUser}>
                  Save
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>

        {/* Bulk Generate Dialog */}
        <Dialog.Root open={openBulkDialog} onOpenChange={onCloseBulkDialog}>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Generate Multiple Users</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap={4}>
                  <Field.Root>
                    <Field.Label>Number of Users</Field.Label>
                    <Input
                      type="number"
                      value={bulkCount}
                      onChange={(e) => setBulkCount(parseInt(e.target.value) || 1)}
                      min={1}
                      max={1000}
                    />
                    <Field.HelperText>Generate up to 1000 users at once</Field.HelperText>
                  </Field.Root>
                  
                  <Field.Root>
                    <Field.Label>Username Prefix</Field.Label>
                    <Input
                      value={bulkPrefix}
                      onChange={(e) => setBulkPrefix(e.target.value)}
                      placeholder="e.g., user, guest"
                    />
                    <Field.HelperText>
                      Users will be named {bulkPrefix}1, {bulkPrefix}2, etc.
                    </Field.HelperText>
                  </Field.Root>
                  
                  <Field.Root>
                    <Field.Label>Expiry Duration</Field.Label>
                    <select
                      value={bulkDuration}
                      onChange={(e) => setBulkDuration(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        width: '100%',
                        fontSize: '14px'
                      }}
                    >
                      <option value="1hour">1 Hour</option>
                      <option value="12hours">12 Hours</option>
                      <option value="1day">1 Day</option>
                      <option value="3days">3 Days</option>
                      <option value="1week">1 Week</option>
                      <option value="1month">1 Month</option>
                      <option value="infinite">Infinite</option>
                    </select>
                  </Field.Root>
                </Stack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button onClick={onCloseBulkDialog}>Cancel</Button>
                <Button colorScheme="green" onClick={handleBulkGenerate}>
                  Generate
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>

        {/* Delete Confirmation Dialog */}
        <Dialog.Root open={openDeleteDialog} onOpenChange={onCloseDeleteDialog}>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Confirm Delete</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text>
                  Are you sure you want to delete user &quot;{userToDelete?.username}&quot;? This action cannot be undone.
                </Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Button onClick={onCloseDeleteDialog}>Cancel</Button>
                <Button colorScheme="red" onClick={handleDelete}>
                  Delete
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>

        {/* Change Password Dialog */}
        <Dialog.Root open={openPasswordDialog} onOpenChange={onClosePasswordDialog}>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Change Admin Password</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap={4}>
                  <Field.Root>
                    <Field.Label>New Password</Field.Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </Field.Root>
                  
                  <Field.Root>
                    <Field.Label>Confirm Password</Field.Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </Field.Root>
                </Stack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button onClick={onClosePasswordDialog}>Cancel</Button>
                <Button colorScheme="blue" onClick={handleChangePassword}>
                  Change Password
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
        </Container>
      )}
    </Box>
  )
}
