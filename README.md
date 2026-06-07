
# AdminPro - Ecommerce Admin Dashboard

A modern, production-ready admin dashboard built with React, Vite, Ant Design, Tailwind CSS, and Laravel backend API.

## 🚀 Features

### Core Features
- **Full Authentication System** - Login/Logout with JWT token management
- **Dark/Light Mode Support** - Theme toggle with localStorage persistence
- **Responsive Design** - Mobile-friendly layout with sidebar navigation
- **Real-time Search** - Global search across all modules
- **Export to CSV** - Export data from all modules

### Modules

#### Dashboard
- Key metrics overview (Revenue, Orders, Customers, Products)
- Sales charts and analytics
- Recent orders table
- Top selling products
- Revenue by channel breakdown
- Low stock alerts
- Export dashboard report

#### Category Management
- List, create, edit, delete categories
- Image upload support
- Category status toggle (Active/Hidden)
- Search and filter by status
- View products in category
- Export categories to CSV

#### Product Management
- Complete product CRUD operations
- Image upload for products
- Stock management with low stock indicators
- Filter by category and search by name/SKU
- Product status management
- Export products to CSV

#### Order Management
- View all customer orders
- Update order status (Pending, Processing, Shipped, Delivered, Cancelled)
- Update payment status (Pending, Paid, Failed, Refunded)
- Order details drawer with items breakdown
- Filter by order status
- Export orders to CSV

#### Customer Management
- Customer list with pagination
- View customer details and order history
- Toggle customer active/inactive status
- Add new customers with password
- Search by name or email
- Export customers to CSV

#### Profile Settings
- Update profile information
- Change password functionality

### Additional Features
- **Global Search** - Search across categories, products, orders, customers
- **Notifications** - Real-time notification system
- **Responsive Sidebar** - Collapsible navigation
- **Loading Skeletons** - Smooth loading experience
- **Error Boundaries** - Graceful error handling

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI Library
- **Vite** - Build tool and development server
- **Redux Toolkit** - State management
- **React Router DOM** - Routing
- **Ant Design** - UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client

### Backend (Laravel)
- **Laravel 12** - PHP Framework
- **MySQL** - Database
- **Sanctum** - API authentication
- **Intervention Image** - Image processing

## 📁 Project Structure

```
ecommerceStore_admin/
├── src/
│   ├── api/
│   │   └── axios.js              # API configuration
│   ├── components/
│   │   ├── Common/
│   │   │   ├── ErrorBoundary.jsx # Error handling
│   │   │   └── LoadingSpinner.jsx # Loading states
│   │   └── Layout/
│   │       ├── AdminLayout.jsx   # Main layout wrapper
│   │       ├── AdminHeader.jsx   # Top navigation
│   │       └── AdminSidebar.jsx  # Side navigation
│   ├── pages/
│   │   ├── Login.jsx              # Authentication
│   │   ├── Dashboard.jsx          # Dashboard view
│   │   ├── Categories/            # Category management
│   │   ├── Products/              # Product management
│   │   ├── Orders/                # Order management
│   │   ├── Customers/             # Customer management
│   │   └── Profile.jsx            # User profile
│   ├── store/
│   │   ├── index.js               # Store configuration
│   │   └── slices/                # Redux slices
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles
├── .env                           # Environment variables
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Laravel backend running (see backend setup)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-repo/ecommerceStore_admin.git
cd ecommerceStore_admin
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:8000/api
```

4. **Start the development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
```

## 🔧 Backend Setup

1. **Clone the Laravel backend**
```bash
git clone https://github.com/your-repo/ecommerceStore.git
cd ecommerceStore
```

2. **Install PHP dependencies**
```bash
composer install
```

3. **Configure database**
Update `.env` file with your database credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ecommerce_store_db
DB_USERNAME=root
DB_PASSWORD=
```

4. **Run migrations and seeders**
```bash
php artisan migrate --seed
```

5. **Start the backend server**
```bash
php artisan serve
```

## 🔑 Default Login Credentials

- **Email:** admin@example.com
- **Password:** password

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🎨 Design System

### Colors
- **Primary:** `#0057c2`
- **Success:** `#266d00`
- **Warning:** `#7d5400`
- **Error:** `#ba1a1a`
- **Surface:** `#faf9f9`
- **On Surface:** `#1b1c1c`

### Typography
- **Primary Font:** Inter
- **Monospace Font:** JetBrains Mono

### Spacing
- Based on 4px grid system
- Standard padding: 16px
- Section gaps: 24px

## 📱 Responsive Breakpoints

- **Desktop:** > 1200px (12-column grid)
- **Tablet:** 768px - 1199px (8-column grid)
- **Mobile:** < 768px (Single column)

## 🔒 API Endpoints

### Public Routes
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/categories` - List categories
- `GET /api/products` - List products

### Protected Routes (Requires Auth)
- `POST /api/logout` - Logout
- `GET /api/profile` - Get profile
- `PUT /api/profile` - Update profile
- `PUT /api/change-password` - Change password
- `GET /api/my-orders` - User orders

### Admin Routes
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/customers` - List customers
- `PUT /api/customers/{id}/status` - Update customer status
- `DELETE /api/customers/{id}` - Delete customer
- `GET /api/orders` - List orders
- `PUT /api/orders/{id}/status` - Update order status
- `PUT /api/products/{id}/stock` - Update product stock

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Error**
   - Ensure backend is running on `http://localhost:8000`
   - Check `VITE_API_URL` in `.env` file
   - Verify CORS configuration in Laravel

2. **Authentication Issues**
   - Clear localStorage and login again
   - Check token expiration in Laravel config

3. **Image Upload Issues**
   - Run `php artisan storage:link` in backend
   - Check file permissions in `storage` directory

## 📄 License

This project is proprietary and confidential.

## 👥 Support

For support, email support@adminpro.com or visit our documentation.

## 🙏 Acknowledgments

- Ant Design for the amazing UI components
- Tailwind CSS for utility-first CSS
- Laravel community for the robust backend framework

---

**Built with ❤️ by AdminPro Team**
