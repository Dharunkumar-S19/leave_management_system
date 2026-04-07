import React from 'react';
import { Calendar, Heart, ShieldCheck } from 'lucide-react';

const LeaveBalanceCards = ({ balance }) => {
  if (!balance) return null;

  const cards = [
    {
      title: 'Casual Leave',
      used: balance.cl_used,
      total: balance.cl_total,
      remaining: balance.cl_remaining,
      icon: <Calendar className="text-blue-600" size={24} />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100'
    },
    {
      title: 'Medical Leave',
      used: balance.ml_used,
      total: balance.ml_total,
      remaining: balance.ml_remaining,
      icon: <Heart className="text-red-600" size={24} />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-100'
    },
    {
      title: 'On Duty',
      used: balance.od_used,
      total: '-', // OD usually doesn't have a fixed total in many systems
      remaining: 'Used: ' + balance.od_used,
      icon: <ShieldCheck className="text-green-600" size={24} />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className={`p-6 rounded-2xl border ${card.borderColor} ${card.bgColor} shadow-sm transition-all hover:shadow-md`}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              {card.icon}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              {card.title}
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-gray-900">
              {card.remaining} <span className="text-sm font-medium text-gray-500">Remaining</span>
            </h3>
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-semibold">{card.used}</span>
              <span className="mx-1">/</span>
              <span>{card.total}</span>
              <span className="ml-2 font-medium">Total Credits</span>
            </div>
          </div>
          
          {/* Simple Progress Bar */}
          <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full ${card.icon.props.className.replace('text', 'bg')} transition-all duration-1000`} 
              style={{ width: card.total === '-' ? '0%' : `${(card.used / card.total) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeaveBalanceCards;
