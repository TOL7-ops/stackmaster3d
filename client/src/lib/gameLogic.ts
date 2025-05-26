interface Block {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}

interface TrimResult {
  newBlock: Block;
  newSize: [number, number, number];
  perfect: boolean;
}

export function calculateTrimming(
  lastBlock: Block, 
  currentBlock: Block, 
  direction: "x" | "z"
): TrimResult | null {
  const [lastX, lastY, lastZ] = lastBlock.position;
  const [lastW, lastH, lastD] = lastBlock.size;
  const [currX, currY, currZ] = currentBlock.position;
  const [currW, currH, currD] = currentBlock.size;
  
  let overlap: number;
  let newPosition: [number, number, number];
  let newSize: [number, number, number];
  
  if (direction === "x") {
    // Calculate overlap in X direction
    const lastLeft = lastX - lastW / 2;
    const lastRight = lastX + lastW / 2;
    const currLeft = currX - currW / 2;
    const currRight = currX + currW / 2;
    
    const overlapLeft = Math.max(lastLeft, currLeft);
    const overlapRight = Math.min(lastRight, currRight);
    overlap = overlapRight - overlapLeft;
    
    if (overlap <= 0) return null; // No overlap
    
    // Perfect alignment bonus
    const perfect = Math.abs(lastX - currX) < 0.1;
    
    const newX = (overlapLeft + overlapRight) / 2;
    newPosition = [newX, currY, currZ];
    newSize = [overlap, currH, currD];
  } else {
    // Calculate overlap in Z direction
    const lastFront = lastZ - lastD / 2;
    const lastBack = lastZ + lastD / 2;
    const currFront = currZ - currD / 2;
    const currBack = currZ + currD / 2;
    
    const overlapFront = Math.max(lastFront, currFront);
    const overlapBack = Math.min(lastBack, currBack);
    overlap = overlapBack - overlapFront;
    
    if (overlap <= 0) return null; // No overlap
    
    // Perfect alignment bonus
    const perfect = Math.abs(lastZ - currZ) < 0.1;
    
    const newZ = (overlapFront + overlapBack) / 2;
    newPosition = [currX, currY, newZ];
    newSize = [currW, currH, overlap];
  }
  
  return {
    newBlock: {
      position: newPosition,
      size: newSize,
      color: currentBlock.color
    },
    newSize,
    perfect: Math.abs(lastBlock.position[direction === "x" ? 0 : 2] - currentBlock.position[direction === "x" ? 0 : 2]) < 0.1
  };
}

export function generateBlockColor(index: number): string {
  const colors = [
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#45B7D1", // Blue
    "#FFA07A", // Orange
    "#98D8C8", // Mint
    "#F7DC6F", // Yellow
    "#BB8FCE", // Purple
    "#85C1E9", // Light Blue
    "#F8C471", // Gold
    "#82E0AA", // Green
  ];
  
  return colors[index % colors.length];
}
