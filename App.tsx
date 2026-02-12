
import React, { useState, useEffect, useRef } from 'react';
import { UserPlan, Recipe, GenerationState } from './types';
import { generateRecipes, generateDishImage } from './services/geminiService';
import { FireIcon, ChefHatIcon, ClockIcon, TrashIcon } from './components/Icons';
import RecipeDetails from './components/RecipeDetails';
import PremiumModal from './components/PremiumModal';

const RecipeCard: React.FC<{ recipe: Recipe; onClick: () => void }> = ({ recipe, onClick }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(recipe.imageUrl || null);
  const [imageLoading, setImageLoading] = useState(!recipe.imageUrl);

  useEffect(() => {
    if (!recipe.imageUrl) {
      let isMounted = true;
      const fetchImage = async () => {
        try {
          const url = await generateDishImage(recipe.name, recipe.description);
          if (isMounted) {
            setImageUrl(url);
            recipe.imageUrl = url; 
            setImageLoading(false);
          }
        } catch (err) {
          console.error("Image generation failed", err);
          if (isMounted) {
            setImageUrl(`https://picsum.photos/seed/${recipe.name}/400/300`);
            setImageLoading(false);
          }
        }
      };
      fetchImage();
      return () => { isMounted = false; };
    }
  }, [recipe]);

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl active:scale-95 transition-all cursor-pointer flex flex-col h-full"
    >
      <div className="h-52 relative flex-shrink-0 bg-gray-50">
        {imageLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-2"></div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Создаем фото...</span>
            </div>
          </div>
        ) : (
          <img 
            src={imageUrl || ''} 
            alt={recipe.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
        <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-gray-700 flex items-center shadow-sm uppercase tracking-wider">
          <FireIcon className="w-3 h-3 mr-1 text-orange-500" />
          {recipe.difficulty}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center text-[10px] font-bold text-orange-500 mb-2 uppercase tracking-widest">
          <ClockIcon className="w-3.5 h-3.5 mr-1" />
          {recipe.time}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-orange-600 transition-colors">
          {recipe.name}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
          {recipe.description}
        </p>
        <div className="mt-auto flex items-center text-xs font-bold text-orange-600 uppercase tracking-widest">
          Готовить сейчас
          <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [plan, setPlan] = useState<UserPlan>(UserPlan.BASIC);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [state, setState] = useState<GenerationState>({
    loading: false,
    error: null,
    recipes: []
  });
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handlePlanSelect = (newPlan: UserPlan) => {
    if (newPlan === UserPlan.PREMIUM) {
      setIsPremiumModalOpen(true);
    } else {
      setPlan(newPlan);
    }
  };

  const addIngredient = (e?: React.FormEvent) => {
    e?.preventDefault();
    const val = inputValue.trim().toLowerCase();
    if (val && !ingredients.includes(val)) {
      setIngredients([...ingredients, val]);
      setInputValue('');
    }
  };

  const removeIngredient = (ing: string) => {
    setIngredients(ingredients.filter(i => i !== ing));
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) return;
    
    setState({ ...state, recipes: [], loading: true, error: null });
    try {
      const results = await generateRecipes(ingredients, plan);
      setState({ recipes: results, loading: false, error: null });
      // Плавный скролл к результатам на мобильных
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setState({ 
        ...state, 
        loading: false, 
        error: 'Произошла ошибка. Пожалуйста, попробуйте позже.' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf7] flex flex-col items-center">
      <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />
      
      {/* Sticky Top Header for App feel */}
      <header className="sticky top-0 z-40 w-full bg-[#fcfbf7]/80 backdrop-blur-lg border-b border-orange-100/50 px-4 py-4 mb-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500 rounded-xl shadow-lg shadow-orange-100">
              <ChefHatIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 leading-none tracking-tight uppercase">ШефИИ</h1>
              <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">Smart Kitchen</span>
            </div>
          </div>
          <div className="text-[10px] font-black bg-orange-100 text-orange-600 px-3 py-1.5 rounded-full uppercase tracking-widest">
            {plan} Plan
          </div>
        </div>
      </header>

      <main className="w-full max-w-4xl px-4 flex flex-col md:flex-row gap-8 pb-12">
        
        {/* Sidebar: Inputs */}
        <div className="w-full md:w-1/3 flex flex-col space-y-4">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-orange-50/50">
            <h2 className="text-lg font-extrabold text-gray-800 mb-4 flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
              Продукты
            </h2>
            
            <form onSubmit={addIngredient} className="relative mb-4">
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Что в холодильнике?"
                className="w-full pl-4 pr-12 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all text-gray-800 font-medium placeholder:text-gray-400 shadow-inner"
              />
              <button 
                type="submit"
                className="absolute right-2 top-2 bg-orange-500 text-white p-2 rounded-xl hover:bg-orange-600 active:scale-90 transition-all shadow-md"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </form>

            <div className="flex flex-wrap gap-2 min-h-[120px] content-start">
              {ingredients.length === 0 ? (
                <div className="w-full py-8 flex flex-col items-center justify-center opacity-20">
                  <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-xs font-bold uppercase tracking-widest">Пусто</p>
                </div>
              ) : (
                ingredients.map((ing) => (
                  <span 
                    key={ing} 
                    className="inline-flex items-center bg-orange-50 text-orange-700 px-4 py-2 rounded-2xl text-xs font-bold border border-orange-100 shadow-sm animate-in zoom-in duration-200"
                  >
                    {ing}
                    <button 
                      onClick={() => removeIngredient(ing)}
                      className="ml-2 text-orange-300 hover:text-orange-600 p-0.5"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-orange-50/50">
            <div className="flex p-1 bg-gray-50 rounded-2xl">
              <button 
                onClick={() => handlePlanSelect(UserPlan.BASIC)}
                className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${plan === UserPlan.BASIC ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400'}`}
              >
                Basic
              </button>
              <button 
                onClick={() => handlePlanSelect(UserPlan.PREMIUM)}
                className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest relative ${plan === UserPlan.PREMIUM ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400'}`}
              >
                Premium
                <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
                </span>
              </button>
            </div>
          </div>

          <button 
            disabled={ingredients.length === 0 || state.loading}
            onClick={handleGenerate}
            className={`w-full py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2 
              ${ingredients.length === 0 || state.loading 
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                : 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-200'}`}
          >
            {state.loading ? (
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Генерация...</span>
              </div>
            ) : (
              <>
                <FireIcon className="w-5 h-5" />
                <span>Создать меню</span>
              </>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-[400px]" ref={resultsRef}>
          {state.error && (
            <div className="bg-red-50 border-2 border-red-100 text-red-600 p-6 rounded-[2rem] mb-6 text-center font-bold text-sm">
              {state.error}
            </div>
          )}

          {state.loading ? (
            <div className="flex flex-col items-center justify-center h-full py-16 space-y-8">
              <div className="relative">
                <div className="w-32 h-32 border-[12px] border-orange-50 rounded-full shadow-inner"></div>
                <div className="absolute inset-0 w-32 h-32 border-[12px] border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <ChefHatIcon className="w-10 h-10 text-orange-500 animate-bounce" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-gray-900 font-black text-lg uppercase tracking-widest mb-2">Шеф творит магию</p>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Придумываем лучшие сочетания...</p>
              </div>
            </div>
          ) : state.recipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-24">
              {state.recipes.map((recipe, index) => (
                <RecipeCard 
                  key={index} 
                  recipe={recipe} 
                  onClick={() => setSelectedRecipe(recipe)} 
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                <ChefHatIcon className="w-10 h-10 text-orange-200" />
              </div>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest mb-2">Ваша кухня</h3>
              <p className="text-gray-400 text-sm font-medium max-w-xs mx-auto leading-relaxed">
                Добавьте продукты, которые у вас есть, и мы превратим их в ресторанные блюда.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Details Modal */}
      {selectedRecipe && (
        <RecipeDetails 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)} 
        />
      )}
    </div>
  );
};

export default App;
