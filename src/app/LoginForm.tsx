'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
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

export function LoginForm() {
  const searchParams = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const hid = searchParams.get('hid') || ''

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate login (in a real app, you would validate credentials)
    // For this example, we'll just redirect after a brief delay
    setTimeout(() => {
      if (hid) {
        window.location.href = `http://10.1.1.1/opennds_auth/?hid=${hid}`
      } else {
        alert('Missing hid parameter')
        setIsLoading(false)
      }
    }, 500)
  }

  return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
      <Container maxW="md" py={12}>
        <Card.Root>
          <Card.Body p={8}>
            <Stack gap={6}>
              <Box textAlign="center">
                <Heading size="xl" mb={2}>OpenNDS Login</Heading>
                <Text color="gray.600">Enter your credentials to continue</Text>
              </Box>

              <form onSubmit={handleSubmit}>
                <Stack gap={4}>
                  <Box>
                    <Text mb={2} fontWeight="medium">Username</Text>
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
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
                      placeholder="Enter your password"
                      required
                      size="lg"
                    />
                  </Box>

                  {hid && (
                    <Box>
                      <Text fontSize="sm" color="gray.500">
                        Session ID: {hid}
                      </Text>
                    </Box>
                  )}

                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    width="full"
                    loading={isLoading}
                    disabled={isLoading}
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
