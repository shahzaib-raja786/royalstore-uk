"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  ShoppingBag,
  FileText,
  Tag,
  Truck,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Activity,
  Sparkles,
  Target,
  Award,
  Zap,
  Crown,
  Rocket
} from "lucide-react";

export default function AdminOverview() {
  const [stats, setStats] = useState({
    overview: {
      totalProducts: 0,
      totalOrders: 0,
      totalUsers: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      totalCategories: 0,
      totalBlogs: 0,
      activeCoupons: 0,
      todayOrders: 0,
      monthlyRevenue: 0,
      cancellationRequests: 0,
      returnRequests: 0
    },
    orderStatus: {},
    userStats: {},
    productStats: {},
    blogStats: {},
    paymentStats: {},
    recentActivities: [],
    trends: {}
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        console.error("Failed to fetch stats:", result.error);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Products",
      value: stats.overview.totalProducts,
      icon: Package,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
      borderColor: "border-purple-200",
      change: "+12%",
      changeType: "positive",
      description: "Active products in store"
    },
    {
      title: "Total Orders",
      value: stats.overview.totalOrders,
      icon: ShoppingCart,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      change: "+8%",
      changeType: "positive",
      description: "All time orders"
    },
    {
      title: "Total Users",
      value: stats.overview.totalUsers,
      icon: Users,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      change: "+15%",
      changeType: "positive",
      description: "Registered customers"
    },
    {
      title: "Total Revenue",
      value: `$${stats.overview.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
      borderColor: "border-amber-200",
      change: "+23%",
      changeType: "positive",
      description: "Lifetime revenue"
    },
    {
      title: "Pending Orders",
      value: stats.overview.pendingOrders,
      icon: Clock,
      color: "from-yellow-500 to-amber-500",
      bgColor: "bg-gradient-to-br from-yellow-50 to-amber-50",
      borderColor: "border-yellow-200",
      change: "-5%",
      changeType: "negative",
      description: "Awaiting processing"
    },
    {
      title: "Today's Orders",
      value: stats.overview.todayOrders,
      icon: ShoppingBag,
      color: "from-red-500 to-rose-500",
      bgColor: "bg-gradient-to-br from-red-50 to-rose-50",
      borderColor: "border-red-200",
      change: "+3%",
      changeType: "positive",
      description: "Orders today"
    },
    {
      title: "Categories",
      value: stats.overview.totalCategories,
      icon: Tag,
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-gradient-to-br from-indigo-50 to-purple-50",
      borderColor: "border-indigo-200",
      change: "+2%",
      changeType: "positive",
      description: "Product categories"
    },
    {
      title: "NEWS",
      value: stats.overview.totalBlogs,
      icon: FileText,
      color: "from-teal-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-teal-50 to-cyan-50",
      borderColor: "border-teal-200",
      change: "+7%",
      changeType: "positive",
      description: "Published articles"
    },
    {
      title: "Cancellation Requests",
      value: stats.overview.cancellationRequests,
      icon: AlertCircle,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50",
      borderColor: "border-orange-200",
      change: stats.overview.cancellationRequests > 0 ? "Needs attention" : "All clear",
      changeType: stats.overview.cancellationRequests > 0 ? "negative" : "positive",
      description: "Pending review"
    },
    {
      title: "Return Requests",
      value: stats.overview.returnRequests,
      icon: Package,
      color: "from-blue-500 to-indigo-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
      borderColor: "border-blue-200",
      change: stats.overview.returnRequests > 0 ? "Needs attention" : "All clear",
      changeType: stats.overview.returnRequests > 0 ? "negative" : "positive",
      description: "Pending approval"
    }
  ];

  // Helper function to get icon for activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case "order": return ShoppingCart;
      case "product": return Package;
      case "user": return Users;
      case "blog": return FileText;
      case "coupon": return Tag;
      default: return Activity;
    }
  };

  // Helper function to get activity color
  const getActivityColor = (type) => {
    switch (type) {
      case "order": return "from-blue-500 to-cyan-500";
      case "product": return "from-purple-500 to-pink-500";
      case "user": return "from-green-500 to-emerald-500";
      case "blog": return "from-teal-500 to-cyan-500";
      case "coupon": return "from-amber-500 to-orange-500";
      default: return "from-gray-500 to-slate-500";
    }
  };

  // Helper function to format time
  const formatTime = (timeString) => {
    const time = new Date(timeString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#de5422]"></div>
          <Rocket className="w-6 h-6 text-[#de5422] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-gray-600 font-medium">Loading Dashboard...</p>
        <p className="text-sm text-gray-500">Getting your store insights ready</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-r from-[#de5422] via-orange-500 to-amber-600 rounded-2xl p-8 text-white overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl font-bold">Welcome to RoyalStore Admin</h1>
          </div>
          <p className="text-orange-100 text-lg mb-6">Manage your e-commerce store efficiently with real-time insights</p>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <Zap className="w-5 h-5 text-amber-300" />
              <span className="font-semibold">System Status: Online</span>
            </div>
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <Target className="w-5 h-5 text-amber-300" />
              <span>Monthly Revenue: ${stats.overview.monthlyRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <Award className="w-5 h-5 text-amber-300" />
              <span>Performance: Excellent</span>
            </div>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: index * 0.1,
              duration: 0.5,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{
              y: -5,
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            className={`relative ${card.bgColor} rounded-2xl p-6 border-2 ${card.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden`}
          >
            {/* Background Gradient Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  {card.changeType === "positive" ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-semibold ${card.changeType === "positive" ? "text-green-600" : "text-red-600"}`}>
                    {card.change}
                  </span>
                </div>
                <Sparkles className="w-4 h-4 text-gray-400 group-hover:text-yellow-500 transition-colors" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts and Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-6 h-6 mr-3 text-[#de5422]" />
              Revenue Overview
            </h3>
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1 rounded-full">
              <TrendingUp className="w-4 h-4 text-[#de5422]" />
              <span className="text-sm font-semibold text-[#de5422]">
                +{stats.trends.revenueGrowth?.toFixed(1) || 0}% Growth
              </span>
            </div>
          </div>

          {/* Revenue Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Today", value: stats.overview.todayRevenue || 0, color: "from-blue-500 to-cyan-500" },
              { label: "This Week", value: stats.overview.weeklyRevenue || 0, color: "from-purple-500 to-pink-500" },
              { label: "This Month", value: stats.overview.monthlyRevenue, color: "from-amber-500 to-orange-500" },
              { label: "Total", value: stats.overview.totalRevenue, color: "from-green-500 to-emerald-500" }
            ].map((item, index) => (
              <div key={item.label} className="text-center p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <p className="text-sm text-gray-600 mb-2">{item.label}</p>
                <p className={`text-lg font-bold bg-gradient-to-br ${item.color} bg-clip-text text-transparent`}>
                  ${item.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Enhanced Bar Chart */}
          <div className="space-y-6">
            <h4 className="font-bold text-gray-800 text-lg">Revenue Distribution</h4>
            <div className="space-y-4">
              {[
                { label: "Today", value: stats.overview.todayRevenue || 0, total: stats.overview.totalRevenue, color: "bg-gradient-to-r from-blue-500 to-cyan-500" },
                { label: "This Week", value: stats.overview.weeklyRevenue || 0, total: stats.overview.totalRevenue, color: "bg-gradient-to-r from-purple-500 to-pink-500" },
                { label: "This Month", value: stats.overview.monthlyRevenue, total: stats.overview.totalRevenue, color: "bg-gradient-to-r from-amber-500 to-orange-500" }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between group"
                >
                  <span className="text-sm font-medium text-gray-700 w-24">{item.label}</span>
                  <div className="flex items-center gap-4 flex-1 max-w-md">
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className={`h-3 rounded-full ${item.color} shadow-lg`}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min((item.value / Math.max(item.total, 1)) * 100, 100)}%`
                        }}
                        transition={{ delay: index * 0.2 + 0.5, duration: 1, type: "spring" }}
                      ></motion.div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-20 text-right">
                      ${item.value.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-200">
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-700">Daily Growth</p>
                <p className="text-lg font-bold text-green-800">
                  +{stats.trends.dailyGrowth?.toFixed(1) || 0}%
                </p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                <Target className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <p className="text-sm text-amber-700">Conversion Rate</p>
                <p className="text-lg font-bold text-amber-800">
                  {stats.trends.conversionRate?.toFixed(1) || 2.5}%
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Activity className="w-6 h-6 mr-3 text-[#de5422]" />
              Recent Activities
            </h3>
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1 rounded-full">
              <span className="text-sm font-semibold text-[#de5422]">
                Live Updates
              </span>
            </div>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity, index) => {
                const IconComponent = getActivityIcon(activity.type);
                const gradient = getActivityColor(activity.type);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 leading-relaxed">{activity.message}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-xs text-gray-500">{formatTime(activity.time)}</p>
                        {activity.amount && (
                          <p className="text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                            ${activity.amount.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No recent activities</p>
                <p className="text-sm text-gray-400 mt-1">Activities will appear here as they happen</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300"
      >
        <h3 className="text-xl font-bold text-gray-900 flex items-center mb-6">
          <CheckCircle className="w-6 h-6 mr-3 text-green-500" />
          System Status & Performance
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: "Database",
              status: "Connected",
              color: "from-green-500 to-emerald-500",
              icon: CheckCircle,
              description: "All systems operational"
            },
            {
              name: "API Server",
              status: "Running",
              color: "from-green-500 to-emerald-500",
              icon: Zap,
              description: "Response time: 120ms"
            },
            {
              name: "Cloudinary",
              status: "Connected",
              color: "from-green-500 to-emerald-500",
              icon: CheckCircle,
              description: "Media storage active"
            },
            {
              name: "Performance",
              status: "Excellent",
              color: "from-amber-500 to-orange-500",
              icon: Rocket,
              description: "98.7% uptime"
            }
          ].map((service, index) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.5 }}
              className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border-2 border-gray-200 hover:border-green-200 transition-all duration-300 group text-center"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${service.color} shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 text-lg">{service.name}</h4>
              <p className={`text-sm font-semibold bg-gradient-to-br ${service.color} bg-clip-text text-transparent`}>
                {service.status}
              </p>
              <p className="text-xs text-gray-500 mt-2">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}