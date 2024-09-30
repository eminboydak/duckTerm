import { useState } from 'react'

export default function Tab({ tabs }) {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div>
      {/* Tab titles */}
      <div className="flex space-x-5 justify-center">
        {tabs.map((tab, index) => (
          <div
            key={index}
            className={`text-base font-bold border-b-2 border-transparent pb-1 cursor-pointer ${activeTab === index ? 'text-ctp-green border-ctp-green' : 'text-ctp-text hover:text-ctp-subtext0'}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.title}
          </div>
        ))}
      </div>

      {/* Active tab content */}
      <div className="p-4">{tabs[activeTab] && tabs[activeTab].content}</div>
    </div>
  )
}
