
import React from 'react';
import { Recipe } from '../types';
import { ClockIcon, FireIcon } from './Icons';

interface Props {
  recipe: Recipe;
  onClose: () => void;
}

const RecipeDetails: React.FC<Props> = ({ recipe, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl max-h-[92vh] rounded-t-[3rem] sm:rounded-[3.5rem] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
        <div className="relative h-72 sm:h-96 flex-shrink-0 bg-gray-100">
          <img 
            src={recipe.imageUrl || `https://picsum.photos/seed/${recipe.name}/800/600`} 
            alt={recipe.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 bg-white/10 hover:bg-white/30 text-white p-3 rounded-2xl backdrop-blur-xl transition-all border border-white/20 active:scale-90"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-orange-500 px-4 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center">
                <FireIcon className="w-3.5 h-3.5 mr-2" />
                {recipe.difficulty}
              </div>
              <div className="bg-white/20 backdrop-blur-md border border-white/30 px-4 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center">
                <ClockIcon className="w-3.5 h-3.5 mr-2" />
                {recipe.time}
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tighter uppercase drop-shadow-lg">
              {recipe.name}
            </h2>
          </div>
        </div>

        <div className="p-8 sm:p-10 overflow-y-auto recipe-scroll bg-[#fcfbf7]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-5">
              <h3 className="text-[11px] font-black text-gray-400 mb-6 uppercase tracking-[0.3em] flex items-center">
                <span className="w-8 h-px bg-orange-200 mr-4"></span>
                Ингредиенты
              </h3>
              <ul className="space-y-3">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-center text-gray-800 bg-white border border-gray-100 p-4 rounded-2xl font-bold text-sm shadow-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-4 shadow-orange-200 shadow-md"></div>
                    {ing}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-7">
              <h3 className="text-[11px] font-black text-gray-400 mb-8 uppercase tracking-[0.3em] flex items-center">
                <span className="w-8 h-px bg-orange-200 mr-4"></span>
                Порядок приготовления
              </h3>
              <div className="space-y-10">
                {recipe.steps.map((step, i) => (
                  <div key={i} className="group flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white border-2 border-orange-100 text-orange-500 flex items-center justify-center font-black text-lg shadow-sm group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-all duration-300">
                      {i + 1}
                    </div>
                    <p className="text-gray-700 pt-1 leading-relaxed font-bold text-base group-hover:text-gray-900 transition-colors">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-gray-100 text-center">
             <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">Приятного аппетита от ШефИИ</p>
          </div>
        </div>

        <div className="p-8 bg-white border-t border-gray-100 flex-shrink-0">
          <button 
            onClick={onClose}
            className="w-full bg-gray-900 hover:bg-black text-white font-black py-5 rounded-[2rem] transition-all shadow-2xl active:scale-[0.98] uppercase tracking-[0.2em] text-xs"
          >
            Я всё понял, иду готовить!
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails;
