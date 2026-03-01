# OpenNDS Login Page

A simple Next.js login page with Chakra UI for OpenNDS authentication.

## Features

- Clean, responsive login interface built with Chakra UI
- Username and password authentication form
- URL parameter handling for OpenNDS `hid` (session ID)
- Automatic redirect to OpenNDS authentication endpoint after successful login

## Getting Started

First, install dependencies:

```bash
npm install
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

The login page accepts a `hid` (host ID) parameter in the URL:

```
http://localhost:3000?hid=YOUR_SESSION_ID
```

After submitting the login form, users will be redirected to:

```
http://10.1.1.1/opennds_auth/?hid=YOUR_SESSION_ID
```

## Build

To create a production build:

```bash
npm run build
npm start
```

## Technologies

- [Next.js 16](https://nextjs.org/) - React framework
- [Chakra UI](https://chakra-ui.com/) - Component library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
