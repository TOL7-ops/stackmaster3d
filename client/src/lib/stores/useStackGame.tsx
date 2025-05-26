import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { calculateTrimming, generateBlockColor } from "../gameLogic";
import { useAudio } from "./useAudio";
import * as THREE from "three";
import gsap from "gsap";

export type GamePhase = "ready" | "playing" | "ended";

interface Block {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}

interface GameState {
  gamePhase: GamePhase;
  blocks: Block[];
  currentBlock: Block | null;
  score: number;
  highScore: number;
  direction: "x" | "z";
  speed: number;
  blockSize: [number, number, number];
  isDropping: boolean;
  
  // Actions
  startGame: () => void;
  dropBlock: () => void;
  updateCurrentBlock: (delta: number) => void;
  gameOver: () => void;
  resetGame: () => void;
  loadHighScore: () => void;
  saveHighScore: () => void;
}

const INITIAL_BLOCK_SIZE: [number, number, number] = [3, 2, 3];
const SLIDE_DISTANCE = 6;
const MIN_BLOCK_SIZE = 0.5;

export const useStackGame = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    gamePhase: "ready",
    blocks: [],
    currentBlock: null,
    score: 0,
    highScore: 0,
    direction: "x",
    speed: 3,
    blockSize: INITIAL_BLOCK_SIZE,
    isDropping: false,
    
    startGame: () => {
      const baseBlock: Block = {
        position: [0, 0, 0],
        size: INITIAL_BLOCK_SIZE,
        color: generateBlockColor(0)
      };
      
      const firstSlidingBlock: Block = {
        position: [-SLIDE_DISTANCE, 2, 0],
        size: INITIAL_BLOCK_SIZE,
        color: generateBlockColor(1)
      };
      
      set({
        gamePhase: "playing",
        blocks: [baseBlock],
        currentBlock: firstSlidingBlock,
        score: 0,
        direction: "x",
        speed: 3,
        blockSize: INITIAL_BLOCK_SIZE
      });
    },
    
    updateCurrentBlock: (delta: number) => {
      const state = get();
      if (!state.currentBlock || state.gamePhase !== "playing" || state.isDropping) return;
      
      const { currentBlock, direction, speed } = state;
      const newPosition: [number, number, number] = [...currentBlock.position];
      
      if (direction === "x") {
        newPosition[0] += speed * delta;
        if (newPosition[0] > SLIDE_DISTANCE) {
          newPosition[0] = -SLIDE_DISTANCE;
        }
      } else {
        newPosition[2] += speed * delta;
        if (newPosition[2] > SLIDE_DISTANCE) {
          newPosition[2] = -SLIDE_DISTANCE;
        }
      }
      
      set({
        currentBlock: {
          ...currentBlock,
          position: newPosition
        }
      });
    },
    
    dropBlock: () => {
      const state = get();
      if (!state.currentBlock || state.gamePhase !== "playing" || state.isDropping) return;
      
      const { blocks, currentBlock, direction, score, speed } = state;
      const lastBlock = blocks[blocks.length - 1];
      
      // Set dropping state to prevent further input
      set({ isDropping: true });
      
      // Calculate target drop position
      const targetY = blocks.length * 2;
      const dropPosition: [number, number, number] = [
        currentBlock.position[0],
        targetY,
        currentBlock.position[2]
      ];
      
      // Animate the drop with GSAP
      const tempPosition = { 
        x: currentBlock.position[0],
        y: currentBlock.position[1],
        z: currentBlock.position[2]
      };
      
      gsap.to(tempPosition, {
        duration: 0.3,
        y: targetY,
        ease: "bounce.out",
        onUpdate: () => {
          const state = get();
          if (state.currentBlock) {
            set({
              currentBlock: {
                ...state.currentBlock,
                position: [tempPosition.x, tempPosition.y, tempPosition.z]
              }
            });
          }
        },
        onComplete: () => {
          // After drop animation, calculate trimming
          const state = get();
          if (!state.currentBlock) return;
          
          const trimResult = calculateTrimming(lastBlock, {
            ...state.currentBlock,
            position: dropPosition
          }, direction);
          
          if (!trimResult) {
            // Complete miss - game over
            set({ gamePhase: "ended", isDropping: false });
            return;
          }
          
          const { newBlock, newSize } = trimResult;
          
          // Check if block is too small
          if (newSize[0] < MIN_BLOCK_SIZE || newSize[2] < MIN_BLOCK_SIZE) {
            set({ gamePhase: "ended", isDropping: false });
            return;
          }
          
          // Add the trimmed block to the stack
          const newBlocks = [...blocks, newBlock];
          const newScore = score + (trimResult.perfect ? 10 : 1);
          
          // Play sound effect for successful drop
          if (trimResult.perfect) {
            // Perfect drop - play success sound
            try {
              const audio = useAudio.getState();
              audio.playSuccess();
            } catch (e) {
              console.log('Audio not ready yet');
            }
          } else {
            // Regular drop - play hit sound
            try {
              const audio = useAudio.getState();
              audio.playHit();
            } catch (e) {
              console.log('Audio not ready yet');
            }
          }
          
          // Create next sliding block
          const nextDirection: "x" | "z" = direction === "x" ? "z" : "x";
          const nextHeight = newBlocks.length * 2;
          const nextSpeed = Math.min(speed + 0.1, 8); // Increase speed slightly
          
          const nextBlock: Block = {
            position: nextDirection === "x" 
              ? [-SLIDE_DISTANCE, nextHeight, newBlock.position[2]]
              : [newBlock.position[0], nextHeight, -SLIDE_DISTANCE],
            size: newSize,
            color: generateBlockColor(newBlocks.length)
          };
          
          set({
            blocks: newBlocks,
            currentBlock: nextBlock,
            score: newScore,
            direction: nextDirection,
            speed: nextSpeed,
            blockSize: newSize,
            isDropping: false
          });
        }
      });
    },
    
    gameOver: () => {
      const state = get();
      // Save high score if current score is higher
      if (state.score > state.highScore) {
        const newHighScore = state.score;
        set({ highScore: newHighScore });
        // Save to localStorage
        localStorage.setItem('stackTowerHighScore', newHighScore.toString());
      }
      set({ gamePhase: "ended" });
    },
    
    loadHighScore: () => {
      // Load high score from localStorage
      const savedHighScore = localStorage.getItem('stackTowerHighScore');
      const highScore = savedHighScore ? parseInt(savedHighScore, 10) : 0;
      set({ highScore });
    },
    
    saveHighScore: () => {
      const state = get();
      localStorage.setItem('stackTowerHighScore', state.highScore.toString());
    },
    
    resetGame: () => {
      const state = get();
      set({
        gamePhase: "ready",
        blocks: [],
        currentBlock: null,
        score: 0,
        direction: "x",
        speed: 3,
        blockSize: INITIAL_BLOCK_SIZE,
        isDropping: false
        // Keep the highScore from current state
      });
    }
  }))
);
