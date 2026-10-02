import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faPlaneDeparture,
  faGauge,
  faUsers,
  faCogs,
  faMap,
  faTools,
  faUserShield,
  faMoneyBillWave,
  faWrench,
  faUserFriends,
  faGasPump,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';

type SectionItem = {
  key: string;
  label: string;
  icon?: IconDefinition;
  children?: SectionItem[];
};

type SidebarProps = {
  sections: SectionItem[];
  selected: string;
  onSelect: (section: string) => void;
};

export default function Sidebar({ sections, selected, onSelect }: SidebarProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({});
  const toggleSection = (key: string) => {
    setOpenSections(prev => {
      const isOpen = !!prev[key];
      return isOpen ? {} : { [key]: true };
    });
  };

  const filteredSections = sections
    .map(section => {
      if (section.children) {
        const filteredChildren = section.children.filter(child =>
          child.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return filteredChildren.length ? { ...section, children: filteredChildren } : null;
      }
      return section.label.toLowerCase().includes(searchTerm.toLowerCase()) ? section : null;
    })
    .filter(Boolean) as SectionItem[];

  return (
    <aside style={{ animation: 'slideIn 0.5s ease-out forwards' }} className="w-64 bg-gray-900 text-white p-4 space-y-2 hidden md:block animate-slide-in-left">
      <div className="flex items-center gap-2 mb-6">
        <FontAwesomeIcon icon={faPlaneDeparture} className="text-2xl text-blue-400 animate-bounce" />
        <h2 className="text-xl font-bold">پنل مدیریت</h2>
      </div>
      <input
        type="text"
        placeholder="جستجو..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 mb-4 rounded bg-gray-800 text-white placeholder-gray-400"
      />
      {filteredSections.map(({ key, label, icon, children }) => (
        <div key={key}>
          <button
            onClick={() => {
              if (children) toggleSection(key);
              else onSelect(key);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded transition border-l-4 ${
              selected === key
                ? 'bg-blue-600 border-blue-300 text-white'
                : 'hover:bg-gray-800 border-transparent text-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              {icon && <FontAwesomeIcon icon={icon} className="text-lg" />}
              <span>{label}</span>
            </span>
            {children && (
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`transition-transform duration-300 ${openSections[key] ? 'rotate-180' : ''}`}
              />
            )}
          </button>
          {children && openSections[key] && (
            <div className="ml-6 mt-1 space-y-1 animate-fade-in">
              {children.map((child) => (
                <button
                  key={child.key}
                  onClick={() => onSelect(child.key)}
                  className={`w-full flex items-center gap-2 text-left px-3 py-1 rounded transition ${
                    selected === child.key ? 'bg-blue-500 text-white' : 'hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  {child.icon && <FontAwesomeIcon icon={child.icon} className="text-sm" />}
                  <span className="text-sm">{child.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </aside>
  );
}