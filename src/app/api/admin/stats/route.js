import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Category from "@/models/Category";
import News from "@/models/News";
import Coupon from "@/models/Coupon";
import { verifyAdminAuth } from "@/lib/adminAuth";

// 📊 Get All Dashboard Statistics
export async function GET(req) {
  try {
    await connectDB();

    // Verify admin authentication
    const auth = await verifyAdminAuth();
    if (!auth.authenticated) {
      return Response.json(
        { success: false, error: auth.error || "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch all data in parallel for better performance
    const [products, orders, users, categories, news, coupons] = await Promise.all([
      Product.find({}).populate("category"),
      Order.find({}).populate("user"),
      User.find({}),
      Category.find({}),
      News.find({}),
      Coupon.find({})
    ]);

    // Calculate statistics
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalUsers = users.length;
    const totalCategories = categories.length;
    const totalBlogs = news.length;
    const activeCoupons = coupons.filter(coupon => coupon.isActive).length;

    // Revenue calculations
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Order status counts
    const pendingOrders = orders.filter(order => order.status === "pending").length;
    const processingOrders = orders.filter(order => order.status === "processing").length;
    const shippedOrders = orders.filter(order => order.status === "shipped").length;
    const deliveredOrders = orders.filter(order => order.status === "delivered").length;
    const cancelledOrders = orders.filter(order => order.status === "cancelled").length;

    // Today's data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(order =>
      new Date(order.createdAt) >= today
    ).length;

    const todayRevenue = orders
      .filter(order => new Date(order.createdAt) >= today)
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // This month's data
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    }).length;

    const monthlyRevenue = orders
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      })
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Last 7 days data for trends
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const weeklyOrders = orders.filter(order =>
      new Date(order.createdAt) >= last7Days
    ).length;

    const weeklyRevenue = orders
      .filter(order => new Date(order.createdAt) >= last7Days)
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Recent activities (last 10 activities)
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(order => ({
        type: "order",
        message: `New order #${order._id.toString().slice(-4)} received`,
        time: order.createdAt,
        amount: order.totalPrice
      }));

    const recentProducts = products
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
      .map(product => ({
        type: "product",
        message: `Product '${product.name}' added`,
        time: product.createdAt
      }));

    const recentNews = news
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 2)
      .map(item => ({
        type: "news",
        message: `News post '${item.title}' published`,
        time: item.createdAt
      }));

    // Combine and sort all activities
    const recentActivities = [...recentOrders, ...recentProducts, ...recentNews]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10);

    // User role distribution
    const adminUsers = users.filter(user => user.role === "admin").length;
    const customerUsers = users.filter(user => user.role === "customer").length;

    // Product category distribution
    const categoryStats = categories.map(category => {
      const productCount = products.filter(product =>
        product.category && product.category._id.toString() === category._id.toString()
      ).length;
      return {
        name: category.name,
        count: productCount
      };
    });

    // Payment method distribution
    const paymentStats = orders.reduce((acc, order) => {
      const method = order.paymentMethod || 'cod';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    // Blog status distribution
    const publishedBlogs = news.filter(item => item.status === "published").length;
    const draftBlogs = news.filter(item => item.status === "draft").length;

    // Return comprehensive stats
    const stats = {
      overview: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue,
        totalCategories,
        totalBlogs,
        activeCoupons,
        todayOrders,
        todayRevenue,
        monthlyOrders,
        monthlyRevenue,
        weeklyOrders,
        weeklyRevenue
      },
      orderStatus: {
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders
      },
      userStats: {
        total: totalUsers,
        admins: adminUsers,
        customers: customerUsers
      },
      productStats: {
        total: totalProducts,
        categories: categoryStats
      },
      blogStats: {
        total: totalBlogs,
        published: publishedBlogs,
        draft: draftBlogs
      },
      paymentStats,
      recentActivities,
      trends: {
        dailyGrowth: todayOrders > 0 ? ((todayOrders / Math.max(weeklyOrders / 7, 1)) - 1) * 100 : 0,
        revenueGrowth: todayRevenue > 0 ? ((todayRevenue / Math.max(weeklyRevenue / 7, 1)) - 1) * 100 : 0
      }
    };

    return Response.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
