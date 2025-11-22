import React, { useState } from 'react';
import type { UserProfile as UserProfileType } from '../types';

interface UserProfileProps {
  profile: UserProfileType;
  onSave: (profile: UserProfileType) => void;
  onClose: () => void;
}

const makeupStyles = ["Natural", "Glam", "Everyday", "Creative", "Minimalist"];
const skinConcerns = ["Sensitive Skin", "Acne-prone", "Redness", "Fine Lines", "Large Pores", "Dry Patches"];
const makeupFinishes = ["Matte", "Dewy", "Satin", "Radiant"];
const productPriorities = ["Cream Blush", "Liquid Foundation", "Long-wear Lipstick", "Waterproof Mascara"];
const productAvoidances = ["Glitter", "Heavy Fragrance", "Talc", "Silicone"];

export const UserProfile: React.FC<UserProfileProps> = ({ profile, onSave, onClose }) => {
  // Initialize local state with defaults to ensure new fields exist, then override with profile from props.
  const [localProfile, setLocalProfile] = useState<UserProfileType>({
    name: '',
    style: 'Natural',
    concerns: [],
    finish: 'Satin',
    priorities: [],
    avoidances: [],
    ...profile,
  });

  const handleCheckboxChange = (
    key: 'concerns' | 'priorities' | 'avoidances',
    value: string
  ) => {
    const currentValues = localProfile[key] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(c => c !== value)
      : [...currentValues, value];
    setLocalProfile({ ...localProfile, [key]: newValues });
  };

  const handleSave = () => {
    onSave(localProfile); // Commit changes to parent state
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl max-w-lg w-full relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-3xl font-bold">&times;</button>
        <h2 className="text-2xl font-bold text-[#3a3a3a] dark:text-gray-100 mb-6">My Profile</h2>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
              type="text"
              id="name"
              value={localProfile.name}
              onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
              placeholder="e.g., Jane Doe"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-[#c5a78f] focus:border-[#c5a78f] sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="style" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Makeup Style</label>
            <select
              id="style"
              value={localProfile.style}
              onChange={(e) => setLocalProfile({ ...localProfile, style: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-[#c5a78f] focus:border-[#c5a78f] sm:text-sm rounded-md"
            >
              {makeupStyles.map(style => <option key={style}>{style}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Makeup Finish</label>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
              {makeupFinishes.map(finish => (
                <div key={finish} className="flex items-center">
                  <input
                    id={finish}
                    name="finish"
                    type="radio"
                    checked={localProfile.finish === finish}
                    onChange={() => setLocalProfile({ ...localProfile, finish })}
                    className="h-4 w-4 text-[#c5a78f] focus:ring-[#b9987e] border-gray-300 dark:border-gray-500"
                  />
                  <label htmlFor={finish} className="ml-2 block text-sm text-gray-900 dark:text-gray-200">{finish}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Common Skin Concerns</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {skinConcerns.map(concern => (
                <div key={concern} className="flex items-center">
                  <input
                    id={concern}
                    type="checkbox"
                    checked={localProfile.concerns.includes(concern)}
                    onChange={() => handleCheckboxChange('concerns', concern)}
                    className="h-4 w-4 text-[#c5a78f] focus:ring-[#b9987e] border-gray-300 dark:border-gray-500 rounded bg-gray-100 dark:bg-gray-600"
                  />
                  <label htmlFor={concern} className="ml-2 block text-sm text-gray-900 dark:text-gray-200">{concern}</label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prioritize These Products</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {productPriorities.map(priority => (
                <div key={priority} className="flex items-center">
                  <input
                    id={priority}
                    type="checkbox"
                    checked={localProfile.priorities.includes(priority)}
                    onChange={() => handleCheckboxChange('priorities', priority)}
                    className="h-4 w-4 text-[#c5a78f] focus:ring-[#b9987e] border-gray-300 dark:border-gray-500 rounded bg-gray-100 dark:bg-gray-600"
                  />
                  <label htmlFor={priority} className="ml-2 block text-sm text-gray-900 dark:text-gray-200">{priority}</label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Avoid These Things</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {productAvoidances.map(avoidance => (
                <div key={avoidance} className="flex items-center">
                  <input
                    id={avoidance}
                    type="checkbox"
                    checked={localProfile.avoidances.includes(avoidance)}
                    onChange={() => handleCheckboxChange('avoidances', avoidance)}
                    className="h-4 w-4 text-[#c5a78f] focus:ring-[#b9987e] border-gray-300 dark:border-gray-500 rounded bg-gray-100 dark:bg-gray-600"
                  />
                  <label htmlFor={avoidance} className="ml-2 block text-sm text-gray-900 dark:text-gray-200">{avoidance}</label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-2 px-6 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-[#c5a78f] text-white font-bold py-2 px-6 rounded-xl hover:bg-[#b9987e] transition-colors"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};