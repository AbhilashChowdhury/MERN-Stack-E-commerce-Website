import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { useGetUsersQuery } from "../../redux/api/usersApiSlice";
import {
  useGetTotalOrdersQuery,
  useGetOrdersQuery,
} from "../../redux/api/orderApiSlice";
import Loader from "../../components/Loader";
import { NavLink } from "react-router-dom";

const AdminDashboard = () => {
  const { data: customers, isLoading: customersLoading } = useGetUsersQuery();
  const { data: totalOrdersData, isLoading: totalOrdersLoading } = useGetTotalOrdersQuery();
  const { data: allOrders, isLoading: allOrdersLoading } = useGetOrdersQuery();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [chartState, setChartState] = useState({
    options: {
      chart: {
        type: "bar",
        stacked: false,
        foreColor: "#ffffff",
        background: "#000000",
        fontFamily: "'Inter', sans-serif",
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false,
          },
        },
        offsetX: 0,
        offsetY: 0,
      },
      colors: ["#00E396", "#FF4560", "#008FFB", "#FEB019"], // green, red, blue, yellow
      dataLabels: { enabled: false },
      stroke: { width: 1, colors: ["#fff"] },
      title: {
        text: "Order & User Counts Over Time",
        align: "left",
        offsetY: 20,
        style: {
          color: "#fff",
          fontFamily: "'Inter', sans-serif",
          fontWeight: "700",
          fontSize: "1.5rem",
        },
      },
      plotOptions: {
        bar: {
          columnWidth: "35%",
          barGap: 0,
          barPadding: 2,
          distributed: false,
        },
      },
      xaxis: {
        categories: [],
        type: "category",
        title: { text: "Date", style: { color: "#fff", fontFamily: "'Inter', sans-serif" } },
        labels: { style: { colors: "#fff", fontFamily: "'Inter', sans-serif" } },
        axisBorder: { show: true, color: "#fff" },
        axisTicks: { show: true, color: "#fff" },
      },
      yaxis: {
        title: { text: "Count", style: { color: "#fff", fontFamily: "'Inter', sans-serif" } },
        labels: {
          style: { colors: "#fff", fontFamily: "'Inter', sans-serif" },
          formatter: (val) => val.toLocaleString(undefined, { maximumFractionDigits: 0 }),
        },
        min: 0,
      },
      tooltip: {
        theme: "dark",
        fillSeriesColor: false,
        marker: { show: true },
        style: { color: "#fff", fontFamily: "'Inter', sans-serif" },
        custom: ({ series, seriesIndex, dataPointIndex, w }) => {
          const val = series[seriesIndex][dataPointIndex];
          const name = w.globals.seriesNames[seriesIndex];
          return `<div style="padding:5px; color:#fff; background:#000; border-radius:3px; font-family: 'Inter', sans-serif;">
                    <strong>${name}:</strong> ${val}
                  </div>`;
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        labels: { colors: "#fff", fontFamily: "'Inter', sans-serif" },
      },
      grid: {
        borderColor: "#444",
      },
    },
    series: [
      { name: "Paid Orders", data: [] },
      { name: "Unpaid Orders", data: [] },
      { name: "Total Orders", data: [] },
      { name: "Users", data: [] },
    ],
  });

  useEffect(() => {
    if (
      allOrders && Array.isArray(allOrders) && allOrders.length > 0 &&
      customers && Array.isArray(customers)
    ) {
      const orderCountsByDate = {};
      const usersByDate = {};

      // Aggregate paid/unpaid and total orders count by date
      allOrders.forEach(order => {
        if (!order.createdAt) return;
        const date = new Date(order.createdAt).toISOString().slice(0, 10);

        if (!orderCountsByDate[date]) {
          orderCountsByDate[date] = { paidCount: 0, unpaidCount: 0, totalCount: 0 };
        }

        if (order.isPaid) {
          orderCountsByDate[date].paidCount += 1;
        } else {
          orderCountsByDate[date].unpaidCount += 1;
        }
        orderCountsByDate[date].totalCount += 1;
      });

      // Aggregate users by registration date
      customers.forEach(user => {
        if (!user.createdAt) return;
        const date = new Date(user.createdAt).toISOString().slice(0, 10);
        usersByDate[date] = (usersByDate[date] || 0) + 1;
      });

      // Combine all dates from orders and users
      const allDatesSet = new Set([
        ...Object.keys(orderCountsByDate),
        ...Object.keys(usersByDate),
      ]);
      const sortedDates = Array.from(allDatesSet).sort();

      // Map data arrays for each series
      const paidOrdersData = sortedDates.map(date => orderCountsByDate[date]?.paidCount || 0);
      const unpaidOrdersData = sortedDates.map(date => orderCountsByDate[date]?.unpaidCount || 0);
      const totalOrdersDataArr = sortedDates.map(date => orderCountsByDate[date]?.totalCount || 0);
      const usersData = sortedDates.map(date => usersByDate[date] || 0);

      setChartState(prev => ({
        ...prev,
        options: {
          ...prev.options,
          xaxis: {
            ...prev.options.xaxis,
            categories: sortedDates,
          },
        },
        series: [
          { name: "Paid Orders", data: paidOrdersData },
          { name: "Unpaid Orders", data: unpaidOrdersData },
          { name: "Total Orders", data: totalOrdersDataArr },
          { name: "Users", data: usersData },
        ],
      }));
    }
  }, [allOrders, customers]);

  const totalSalesAmount = allOrders
    ?.filter(order => order.isPaid)
    .reduce((acc, order) => acc + (order.totalPrice || 0), 0) ?? 0;

  const totalDueSalesAmount = allOrders
    ?.filter(order => !order.isPaid)
    .reduce((acc, order) => acc + (order.totalPrice || 0), 0) ?? 0;

  const totalOrdersCount = totalOrdersData?.totalOrders ?? allOrders?.length ?? 0;

  const ordersLoading = totalOrdersLoading || allOrdersLoading;

  return (
    <div className="flex flex-row-reverse min-h-screen bg-black text-gray-100 font-sans">
      {/* Sidebar */}
      <aside
        className={`transition-width duration-300 bg-gray-900 ${
          sidebarOpen ? "w-64" : "w-16"
        } flex flex-col shadow-lg`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {sidebarOpen && (
            <h2 className="text-xl font-bold text-white select-none">Admin Menu</h2>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-pink-500 hover:text-pink-600 focus:outline-none"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        <nav className="flex flex-col mt-4 space-y-1 px-2">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-700 ${
                isActive ? "bg-pink-600 text-black" : "text-gray-300"
              }`
            }
            title="Dashboard"
          >
            {sidebarOpen ? "Dashboard" : "🏠"}
          </NavLink>

          <NavLink
            to="/admin/categorylist"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-700 ${
                isActive ? "bg-pink-600 text-black" : "text-gray-300"
              }`
            }
            title="Create Category"
          >
            {sidebarOpen ? "Create Category" : "📂"}
          </NavLink>

          <NavLink
            to="/admin/productlist"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-700 ${
                isActive ? "bg-pink-600 text-black" : "text-gray-300"
              }`
            }
            title="Create Product"
          >
            {sidebarOpen ? "Create Product" : "🛒"}
          </NavLink>

          <NavLink
            to="/admin/allproductslist"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-700 ${
                isActive ? "bg-pink-600 text-black" : "text-gray-300"
              }`
            }
            title="All Products"
          >
            {sidebarOpen ? "All Products" : "📦"}
          </NavLink>

          <NavLink
            to="/admin/userlist"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-700 ${
                isActive ? "bg-pink-600 text-black" : "text-gray-300"
              }`
            }
            title="Manage Users"
          >
            {sidebarOpen ? "Manage Users" : "👥"}
          </NavLink>

          <NavLink
            to="/admin/orderlist"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-700 ${
                isActive ? "bg-pink-600 text-black" : "text-gray-300"
              }`
            }
            title="Manage Orders"
          >
            {sidebarOpen ? "Manage Orders" : "📋"}
          </NavLink>

          <NavLink
            to="/admin/add-discounts"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-700 ${
                isActive ? "bg-pink-600 text-black" : "text-gray-300"
              }`
            }
            title="Add Coupons & Student Discount"
          >
            {sidebarOpen ? "Add Coupons & Student Discount" : "🎁"}
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <section className="flex-1 p-8 overflow-auto max-w-7xl mx-auto">
        {/* Heading */}
        <h1 className="text-3xl font-bold mb-6 text-white text-left">
          Dashboard
        </h1>

        {/* Dashboard Stats */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* First row: Paid and Due Payment Sales */}
          <div className="flex justify-around space-x-8">
            {/* Sales (Paid Orders) Card */}
            <div className="rounded-lg bg-[#101011] p-6 w-[20rem] shadow-lg">
              <div className="font-bold rounded-full w-[3rem] bg-pink-600 text-center p-3">$</div>
              <p className="mt-5 text-white">Sales (Paid Orders)</p>
              <h1 className="text-xl font-bold text-white">
                {ordersLoading ? <Loader /> : `৳ ${totalSalesAmount.toFixed(2)}`}
              </h1>
            </div>

            {/* Sales (Due Payment Orders) Card */}
            <div className="rounded-lg bg-[#101011] p-6 w-[20rem] shadow-lg">
              <div className="font-bold rounded-full w-[3rem] bg-red-600 text-center p-3">$</div>
              <p className="mt-5 text-white">Sales (Unpaid Orders)</p>
              <h1 className="text-xl font-bold text-white">
                {ordersLoading ? <Loader /> : `৳ ${totalDueSalesAmount.toFixed(2)}`}
              </h1>
            </div>
          </div>

          {/* Second row: Customers and All Orders with lighter blue hover animation */}
          <div className="flex justify-around space-x-8">
            {/* Customers Card */}
            <NavLink
              to="/admin/userlist"
              className="group rounded-lg bg-[#101011] p-6 w-[20rem] shadow-lg cursor-pointer 
                         hover:bg-[#0e1f3c] hover:scale-105 transform transition duration-300 ease-in-out"
              title="View Customers"
            >
              <div className="font-bold rounded-full w-[3rem] bg-pink-600 text-center p-3 
                              transition-colors duration-300 ease-in-out group-hover:text-blue-300">
                👥
              </div>
              <p className="mt-5 text-white group-hover:text-blue-300 transition-colors duration-300 ease-in-out">
                Customers
              </p>
              <h1 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300 ease-in-out">
                {customersLoading ? <Loader /> : customers?.length ?? 0}
              </h1>
            </NavLink>

            {/* All Orders Card */}
            <NavLink
              to="/admin/orderlist"
              className="group rounded-lg bg-[#101011] p-6 w-[20rem] shadow-lg cursor-pointer 
                         hover:bg-[#0e1f3c] hover:scale-105 transform transition duration-300 ease-in-out"
              title="View All Orders"
            >
              <div className="font-bold rounded-full w-[3rem] bg-pink-600 text-center p-3 
                              transition-colors duration-300 ease-in-out group-hover:text-blue-300">
                📦
              </div>
              <p className="mt-5 text-white group-hover:text-blue-300 transition-colors duration-300 ease-in-out">
                All Orders
              </p>
              <h1 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300 ease-in-out">
                {ordersLoading ? <Loader /> : totalOrdersCount}
              </h1>
            </NavLink>
          </div>
        </div>

        {/* Chart container with symmetrical black background and padding */}
        <div className="p-8 pb-12 bg-black rounded-lg shadow-lg max-w-7xl mx-auto">
          <Chart
            options={{
              ...chartState.options,
              chart: {
                ...chartState.options.chart,
                background: "#000000",
                offsetX: 0,
                offsetY: 0,
              },
            }}
            series={chartState.series}
            type="bar"
            width="100%"
            height={500}
          />
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
