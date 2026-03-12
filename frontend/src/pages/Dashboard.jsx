import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnalytics } from '../utils/api';
import Filters from '../components/Filters';
import BarChart from '../components/BarChart';
import LineChart from '../components/LineChart';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

function Dashboard() {
  const [barChartData, setBarChartData] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);
  const [filters, setFilters] = useState({});
  const [selectedFeature, setSelectedFeature] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getAnalytics(filters);
      setBarChartData(data.barChart || []);
      setLineChartData(data.lineChart || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      
      // Handle specific error cases
      if (error.message.includes('Unauthorized') || error.message.includes('token')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        navigate('/login');
      } else if (error.message.includes('start_date must be less than or equal to end_date')) {
        setError('Invalid date range: Start date must be before end date');
      } else if (error.message.includes('Invalid')) {
        setError(error.message);
      } else {
        setError('Failed to load analytics data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    if (newFilters.feature_name) {
      setSelectedFeature(newFilters.feature_name);
    }
  };

  const handleBarClick = (featureName) => {
    setSelectedFeature(featureName);
    const updatedFilters = {
      ...filters,
      feature_name: featureName
    };
    setFilters(updatedFilters);
  };

  const handleRetry = () => {
    fetchData();
  };

  // Early return for empty state
  if (!loading && !error && barChartData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Product Analytics Dashboard</h1>
            <p className="text-sm text-gray-500">Track feature usage and user interactions.</p>
          </div>

          <Filters onFilterChange={handleFilterChange} />
          <div className="text-center py-20 text-gray-500">
            No analytics data available yet.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Product Analytics Dashboard</h1>
          <p className="text-sm text-gray-500">Track feature usage and user interactions.</p>
        </div>

        <Filters onFilterChange={handleFilterChange} />

        {error && (
          <ErrorMessage message={error} onRetry={handleRetry} />
        )}

        {loading && !error ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading analytics...</p>
          </div>
        ) : !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white shadow-sm rounded-xl p-6 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-4">Feature Clicks by Type</h2>
              <p className="text-sm text-gray-600 mb-4">Click on a bar to view timeline</p>
              {barChartData.length > 0 ? (
                <BarChart data={barChartData} onBarClick={handleBarClick} />
              ) : (
                <EmptyState 
                  title="No Data Available" 
                  message="No feature clicks found for the selected filters. Try adjusting your date range or removing filters."
                  icon="database"
                />
              )}
            </div>

            <div className="bg-white shadow-sm rounded-xl p-6 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-4">
                {selectedFeature ? `Clicks Over Time - ${selectedFeature}` : 'Clicks Over Time'}
              </h2>
              <LineChart data={lineChartData} selectedFeature={selectedFeature} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
