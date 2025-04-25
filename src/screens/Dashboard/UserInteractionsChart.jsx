import React from "react";
import { Card } from "react-bootstrap";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const UserInteractionsChart = ({ customData, title = "User Interactions", height = 300 }) => {
  // Default chart data if not provided
  const defaultChartData = [
    { name: "Jan", uv: 1500 }, { name: "Feb", uv: 1800 }, { name: "Mar", uv: 2200 },
    { name: "Apr", uv: 2800 }, { name: "May", uv: 3500 }, { name: "Jun", uv: 4500 },
    { name: "Jul", uv: 5000 }, { name: "Aug", uv: 3500 }, { name: "Sep", uv: 2500 },
    { name: "Oct", uv: 1800 }, { name: "Nov", uv: 1500 }, { name: "Dec", uv: 1500 }
  ];

  // Use the provided data or default data
  const chartData = customData || defaultChartData;

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
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="colorInactive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="colorStaff" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff8042" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            {chartData[0] && chartData[0].total_users !== undefined ? (
              <>
                <Area 
                  type="monotone" 
                  dataKey="total_users" 
                  name="Total Users"
                  stroke="#8884d8" 
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="active_users" 
                  name="Active Users"
                  stroke="#82ca9d" 
                  fillOpacity={1} 
                  fill="url(#colorActive)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="inactive_users" 
                  name="Inactive Users"
                  stroke="#ffc658" 
                  fillOpacity={1} 
                  fill="url(#colorInactive)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="staff_users" 
                  name="Staff Users"
                  stroke="#ff8042" 
                  fillOpacity={1} 
                  fill="url(#colorStaff)" 
                />
              </>
            ) : (
              <Area 
                type="monotone" 
                dataKey="uv" 
                stroke="#8884d8" 
                fillOpacity={1} 
                fill="url(#colorTotal)" 
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
};

export default UserInteractionsChart; 