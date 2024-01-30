import { useState, useEffect, useCallback } from "react";
import "./Game.css";

const CELL_SIZE = 20;
const WIDTH = 1200;
const HEIGHT = 900;
const rows = HEIGHT / CELL_SIZE;
const cols = WIDTH / CELL_SIZE;

const generateEmptyGrid = () => Array.from({ length: rows }, () => Array(cols).fill(false));

const getElementOffset = (elem) => {
  const rect = elem.getBoundingClientRect();
  const doc = document.documentElement;

  return {
    x: rect.left - doc.clientLeft,
    y: rect.top - doc.clientTop,
  };
};

const Cell = ({ x, y }) => {
  return (
    <div
      className="Cell"
      style={{
        left: `${CELL_SIZE * x + 1}px`,
        top: `${CELL_SIZE * y + 1}px`,
        width: `${CELL_SIZE - 1}px`,
        height: `${CELL_SIZE - 1}px`,
      }}
    />
  );
};

const Game = () => {
  const [cells, setCells] = useState(() => generateEmptyGrid());
  const [cellList, setCellList] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(100);
  
  const runIteration = useCallback(() => {
    const neighborOffsets = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];
    // console.log('Running iteration');
    
    const newCells = [...cells];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let neighbors = 0;

        neighborOffsets.forEach(([offsetX, offsetY]) => {
          const newX = x + offsetX;
          const newY = y + offsetY;
          if (newX >= 0 && newX < cols && newY >= 0 && newY < rows) {
            neighbors += cells[newY][newX];
          }
        });

        if (neighbors < 2 || neighbors > 3) {
          newCells[y][x] = false;
        } else if (!cells[y][x] && neighbors === 3) {
          newCells[y][x] = true;
        }
      }
    }

    setCells(newCells);   
  }, [cells]);

  useEffect(() => {
    if (!isRunning) { return; }
    const id = setInterval(runIteration, updateInterval);
    return () => clearInterval(id);
  }, [isRunning, updateInterval, runIteration]);  

  useEffect(() => {
    // Update cellList whenever cells change
    const newCellList = [];
    
    // use forEach instead of nested for loops
    cells.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          newCellList.push({ x, y });
        }
      });
    });
    
    setCellList(newCellList);
  }, [cells]);

  const handleBoardClick = (event) => {
    if (isRunning) return;
    const elemOffset = getElementOffset(event.currentTarget);

    const offsetX = event.clientX - elemOffset.x;
    const offsetY = event.clientY - elemOffset.y;

    const x = Math.floor(offsetX / CELL_SIZE);
    const y = Math.floor(offsetY / CELL_SIZE);

    console.log('Clicked at:', x, y);

    if (x >= 0 && x < cols && y >= 0 && y < rows) {
      // ? 
      const newCells = [...cells];
      newCells[y][x] = !newCells[y][x];
      setCells(newCells);
    }
  };
  
  const handleRandomClick = () => {
    const newCells = generateEmptyGrid();
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        newCells[y][x] = Math.random() > 0.5;
      }
    }
    setCells(newCells);
  };

  const handleClearClick = () => setCells(generateEmptyGrid());
  const handleStopClick = () => setIsRunning(false);  
  const handleRunClick = () => setIsRunning(true);

  return (
    <div>
      <div
        className="Board"
        onClick={handleBoardClick}
        style={{
          width: WIDTH,
          height: HEIGHT,
          backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
        }}
      >
        {cellList.map((cell) => (
          <Cell x={cell.x} y={cell.y} key={`${cell.x},${cell.y}`} />
        ))}
      </div>

      <div className="controls">
        Update every{" "}
        <input
          className="input"
          value={updateInterval}
          onChange={(event) => setUpdateInterval(event.target.value)}
        />{" "}
        msec
        {isRunning ?
            <button className="button" onClick={handleStopClick}>Stop</button> :
            <button className="button" onClick={handleRunClick}>Run</button>
        }
        <button className="button" onClick={handleRandomClick} disabled={isRunning}>Random</button>
        <button className="button" onClick={handleClearClick} disabled={isRunning}>Clear</button>
        
      </div>
    </div>
  );
};

export default Game;
