import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { calculateTrimming, generateBlockColor } from "../gameLogic";
import * as THREE from "three";

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
  direction: "x" | "z";
  speed: number;
  blockSize: [number, number, number];
  
  // Actions
  startGame: () => void;
  dropBlock: () => void;
  updateCurrentBlock: (delta: number) => void;
  gameOver: () => void;
  resetGame: () => void;
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
    direction: "x",
    speed: 3,
    blockSize: INITIAL_BLOCK_SIZE,
    
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
      if (!state.currentBlock || state.gamePhase !== "playing") return;
      
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
      if (!state.currentBlock || state.gamePhase !== "playing") return;
      
      const { blocks, currentBlock, direction, score, speed } = state;
      const lastBlock = blocks[blocks.length - 1];
      
      // Calculate trimming
      const trimResult = calculateTrimming(lastBlock, currentBlock, direction);
      
      if (!trimResult) {
        // Complete miss - game over
        set({ gamePhase: "ended" });
        return;
      }
      
      const { newBlock, newSize } = trimResult;
      
      // Check if block is too small
      if (newSize[0] < MIN_BLOCK_SIZE || newSize[2] < MIN_BLOCK_SIZE) {
        set({ gamePhase: "ended" });
        return;
      }
      
      // Add the trimmed block to the stack
      const newBlocks = [...blocks, newBlock];
      const newScore = score + (trimResult.perfect ? 10 : 1);
      
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
        blockSize: newSize
      });
    },
    
    gameOver: () => {
      set({ gamePhase: "ended" });
    },
    
    resetGame: () => {
      set({
        gamePhase: "ready",
        blocks: [],
        currentBlock: null,
        score: 0,
        direction: "x",
        speed: 3,
        blockSize: INITIAL_BLOCK_SIZE
      });
    }
  }))
);
