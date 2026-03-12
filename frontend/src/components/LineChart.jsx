import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import EmptyState from './EmptyState';

function LineChart({ data, selectedFeature }) {
  // If no feature selected, show message
  if (!selectedFeature) {
    return (
      <EmptyState 
        title="Select a feature to view trends" 
        message="Click on a bar in the chart above to see the timeline"
        icon="chart"
      />
    );
  }

  // If no data available for selected feature
  if (!data || data.length === 0) {
    return (
      <EmptyState 
        title={`No data available for ${selectedFeature}`} 
        message="Try selecting a different date range or feature"
        icon="search"
      />
    );
  }

  // Format data for Recharts
  const chartData = data.map(item => ({
    day: item.day,
    clicks: item.clicks || item.count || 0
  }));

  // Format date for display (shorter format)
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart 
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="day" 
          tickFormatter={formatDate}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          label={{ value: 'Click Count', angle: -90, position: 'insideLeft' }}
          allowDecimals={false}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
          labelFormatter={formatDate}
          formatter={(value) => [value, 'Clicks']}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="clicks" 
          name="Clicks"
          stroke="#6366f1" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
          animationDuration={500}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

export default LineChart;
