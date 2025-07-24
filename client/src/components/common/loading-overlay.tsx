interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message = "Loading..." }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-blue mx-auto mb-4"></div>
        <p className="text-coastal-grey">{message}</p>
      </div>
    </div>
  );
}
