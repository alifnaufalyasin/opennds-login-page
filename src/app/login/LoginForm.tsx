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
  const [error, setError] = useState('')

  const hid = searchParams.get('hid') || ''

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validate that hid parameter exists and is alphanumeric
    if (!hid) {
      setError('Missing hid parameter in URL')
      return
    }

    // Basic validation: hid should be alphanumeric and not empty
    if (!/^[a-zA-Z0-9]+$/.test(hid)) {
      setError('Invalid session ID format')
      return
    }

    setIsLoading(true)
    
    // Note: This is a simple redirect to OpenNDS authentication endpoint.
    // The username and password fields are collected here for future integration
    // with OpenNDS authentication API if needed. Currently, actual credential 
    // validation is handled by the OpenNDS system after redirect.
    
    // Brief delay to show loading state before redirect
    setTimeout(() => {
      // Encode the hid parameter to prevent injection issues
      window.location.href = `http://10.1.1.1/opennds_auth/?hid=${encodeURIComponent(hid)}`
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
