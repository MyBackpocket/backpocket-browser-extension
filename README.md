# Backpocket Browser Extension

Save links to your [Backpocket](https://backpocket.dev) account with a single click.

## Features

- Quick-save the current page to Backpocket
- Add tags with autocomplete from your existing tags
- Cross-browser support (Chrome, Firefox)
- Clerk authentication

## Setup

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- A Backpocket account at [backpocket.dev](https://backpocket.dev)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd backpocket-browser-extension

# Install dependencies
bun install
```

### Environment Variables

Copy the example environment file and fill in your Clerk publishable key:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_key_here
```

> **Note:** Get your Clerk publishable key from the [Clerk Dashboard](https://dashboard.clerk.com). Use the same Clerk application as the main Backpocket web app.

### Clerk Dashboard Configuration

For the extension to work with Clerk authentication:

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Configure** → **Domains**
3. Add the extension URL to allowed origins:
   - Chrome: `chrome-extension://<extension-id>`
   - Firefox: `moz-extension://<extension-id>`

You can find your extension ID after loading it in the browser (see Development section).

## Development

### Mock Auth Mode

For local development without Clerk configured, you can enable **mock auth mode**:

```env
# Add to .env.development.local
VITE_BACKPOCKET_AUTH_MODE=mock
```

This bypasses Clerk authentication entirely and uses a mock token. Your backend must also be in mock mode (`BACKPOCKET_AUTH_MODE=mock`) for this to work.

**What it does:**

- Skips Clerk sign-in, shows the save form immediately
- Uses `mock-token` as the auth token (backend recognizes this in mock mode)
- Shows a 🧪 badge instead of the user avatar

**Security:** Only use this for local development. The backend will reject `mock-token` unless it's also running in mock mode.

### Start dev server (Chrome)

```bash
bun run dev
```

### Start dev server (Firefox)

```bash
bun run dev:firefox
```

### Load the extension

**Chrome/Chromium:**

1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `.output/chrome-mv3` folder

**Firefox:**

1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select any file in the `.output/firefox-mv2` folder

## Production Build

```bash
# Build for all browsers
bun run build

# Build for specific browser
bun run build        # Chrome (default)
bun run build:firefox

# Create zip for store submission
bun run zip
bun run zip:firefox
```

## Project Structure

```
backpocket-browser-extension/
├── entrypoints/
│   ├── popup/          # Extension popup UI
│   │   ├── App.tsx     # Main React app
│   │   ├── main.tsx    # Entry point
│   │   └── style.css   # Styles
│   └── background.ts   # Service worker
├── components/
│   ├── SaveForm.tsx    # Save link form
│   └── TagInput.tsx    # Tag autocomplete input
├── lib/
│   ├── api.ts          # Backpocket API client
│   ├── auth.tsx        # Auth provider (Clerk or mock mode)
│   └── types.ts        # TypeScript types
├── public/
│   └── icon/           # Extension icons
├── wxt.config.ts       # WXT configuration
└── package.json
```

## Tech Stack

- [WXT](https://wxt.dev/) - Next-gen web extension framework
- [React](https://react.dev/) - UI framework
- [Clerk](https://clerk.com/) - Authentication
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Bun](https://bun.sh/) - JavaScript runtime & package manager

## License

MIT
