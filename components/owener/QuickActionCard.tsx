interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  onClick: () => void;
  disabled?: boolean;
}

export const QuickActionCard = ({
  title,
  description,
  icon: Icon,
  color,
  onClick,
  disabled = false,
}: QuickActionCardProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left w-full group ${
      disabled
        ? "opacity-50 cursor-not-allowed"
        : ""
    }`}
  >
    <div
      className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
    >
      <Icon
        className={`h-6 w-6 text-${color}-600`}
      />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      {title}
    </h3>
    <p className="text-gray-600 text-sm">
      {description}
    </p>
  </button>
);
