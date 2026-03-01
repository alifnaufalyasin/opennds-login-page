# OpenNDS Login Page

A simple Next.js login page with Chakra UI for OpenNDS authentication.

## Features

- Clean, responsive login interface built with Chakra UI
- Username and password authentication form
- URL parameter handling for OpenNDS `hid` (session ID)
- Automatic redirect to OpenNDS authentication endpoint after successful login
- File-based routing structure using Next.js App Router

## Project Structure

```
src/app/
├── layout.tsx          # Root layout with Chakra UI provider
├── providers.tsx       # Chakra UI configuration
├── page.tsx           # Root page (redirects to /login)
└── login/
    ├── page.tsx       # Login page component
    └── LoginForm.tsx  # Login form implementation
```

## Routing

The application uses Next.js's file-based routing:

- `/` → Redirects to `/login`
- `/login` → Login page with username and password form

## Getting Started

First, install dependencies:

```bash
npm install
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser. You'll be redirected to the login page at [http://localhost:3000/login](http://localhost:3000/login).

## Usage

The login page accepts a `hid` (host ID) parameter in the URL:

```
http://localhost:3000/login?hid=YOUR_SESSION_ID
```

After submitting the login form, users will be redirected to:

```
http://10.1.1.1/opennds_auth/?hid=YOUR_SESSION_ID
```

### Validation

- The `hid` parameter must be alphanumeric
- Both username and password fields are required
- Error messages are displayed inline for invalid input

## Build

To create a production build:

```bash
npm run build
npm start
```

## Technologies

- [Next.js 16](https://nextjs.org/) - React framework with App Router
- [Chakra UI](https://chakra-ui.com/) - Component library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
