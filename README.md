PROCTORING-SYSTEM
├── 🐍 backend (Python / FastAPI or Flask)
│ ├── api # Endpoints (Routes)
│ │ ├── session.py # Start/Stop exam, validate token
│ │ ├── alerts.py # (Renamed from slaert.py) Receives warnings
│ │ └── snapshots.py # Receives base64 images
│ ├── services # Business Logic
│ │ ├── report_gen.py # Compiles final PDF/JSON report
│ │ └── storage.py # S3 or Local disk saver
│ ├── storage # Local folder for temp images
│ └── main.py # Entry point
│
├── ⚛️ frontend (Next.js App)
│ ├── public # Static assets (models, logos)
│ ├── src
│ │ ├── app # Next.js App Router (Pages)
│ │ │ ├── exam
│ │ │ │ ├── [id]
│ │ │ │ │ ├── page.tsx # The Exam Room (Main)
│ │ │ │ │ └── gateway.tsx # System Check Page
│ │ ├── components
│ │ │ ├── ui # Buttons, Modals, Cards
│ │ │ └── proctor # Proctoring specific UI
│ │ │ ├── CameraView.tsx
│ │ │ └── StatusLog.tsx
│ │ │
│ │ │ # 👇 Твой SDK и ML переезжают сюда, в src/lib или src/modules
│ │ └── modules
│ │ ├── proctoring-sdk
│ │ │ ├── core
│ │ │ │ ├── ProctoringEngine.ts # Main Orchestrator (Facade)
│ │ │ │ ├── MonitoringEngine.ts # Loop runner
│ │ │ │ ├── AlertEngine.ts # Logic for deciding when to warn
│ │ │ │ ├── Logger.ts
│ │ │ │ └── config.ts
│ │ │ ├── services
│ │ │ │ ├── CameraController.ts
│ │ │ │ ├── BrowserWatchers.ts # Tab visibility, blur
│ │ │ │ ├── PreExamChecker.ts # Hardware checks
│ │ │ │ └── SnapshotService.ts
│ │ │ └── types.ts
│ │ │
│ │ └── vision-ml # (Твоя папка ml)
│ │ ├── behavior
│ │ ├── config
│ │ │ └── threshold.json
│ │ └── vision
│ │ ├── faceDetection.ts
│ │ ├── faceMesh.ts
│ │ ├── gazeEstimator.ts
│ │ └── headPose.ts
│ │
│ └── package.json

Step 1:
npm install @mediapipe/face_mesh @mediapipe/camera_utils react-webcam

Step 2:
cd frontend

Step 3:
npm run dev
