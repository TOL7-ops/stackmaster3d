import { useStackGame } from "../lib/stores/useStackGame";
import { useAudio } from "../lib/stores/useAudio";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

export default function GameUI() {
  const { gamePhase, score, highScore, resetGame, isDropping, speed } = useStackGame();
  const { isMuted, toggleMute } = useAudio();

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Score Display - Mobile Friendly */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 pointer-events-auto">
        <Card className="bg-black/90 text-white border-white/20 backdrop-blur-sm">
          <CardContent className="p-3 sm:p-4">
            <h2 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Score: {score}
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
              <p className="text-xs sm:text-sm text-gray-300 mt-1">
                High Score: {highScore}
              </p>
              {gamePhase === "playing" && (
                <p className="text-xs text-blue-400 mt-1">
                  Speed: {speed.toFixed(1)}x
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audio Control - Mobile Friendly */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 pointer-events-auto">
        <Button
          onClick={toggleMute}
          className="bg-black/80 hover:bg-black/90 text-white border border-white/20 p-2 sm:p-3"
          size="sm"
        >
          {isMuted ? "🔇" : "🔊"}
        </Button>
      </div>

      {/* Instructions */}
      {gamePhase === "ready" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Card className="bg-black/90 text-white border-white/20 max-w-md">
            <CardContent className="p-8 text-center">
              <h1 className="text-4xl font-bold mb-4">Stack Tower</h1>
              <p className="text-lg mb-4">
                Click or press SPACE to drop blocks and build the highest tower!
              </p>
              <p className="text-sm text-gray-300">
                Misaligned blocks will be trimmed. Game over when blocks become too small.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Game Playing Instructions */}
      {gamePhase === "playing" && !isDropping && (
        <div className="absolute bottom-4 left-4 pointer-events-auto">
          <Card className="bg-black/80 text-white border-white/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-sm animate-pulse">Click or press SPACE to drop the block</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dropping Feedback */}
      {isDropping && (
        <div className="absolute bottom-4 left-4 pointer-events-auto">
          <Card className="bg-green-600/80 text-white border-green-400/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-sm font-semibold">Dropping...</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Game Over Screen - Mobile Friendly */}
      {gamePhase === "ended" && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <Card className="bg-black/90 text-white border-white/20 max-w-md w-full backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-red-400">Game Over!</h1>
              
              {/* Score Summary */}
              <div className="mb-6 space-y-2">
                <p className="text-xl sm:text-2xl mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent font-bold">
                  Your Score: {score}
                </p>
                <p className="text-lg sm:text-xl text-gray-300">
                  Highest Score: {highScore}
                </p>
                {score === highScore && score > 0 && (
                  <p className="text-sm text-green-400 font-semibold animate-pulse">
                    🎉 NEW HIGH SCORE! 🎉
                  </p>
                )}
              </div>
              
              <p className="text-sm sm:text-lg mb-6 text-gray-300">
                The block became too small to continue!
              </p>
              
              <Button 
                onClick={resetGame}
                className="pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-2 sm:py-3 text-lg font-semibold"
              >
                Try Again
              </Button>
              <p className="text-xs sm:text-sm mt-4 text-gray-400">
                Or click anywhere / press SPACE
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
