import React, { useState, useEffect } from 'react';
import { trackFeature } from '../utils/api';
import { saveFilterPreferences, loadFilterPreferences } from '../utils/cookies';

function Filters({ onFilterChange }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [featureName, setFeatureName] = useState('');

  // Load filter preferences from cookies on component mount
  useEffect(() => {
    const savedFilters = loadFilterPreferences();
    if (savedFilters) {
      if (savedFilters.start_date) setStartDate(savedFilters.start_date);
      if (savedFilters.end_date) setEndDate(savedFilters.end_date);
      if (savedFilters.age) setAge(savedFilters.age);
      if (savedFilters.gender) setGender(savedFilters.gender);
      
      // Apply saved filters automatically
      if (Object.keys(savedFilters).some(key => savedFilters[key])) {
        onFilterChange(savedFilters);
      }
    }
  }, []);

  // Track filter interaction
  const trackFilterChange = async (filterType) => {
    try {
      await trackFeature(filterType);
    } catch (error) {
      console.error('Failed to track filter change:', error);
    }
  };

  const handleStartDateChange = (e) => {
    const value = e.target.value;
    setStartDate(value);
    trackFilterChange('date_filter');
  };

  const handleEndDateChange = (e) => {
    const value = e.target.value;
    setEndDate(value);
    trackFilterChange('date_filter');
  };

  const handleAgeChange = (e) => {
    const value = e.target.value;
    setAge(value);
    trackFilterChange('age_filter');
  };

  const handleGenderChange = (e) => {
    const value = e.target.value;
    setGender(value);
    trackFilterChange('gender_filter');
  };

  const handleFeatureNameChange = (e) => {
    const value = e.target.value;
    setFeatureName(value);
  };

  const handleApply = () => {
    const filters = {};
    if (startDate) filters.start_date = startDate;
    if (endDate) filters.end_date = endDate;
    if (age) filters.age = age;
    if (gender) filters.gender = gender;
    if (featureName) filters.feature_name = featureName;
    
    // Save filter preferences to cookies (excluding feature_name)
    saveFilterPreferences(filters);
    
    onFilterChange(filters);
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setAge('');
    setGender('');
    setFeatureName('');
    
    // Clear filter preferences from cookies
    saveFilterPreferences({});
    
    onFilterChange({});
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Date Range Picker - Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Date Range Picker - End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Age Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Age Range
          </label>
          <select
            value={age}
            onChange={handleAgeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">All Ages</option>
            <option value="<18">&lt;18</option>
            <option value="18-40">18-40</option>
            <option value=">40">&gt;40</option>
          </select>
        </div>

        {/* Gender Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <select
            value={gender}
            onChange={handleGenderChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Feature Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Feature Name
          </label>
          <input
            type="text"
            value={featureName}
            onChange={handleFeatureNameChange}
            placeholder="e.g., dashboard_view"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleApply}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Apply Filters
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default Filters;
