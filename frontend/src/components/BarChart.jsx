import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { trackFeature } from '../utils/api';
import EmptyState from './EmptyState';

function BarChart({ data, onBarClick }) {
  const [activeIndex, setActiveIndex] = React.useState(null);

  // Handle bar click
  const handleBarClick = async (data, index) => {
    try {
      // Track the bar chart click
      await trackFeature('bar_chart_click');
      
      // Set active bar
      setActiveIndex(index);
      
      // Notify parent component to update line chart
      if (onBarClick && data.feature_name) {
        onBarClick(data.feature_name);
      }
    } catch (error) {
      console.error('Failed to track bar click:', error);
    }
  };

  // Format data for Recharts (use 'total' as the value key)
  const chartData = data.map(item => ({
    feature_name: item.feature_name,
    total: item.total || item.count || 0
  }));

  // Colors for bars
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (!chartData || chartData.length === 0) {
    return (
      <EmptyState 
        title="No Data Available" 
        message="No feature clicks found. Try adjusting your filters or date range."
        icon="chart"
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart 
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="feature_name" 
          angle={-45}
          textAnchor="end"
          height={100}
          interval={0}
        />
        <YAxis 
          label={{ value: 'Click Count', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
          cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
        />
        <Legend />
        <Bar 
          dataKey="total" 
          name="Total Clicks"
          fill="#3b82f6"
          onClick={handleBarClick}
          cursor="pointer"
          animationDuration={500}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={activeIndex === index ? '#1e40af' : COLORS[index % COLORS.length]}
            />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

export default BarChart;
