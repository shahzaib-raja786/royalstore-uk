# RoyalStore - Furniture E-commerce Platform

![Next.js](https://img.shields.io/badge/next.js-16.1.0-black)
![React](https://img.shields.io/badge/react-19.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
RoyalStore is a modern, full-featured e-commerce platform built with Next.js 16, designed specifically for furniture retailers. It provides a seamless shopping experience with advanced admin capabilities for managing products, orders, and content.
## 🛋️ Features

### Customer-Facing Features
- **Product Catalog**: Browse furniture by categories and subcategories
- **Advanced Search**: Find products quickly with search functionality
- **Product Customization**: Dynamic product options (colors, sizes, materials)
- **Shopping Cart**: Add, remove, and manage items before checkout
- **User Authentication**: Secure signup and login with JWT
- **Order Management**: Track order history and status
- **Responsive Design**: Fully responsive for mobile, tablet, and desktop

### Admin Features
- **Dashboard Overview**: Analytics and sales metrics
- **Product Management**: Create, edit, and delete products with customizable options
- **Category Management**: Organize products into categories and subcategories
- **Order Management**: View, update, and manage customer orders
- **Content Management**: 
  - Hero section management
  - News/blog posts
  - Ticker notifications
  - Company profile settings
- **Coupon System**: Create and manage discount coupons
- **Delivery Management**: Configure delivery routes and options
- **User Management**: Admin user management
- **Return & Cancellation Requests**: Handle customer requests

## 🚀 Tech Stack

- **Frontend**: Next.js 16 with App Router, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB with Mongoose
- **Authentication**: JWT, bcryptjs
- **UI Components**: Framer Motion, Lucide React, React Hot Toast
- **Rich Text Editor**: Tiptap Editor with Cloudinary integration
- **Image Management**: Cloudinary for image storage and optimization
- **Email Service**: Resend/Nodemailer for transactional emails
- **Payments**: Stripe integration ready
- **State Management**: React Hooks and Context API

## 📁 Project Structure

```
royalstore/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/             # API routes
│   │   ├── admin/           # Admin dashboard
│   │   └── ...              # Public pages (product listing, cart, etc.)
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions and services
│   └── models/              # Mongoose models
├── public/                  # Static assets
└── ...
```

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd royalstore
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Copy `.env.sample` to `.env` and configure the required variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RESEND_API_KEY=your_resend_api_key
# ... other required variables
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔄 Updating Dependencies

To update all dependencies to their latest versions compatible with Next.js 16.1.0:

### On Windows:
```bash
update-dependencies.bat
```

### On macOS/Linux:
```bash
chmod +x update-dependencies.sh
./update-dependencies.sh
```
## 🚢 Deployment

Refer to [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions on Vercel.

## 📖 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)
- [Cloudinary](https://cloudinary.com/)
- [Resend](https://resend.com/)
- [Tiptap Editor](https://tiptap.dev/)

## 📞 Support

For support, email [support@furniturelogistics.co.uk](mailto:support@furniturelogistics.co.uk) or open an issue in the repository.