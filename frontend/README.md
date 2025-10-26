# Opinion Poll Frontend

React frontend for the real-time opinion polling platform.

## Features

- Real-time poll display with live updates
- Create new polls with multiple options
- Vote on polls with instant results
- Like polls and see like counts
- Responsive design with modern UI
- WebSocket integration for live updates

## Tech Stack

- React 18
- Axios for API calls
- Recharts for data visualization
- CSS3 with modern features
- WebSocket for real-time updates

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000/api/ws
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)
