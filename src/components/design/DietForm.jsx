import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Button';

const DietForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    age: 25,
    sex: 'male',
    height: 175,
    weight: 70,
    state: '',
    country: '',
    health_conditions: '',
    diet_type: 'veg'
  });
  const [dietPlan, setDietPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const DAY_ORDER = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const processedData = {
        ...formData,
        health_conditions: formData.health_conditions
          .split(',')
          .map(condition => condition.trim().toLowerCase())
          .filter(condition => condition)
      };

      const response = await fetch('https://smart-plate-e5ju.onrender.com/api/generate-diet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors || 'Failed to generate diet plan');
      }

      const data = await response.json();
      setDietPlan(data.diet_plan);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? 
        (checked ? [...prev.health_conditions, value] : prev.health_conditions.filter(item => item !== value)) 
        : value
    }));
  };

  return (
    <div className="min-h-screen bg-cyan-50 pt-[4.75rem] lg:pt-[5.25rem] overflow-hidden">
      <div className="container mx-auto px-4 py-12">
        <button 
          onClick={() => navigate('/')}
          className="mb-8 text-amber-600 hover:text-amber-700 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </button>

        {!dietPlan ? (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-xl ring-1 ring-gray-200">
            <h1 className="h1 mb-8 text-center text-gray-800">Personalized Diet Planner</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Age Input */}
                <div className="space-y-2">
                  <label className="block text-gray-800 body-2">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white text-black rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500"
                    min="18"
                    max="120"
                    required
                  />
                </div>

                {/* Gender Select */}
                <div className="space-y-2">
                  <label className="block text-gray-800 body-2">Gender</label>
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white text-black rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                {/* Height Input */}
                <div className="space-y-2">
                  <label className="block text-gray-800 body-2">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white text-black rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500"
                    min="100"
                    max="250"
                    required
                  />
                </div>

                {/* Weight Input */}
                <div className="space-y-2">
                  <label className="block text-gray-800 body-2">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white text-black rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500"
                    min="30"
                    max="300"
                    required
                  />
                </div>

                {/* Country Input */}
                <div className="space-y-2">
                  <label className="block text-gray-800 body-2">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white text-black rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                {/* State Input */}
                <div className="space-y-2">
                  <label className="block text-gray-800 body-2">State/Province</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white text-black rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Health Conditions Textarea */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-gray-800 body-2">Health Conditions (comma separated)</label>
                  <textarea
                    name="health_conditions"
                    value={formData.health_conditions}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white text-black rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 resize-none"
                    placeholder="e.g., Diabetes, Hypertension, Food Allergies"
                    rows="3"
                  />
                  {formData.health_conditions.split(',').some(cond => {
                    const trimmed = cond.trim();
                    return trimmed && (trimmed.length < 3 || !/^[a-zA-Z\s]+$/.test(trimmed))
                  }) && (
                    <div className="text-rose-600 body-2 mt-2">
                      Each condition must be at least 3 letters and contain only letters/spaces
                    </div>
                  )}
                </div>

                {/* Diet Preference */}
                <div className="space-y-2">
                  <label className="block text-gray-800 body-2">Diet Preference</label>
                  <div className="flex gap-4">
                    {['Vegetarian', 'Non-Vegetarian'].map((type) => (
                      <label key={type} className="flex items-center space-x-2 p-2 bg-cyan-100 rounded-lg flex-1 justify-center group">
                        <input
                          type="radio"
                          name="diet_type"
                          value={type === 'Vegetarian' ? 'veg' : 'non-veg'}
                          checked={formData.diet_type === (type === 'Vegetarian' ? 'veg' : 'non-veg')}
                          onChange={handleInputChange}
                          className="form-radio text-white checked:text-black border-2 border-gray-300 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-gray-800 body-2 group-has-[input:checked]:font-medium">
                          {type}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {error && <div className="text-rose-600 body-2 p-3 bg-rose-50 rounded-lg">{error}</div>}

              <Button 
                type="submit" 
                className="w-full py-4 text-lg bg-amber-400 hover:bg-amber-500 text-white transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Generating Your Plan...' : 'Generate Diet Plan'}
              </Button>
            </form>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-xl space-y-8 ring-1 ring-gray-200">
            <h2 className="h2 text-center mb-8 text-gray-800">Your Personalized Diet Plan</h2>
            
            {/* Nutritional Goals */}
            <div className="bg-cyan-50 p-6 rounded-xl ring-1 ring-cyan-200">
              <h3 className="h3 mb-4 text-gray-800">Nutritional Goals</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 body-2">
                <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                  <p className="text-gray-600">Daily Calories</p>
                  <p className="h4 text-gray-800">{dietPlan.nutritional_goals.daily_calories}</p>
                </div>
                <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                  <p className="text-gray-600">Protein</p>
                  <p className="h4 text-gray-800">{dietPlan.nutritional_goals.protein_grams}g</p>
                </div>
                <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                  <p className="text-gray-600">Carbs</p>
                  <p className="h4 text-gray-800">{dietPlan.nutritional_goals.carb_grams}g</p>
                </div>
                <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                  <p className="text-gray-600">Fats</p>
                  <p className="h4 text-gray-800">{dietPlan.nutritional_goals.fat_grams}g</p>
                </div>
              </div>
            </div>

            {/* Weekly Plan */}
            <div className="space-y-6">
              <h3 className="h3 text-gray-800">Weekly Meal Plan</h3>
              {DAY_ORDER.map(day => (
                <div key={day} className="bg-cyan-50 p-6 rounded-xl ring-1 ring-cyan-200">
                  <h4 className="h4 capitalize mb-4 text-gray-800">{day}</h4>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(dietPlan.weekly_plan[day]).map(([mealType, details]) => (
                      <div key={mealType} className="bg-white p-4 rounded-lg shadow-sm">
                        <h5 className="body-1 capitalize mb-2 text-gray-800">{mealType}</h5>
                        <p className="body-2 text-gray-600 mb-2">{details.meal}</p>
                        <div className="flex justify-between body-2 text-gray-500">
                          <span>🔥 {details.calories}</span>
                          <span>🥩 {details.protein}</span>
                          <span>🍞 {details.carbs}</span>
                          <span>🥑 {details.fats}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Recommended vs Avoid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-emerald-50 rounded-lg p-6 ring-1 ring-emerald-200">
                <h2 className="text-2xl font-bold text-emerald-700 mb-4">✅ Recommended Foods</h2>
                <div className="space-y-2">
                  {dietPlan.recommended_foods.map((food, index) => (
                    <p key={index} className="text-gray-700 body-2">• {food}</p>
                  ))}
                </div>
              </div>

              <div className="bg-rose-50 rounded-lg p-6 ring-1 ring-rose-200">
                <h2 className="text-2xl font-bold text-rose-700 mb-4">❌ Foods to Avoid</h2>
                <div className="space-y-2">
                  {dietPlan.foods_to_avoid.map((food, index) => (
                    <p key={index} className="text-gray-700 body-2">• {food}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Cooking Tips */}
            <div className="bg-amber-50 rounded-lg p-6 ring-1 ring-amber-200 mb-8">
              <h2 className="text-2xl font-bold text-amber-700 mb-4">👩🍳 Cooking Tips</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {dietPlan.cooking_tips.map((tip, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-gray-700 body-2">• {tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cultural Considerations */}
            {dietPlan.cultural_considerations && (
              <div className="bg-indigo-50 rounded-lg p-6 ring-1 ring-indigo-200">
                <h2 className="text-2xl font-bold text-indigo-700 mb-4">🌍 Cultural Considerations</h2>
                <p className="text-gray-700 body-2">{dietPlan.cultural_considerations}</p>
              </div>
            )}

            <Button 
              onClick={() => {
                setDietPlan(null);
                window.scrollTo(0, 0);
              }}
              className="w-full py-4 text-lg bg-amber-400 hover:bg-amber-500 text-white transition-colors"
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
