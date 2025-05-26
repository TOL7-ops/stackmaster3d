import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@fontsource/inter";
import StackTowerGame from "./components/StackTowerGame";
import GameUI from "./components/GameUI";
import { useStackGame } from "./lib/stores/useStackGame";

const queryClient = new QueryClient();

function App() {
  const { gamePhase } = useStackGame();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full h-screen relative overflow-hidden bg-gradient-to-b from-purple-400 via-blue-500 to-indigo-600">
        {/* Game UI Overlay */}
        <GameUI />
        
        {/* 3D Canvas */}
        <Canvas
          shadows
          camera={{
            position: [5, 8, 5],
            fov: 60,
            near: 0.1,
            far: 1000
          }}
          gl={{
            antialias: true,
            powerPreference: "high-performance"
          }}
        >
          {/* Enhanced Lighting */}
          <ambientLight intensity={0.3} color="#8B5CF6" />
          <directionalLight
            position={[10, 15, 5]}
            intensity={1.2}
            color="#FFFFFF"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-15}
            shadow-camera-right={15}
            shadow-camera-top={15}
            shadow-camera-bottom={-15}
          />
          <pointLight position={[-5, 10, -5]} intensity={0.5} color="#60A5FA" />
          <pointLight position={[5, 10, 5]} intensity={0.5} color="#F472B6" />
          
          <Suspense fallback={null}>
            <StackTowerGame />
          </Suspense>
        </Canvas>
      </div>
    </QueryClientProvider>
  );
}

export default App;
