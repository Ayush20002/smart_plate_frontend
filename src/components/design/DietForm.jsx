import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Button'; // Assuming Button component is in '../Button'

const DietForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    age: 25,
    sex: 'male',
    height: 175,
    weight: 70,
    state: '',
    country: '',
    health_conditions: '', // Store as comma-separated string initially
    diet_type: 'veg'       // Default diet type
  });
  const [dietPlan, setDietPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Define the desired order for displaying days AND meals
  const DAY_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const MEAL_ORDER = ['breakfast', 'lunch', 'snacks', 'dinner']; // <-- Define desired meal order

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setDietPlan(null); // Clear previous plan

    // Basic Frontend Validation (can be expanded)
    if (!formData.country || !formData.state) {
        setError('Country and State/Province are required.');
        setIsLoading(false);
        return;
    }
     // Health conditions validation (optional, example)
     const conditions = formData.health_conditions.split(',')
        .map(condition => condition.trim())
        .filter(condition => condition); // Filter out empty strings

     const invalidConditions = conditions.filter(cond => cond.length > 0 && (cond.length < 3 || !/^[a-zA-Z\s]+$/.test(cond)));
     if (invalidConditions.length > 0) {
         setError(`Invalid health condition(s): "${invalidConditions.join(', ')}". Each must be at least 3 letters and contain only letters/spaces.`);
         setIsLoading(false);
         return;
     }


    try {
      // Prepare data for the backend (send health_conditions as an array of strings)
      const processedData = {
        ...formData,
        age: parseInt(formData.age, 10), // Ensure numbers are sent as numbers
        height: parseInt(formData.height, 10),
        weight: parseFloat(formData.weight), // Weight might have decimals
        health_conditions: conditions // Send the cleaned array
      };

      // Replace with your actual backend API endpoint
      const apiUrl = process.env.REACT_APP_API_URL || 'https://smart-plate-e5ju.onrender.com/api/generate-diet';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData)
      });

      const data = await response.json(); // Always parse JSON response

      if (!response.ok) {
        // Handle errors from the backend (validation errors or other issues)
        let errorMessage = 'Failed to generate diet plan.';
        if (data && data.message) {
            errorMessage = data.message;
        } else if (data && data.errors) {
            // Format validation errors nicely
            errorMessage = Object.entries(data.errors)
                .map(([field, message]) => `${field.charAt(0).toUpperCase() + field.slice(1)}: ${message}`)
                .join(' ');
        }
        throw new Error(errorMessage);
      }

      // Check if the response status is success and diet_plan exists
      if (data.status === 'success' && data.diet_plan) {
          setDietPlan(data.diet_plan);
      } else {
          // Handle cases where status might be success but no plan, or other unexpected successful responses
           throw new Error(data.message || 'Received success status but no diet plan data.');
      }

    } catch (err) {
        console.error("API Error:", err);
        setError(err.message || 'An unexpected error occurred. Please try again.'); // Display the error message
    } finally {
      setIsLoading(false);
    }
  };

  // Handles changes in form inputs (text, number, select, radio)
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handles changes specifically for the health conditions textarea
   const handleHealthConditionsChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
          ...prev,
          [name]: value // Keep as comma-separated string in state
      }));
   };


  // Helper function to render meal details safely
  const renderMealDetails = (details) => {
    if (!details) {
        // This case should ideally not be hit if we check before calling, but good failsafe
        return <p className="body-2 text-gray-500">Meal details not available.</p>;
    }
    return (
        <>
            <p className="body-2 text-gray-600 mb-2">{details.meal || 'N/A'}</p>
            <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-1 body-2 text-xs sm:text-sm text-gray-500">
                <span title="Calories">🔥 {details.calories ?? 'N/A'}</span>
                <span title="Protein">🥩 {details.protein ?? 'N/A'}</span>
                <span title="Carbohydrates">🍞 {details.carbs ?? 'N/A'}</span>
                <span title="Fats">🥑 {details.fats ?? 'N/A'}</span>
                {/* Display Glucose Spike Prediction if available */}
                {details.glucose_spike_prediction && (
                    <span
                        title="Predicted Glucose Spike"
                        className="font-medium text-indigo-600 whitespace-nowrap" // Added whitespace-nowrap
                    >
                        🩸 {details.glucose_spike_prediction}
                    </span>
                )}
            </div>
        </>
    );
  };


  return (
    // Using Tailwind CSS classes for styling
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 pt-[4.75rem] lg:pt-[5.25rem] overflow-hidden">
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')} // Navigate back to home or previous page
          className="mb-8 text-amber-600 hover:text-amber-800 flex items-center gap-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>

        {/* Conditional Rendering: Show Form or Diet Plan */}
        {!dietPlan ? (
          // --- Diet Plan Form (Code remains exactly the same as previous version) ---
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 md:p-8 shadow-xl ring-1 ring-gray-900/5">
            <h1 className="text-3xl font-bold tracking-tight text-center mb-8 text-gray-800">Personalized Diet Planner</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Grid for basic info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Age */}
                <div className="space-y-1">
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                  <input
                    id="age"
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-150 ease-in-out"
                    min="1"
                    max="120"
                    required
                    aria-describedby="age-description"
                  />
                   <p id="age-description" className="text-xs text-gray-500">Enter your current age.</p>
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <label htmlFor="sex" className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    id="sex"
                    name="sex"
                    value={formData.sex}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-150 ease-in-out"
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                   <p className="text-xs text-gray-500">Select your gender.</p>
                </div>

                {/* Height */}
                <div className="space-y-1">
                  <label htmlFor="height" className="block text-sm font-medium text-gray-700">Height (cm)</label>
                  <input
                    id="height"
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-150 ease-in-out"
                    min="50"
                    max="300"
                    step="0.1"
                    required
                    aria-describedby="height-description"
                  />
                   <p id="height-description" className="text-xs text-gray-500">Enter height in centimeters.</p>
                </div>

                {/* Weight */}
                <div className="space-y-1">
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                  <input
                    id="weight"
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-150 ease-in-out"
                    min="10"
                    max="500"
                    step="0.1"
                    required
                     aria-describedby="weight-description"
                  />
                  <p id="weight-description" className="text-xs text-gray-500">Enter weight in kilograms.</p>
                </div>

                 {/* Country */}
                 <div className="space-y-1">
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                  <input
                    id="country"
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-150 ease-in-out"
                    required
                    placeholder="e.g., India"
                  />
                   <p className="text-xs text-gray-500">Country of residence.</p>
                </div>

                 {/* State/Province */}
                 <div className="space-y-1">
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">State / Province</label>
                  <input
                    id="state"
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-150 ease-in-out"
                    required
                    placeholder="e.g., Maharashtra"
                  />
                   <p className="text-xs text-gray-500">State or province of residence.</p>
                </div>
              </div>

              {/* Health Conditions */}
              <div className="space-y-1">
                <label htmlFor="health_conditions" className="block text-sm font-medium text-gray-700">
                    Health Conditions <span className="text-xs text-gray-500">(Optional, comma-separated)</span>
                </label>
                <textarea
                  id="health_conditions"
                  name="health_conditions"
                  value={formData.health_conditions}
                  onChange={handleHealthConditionsChange}
                  className="w-full p-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none transition duration-150 ease-in-out"
                  placeholder="e.g., Diabetes, Hypertension, Food Allergies"
                  rows="3"
                  aria-describedby="health-conditions-description"
                />
                 <p id="health-conditions-description" className="text-xs text-gray-500">
                   List any relevant health conditions separated by commas. Leave blank if none.
                   Each condition should be letters/spaces only, min 3 chars.
                </p>
                 {formData.health_conditions.split(',').some(cond => {
                    const trimmed = cond.trim();
                    return trimmed && (trimmed.length < 3 || !/^[a-zA-Z\s]+$/.test(trimmed));
                  }) && (
                    <div className="text-rose-600 text-xs mt-1">
                      Invalid format detected. Ensure each condition has min 3 letters (letters/spaces only).
                    </div>
                  )}
              </div>

              {/* Diet Preference */}
              <div className="space-y-2">
                 <label className="block text-sm font-medium text-gray-700">Diet Preference</label>
                 <div className="flex flex-col sm:flex-row gap-3">
                    {['Vegetarian', 'Non-Vegetarian'].map((type) => {
                      const value = type === 'Vegetarian' ? 'veg' : 'non-veg';
                      return (
                        <label key={type} className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors duration-150 ease-in-out flex-1 justify-center ${formData.diet_type === value ? 'bg-amber-100 border-amber-400 ring-1 ring-amber-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                          <input
                            type="radio"
                            name="diet_type"
                            value={value}
                            checked={formData.diet_type === value}
                            onChange={handleInputChange}
                            className="form-radio h-4 w-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                          />
                          <span className={`text-sm font-medium ${formData.diet_type === value ? 'text-amber-900' : 'text-gray-700'}`}>
                            {type}
                          </span>
                        </label>
                      );
                    })}
                 </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="text-rose-600 text-sm p-3 bg-rose-50 rounded-lg border border-rose-200">
                  <strong>Error:</strong> {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                   <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Your Plan...
                   </div>
                ) : 'Generate Diet Plan'}
              </Button>
            </form>
          </div>
          // --- End of Form ---
        ) : (
          // --- Diet Plan Display ---
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 md:p-8 shadow-xl space-y-8 ring-1 ring-gray-900/5">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-6 text-gray-800">Your Personalized Diet Plan</h2>

             {/* Error Display if plan generation succeeded but has issues */}
             {error && (
                <div className="text-rose-600 text-sm p-3 bg-rose-50 rounded-lg border border-rose-200">
                  <strong>Note:</strong> {error}
                </div>
             )}

            {/* Nutritional Goals */}
            {dietPlan.nutritional_goals && (
                 <div className="bg-gradient-to-r from-cyan-50 to-blue-100 p-5 rounded-xl ring-1 ring-cyan-200">
                   <h3 className="text-xl font-semibold mb-4 text-cyan-800">Estimated Daily Nutritional Goals</h3>
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                     {[
                       { label: 'Calories', value: dietPlan.nutritional_goals.daily_calories, unit: '' },
                       { label: 'Protein', value: dietPlan.nutritional_goals.protein_grams, unit: 'g' },
                       { label: 'Carbs', value: dietPlan.nutritional_goals.carb_grams, unit: 'g' },
                       { label: 'Fats', value: dietPlan.nutritional_goals.fat_grams, unit: 'g' },
                     ].map(item => (
                       <div key={item.label} className="bg-white p-3 rounded-lg shadow-sm ring-1 ring-gray-200">
                         <p className="text-xs sm:text-sm text-gray-600">{item.label}</p>
                         <p className="text-lg sm:text-xl font-bold text-gray-800">
                           {item.value ?? 'N/A'}{item.unit}
                         </p>
                       </div>
                     ))}
                   </div>
                 </div>
            )}


            {/* Weekly Plan */}
            {dietPlan.weekly_plan && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800">Weekly Meal Plan</h3>
                {/* Explanatory Note for Glucose Spike */}
                 <div className="bg-indigo-50 p-3 rounded-lg ring-1 ring-indigo-100 text-indigo-800 text-sm">
                     💡 <span className="font-medium">Glucose Spike Info:</span> The '🩸 Low/Moderate/High' value is a lab driven value based on meal content.
                 </div>

                {DAY_ORDER.map(day => (
                  dietPlan.weekly_plan[day] ? ( // Check if day exists in the plan
                    <div key={day} className="bg-gray-50 p-4 md:p-6 rounded-xl ring-1 ring-gray-200">
                      <h4 className="text-lg font-semibold capitalize mb-4 text-gray-700">{day}</h4>
                      {/* Grid for meals */}
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* --- MODIFICATION START: Iterate using MEAL_ORDER --- */}
                        {MEAL_ORDER.map(mealType => {
                          // Safely access meal details using optional chaining
                          const details = dietPlan.weekly_plan[day]?.[mealType];

                          // Only render the card if details for this mealType exist
                          return details ? (
                            <div key={mealType} className="bg-white p-4 rounded-lg shadow-sm ring-1 ring-gray-100 flex flex-col justify-between min-h-[120px]">
                              {/* Capitalize meal type for display */}
                              <h5 className="text-sm font-semibold capitalize mb-2 text-gray-800">{mealType}</h5>
                              {renderMealDetails(details)} {/* Use helper function */}
                            </div>
                          ) : null; // Render nothing if this meal type is missing for the day
                        })}
                        {/* --- MODIFICATION END --- */}
                      </div>
                    </div>
                  ) : null // Don't render anything if the day is missing
                ))}
              </div>
            )}


            {/* Recommended vs Avoid Foods */}
             {(dietPlan.recommended_foods?.length > 0 || dietPlan.foods_to_avoid?.length > 0) && (
                 <div className="grid md:grid-cols-2 gap-6">
                   {dietPlan.recommended_foods?.length > 0 && (
                     <div className="bg-emerald-50 rounded-lg p-5 ring-1 ring-emerald-200">
                       <h3 className="text-lg font-semibold text-emerald-800 mb-3">✅ Recommended Foods</h3>
                       <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                         {dietPlan.recommended_foods.map((food, index) => (
                           <li key={`rec-${index}`}>{food}</li>
                         ))}
                       </ul>
                     </div>
                   )}
                   {dietPlan.foods_to_avoid?.length > 0 && (
                     <div className="bg-rose-50 rounded-lg p-5 ring-1 ring-rose-200">
                       <h3 className="text-lg font-semibold text-rose-800 mb-3">❌ Foods to Avoid</h3>
                       <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                         {dietPlan.foods_to_avoid.map((food, index) => (
                           <li key={`avoid-${index}`}>{food}</li>
                         ))}
                       </ul>
                     </div>
                   )}
                 </div>
             )}


            {/* Cooking Tips */}
            {dietPlan.cooking_tips?.length > 0 && (
                 <div className="bg-amber-50 rounded-lg p-5 ring-1 ring-amber-200">
                   <h3 className="text-lg font-semibold text-amber-800 mb-3">👩‍🍳 Cooking Tips</h3>
                   <ul className="space-y-2 text-sm text-gray-700">
                     {dietPlan.cooking_tips.map((tip, index) => (
                        <li key={`tip-${index}`} className="flex items-start gap-2">
                           <span className="text-amber-600 mt-1">●</span>
                           <span>{tip}</span>
                        </li>
                     ))}
                   </ul>
                 </div>
            )}

            {/* Cultural Considerations */}
            {dietPlan.cultural_considerations && (
              <div className="bg-purple-50 rounded-lg p-5 ring-1 ring-purple-200">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">🌍 Cultural & Location Notes</h3>
                <p className="text-sm text-gray-700">{dietPlan.cultural_considerations}</p>
              </div>
            )}

            {/* Create New Plan Button */}
            <Button
              onClick={() => {
                setDietPlan(null);
                setError('');
                window.scrollTo(0, 0);
              }}
              className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out"
            >
              Create New Plan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DietForm;
