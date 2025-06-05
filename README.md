# BudgetNaira

A comprehensive personal finance management application built with React, TypeScript, and Node.js.

## Features

### 1. Dashboard Overview
- Real-time financial summary
- Current balance display
- Monthly income and expense tracking
- Savings rate monitoring
- Visual progress indicators for budgets and savings goals

### 2. Expense Management
- Track daily expenses
- Categorize expenses
- View expense history
- Expense analytics and trends
- Monthly expense summaries

### 3. Budget Planning
- Create and manage budgets
- Set spending limits by category
- Track budget progress
- Visual budget status indicators
- Budget vs actual spending comparison

### 4. Savings Goals
- Set financial goals
- Track progress towards goals
- Monthly savings targets
- Visual progress tracking
- Goal completion estimates

### 5. Financial Calendar & Reminders
- Bill payment tracking
- Due date notifications
- Recurring payment management
- Custom financial event scheduling
- Payment history

### 6. Transaction Management
- Recent transactions list
- Transaction categorization
- Search and filter capabilities
- Transaction history
- Export functionality

### 7. User Features
- Secure authentication
- User profile management
- Currency preference (NGN)
- Data privacy and security

## Technical Stack

### Frontend
- React with TypeScript
- Redux for state management
- Tailwind CSS for styling
- React Icons for UI elements
- Date-fns for date manipulation

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- TypeScript for type safety
- RESTful API architecture

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/budgetnaira.git
```

2. Install dependencies
```bash
# Install backend dependencies
cd budgetnaira-backend
npm install

# Install frontend dependencies
cd ../budgetnaira-frontend
npm install
```

3. Set up environment variables
```bash
# Backend (.env)
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
PORT=5000

# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000/api/v1
```

4. Start the development servers
```bash
# Start backend
cd budgetnaira-backend
npm run dev

# Start frontend
cd ../budgetnaira-frontend
npm start
```

## Project Structure
# BudgetNaira
