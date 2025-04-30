import React, { useState, useEffect } from "react";
import { Card } from "react-bootstrap";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import API from "../../api/endpoint";

const VoterCardChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVoterCardStats = async () => {
      try {
        const response = await API.get(`${API.ENDPOINTS.VOTER_CARDS}/?paginate=1`);
        console.log("Voter Card Stats:", response);

        // Process the data for the chart
        const processedData = response.results.reduce((acc, card) => {
          const date = new Date(card.created_at);
          const month = date.toLocaleString('default', { month: 'short' });
          
          const existingMonth = acc.find(item => item.name === month);
          if (existingMonth) {
            existingMonth.total++;
            if (card.status === 'pending') existingMonth.pending++;
            if (card.status === 'approved') existingMonth.approved++;
          } else {
            acc.push({
              name: month,
              total: 1,
              pending: card.status === 'pending' ? 1 : 0,
              approved: card.status === 'approved' ? 1 : 0
            });
          }
          return acc;
        }, []);

        setChartData(processedData);
      } catch (error) {
        console.error("Error fetching voter card stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVoterCardStats();
  }, []);

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h5 className="fw-bold">Voter Card Requests</h5>
          <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        <h5 className="fw-bold">Voter Card Requests</h5>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" name="Total Requests" fill="#8884d8" />
            <Bar dataKey="pending" name="Pending" fill="#ffc658" />
            <Bar dataKey="approved" name="Approved" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
};

export default VoterCardChart; 