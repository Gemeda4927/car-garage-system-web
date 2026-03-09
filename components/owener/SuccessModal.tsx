// components/dashboard/SuccessModal.tsx
import { CheckCircle } from "lucide-react";

interface SuccessModalProps {
  message: string;
  onClose: () => void;
}

export const SuccessModal = ({ message, onClose }: SuccessModalProps) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/20 transform animate-scale-in">
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
          <CheckCircle className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
        <p className="text-gray-600 text-center mb-6">{message}</p>
        <button
          onClick={onClose}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all transform hover:-translate-y-0.5 shadow-lg font-medium"
        >
          Continue
        </button>
      </div>
    </div>
  </div>
);