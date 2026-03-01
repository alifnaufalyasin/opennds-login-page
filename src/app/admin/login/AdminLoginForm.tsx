'use client'

import { useState } from 'react'
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
} from '@chakra-ui/react'

export function AdminLoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Login failed')
        setIsLoading(false)
        return
      }
      
      // Redirect to admin panel
      router.push('/admin')
      router.refresh()
    } catch (err) {
      console.error('Login error:', err)
      setError('An error occurred during login')
      setIsLoading(false)
    }
  }

  return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
      <Container maxW="md" py={12}>
        <Card.Root>
          <Card.Body p={8}>
            <Stack gap={6}>
              <Box textAlign="center">
                <Heading size="xl" mb={2}>Admin Login</Heading>
                <Text color="gray.600">Enter admin credentials to continue</Text>
              </Box>

              <form onSubmit={handleSubmit}>
                <Stack gap={4}>
                  {error && (
                    <Box bg="red.50" border="1px" borderColor="red.200" p={3} borderRadius="md">
                      <Text color="red.600" fontSize="sm">{error}</Text>
                    </Box>
                  )}

                  <Box>
                    <Text mb={2} fontWeight="medium">Username</Text>
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter admin username"
                      required
                      size="lg"
                    />
                  </Box>

                  <Box>
                    <Text mb={2} fontWeight="medium">Password</Text>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter admin password"
                      required
                      size="lg"
                    />
                  </Box>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    width="full"
                    loading={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </Stack>
              </form>
            </Stack>
          </Card.Body>
        </Card.Root>
      </Container>
    </Box>
  )
}
