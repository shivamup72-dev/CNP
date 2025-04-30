import React from "react";
import { Card } from "react-bootstrap";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const UserInteractionsChart = ({ customData, title = "User Interactions", height = 300 }) => {
  // Default chart data if not provided
  const defaultChartData = [
    { name: "Jan", total_users: 1500, active_users: 1000, inactive_users: 500, staff_users: 200 },
    { name: "Feb", total_users: 1800, active_users: 1200, inactive_users: 600, staff_users: 250 },
    { name: "Mar", total_users: 2200, active_users: 1500, inactive_users: 700, staff_users: 300 },
    { name: "Apr", total_users: 2800, active_users: 1800, inactive_users: 1000, staff_users: 350 },
    { name: "May", total_users: 3500, active_users: 2200, inactive_users: 1300, staff_users: 400 },
    { name: "Jun", total_users: 4500, active_users: 2800, inactive_users: 1700, staff_users: 450 },
    { name: "Jul", total_users: 5000, active_users: 3200, inactive_users: 1800, staff_users: 500 },
    { name: "Aug", total_users: 3500, active_users: 2200, inactive_users: 1300, staff_users: 400 },
    { name: "Sep", total_users: 2500, active_users: 1500, inactive_users: 1000, staff_users: 350 },
    { name: "Oct", total_users: 1800, active_users: 1200, inactive_users: 600, staff_users: 250 },
    { name: "Nov", total_users: 1500, active_users: 1000, inactive_users: 500, staff_users: 200 },
    { name: "Dec", total_users: 1500, active_users: 1000, inactive_users: 500, staff_users: 200 }
  ];

  // Use the provided data or default data
  const chartData = customData && customData.length > 0 ? customData : defaultChartData;

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        <h5 className="fw-bold">{title}</h5>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9c27b0" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#673ab7" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="colorInactive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3f51b5" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="colorStaff" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="total_users" 
              name="Total Users"
              stroke="#9c27b0" 
              fillOpacity={1} 
              fill="url(#colorTotal)" 
            />
            <Area 
              type="monotone" 
              dataKey="active_users" 
              name="Active Users"
              stroke="#673ab7" 
              fillOpacity={1} 
              fill="url(#colorActive)" 
            />
            <Area 
              type="monotone" 
              dataKey="inactive_users" 
              name="Inactive Users"
              stroke="#3f51b5" 
              fillOpacity={1} 
              fill="url(#colorInactive)" 
            />
            <Area 
              type="monotone" 
              dataKey="staff_users" 
              name="Staff Users"
              stroke="#2196f3" 
              fillOpacity={1} 
              fill="url(#colorStaff)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
};

export default UserInteractionsChart; 