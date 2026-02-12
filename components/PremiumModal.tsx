
import React from 'react';
import { FireIcon, ChefHatIcon } from './Icons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PremiumModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="bg-gradient-to-br from-orange-400 to-red-500 p-8 text-center text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="inline-block p-4 bg-white rounded-3xl mb-4 shadow-xl">
            <FireIcon className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="text-3xl font-black mb-2">Перейдите на Premium</h2>
          <p className="opacity-90">Разблокируйте все возможности Шеф-повара ИИ</p>
        </div>

        <div className="p-8">
          <ul className="space-y-4 mb-8">
            {[
              "До 10 уникальных рецептов за раз",
              "Эксклюзивные авторские блюда",
              "Генерация фото в 4K качестве",
              "Приоритетный доступ к новым моделям"
            ].map((feature, i) => (
              <li key={i} className="flex items-center text-gray-700">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-medium">{feature}</span>
              </li>
            ))}
          </ul>

          <button 
            onClick={() => alert('Перенаправление на страницу оплаты...')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-100 active:scale-[0.98] mb-4"
          >
            Попробовать за 299₽ / месяц
          </button>
          
          <button 
            onClick={onClose}
            className="w-full text-gray-400 font-medium hover:text-gray-600 transition-colors"
          >
            Может быть позже
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;
