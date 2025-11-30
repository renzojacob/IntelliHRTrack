# Think Web Frontend

React + TypeScript + Tailwind CSS frontend for Think Web Employee Management System.

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Create environment file:**
```bash
cp .env.example .env
# Edit .env with your API URL
```

3. **Run development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   ├── layouts/         # Layout components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── store/           # State management (Zustand)
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── package.json
└── vite.config.ts
```

## Features

- ✅ Authentication (JWT)
- ✅ Role-based routing (Admin/Employee)
- ✅ Attendance check-in/out with camera
- ✅ Dashboard with statistics
- ✅ Responsive design with Tailwind CSS
- ✅ Dark mode support













