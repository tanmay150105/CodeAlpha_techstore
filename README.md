# CodeAlpha TechStore E-commerce

A modern e-commerce platform for computer components built with Node.js and MySQL.
**CodeAlpha Internship Project**

## Installation

1. Clone the repository with submodules:
```bash
git clone --recurse-submodules https://github.com/tanmay150105/CodeAlpha_techstore.git
```

2. If you already cloned the project, initialize submodules:
```bash
git submodule init
git submodule update
```

## Features
- User authentication
- Product catalog with categories
- Shopping cart functionality
- Order processing and history
- Responsive design

## Tech Stack
- **Frontend:** Vanilla JavaScript, HTML5, CSS3 (in docs/)
- Backend: Node.js, Express
- Database: MySQL
- Authentication: JWT

## Dependencies
- Global libraries: [global_libs](https://github.com/tanmay150105/global_libs)
- Shared utilities: [global_shared-utils](https://github.com/tanmay150105/global_shared-utils)

## Project Structure
```
techstore/
├── docs/              # Client-side code
│   ├── index.html     # Main page
│   ├── products.html  # Products listing
│   ├── cart.html     # Shopping cart
│   ├── script.js     # Frontend logic
│   ├── api.js        # API integration
│   └── styles.css    # Styling
└── backend/          # Server-side code
    ├── server.mysql.js    # Express server
    ├── controllers/  # Business logic
    ├── models/      # Database models
    ├── routes/      # API endpoints
    └── middleware/  # Auth middleware
```

## Setup

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- PNPM 8.0+

### Installation
1. Clone repository with submodules:
```bash
git clone --recurse-submodules https://github.com/tanmay150105/CodeAlpha_techstore.git
cd CodeAlpha_techstore
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up MySQL database:
```bash
# Create database and import schema
mysql -u root -p < database-setup.sql
```

4. Configure environment:
```bash
# Copy environment template
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials
```

5. Start the application:
```bash
# Development mode
pnpm dev

# Production mode  
pnpm start
```

The application will be available at `http://localhost:5000`

## Environment Variables
Copy `.env.example` to `.env` and update:
- `PORT` - Server port (default: 5000)
- `MYSQL_HOST` - Database host
- `MYSQL_USER` - Database user
- `MYSQL_PASSWORD` - Database password
- `MYSQL_DATABASE` - Database name
- `JWT_SECRET` - JWT signing key

## License
MIT