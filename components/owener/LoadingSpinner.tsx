import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message: string;
}

export const ContentLoadingSpinner = ({
  message,
}: LoadingSpinnerProps) => (
  <div className="flex items-center justify-center min-h-[400px] w-full">
    <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/20">
      <div className="flex flex-col items-center">
        <div className="relative">
          <Loader2 className="h-16 w-16 text-purple-600 animate-spin" />
        </div>
        <p className="text-gray-800 text-lg font-medium mt-4">
          {message}
        </p>
      </div>
    </div>
  </div>
);

export const GlobalLoadingSpinner = ({
  message,
}: LoadingSpinnerProps) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/20">
      <div className="flex flex-col items-center">
        <div className="relative">
          <Loader2 className="h-16 w-16 text-purple-600 animate-spin" />
        </div>
        <p className="text-gray-800 text-lg font-medium mt-4">
          {message}
        </p>
      </div>
    </div>
  </div>
);
