
import { TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: string;
}

export const StatCard = ({ title, value, icon: Icon, color, trend }: StatCardProps) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
      {trend && (
        <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center">
          <TrendingUp className="h-3 w-3 mr-1" />
          {trend}%
        </span>
      )}
    </div>
    <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);