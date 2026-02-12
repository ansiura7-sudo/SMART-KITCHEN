
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
      className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-orange-100/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col h-full"
    >
      <div className="h-64 relative flex-shrink-0 bg-gray-50 overflow-hidden">
        {imageLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
            <span className="text-[10px] text-orange-400 font-black uppercase tracking-[0.2em]">Шеф рисует...</span>
          </div>
        ) : (
          <img 
            src={imageUrl || ''} 
            alt={recipe.name} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        )}
        <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black text-gray-800 flex items-center shadow-lg border border-white/50 uppercase tracking-widest">
          <FireIcon className="w-3.5 h-3.5 mr-2 text-orange-500" />
          {recipe.difficulty}
        </div>
      </div>
      <div className="p-8 flex flex-col flex-1 relative bg-gradient-to-b from-white to-orange-50/10">
        <div className="flex items-center text-[10px] font-black text-orange-500 mb-3 uppercase tracking-[0.3em]">
          <ClockIcon className="w-4 h-4 mr-2" />
          {recipe.time}
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-3 leading-tight group-hover:text-orange-600 transition-colors">
          {recipe.name}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-3 mb-8 leading-relaxed font-medium">
          {recipe.description}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-[11px] font-black text-orange-600 uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform duration-300 flex items-center">
            Начать готовку 
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
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

  const addIngredient = (e?: React.FormEvent) => {
    e?.preventDefault();
    const val = inputValue.trim().toLowerCase();
    if (val && !ingredients.includes(val)) {
      setIngredients([...ingredients, val]);
      setInputValue('');
    }
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) return;
    
    // Explicit check for the key presence in the browser environment
    if (!process.env.API_KEY || process.env.API_KEY === "undefined") {
      setState({ ...state, loading: false, error: "Критическая ошибка: API ключ не обнаружен в окружении браузера. Проверьте настройки Vercel Environment Variables и сделайте Redeploy." });
      return;
    }

    setState({ ...state, recipes: [], loading: true, error: null });
    try {
      const results = await generateRecipes(ingredients, plan);
      setState({ recipes: results, loading: false, error: null });
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    } catch (err: any) {
      console.error("GENERATION ERROR:", err);
      let errorMsg = 'Произошла ошибка при генерации. Проверьте консоль для подробностей.';
      if (err.message?.includes('API Key') || err.message?.includes('Ng')) {
        errorMsg = 'API Ключ не проброшен в приложение! Пожалуйста, добавьте API_KEY в настройки Vercel и обязательно нажмите Redeploy.';
      }
      setState({ ...state, loading: false, error: errorMsg });
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf7] flex flex-col items-center selection:bg-orange-100">
      <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />
      
      <header className="sticky top-0 z-40 w-full bg-[#fcfbf7]/80 backdrop-blur-2xl border-b border-orange-100/30 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-2xl shadow-orange-200 transform -rotate-6 hover:rotate-0 transition-all duration-500 group">
              <ChefHatIcon className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 leading-none tracking-tighter uppercase">ШефИИ</h1>
              <span className="text-[10px] text-orange-500 font-black uppercase tracking-[0.5em] block mt-1">Gourmet Assistant</span>
            </div>
          </div>
          <button 
            onClick={() => setIsPremiumModalOpen(true)}
            className="flex items-center space-x-3 bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 group"
          >
            <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-600 group-hover:text-orange-600 transition-colors">{plan} Access</span>
          </button>
        </div>
      </header>

      <main className="w-full max-w-7xl px-8 py-12 flex flex-col lg:flex-row gap-16">
        
        {/* Sidebar / Kitchen Drawer */}
        <aside className="w-full lg:w-[420px] space-y-10 flex-shrink-0">
          <div className="bg-white p-10 rounded-[4rem] shadow-xl shadow-orange-100/20 border border-orange-50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50/50 rounded-full -mr-32 -mt-32 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            
            <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] mb-8 flex items-center">
              <span className="w-3 h-3 bg-orange-500 rounded-full mr-4 shadow-lg shadow-orange-200 animate-pulse"></span>
              Мои Ингредиенты
            </h2>
            
            <form onSubmit={addIngredient} className="relative mb-10 group/input">
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Что у вас есть?"
                className="w-full pl-8 pr-16 py-7 bg-gray-50 border-none rounded-[2rem] focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all text-gray-800 font-bold placeholder:text-gray-300 shadow-inner text-lg"
              />
              <button 
                type="submit"
                className="absolute right-3 top-3 bg-orange-500 text-white p-4 rounded-2xl hover:bg-orange-600 active:scale-90 transition-all shadow-xl shadow-orange-200"
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </form>

            <div className="flex flex-wrap gap-3 min-h-[240px] content-start">
              {ingredients.length === 0 ? (
                <div className="w-full py-16 flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-gray-50 rounded-[3rem] flex items-center justify-center mb-6 border-2 border-dashed border-gray-100 transform -rotate-3">
                    <TrashIcon className="w-10 h-10 text-gray-200" />
                  </div>
                  <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.3em] max-w-[200px] leading-relaxed">
                    Добавьте продукты выше, чтобы шеф начал творить
                  </p>
                </div>
              ) : (
                ingredients.map((ing) => (
                  <span 
                    key={ing} 
                    className="inline-flex items-center bg-white text-gray-700 px-6 py-4 rounded-[1.8rem] text-xs font-black uppercase tracking-widest border border-gray-100 shadow-sm hover:border-orange-300 hover:shadow-lg transition-all animate-in zoom-in-50 duration-300 cursor-default"
                  >
                    {ing}
                    <button 
                      onClick={() => setIngredients(ingredients.filter(i => i !== ing))}
                      className="ml-4 text-gray-300 hover:text-red-500 transition-colors p-1"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="bg-white p-3 rounded-[2.5rem] shadow-lg border border-orange-50 flex space-x-2">
            <button 
              onClick={() => setPlan(UserPlan.BASIC)}
              className={`flex-1 py-5 text-[11px] font-black rounded-[2rem] transition-all uppercase tracking-[0.3em] ${plan === UserPlan.BASIC ? 'bg-orange-500 text-white shadow-2xl shadow-orange-200' : 'text-gray-400 hover:text-gray-700'}`}
            >
              Basic
            </button>
            <button 
              onClick={() => setIsPremiumModalOpen(true)}
              className={`flex-1 py-5 text-[11px] font-black rounded-[2rem] transition-all uppercase tracking-[0.3em] relative ${plan === UserPlan.PREMIUM ? 'bg-orange-500 text-white shadow-2xl shadow-orange-200' : 'text-gray-400 hover:text-gray-700'}`}
            >
              Premium
              <div className="absolute top-3 right-3 w-2 h-2 bg-white rounded-full animate-ping"></div>
            </button>
          </div>

          <button 
            disabled={ingredients.length === 0 || state.loading}
            onClick={handleGenerate}
            className={`w-full py-9 rounded-[3.5rem] font-black text-base uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-[0.96] flex items-center justify-center space-x-5 
              ${ingredients.length === 0 || state.loading 
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none' 
                : 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-200 hover:shadow-orange-300'}`}
          >
            {state.loading ? (
              <div className="flex items-center space-x-5">
                <div className="w-7 h-7 border-[5px] border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Творим...</span>
              </div>
            ) : (
              <>
                <FireIcon className="w-8 h-8" />
                <span>Сгенерировать</span>
              </>
            )}
          </button>
        </aside>

        {/* Results Area */}
        <section className="flex-1 min-h-[800px] relative" ref={resultsRef}>
          {state.error && (
            <div className="bg-red-50 border-2 border-red-100 p-12 rounded-[4rem] mb-12 animate-in slide-in-from-top-10 duration-1000 shadow-2xl shadow-red-100/50">
              <div className="flex items-start space-x-8">
                <div className="p-5 bg-red-100 rounded-[2rem] text-red-600 shadow-inner">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <div>
                  <h3 className="text-red-900 font-black uppercase tracking-[0.3em] text-xs mb-3">Ошибка Окружения</h3>
                  <p className="text-red-600 font-bold text-xl leading-relaxed">{state.error}</p>
                  <div className="mt-8 flex flex-col space-y-2">
                    <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">Проверьте консоль разработчика (F12)</p>
                    <p className="text-red-400 text-[10px] font-black uppercase tracking-widest italic">Убедитесь, что API_KEY добавлен в Vercel Settings -> Environment Variables</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {state.loading ? (
            <div className="flex flex-col items-center justify-center h-full py-40 space-y-16">
              <div className="relative">
                <div className="w-56 h-56 border-[24px] border-orange-50 rounded-full shadow-inner"></div>
                <div className="absolute inset-0 w-56 h-56 border-[24px] border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <ChefHatIcon className="w-20 h-20 text-orange-500 animate-bounce" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-gray-900 font-black text-4xl uppercase tracking-[0.4em] mb-4 animate-pulse">Шеф на Кухне</p>
                <div className="flex flex-col items-center space-y-2">
                  <p className="text-gray-400 text-[11px] font-black uppercase tracking-[0.5em] animate-in fade-in slide-in-from-bottom duration-1000">Подбираем лучшие сочетания...</p>
                  <p className="text-gray-400 text-[11px] font-black uppercase tracking-[0.5em] opacity-0 animate-in fade-in duration-1000 delay-500">Сервируем стол...</p>
                </div>
              </div>
            </div>
          ) : state.recipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-60">
              {state.recipes.map((recipe, index) => (
                <RecipeCard 
                  key={index} 
                  recipe={recipe} 
                  onClick={() => setSelectedRecipe(recipe)} 
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-48 text-center">
              <div className="w-48 h-48 bg-orange-50/40 rounded-[5rem] flex items-center justify-center mb-14 transform -rotate-12 border border-orange-100/50 shadow-inner group">
                <ChefHatIcon className="w-24 h-24 text-orange-100 group-hover:text-orange-200 transition-colors duration-500" />
              </div>
              <h3 className="text-4xl font-black text-gray-900 uppercase tracking-widest mb-6">Готовы Творить?</h3>
              <p className="text-gray-400 text-sm font-black max-w-sm mx-auto leading-relaxed uppercase tracking-[0.3em]">
                Заполните корзину слева продуктами и получите авторское меню от ИИ в один клик.
              </p>
            </div>
          )}
        </section>
      </main>

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
