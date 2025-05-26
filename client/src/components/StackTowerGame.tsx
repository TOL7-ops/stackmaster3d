import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useStackGame } from "../lib/stores/useStackGame";
import { calculateTrimming, generateBlockColor } from "../lib/gameLogic";
import Block from "./Block";
import Camera from "./Camera";

export default function StackTowerGame() {
  const {
    gamePhase,
    blocks,
    currentBlock,
    score,
    direction,
    speed,
    startGame,
    dropBlock,
    gameOver,
    resetGame
  } = useStackGame();

  const gameStarted = useRef(false);

  // Start the game automatically
  useEffect(() => {
    if (!gameStarted.current && gamePhase === "ready") {
      startGame();
      gameStarted.current = true;
    }
  }, [gamePhase, startGame]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "Enter") {
        event.preventDefault();
        if (gamePhase === "playing") {
          dropBlock();
        } else if (gamePhase === "ended") {
          resetGame();
          gameStarted.current = false;
        }
      }
    };

    const handleClick = () => {
      if (gamePhase === "playing") {
        dropBlock();
      } else if (gamePhase === "ended") {
        resetGame();
        gameStarted.current = false;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("click", handleClick);
    };
  }, [gamePhase, dropBlock, resetGame]);

  // Animate sliding block
  useFrame((state, delta) => {
    if (gamePhase === "playing" && currentBlock) {
      useStackGame.getState().updateCurrentBlock(delta);
    }
  });

  return (
    <>
      <Camera stackHeight={blocks.length} />
      
      {/* Ground plane */}
      <mesh receiveShadow position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Render all stacked blocks */}
      {blocks.map((block, index) => (
        <Block
          key={index}
          position={block.position}
          size={block.size}
          color={block.color}
          castShadow
          receiveShadow
        />
      ))}

      {/* Render current sliding block */}
      {currentBlock && gamePhase === "playing" && (
        <Block
          position={currentBlock.position}
          size={currentBlock.size}
          color={currentBlock.color}
          castShadow
        />
      )}
    </>
  );
}
