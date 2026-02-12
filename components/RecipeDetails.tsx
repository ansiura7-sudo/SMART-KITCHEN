
import React from 'react';
import { Recipe } from '../types';
import { ClockIcon, FireIcon } from './Icons';

interface Props {
  recipe: Recipe;
  onClose: () => void;
}

const RecipeDetails: React.FC<Props> = ({ recipe, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="relative h-48 sm:h-64 flex-shrink-0">
          <img 
            src={`https://picsum.photos/seed/${recipe.name}/800/600`} 
            alt={recipe.name} 
            className="w-full h-full object-cover"
          />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-md transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto recipe-scroll">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900 pr-4">{recipe.name}</h2>
            <div className="flex items-center space-x-2 bg-orange-50 px-3 py-1 rounded-full text-orange-600 font-medium whitespace-nowrap">
              <FireIcon className="w-4 h-4" />
              <span>{recipe.difficulty}</span>
            </div>
          </div>

          <div className="flex items-center text-gray-500 mb-6 space-x-4">
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              <span>{recipe.time}</span>
            </div>
          </div>

          <p className="text-gray-600 mb-6 italic">{recipe.description}</p>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Ингредиенты</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-center text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Способ приготовления</h3>
            <div className="space-y-6">
              {recipe.steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <p className="text-gray-700 pt-1 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t flex-shrink-0">
          <button 
            onClick={onClose}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95"
          >
            Приятного аппетита!
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails;
