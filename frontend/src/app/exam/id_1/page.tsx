import CameraView from '@/components/proctor/CameraView';

export default function ExamPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-24">
      <h1 className="text-white text-2xl mb-4">Proctoring Dev Test</h1>
      <CameraView />
    </div>
  );
}