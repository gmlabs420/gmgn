import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEthereum } from '@fortawesome/free-brands-svg-icons';
import { faPause, faPlay, faRotateLeft, faWandMagicSparkles, faInfoCircle, faCircleXmark, faSun, faMoon, faClock, faStopwatch, faPencil, faCircleExclamation, faList, faMedal, faBroom, faCirclePlay, faDiceD6, faFileCirclePlus, faGamepad, faHashtag, faTableCellsLarge, faCheck } from '@fortawesome/free-solid-svg-icons';
import html2canvas from 'html2canvas';
import ReactDOMServer from 'react-dom/server';
import NumberPad from './NumberPad'; 
import EthereumInfoModal from './EthereumInfoModal'; 
import EthereumInfoIcon from './EthereumInfoIcon'; 
import GameInfoIcon from './GameInfoIcon';







/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

const canvasWidth = 400;
const canvasHeight = 400;

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

const numberColors = {
  1: '#FFB6C1', // LightPink
  2: '#FFD700', // LightGoldenrodYellow
  3: '#98FB98', // PaleGreen
  4: '#87CEFA', // LightSkyBlue
  5: '#FF69B4', // HotPink
  6: '#FFA07A', // LightSalmon
  7: '#DA70D6', // Orchid
  8: '#40E0D0', // Turquoise
  9: '#FF8C00'  // DarkOrange
};

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

const generateCompleteBoard = () => {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  const isValid = (board, row, col, num) => {
    for (let x = 0; x < 9; x++) {
      if (board[row][x] === num || board[x][col] === num ||
        board[3 * Math.floor(row / 3) + Math.floor(x / 3)][3 * Math.floor(col / 3) + x % 3] === num) {
        return false;
      }
    }
    return true;
  };

  const solveBoard = (board) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              if (solveBoard(board)) {
                return true;
              } else {
                board[row][col] = 0;
              }
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  solveBoard(board);
  return board;
};

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

const createPlayableBoard = (completeBoard, difficulty) => {
  const playableBoard = completeBoard.map(row => row.slice());
  let squaresToRemove = Math.floor((81 * difficulty) / 100);
  while (squaresToRemove > 0) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (playableBoard[row][col] !== 0) {
      playableBoard[row][col] = 0;
      squaresToRemove--;
    }
  }
  return playableBoard;
};

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

const calculateTimeInSeconds = (time) => {
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

const formatTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

const formatTimeWithMilliseconds = (totalMilliseconds) => {
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((totalMilliseconds % 1000) / 10);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(2, '0')}`;
};

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

const addTime = (currentTime, additionalSeconds) => {
  const currentSeconds = calculateTimeInSeconds(currentTime);
  const totalSeconds = currentSeconds + additionalSeconds;
  return formatTime(totalSeconds);
};

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

export default function SunriseSudoku() {
  const canvasRef = useRef(null);
  const attestationContainerRef = useRef(null);
  const [difficulty, setDifficulty] = useState(50);
  const [completeBoard, setCompleteBoard] = useState(generateCompleteBoard());
  const [initialBoard, setInitialBoard] = useState(createPlayableBoard(completeBoard, difficulty));
  const [board, setBoard] = useState(initialBoard);
  const [selectedCell, setSelectedCell] = useState({ row: null, col: null });
  const [hoveredCell, setHoveredCell] = useState({ row: null, col: null });
  const [timer, setTimer] = useState(600000); // 10 minutes in milliseconds
  const [timerUp, setTimerUp] = useState(0); // Start from 0 milliseconds
  const [pauseDown, setPauseDown] = useState(true); // Down timer pause state
  const [pauseUp, setPauseUp] = useState(true); // Up timer pause state
  const [showPauseScreen, setShowPauseScreen] = useState(false); // Pause screen state
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [pausedByStartButton, setPausedByStartButton] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameEnd, setGameEnd] = useState(false); // Added gameEnd state
  const [history, setHistory] = useState([initialBoard]);
  const [showInfo, setShowInfo] = useState(false);
  const [gameAttestations, setGameAttestations] = useState([]);
  const [logAttestations, setLogAttestations] = useState([]);
  const [achievementAttestations, setAchievementAttestations] = useState([]);
  const [statAttestations, setStatAttestations] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [showNumberPad, setShowNumberPad] = useState(false);
  const [activeModuleMachine2, setActiveModuleMachine2] = useState('attestation');
  const [activeModuleMachine3, setActiveModuleMachine3] = useState('myBoard');
  const [modalAttestation, setModalAttestation] = useState(null);
  const [lastLoggedValue, setLastLoggedValue] = useState(difficulty);
  const [personalStats, setPersonalStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    points: 0,
    totalTimeSpentPlaying: '00:00:00',
    fastestCompletionTime: 'N/A',
    gamesCompletedUnder5Minutes: 0,
    gamesCompletedUnder10Minutes: 0,
    gamesCompletedOver10Minutes: 0,
    averageTimePerMove: '00:00:00',
    totalMovesMade: 0,
    averageMovesPerGame: 0,
    averagePointsPerGame: 0,
    averageCompletionTime: 'N/A',
    hintsUsed: false,
    mistakesMade: false,
    unlockedAchievements: [] // Ensure initialization here
  });
  
  const [darkMode, setDarkMode] = useState(false);
  const [showAttestationModal, setShowAttestationModal] = useState(false);
  const [currentAttestation, setCurrentAttestation] = useState<AttestationData | null>(null);
  const [pencilMode, setPencilMode] = useState(false);
  const [isPencilMode, setIsPencilMode] = useState(false);
  const [notes, setNotes] = useState({});
  const [logs, setLogs] = useState([]);
  const cellSize = 40;
  const gridSize = cellSize * 9;
  const offsetX = (canvasWidth - gridSize) / 2;
  const offsetY = (canvasHeight - gridSize) / 2;

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

  // Updated achievements list
const achievementsList = [
  { id: 1, description: "First Move", points: 10, icon: "🎉" },
  { id: 2, description: "First Row Completed", points: 50, icon: "✅" },
  { id: 3, description: "First Column Completed", points: 50, icon: "✅" },
  { id: 4, description: "First 3x3 Block Completed", points: 50, icon: "🟩" },
  { id: 5, description: "No Hints Used", points: 100, icon: "🙌" },
  { id: 6, description: "Fast Finish", points: 200, icon: "⏱️" },
  { id: 7, description: "Perfect Game", points: 500, icon: "🏆" },
  { id: 8, description: "Persistent Player", points: 150, icon: "📅" },
  { id: 9, description: "Master of Sudoku", points: 1000, icon: "🧠" },
  { id: 10, description: "Double Trouble", points: 300, icon: "🔄" },
  { id: 11, description: "Early Bird", points: 100, icon: "🌅" },
  { id: 12, description: "Triple Threat", points: 200, icon: "⚡️" },
  { id: 13, description: "Hint-Free", points: 150, icon: "🚫💡" },
  { id: 14, description: "Error-Free", points: 150, icon: "🚫❌" },
  { id: 15, description: "Speed Demon", points: 300, icon: "⚡️" },
  { id: 16, description: "Puzzle Master", points: 500, icon: "🧩" }
];


/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

const unlockAchievement = (achievementId) => {
  const achievement = achievementsList.find(a => a.id === achievementId);
  if (achievement && !personalStats.unlockedAchievements.includes(achievementId)) {
    setPersonalStats(prev => ({
      ...prev,
      points: prev.points + achievement.points,
      unlockedAchievements: [...prev.unlockedAchievements, achievementId]
    }));
    setAchievements(prev => [...prev, achievement]);
    flashAchievement(achievement);
  }
};



/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

const flashAchievement = (achievement) => {
  toast.success(
    <>
      <div className="achievement-toast-content">
        <div className="achievement-description">{achievement.description} {achievement.icon}</div>
        <div className="achievement-points">+{achievement.points} points</div>
      </div>
    </>,
    {
      className: 'achievement-toast',
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      closeButton: false,
      icon: false
    }
  );

  // Placeholder for sound - you can replace the URL with actual sound files
  const audio = new Audio(`path/to/sound/${achievement.id}.mp3`);
  audio.play();
};
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

const updateStatsOnGameEnd = (isWin, completionTime, hintsUsed, movesMade) => {
  setPersonalStats(prev => {
    const newGamesPlayed = prev.gamesPlayed + 1;
    const newGamesWon = isWin ? prev.gamesWon + 1 : prev.gamesWon;
    const newTotalPoints = prev.points + calculatePoints(isWin, completionTime, hintsUsed);
    const newAveragePointsPerGame = newTotalPoints / newGamesPlayed;
    const newGamesCompletedUnder5Minutes = (isWin && completionTime <= 300) ? prev.gamesCompletedUnder5Minutes + 1 : prev.gamesCompletedUnder5Minutes;
    const newGamesCompletedUnder10Minutes = (isWin && completionTime > 300 && completionTime <= 600) ? prev.gamesCompletedUnder10Minutes + 1 : prev.gamesCompletedUnder10Minutes;
    const newGamesCompletedOver10Minutes = (isWin && completionTime > 600) ? prev.gamesCompletedOver10Minutes + 1 : prev.gamesCompletedOver10Minutes;
    const newTotalTimeSpentPlaying = addTime(prev.totalTimeSpentPlaying, completionTime);
    const newTotalMovesMade = prev.totalMovesMade + movesMade;
    const newAverageMovesPerGame = newTotalMovesMade / newGamesPlayed;
    const newAverageTimePerMove = calculateAverageTimePerMove(newTotalTimeSpentPlaying, newTotalMovesMade);
    const newFastestCompletionTime = isWin && (prev.fastestCompletionTime === 'N/A' || completionTime < calculateTimeInSeconds(prev.fastestCompletionTime)) ? formatTime(completionTime) : prev.fastestCompletionTime;
    const newAverageCompletionTime = calculateAverageCompletionTime(newTotalTimeSpentPlaying, newGamesPlayed);

    return {
      ...prev,
      gamesPlayed: newGamesPlayed,
      gamesWon: newGamesWon,
      points: newTotalPoints,
      averagePointsPerGame: newAveragePointsPerGame,
      fastestCompletionTime: newFastestCompletionTime,
      gamesCompletedUnder5Minutes: newGamesCompletedUnder5Minutes,
      gamesCompletedUnder10Minutes: newGamesCompletedUnder10Minutes,
      gamesCompletedOver10Minutes: newGamesCompletedOver10Minutes,
      totalTimeSpentPlaying: newTotalTimeSpentPlaying,
      averageTimePerMove: newAverageTimePerMove,
      totalMovesMade: newTotalMovesMade,
      averageMovesPerGame: newAverageMovesPerGame,
      averageCompletionTime: newAverageCompletionTime
    };
  });
  logStatAttestation();
};


/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

  const calculatePoints = (isWin, completionTime, hintsUsed) => {
    let points = isWin ? 1000 : 0;
    points -= hintsUsed * 10;
    points -= completionTime;
    return Math.max(points, 0);
  };

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

  const calculateAverageTimePerMove = (totalTimeSpentPlaying, totalMovesMade) => {
    const totalSeconds = calculateTimeInSeconds(totalTimeSpentPlaying);
    return formatTime(Math.floor(totalSeconds / totalMovesMade));
  };

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

  const calculateAverageCompletionTime = (totalTimeSpentPlaying, gamesPlayed) => {
    const totalSeconds = calculateTimeInSeconds(totalTimeSpentPlaying);
    return formatTime(Math.floor(totalSeconds / gamesPlayed));
  };

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      drawBoard(ctx);
    }
  }, [board, selectedCell, hoveredCell, notes]);

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */


// Effect hook to update the down timer
useEffect(() => {
  let downTimerId;
  if (!pauseDown) {
    setIsGameRunning(true);
    downTimerId = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer > 0) {
          return prevTimer - 100; // Decrease by 100 milliseconds
        } else {
          clearInterval(downTimerId);
          return 0;
        }
      });
    }, 100); // Update every 100 milliseconds
  }
  return () => clearInterval(downTimerId);
}, [pauseDown]);


/* ------------------------------------------------------------------------ */

// Effect hook to update the gradient based on timer
useEffect(() => {
  const totalDuration = 600000; // 10 minutes in milliseconds
  const remainingTime = timer;
  const progress = ((totalDuration - remainingTime) / totalDuration) * 100;
  document.documentElement.style.setProperty('--progress', `${progress}%`);

  const progressElement = document.querySelector('.sunrise-progress-down');
  if (progressElement) {
    const totalMilliseconds = timer;
    const totalSeconds = Math.floor(totalMilliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    const milliseconds = Math.floor((totalMilliseconds % 1000) / 10);

    // Format and display the time
    const displayMinutes = String(minutes).padStart(2, '0');
    const displaySeconds = String(remainingSeconds).padStart(2, '0');
    const displayMilliseconds = String(milliseconds).padStart(2, '0');

    progressElement.querySelector('span').textContent = `${displayMinutes}:${displaySeconds}:${displayMilliseconds}`;
  }
}, [timer]);


/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

useEffect(() => {
  const progressElementUp = document.querySelector('.sunrise-progress-up');
  if (progressElementUp) {
    const totalMilliseconds = timerUp;
    const totalSeconds = Math.floor(totalMilliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    const milliseconds = Math.floor((totalMilliseconds % 1000) / 10);

    // Format and display the time
    const displayMinutes = String(minutes).padStart(2, '0');
    const displaySeconds = String(remainingSeconds).padStart(2, '0');
    const displayMilliseconds = String(milliseconds).padStart(2, '0');

    progressElementUp.querySelector('span').textContent = `${displayMinutes}:${displaySeconds}:${displayMilliseconds}`;
  }
}, [timerUp]);


/* ------------------------------------------------------------------------ */

// Effect hook to update the up timer
useEffect(() => {
  let upTimerId;
  if (!pauseUp) {
    setIsGameRunning(true);
    upTimerId = setInterval(() => {
      setTimerUp((prevTimerUp) => prevTimerUp + 100); // Update every 100 milliseconds
    }, 100);
  }
  return () => clearInterval(upTimerId);
}, [pauseUp]);


/* ------------------------------------------------------------------------ */

const handleTogglePlayPause = () => {
  if (isGameRunning) {
    handlePauseBoth();
  } else {
    handleResumeBoth();
  }
  setIsGameRunning(!isGameRunning);
};


const handlePauseUp = () => {
  setPauseUp(true);
  setShowPauseScreen(true);
  logAction('Up Timer Paused');
};

const handleResumeUp = () => {
  setPauseUp(false);
  setShowPauseScreen(false);
  setIsGameRunning(true);
  logAction('Up Timer Resumed');
};

const handleResumeBoth = () => {
  setPauseDown(false);
  setPauseUp(false);
  setShowPauseScreen(false);
  logAction('Both Timers Resumed');
};

const handlePauseBoth = () => {
  setPauseDown(true);
  setPauseUp(true);
  setShowPauseScreen(true);
  logAction('Both Timers Paused');
};

// Handle pause and show pause screen
const handlePauseDown = () => {
  setPauseDown(true);
  setShowPauseScreen(true);
  logAction('Down Timer Paused');

};

const handleResumeDown = () => {
  setPauseDown(false);
  setShowPauseScreen(false);
  setIsGameRunning(true);
  logAction('Down Timer Resumed');

}; 

const handleStartTimers = () => {
  setPauseDown(false);
  setPauseUp(false);
  setIsGameRunning(true);
  setShowPauseScreen(false);
  logAction('Game Started');
};



const handlePausedTimers = () => {
  setPauseDown(true);
  setPauseUp(true);
  setShowPauseScreen(true);
  logAction('Both Timers Paused via Start Button');
};

const handlePauseTimers = () => {
  setPauseDown(true);
  setPauseUp(true);
  setIsGameRunning(false); 
  setShowPauseScreen(true);
  setPausedByStartButton(true);
  logAction('Both Timers Paused via Start Button');
};



/* ------------------------------------------------------------------------ */

const setCanvasSize = (canvas) => {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvasWidth * dpr;
  canvas.height = canvasHeight * dpr;
  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  return ctx;
};

useEffect(() => {
  const canvas = canvasRef.current;
  if (canvas) {
    const ctx = setCanvasSize(canvas);
    drawBoard(ctx);
  }
}, [board, selectedCell, hoveredCell, notes]);


/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

const drawBoard = (ctx) => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.fillStyle = darkMode ? "#333" : "#fff";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.strokeStyle = darkMode ? "#fff" : "#333";
  ctx.lineWidth = 10;
  ctx.strokeRect(offsetX, offsetY, gridSize, gridSize);

  ctx.lineWidth = 3;
  for (let row = 0; row <= 9; row += 3) {
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY + row * cellSize);
    ctx.lineTo(offsetX + gridSize, offsetY + row * cellSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(offsetX + row * cellSize, offsetY);
    ctx.lineTo(offsetX + row * cellSize, offsetY + gridSize);
    ctx.stroke();
  }

  ctx.lineWidth = 1;
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const x = col * cellSize + offsetX;
      const y = row * cellSize + offsetY;

      if ((row % 3 !== 0 || col % 3 !== 0) || row === 0 || col === 0) {
        ctx.strokeRect(x, y, cellSize, cellSize);
      }

      const value = board[row][col];
      if (value !== 0) {
        ctx.fillStyle = numberColors[value] || "#fff";
        ctx.fillRect(x, y, cellSize, cellSize);

        ctx.font = "20px 'Londrina Solid', cursive"; // Ensure Londrina font
        ctx.fillStyle = darkMode ? "#fff" : "#333";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(value, x + cellSize / 2, y + cellSize / 2);
      }
      if (hoveredCell.row === row && hoveredCell.col === col) {
        ctx.fillStyle = "rgba(255, 154, 75, 0.5)";
        ctx.fillRect(x, y, cellSize, cellSize);
      }
      if (selectedCell.row === row && selectedCell.col === col) {
        ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
        ctx.fillRect(x, y, cellSize, cellSize);
      }

      // Draw pencil notes
      if (notes[`${row}-${col}`]) {
        ctx.font = "10px 'Londrina Solid', cursive"; // Ensure Londrina font
        ctx.fillStyle = darkMode ? "#ccc" : "#666";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(notes[`${row}-${col}`].join(','), x + 2, y + 2);
       }
    }
  }
};



/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

  const handleMouseMove = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor((x - offsetX) / cellSize);
    const row = Math.floor((y - offsetY) / cellSize);
    setHoveredCell({ row, col });
  };

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

  const handleMouseClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor((x - offsetX) / cellSize);
    const row = Math.floor((y - offsetY) / cellSize);
    setSelectedCell({ row, col });
    logAction(`Cell (${row}, ${col}) Selected`);
  };

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */





/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

  const handleMagic = () => {
    if (history.length > 1) {
      logAction('Magic Wand Used (Undo)');
      setHistory((prevHistory) => {
        const newHistory = prevHistory.slice(0, -1);
        setBoard(newHistory[newHistory.length - 1]);
        return newHistory;
      });
    }
  };

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

const generateSVGBoard = (board, notes, selectedCell, hoveredCell, darkMode, attestationData) => {
  const cellSize = 20; // Reduced cell size
  const boardPadding = 10; // Padding around the board
  const metadataHeight = 60; // Height for the metadata section
  const spacing = 10; // Reduced spacing between lines

  const numberColors = {
    1: '#FFB6C1', // LightPink
    2: '#FFD700', // LightGoldenrodYellow
    3: '#98FB98', // PaleGreen
    4: '#87CEFA', // LightSkyBlue
    5: '#FF69B4', // HotPink
    6: '#FFA07A', // LightSalmon
    7: '#DA70D6', // Orchid
    8: '#40E0D0', // Turquoise
    9: '#FF8C00' // DarkOrange
  };

  // Ensure board is an array
  const safeBoard = Array.isArray(board) ? board : [];

  const svgContent = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={cellSize * 9 + boardPadding * 2}
      height={cellSize * 9 + boardPadding * 2 + metadataHeight}
      style={{ background: "#fff", border: "3px solid rgb(255, 225, 0)", boxShadow: "0 1px 3px #ffeeb5, inset 0 2px 4px rgba(133, 190, 255, 0.227), inset 0 -2px 1px #000000ba" }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Londrina+Solid:wght@300;400;700&display=swap');
          .title { font-family: 'Londrina Solid', cursive; font-size: 12px; font-weight: bold; fill: #333; text-anchor: middle; }
          .subtitle { font-family: 'Londrina Solid', cursive; font-size: 10px; fill: #666; text-anchor: middle; }
          .content { font-family: 'Londrina Solid', cursive; font-size: 8px; fill: #000; text-anchor: middle; }
          .small-note { font-family: 'Londrina Solid', cursive; font-size: 6px; fill: #666; }
          .number { font-family: 'Londrina Solid', cursive; font-size: 10px; text-anchor: middle; alignment-baseline: middle; fill: #000; }
        `}
      </style>
      <text x="50%" y="15" className="subtitle">Time: {attestationData ? attestationData.time : 'N/A'}</text>
      <text x="50%" y={15 + spacing} className="content">Points: {attestationData ? attestationData.points : 'N/A'}</text>
      <text x="50%" y={15 + spacing * 2} className="content">Difficulty: {attestationData ? attestationData.difficulty : 'N/A'}</text>
      <text x="50%" y={15 + spacing * 3} className="content">Timer: {attestationData ? attestationData.timer : 'N/A'}</text>
      <text x="50%" y={15 + spacing * 4} className="content">Timer Up: {attestationData ? attestationData.timerUp : 'N/A'}</text>

      {safeBoard.map((row, rowIndex) => (
        row.map((cell, colIndex) => {
          const x = colIndex * cellSize + boardPadding;
          const y = rowIndex * cellSize + boardPadding + metadataHeight;
          let fill = "#fff";
          if (cell !== 0) {
            fill = numberColors[cell] || "#fff";
          } else if (notes[`${rowIndex}-${colIndex}`]) {
            fill = "lightgray"; // Color for notes
          }
          return (
            <g key={`${rowIndex}-${colIndex}`}>
              <rect
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                fill={fill}
                stroke="#000"
                strokeWidth={0.5}
              />
              {cell !== 0 && (
                <text
                  x={x + cellSize / 2}
                  y={y + cellSize / 2}
                  className="number"
                >
                  {cell}
                </text>
              )}
              {notes[`${rowIndex}-${colIndex}`] && (
                <text
                  x={x + 2}
                  y={y + 2}
                  className="small-note"
                >
                  {notes[`${rowIndex}-${colIndex}`].join(',')}
                </text>
              )}
            </g>
          );
        })
      ))}
    </svg>
  );

  return ReactDOMServer.renderToString(svgContent);
};




const captureGameBoard = (board, notes, selectedCell, hoveredCell, darkMode, attestationData) => {
  const svgString = generateSVGBoard(board, notes, selectedCell, hoveredCell, darkMode, attestationData);
  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
  console.log("Generated SVG Data URL:", svgDataUrl); // Debugging line
  return svgDataUrl;
};




interface AttestationData {
  type: string;
  time: string;
  points: number;
  difficulty: number;
  timer: number;
  timerUp: number;
  boardImage?: string; // Optional property for the image URL
}


/* ------------------------------------------------------------------------ */

const captureAndCreateAttestation = () => {
  const boardImage = captureGameBoard(board, notes, selectedCell, hoveredCell, darkMode, {
    type: 'end',
    time: new Date().toLocaleString(),
    points: personalStats.points,
    difficulty,
    timer,
    timerUp
  });

  const newAttestation = {
    type: 'end',
    time: new Date().toLocaleString(),
    points: personalStats.points,
    difficulty,
    timer,
    timerUp,
    boardImage,
    minted: false
  };

  return newAttestation;
};


/* ------------------------------------------------------------------------ */

const handleNewBoardAndLogAttestation = async () => {
  // Capture the current state and create the attestation
  const newAttestation = captureAndCreateAttestation();

  console.log("Generated SVG Data URL:", newAttestation.boardImage); // Debugging line
  console.log("Setting new attestation:", newAttestation); // Debugging line

  // Update state for current attestation and show modal
  setCurrentAttestation(newAttestation);
  setShowAttestationModal(true);
};

/* ------------------------------------------------------------------------ */

const handleNewBoard = async () => {
  // Capture the current state and create the attestation
  const newAttestation = captureAndCreateAttestation();

  console.log("Generated SVG Data URL:", newAttestation.boardImage); // Debugging line
  console.log("Setting new attestation:", newAttestation); // Debugging line

  // Update state for modal attestation and show modal
  setModalAttestation(newAttestation);
  setShowAttestationModal(true);
};



// Effect to log state updates for debugging
useEffect(() => {
  console.log("Show Attestation Modal:", showAttestationModal);
  if (currentAttestation) {
    console.log("Updated Current Attestation:", currentAttestation);
  }
}, [showAttestationModal, currentAttestation]);


 
/* ------------------------------------------------------------------------ */

const logGameAttestation = () => {
  if (modalAttestation) {
    // Log the current attestation
    setGameAttestations((prev) => [...prev, modalAttestation]);

    // Reset the modal attestation
    setModalAttestation(null);

    // Close the attestation modal
    setShowAttestationModal(false);

    // Setup a new board
    setupNewBoard();

    // Ensure the timers start correctly
    setPauseDown(false);
    setPauseUp(false);
    setIsGameRunning(true);
  }
};


/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
 
const setupNewBoard = () => {
  const newCompleteBoard = generateCompleteBoard();
  const newPlayableBoard = createPlayableBoard(newCompleteBoard, difficulty);
  setCompleteBoard(newCompleteBoard);
  setInitialBoard(newPlayableBoard);
  setBoard(newPlayableBoard);
  setSelectedCell({ row: null, col: null });
  setTimer(600000); // 10 minutes
  setTimerUp(0); // Start from 0
  setPauseDown(true); // Initially paused
  setPauseUp(true); // Initially paused
  setGameOver(false);
  setHistory([newPlayableBoard]);
  setNotes({});
};

const closeModal = () => {
  setupNewBoard(); // Generate a new board and set it up
  handleStartTimers(); // Start the timers
  setShowAttestationModal(false); // Close the modal
};

 
/* ------------------------------------------------------------------------ */

const generateUniqueCode = () => {
  const randomCode = Math.floor(Math.random() * 100000).toString().padStart(5, '0'); // Generate a random 5-digit number
  return `1.420.${randomCode}`;
};


/* ------------------------------------------------------------------------ */


const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};



/* ------------------------------------------------------------------------ */
 
const handleDifficultyChange = (e) => { // Line 44
  const newValue = e.target.value; // Line 45
  setDifficulty(newValue); // Line 46
  setLastLoggedValue(newValue); // Update the last value // Line 47
};


/* ------------------------------------------------------------------------ */

const handleSliderMouseUp = () => { // Line 51
  logAction(`Difficulty Changed to ${lastLoggedValue}`, lastLoggedValue); // Line 52
};


/* ------------------------------------------------------------------------ */

const debounceLogAction = debounce((value) => { // Line 56
  logAction(`Difficulty Changed to ${value}`, value); // Line 57
}, 1000); // Adjust the debounce time (e.g., 1000ms) as needed // Line 58

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
 
   const handleInfoClose = () => {
     logAction('Info Screen Closed');
     setShowInfo(false);
   };
 
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
 
   const handleDarkModeToggle = () => {
     logAction('Dark Mode Toggled');
     setDarkMode(!darkMode);
   };
 
/* ------------------------------------------------------------------------ */

const logAction = (action, value) => {
  const logEntry = {
    id: generateUniqueCode(), // Unique identifier with code
    type: action,
    time: new Date().toLocaleString(),
    points: 10, // Replace with the actual points value from your state
    difficulty: value, // Use the new difficulty value for this log entry
    timerDown: 600, // Replace with the actual timerDown value from your state
    timerUp: 0 // Replace with the actual timerUp value from your state
  };
  setLogs((prev) => [...prev, logEntry]);
};


/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

const EthereumInfoIcon = () => {
  const [showModal, setShowModal] = useState(false);

  const handleModalOpen = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  return (
    <div>
      <div className="ethereum-info-icon" onClick={handleModalOpen}>
        <FontAwesomeIcon icon={faEthereum} />
      </div>
      {showModal && <EthereumInfoModal onClose={handleModalClose} />}
    </div>
  );
};


/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
 
const closeAttestationModalAndSetNewBoard = () => {
  // Update personal stats
  setPersonalStats(prev => {
    const completionTime = timerUp;
    const movesMade = board.flat().filter(cell => cell !== 0).length;

    const newGamesPlayed = prev.gamesPlayed + 1;
    const newGamesWon = prev.gamesWon; // Adjust if you want to handle win/loss condition
    const newTotalPoints = prev.points + calculatePoints(true, completionTime, false); // Assuming points should be added
    const newAveragePointsPerGame = newTotalPoints / newGamesPlayed;
    const newGamesCompletedUnder5Minutes = (completionTime <= 300000) ? prev.gamesCompletedUnder5Minutes + 1 : prev.gamesCompletedUnder5Minutes;
    const newGamesCompletedUnder10Minutes = (completionTime > 300000 && completionTime <= 600000) ? prev.gamesCompletedUnder10Minutes + 1 : prev.gamesCompletedUnder10Minutes;
    const newGamesCompletedOver10Minutes = (completionTime > 600000) ? prev.gamesCompletedOver10Minutes + 1 : prev.gamesCompletedOver10Minutes;
    const newTotalTimeSpentPlaying = addTime(prev.totalTimeSpentPlaying, Math.floor(completionTime / 1000));
    const newTotalMovesMade = prev.totalMovesMade + movesMade;
    const newAverageMovesPerGame = newTotalMovesMade / newGamesPlayed;
    const newFastestCompletionTime = (prev.fastestCompletionTime === 'N/A' || completionTime < calculateTimeInSeconds(prev.fastestCompletionTime)) ? formatTime(Math.floor(completionTime / 1000)) : prev.fastestCompletionTime;
    const newAverageCompletionTime = calculateAverageCompletionTime(newTotalTimeSpentPlaying, newGamesPlayed);

    return {
      ...prev,
      gamesPlayed: newGamesPlayed,
      gamesWon: newGamesWon,
      points: newTotalPoints,
      averagePointsPerGame: newAveragePointsPerGame,
      fastestCompletionTime: newFastestCompletionTime,
      gamesCompletedUnder5Minutes: newGamesCompletedUnder5Minutes,
      gamesCompletedUnder10Minutes: newGamesCompletedUnder10Minutes,
      gamesCompletedOver10Minutes: newGamesCompletedOver10Minutes,
      totalTimeSpentPlaying: newTotalTimeSpentPlaying,
      totalMovesMade: newTotalMovesMade,
      averageMovesPerGame: newAverageMovesPerGame,
      averageCompletionTime: newAverageCompletionTime
    };
  });

  // Reset the game state and close the modal
  setupNewBoard();
  handleStartTimers(); // Start the timers
  setShowAttestationModal(false); // Close the modal
};


 
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
 
 
useEffect(() => {
  if (attestationContainerRef.current) {
    const container = attestationContainerRef.current;
    container.scrollLeft = container.scrollWidth; // Scroll to the rightmost position
  }
}, [gameAttestations, logAttestations, achievementAttestations, statAttestations]);

   
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
   

 
 
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
 
   const togglePencilMode = () => {
     setPencilMode(!pencilMode);
     logAction(`Pencil Mode ${pencilMode ? 'Disabled' : 'Enabled'}`);
   };
 
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

const clearAttestationModuleCards = () => {
  setGameAttestations([]);
  setLogAttestations([]);
  setAchievementAttestations([]);
  setStatAttestations([]);
  logAction('All attestations cleared');
};

 
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

const clearLog = () => {
  setLogs([]);
  logAction('Log cleared');
};

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

const clearStats = () => {
  setPersonalStats({
    gamesPlayed: 0,
    gamesWon: 0,
    points: 0,
    totalTimeSpentPlaying: '00:00:00',
    fastestCompletionTime: 'N/A',
    gamesCompletedUnder5Minutes: 0,
    gamesCompletedUnder10Minutes: 0,
    gamesCompletedOver10Minutes: 0,
    averageTimePerMove: '00:00:00',
    totalMovesMade: 0,
    averageMovesPerGame: 0,
    averagePointsPerGame: 0,
    averageCompletionTime: 'N/A'
  });
  logAction('Stats cleared');
};

 
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
 
   const clearAchievements = () => {
     setAchievements([]);
     logAction('Achievements cleared');
   };
   
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
 
   useEffect(() => {
     window.addEventListener("keydown", handleKeyDown);
     return () => {
       window.removeEventListener("keydown", handleKeyDown);
     };
   }, [selectedCell, board, pencilMode]);
   
/* ------------------------------------------------------------------------ */



/* ------------------------------------------------------------------------ */







/* ------------------------------------------------------------------------ */
 
const mintGameAttestation = (gameAttestation) => {
  const attestationData = {
    type: gameAttestation.type,
    time: gameAttestation.time,
    points: gameAttestation.points,
    difficulty: gameAttestation.difficulty,
    timer: gameAttestation.timer,
    timerUp: gameAttestation.timerUp,
    boardImage: gameAttestation.boardImage, // Include board image here
  };
  
  console.log("Minting attestation with data:", attestationData);
  
  setGameAttestations((prev) =>
    prev.map((att) =>
      att.time === gameAttestation.time ? { ...att, minted: true } : att
    )
  );

  // Log the minting action
  logAction(`Minted Game Attestation`, gameAttestation.difficulty);
};

/* ------------------------------------------------------------------------ */

useEffect(() => {
  console.log("Updated Current Attestation:", currentAttestation);
}, [currentAttestation]);

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
 
const mintLogAttestation = (attestation) => {
  console.log(`Minting log attestation made at: ${attestation.time}`);
  setLogAttestations((prev) =>
    prev.map((att) =>
      att.time === attestation.time ? { ...att, minted: true } : att
    )
  );

  // Log the minting action
  logAction(`Minted Log Attestation`, attestation.difficulty);
};

   
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
 
 const addLogAttestation = () => {
   const currentLog = [...logs]; // Get the current log entries
   const newLogAttestation = {
     type: 'Log',
     time: new Date().toLocaleString(),
     logs: currentLog, // Include all current logs
     minted: false
   };
   
   setLogAttestations((prevLogs) => [...prevLogs, newLogAttestation]);
   logAction('New Log Attestation Added')
 };
 
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

const mintAchievementAttestation = async (attestation) => {
  console.log("Minting achievement attestation with data:", attestation);

  try {
    // Placeholder for the actual minting logic
    // Example: await mintAttestationOnBlockchain(attestation);

    // Simulate successful minting with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update state to mark attestation as minted
    setAchievementAttestations((prev) =>
      prev.map((att) =>
        att.time === attestation.time ? { ...att, minted: true } : att
      )
    );

    // Log the minting action
    logAction(`Minted Achievement Attestation`, attestation.difficulty);

    console.log("Minting successful:", attestation);
  } catch (error) {
    console.error("Minting failed:", error);
  }
};



/* ------------------------------------------------------------------------ */

const addAchievementAttestation = () => {
  const newAchievementAttestation = {
    type: 'achievement',
    time: new Date().toLocaleString(),
    achievements: achievements ? [...achievements] : [], // Ensure this is an array
    minted: false
  };

  setAchievementAttestations((prev) => [...prev, newAchievementAttestation]);
  logAction('New Achievement Attestation Added');
};

 
/* ------------------------------------------------------------------------ */

const logAchievementAttestation = (achievement) => {
  const attestationData = {
    type: 'achievement',
    time: new Date().toLocaleString(),
    achievements: achievement ? [achievement] : [], // Ensure this is an array
    minted: false
  };

  console.log("Logging achievement attestation:", attestationData);

  setAchievementAttestations((prev) => [...prev, attestationData]);

  // Log the achievement attestation action
  logAction(`Logged Achievement Attestation`, achievement ? achievement.points : 0);
};


/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
 
const mintStatAttestation = (attestation) => {
  const attestationData = {
    type: 'stat',
    time: attestation.time,
    stats: attestation.stats, // Include the stats
    minted: false
  };

  console.log("Minting stat attestation with data:", attestationData);

  setStatAttestations((prev) =>
    prev.map((att) =>
      att.time === attestation.time ? { ...att, minted: true } : att
    )
  );

  // Log the stat attestation action
  logAction(`Minted Stat Attestation`, attestation.stats.points);
};



/* ------------------------------------------------------------------------ */

 const addStatAttestation = () => {
  const newStatAttestation = {
    type: 'stat',
    time: new Date().toLocaleString(),
    stats: { ...personalStats }, // Include all current stats
    minted: false
  };

  setStatAttestations((prev) => [...prev, newStatAttestation]);
  logAction('New Stat Attestation Added');
};

/* ------------------------------------------------------------------------ */

const mintAttestation = (attestation) => {
  switch (attestation.attestationType) {
    case 'game':
      mintGameAttestation(attestation);
      break;
    case 'log':
      mintLogAttestation(attestation);
      break;
    case 'achievement':
      mintAchievementAttestation(attestation);
      break;
    case 'stat':
      mintStatAttestation(attestation);
      break;
    default:
      break;
  }
};


/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

const handleNumberPadInput = (value) => {
  if (selectedCell.row !== null && selectedCell.col !== null) {
    const newBoard = board.map((row, rIdx) => row.map((cell, cIdx) => {
      if (rIdx === selectedCell.row && cIdx === selectedCell.col) {
        if (initialBoard[rIdx][cIdx] === 0) {
          return value;
        }
      }
      return cell;
    }));
    setBoard(newBoard);
    setHistory((prevHistory) => [...prevHistory, newBoard]);
    logAction(`Move: Entered ${value} in cell (${selectedCell.row}, ${selectedCell.col})`);
    console.log(`Move: Entered ${value} in cell (${selectedCell.row}, ${selectedCell.col})`);
    
    // Check for first row/column/box completion
    checkForCompletion();

    if (history.length === 1) {
      unlockAchievement(1); // Unlock "First Move" achievement
    }
  }
};

const handleKeyDown = (e) => {
  if (selectedCell.row !== null && selectedCell.col !== null) {
    const value = parseInt(e.key);
    const cellKey = `${selectedCell.row}-${selectedCell.col}`;
    if (value >= 1 && value <= 9) {
      if (pencilMode) {
        setNotes((prevNotes) => {
          const newNotes = { ...prevNotes };
          if (!newNotes[cellKey]) {
            newNotes[cellKey] = [];
          }
          if (newNotes[cellKey].includes(value)) {
            newNotes[cellKey] = newNotes[cellKey].filter((note) => note !== value);
          } else {
            newNotes[cellKey].push(value);
          }
          return newNotes;
        });
      } else {
        setNotes((prevNotes) => {
          const newNotes = { ...prevNotes };
          delete newNotes[cellKey];
          return newNotes;
        });
        handleNumberPadInput(value);
        logAction(`Number Pad Input: Entered ${value} in cell (${selectedCell.row}, ${selectedCell.col})`);
        console.log(`Number Pad Input: Entered ${value} in cell (${selectedCell.row}, ${selectedCell.col})`);
      }
    }
  }
};

useEffect(() => {
  window.addEventListener("keydown", handleKeyDown);
  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [selectedCell, board, pencilMode]);

const handleSelectNumber = (number) => {
  if (selectedCell.row !== null && selectedCell.col !== null) {
    const cellKey = `${selectedCell.row}-${selectedCell.col}`;
    if (number >= 1 && number <= 9) {
      if (isPencilMode) {
        setNotes((prevNotes) => {
          const newNotes = { ...prevNotes };
          if (!newNotes[cellKey]) {
            newNotes[cellKey] = [];
          }
          if (newNotes[cellKey].includes(number)) {
            newNotes[cellKey] = newNotes[cellKey].filter((note) => note !== number);
          } else {
            newNotes[cellKey].push(number);
          }
          return newNotes;
        });
        logAction(`Pencil Mode: Entered ${number} in cell (${selectedCell.row}, ${selectedCell.col})`);
        console.log(`Pencil Mode: Entered ${number} in cell (${selectedCell.row}, ${selectedCell.col})`);
      } else {
        handleNumberPadInput(number);
      }
    }
  }
};

useEffect(() => {
  window.addEventListener("keydown", handleKeyDown);
  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [selectedCell, board, pencilMode]);

// Function to check for row/column/box completion and unlock achievements
const checkForCompletion = () => {
  const { row, col } = selectedCell;

  // Achievement checks
  if (isRowComplete(row)) {
    unlockAchievement(2); // First Row Completed
    logAction(`Achievement Unlocked: First Row Completed (Row ${row})`);
    console.log(`Achievement Unlocked: First Row Completed (Row ${row})`);
  }
  if (isColumnComplete(col)) {
    unlockAchievement(3); // First Column Completed
    logAction(`Achievement Unlocked: First Column Completed (Column ${col})`);
    console.log(`Achievement Unlocked: First Column Completed (Column ${col})`);
  }
  if (isBlockComplete(row, col)) {
    unlockAchievement(4); // First 3x3 Block Completed
    logAction(`Achievement Unlocked: First 3x3 Block Completed (Block starting at row ${row}, col ${col})`);
    console.log(`Achievement Unlocked: First 3x3 Block Completed (Block starting at row ${row}, col ${col})`);
  }
  if (board.every(row => row.every(cell => cell !== 0)) && !personalStats.hintsUsed) {
    unlockAchievement(13); // Hint-Free
    logAction(`Achievement Unlocked: Hint-Free`);
    console.log(`Achievement Unlocked: Hint-Free`);
  }
  if (board.every(row => row.every(cell => cell !== 0)) && !personalStats.mistakesMade) {
    unlockAchievement(14); // Error-Free
    logAction(`Achievement Unlocked: Error-Free`);
    console.log(`Achievement Unlocked: Error-Free`);
  }
  if (board.every(row => row.every(cell => cell !== 0)) && timerUp <= 300000) {
    unlockAchievement(15); // Speed Demon
    logAction(`Achievement Unlocked: Speed Demon`);
    console.log(`Achievement Unlocked: Speed Demon`);
  }

  // Early Bird Achievement Check
  if ((isRowComplete(row) || isColumnComplete(col) || isBlockComplete(row, col)) && timerUp <= 120000) {
    unlockAchievement(11); // Early Bird
    logAction(`Achievement Unlocked: Early Bird`);
    console.log(`Achievement Unlocked: Early Bird`);
  }

  // Check for Triple Threat (three in a row)
  const completedRows = board.filter((row, rIdx) => isRowComplete(rIdx)).length;
  const completedCols = board[0].map((_, colIdx) => isColumnComplete(colIdx)).filter(Boolean).length;
  const completedBlocks = [];
  for (let r = 0; r < 9; r += 3) {
    for (let c = 0; c < 9; c += 3) {
      if (isBlockComplete(r, c)) completedBlocks.push(true);
    }
  }
  if (completedRows >= 3 || completedCols >= 3 || completedBlocks.length >= 3) {
    unlockAchievement(12); // Triple Threat
    logAction(`Achievement Unlocked: Triple Threat`);
    console.log(`Achievement Unlocked: Triple Threat`);
  }

  // Check for Puzzle Master
  if (personalStats.gamesPlayed >= 10) {
    unlockAchievement(16); // Puzzle Master
    logAction(`Achievement Unlocked: Puzzle Master`);
    console.log(`Achievement Unlocked: Puzzle Master`);
  }

  // Check for Perfect Game (No mistakes or hints)
  if (board.every(row => row.every(cell => cell !== 0)) && !personalStats.hintsUsed && !personalStats.mistakesMade) {
    unlockAchievement(7); // Perfect Game
    logAction(`Achievement Unlocked: Perfect Game`);
    console.log(`Achievement Unlocked: Perfect Game`);
  }
};



/* ------------------------------------------------------------------------ */

const isRowComplete = (row) => {
  return board[row].every(cell => cell !== 0);
};

const isColumnComplete = (col) => {
  return board.every(row => row[col] !== 0);
};

const isBlockComplete = (row, col) => {
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = startRow; r < startRow + 3; r++) {
    for (let c = startCol; c < startCol + 3; c++) {
      if (board[r][c] === 0) {
        return false;
      }
    }
  }
  return true;
};


/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

const useHint = () => {
  // Implement the logic to find a correct number for the selected cell
  const { row, col } = selectedCell;
  const hintNumber = getHintNumber(board, row, col); // Your logic to get the hint number

  if (hintNumber) {
    handleNumberInput(hintNumber);
    logAction('Hint used');
    // Update points for hint usage
    setPersonalStats((prev) => ({
      ...prev,
      points: prev.points - 10 // Deduct points for using a hint
    }));
  }
};

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

const allAttestations = [
  ...gameAttestations.map(att => ({ ...att, type: 'game' })),
  ...logAttestations.map(att => ({ ...att, type: 'log' })),
  ...achievementAttestations.map(att => ({ ...att, type: 'achievement' })),
  ...statAttestations.map(att => ({ ...att, type: 'stat' }))
];

// Sort attestations by time
allAttestations.sort((a, b) => new Date(a.time) - new Date(b.time));

/* ------------------------------------------------------------------------ */

const combineAndSortAttestations = () => {
  const allAttestations = [
    ...gameAttestations.map(attestation => ({ ...attestation, attestationType: 'game' })),
    ...logAttestations.map(attestation => ({ ...attestation, attestationType: 'log' })),
    ...achievementAttestations.map(attestation => ({ ...attestation, attestationType: 'achievement' })),
    ...statAttestations.map(attestation => ({ ...attestation, attestationType: 'stat' }))
  ];

  return allAttestations.sort((a, b) => new Date(a.time) - new Date(b.time));
};

const combinedAttestations = combineAndSortAttestations();


/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

useEffect(() => {
  // Update points display in real-time
}, [personalStats.points]);

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

  return (
    <div className={`sundoku-game-module ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="sundoku-game-container">
        <div className="sundoku-game-left sundoku-machine">
          <div className="sundoku-game-top-container">
            <div className="sundoku-game-header-box">
            <div className="number-pad-icon" onClick={() => setShowNumberPad(true)}>
            <FontAwesomeIcon icon={faTableCellsLarge} />            
            </div>

            {showNumberPad && (
              <NumberPad
              onClose={() => setShowNumberPad(false)}
              onSelectNumber={handleSelectNumber}
              onTogglePencilMode={togglePencilMode}
              onMagicWand={handleMagic}
              onTogglePlayPause={handleTogglePlayPause}
              isPencilMode={isPencilMode}
              isGameRunning={isGameRunning}
              />
            )}
            <h1 className="gmdoku-combined-header">"GMDOKU"</h1>
            </div>
            <div className="sundoku-game-info-icon-box">
            <GameInfoIcon />
              <div className="sundoku-game-dark-mode-icon" onClick={handleDarkModeToggle}>
                <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
              </div>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            className="sundoku-game-canvas"
            style={{ width: canvasWidth, height: canvasHeight }}
            onMouseMove={handleMouseMove}
            onClick={handleMouseClick}
          ></canvas>

          {gameOver && (
            <div className="sundoku-game-over-screen">
              <div className="sundoku-game-over-message">Game Over! Time's up!</div>
            </div>
          )}
          
          {gameEnd && (
            <div className="sundoku-game-end-screen">
              <div className="sundoku-game-end-message">Game Ended!</div>
            </div>
          )}
          
          {showAttestationModal && modalAttestation && (
  <div className="attestation-modal">
    <div className="attestation-modal-content">
      <h3>Game Attestation</h3>
      <p>Time: {modalAttestation.time}</p>
      <p>Points: {modalAttestation.points}</p>
      <p>Difficulty: {modalAttestation.difficulty}</p>
      <p>Timer: {modalAttestation.timer}</p>
      <p>Timer Up: {modalAttestation.timerUp}</p>
      <div className="svg-container">
        {modalAttestation.boardImage ? (
          <img src={modalAttestation.boardImage} alt="Game Board" style={{ border: "3px solid rgb(255, 225, 0)", boxShadow: "0 1px 3px #ffeeb5, inset 0 2px 4px rgba(133, 190, 255, 0.227), inset 0 -2px 1px #000000ba" }} />
        ) : (
          <p>Loading image...</p>
        )}
      </div>
      <div className="game-modal-button-container">
        <button className="sundoku-mint-button" onClick={() => mintGameAttestation(modalAttestation)}>Mint</button>
        <button className="sundoku-mint-button" onClick={logGameAttestation}>Log</button>
        <button className="sundoku-mint-button" onClick={closeAttestationModalAndSetNewBoard}>Close</button>
      </div>
    </div>
  </div>
)}











          {showPauseScreen && (
            <div className="sundoku-game-paused-screen">
              <div className="sundoku-game-paused-screen-content">
                <div className="sundoku-game-paused-message">Game Paused</div>
                <button onClick={handleResumeDown} className="resume-button">Resume Down Timer</button>
                <button onClick={handleResumeUp} className="resume-button">Resume Up Timer</button>
                <button onClick={handleResumeBoth} className="resume-button">Resume Both Timers</button>
                {!pausedByStartButton && (
                  <button onClick={handlePauseBoth} className="resume-button">Pause Both Timers</button>
                )}
              </div>
            </div>
          )}

          <div className="sundoku-controls-row">
            <div className="sundoku-controls-container">
              <button onClick={pauseDown ? handleResumeDown : handlePauseDown} className="pause-button">
                <FontAwesomeIcon icon={pauseDown ? faStopwatch : faPause} />
              </button>
              <div className="sunrise-timer">
                <div className="sunrise-progress-down">
                  <span>
                    {`${Math.floor(timer / 60).toString().padStart(2, "0")}:${Math.floor(timer % 60).toString().padStart(2, "0")}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="sundoku-controls-container">
              <button onClick={handlePauseUp} className="pause-button">
                <FontAwesomeIcon icon={pauseUp ? faClock : faPause} />
              </button>
              <div className="sunrise-progess-up-timer">
                <div className="sunrise-progress-up">
                  <span>
                    {`${Math.floor(timerUp / 60).toString().padStart(2, "0")}:${Math.floor(timerUp % 60).toString().padStart(2, "0")}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="sundoku-game-controls">
            <button onClick={togglePencilMode} className={`notes-button ${pencilMode ? 'active' : ''}`}>
              <FontAwesomeIcon icon={faPencil} />
            </button>
            <button onClick={handleMagic} className="sundoku-magic-button">
              <FontAwesomeIcon icon={faWandMagicSparkles} />
            </button>

            <div className="sundoku-controls-container">
              <div className="sundoku-difficulty-box">
                <label>Easy</label>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={difficulty}
                  className="difficulty-slider"
                  onChange={handleDifficultyChange}
                  onMouseUp={handleSliderMouseUp} 

                />
                <label>Hard</label>
              </div>
            </div>

            <button onClick={handleNewBoard} className="new-board-button">
              <FontAwesomeIcon icon={faRotateLeft} />
            </button>
            <button 
              onClick={isGameRunning ? handlePauseTimers : handleStartTimers} 
              className="sundoku-start-button"
            >
              <FontAwesomeIcon icon={isGameRunning ? faPause : faCirclePlay} />
            </button>
          </div>

          {gameOver && (
            <div className="sundoku-game-over-screen">
              <div className="sundoku-game-over-message">Game Over! Time's up!</div>
              <button onClick={handleReset} className="play-again-button">
                Play Again
              </button>
            </div>
          )}
          {showInfo && (
            <div className="sundoku-game-info-screen show">
              <div className="sundoku-game-info-content">
                <FontAwesomeIcon icon={faCircleXmark} className="sundoku-game-info-close" onClick={handleInfoClose} />
                <h2>Information</h2>
                <p>This is the information screen for the Sunrise Sudoku game module.</p>
              </div>
            </div>
          )}
        </div>











        <div className="sundoku-game-right sundoku-machine2">
          <div className="sundoku-toggle-container">
            <label className="sundoku-toggle-switch">
              <input
                type="checkbox"
                checked={activeModuleMachine2 === 'live-attestations'}
                onChange={() => setActiveModuleMachine2(activeModuleMachine2 === 'attestation' ? 'live-attestations' : 'attestation')}
              />
              <span className="sundoku-toggle-slider">
                <FontAwesomeIcon 
                  icon={activeModuleMachine2 === 'attestation' ? faCircleExclamation : faDiceD6} 
                  className="toggle-icon" 
                />
              </span>
            </label>
          </div>
          <div className="sundoku-game-module-content">
  {activeModuleMachine2 === 'attestation' ? (
    <div className="sundoku-attestation-module">
      <div className="sundoku-attestation-module-top">
        <div className="ethereum-info-container">
          <EthereumInfoIcon />
        </div>
        <h2>Attestation Station</h2>
        <button onClick={clearAttestationModuleCards} className="attestation-broom-icon">
          <FontAwesomeIcon icon={faBroom} />
        </button>
      </div>

      <div className="sundoku-attestation-module-cards" ref={attestationContainerRef}>
  {combinedAttestations.length === 0 ? (
    <p>0 Attestations.</p>
  ) : (
    combinedAttestations.map((attestation, index) => {
      let cardClass = 'sundoku-attestation-card';
      if (index === combinedAttestations.length - 1) {
        cardClass += ' new';
      } else {
        cardClass += ' existing';
      }
      cardClass += ` ${attestation.attestationType}`;
      return (
        <div key={index} className={`sundoku-attestation-card ${cardClass}`}>
          {attestation.attestationType === 'game' && (
            <>
              <h2>Game</h2>
              <div className="svg-container">
                <img
                  src={attestation.boardImage}
                  alt="Game Board"
                  style={{
                    border: "3px solid rgb(255, 225, 0)",
                    boxShadow: "0 1px 3px #ffeeb5, inset 0 2px 4px rgba(133, 190, 255, 0.227), inset 0 -2px 1px #000000ba"
                  }}
                />
              </div>
              {!attestation.minted ? (
                <button className="sundoku-mint-button" onClick={() => mintGameAttestation(attestation)}>Mint</button>
              ) : (
                <button className="sundoku-mint-button minted">
                  <FontAwesomeIcon icon={faCheck} /> Minted
                </button>
              )}
            </>
          )}
                {attestation.attestationType === 'log' && (
                  <>
                    <div className="log-attestation-top">
                      <h2>Log</h2>
                    </div>
                    <div className="log-attestation-content">
                      <ul>
                        <li>Type: {attestation.type}</li>
                        <li>Time: {attestation.time}</li>
                        <li>Points: {attestation.points}</li>
                        <li>Difficulty: {attestation.difficulty}</li>
                        <li>Timer Down: {attestation.timerDown}s</li>
                        <li>Timer Up: {attestation.timerUp}s</li>
                        {attestation.row !== undefined && <li>Cell: ({attestation.row}, {attestation.col})</li>}
                        {attestation.interaction && <li>Interaction: {attestation.interaction}</li>}
                        {attestation.gameStatus && <li>Status: {attestation.gameStatus}</li>}
                      </ul>
                    </div>
                    {!attestation.minted ? (
                      <button className="sundoku-mint-button" onClick={() => mintLogAttestation(attestation)}>Mint</button>
                    ) : (
                      <button className={`sundoku-mint-button ${attestation.minted ? 'minted' : ''}`}>
                    {attestation.minted ? <FontAwesomeIcon icon={faCheck} /> : 'Mint'}
                  </button>
                    )}
                  </>
                )}
                {attestation.attestationType === 'achievement' && (
                  <>
                    <div className="achievement-attestation-header">
                      <h2>Achievements</h2>
                    </div>
                    <div className="achievement-attestation-content">
                      <ul>
                        <li>Achievement attestation made at: {attestation.time}</li>
                        {(attestation.achievements || []).map((achievement, idx) => (
                          <li key={idx}>
                            {achievement.description} - Points: {achievement.points} - {achievement.icon}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {!attestation.minted ? (
                      <button className="sundoku-mint-button" onClick={() => mintAchievementAttestation(attestation)}>Mint</button>
                    ) : (
                      <button className={`sundoku-mint-button ${attestation.minted ? 'minted' : ''}`}>
                      {attestation.minted ? <FontAwesomeIcon icon={faCheck} /> : 'Mint'}
                    </button>
                    )}
                  </>
                )}
                {attestation.attestationType === 'stat' && (
                  <>
                    <div className="stats-attestation-header">
                      <h2>Stats</h2>
                    </div>
                    <div className="stats-attestation-content">
                      <ul>
                        <li>Stats attestation made at: {attestation.time}</li>
                        <li>Games Played: {attestation.stats.gamesPlayed}</li>
                        <li>Games Won: {attestation.stats.gamesWon}</li>
                        <li>Points: {attestation.stats.points}</li>
                        <li>Total Time Spent Playing: {attestation.stats.totalTimeSpentPlaying}</li>
                        <li>Fastest Completion Time: {attestation.stats.fastestCompletionTime}</li>
                        <li>Games Completed Under 5 Minutes: {attestation.stats.gamesCompletedUnder5Minutes}</li>
                        <li>Games Completed Under 10 Minutes: {attestation.stats.gamesCompletedUnder10Minutes}</li>
                        <li>Games Completed Over 10 Minutes: {attestation.stats.gamesCompletedOver10Minutes}</li>
                        <li>Total Moves Made: {attestation.stats.totalMovesMade}</li>
                        <li>Average Moves Per Game: {attestation.stats.averageMovesPerGame}</li>
                        <li>Average Points Per Game: {attestation.stats.averagePointsPerGame}</li>
                        <li>Average Completion Time: {attestation.stats.averageCompletionTime}</li>
                      </ul>
                    </div>
                    {!attestation.minted ? (
                      <button className="sundoku-mint-button" onClick={() => mintStatAttestation(attestation)}>Mint</button>
                    ) : (
                    <button className={`sundoku-mint-button ${attestation.minted ? 'minted' : ''}`}>
                      {attestation.minted ? <FontAwesomeIcon icon={faCheck} /> : 'Mint'}
                    </button>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
 


  
            ) : (
              <div className="sundoku-attestation-module">
                <div className="sundoku-attestation-module-top">
                  <h3>Live Attestations</h3>
                </div>
                <div className="sundoku-attestation-module-cards" ref={attestationContainerRef}>
                  <p>No attestations yet.</p>
                </div>
              </div>
            )}
          </div>

          <div className="sundoku-log-container">
            <div className="sundoku-log-container-top">
               
            <button onClick={addLogAttestation} className="log-mint-button">
              <FontAwesomeIcon icon={faFileCirclePlus} />
              </button> 
               
               <h2>Log</h2>

               <button onClick={clearLog} className="broom-icon">
                <FontAwesomeIcon icon={faBroom} />
              </button>

            </div>
           
            <div className="sundoku-game-log sundoku-recessed-field-log">
              <ul>
                {logs.length === 0 ? (
                  <li>No log entries yet.</li>
                ) : (
                  logs.slice().reverse().map((log) => (
                    <li key={log.id}> {/* Use unique identifier */}
                      [{log.id}] {log.type} - {log.time} - Points: {log.points} - Difficulty: {log.difficulty} - 
                      Timer Down: {log.timerDown}s - Timer Up: {log.timerUp}s 
                      {log.row !== undefined && log.col !== undefined ? ` - Cell: (${log.row}, ${log.col})` : ''} 
                      {log.interaction ? ` - Interaction: ${log.interaction}` : ''} 
                      {log.gameStatus ? ` - Status: ${log.gameStatus}` : ''}
                    </li>
                  ))
                )}
              </ul>
            </div>


         
          

           




              

          </div>
        </div>

        <div className="sundoku-game-right sundoku-machine3">
        <div className="sundoku-toggle-leaderboard-container">
          <label className="sundoku-toggle-leaderboard-switch">
            <input
              type="checkbox"
              checked={activeModuleMachine3 !== 'myBoard'}
              onChange={() => setActiveModuleMachine3(activeModuleMachine3 === 'myBoard' ? 'leaderboard' : 'myBoard')}
            />
            <span className="sundoku-toggle-leaderboard-slider">
              <FontAwesomeIcon 
                icon={activeModuleMachine3 === 'myBoard' ? faList : faMedal} 
                className="toggle-icon" 
              />
            </span>
          </label>
        </div>

  <div className="sundoku-game-module-content">
    {activeModuleMachine3 === 'myBoard' ? (
      <>
        <div className="sundoku-my-board">
          <div className="sundoku-leaderboard-module-top">
            <h2>My Board</h2>
          </div>
          {/* Add your "My Board" content here */}
        </div>

        <div className="sundoku-game-stats-achievements">
          <div className="sundoku-game-stats-sundoku-recessed-field">
            <div className="sundoku-game-stats-recessed-field-top">
            <h3>Stats</h3>

              </div>
            <div className="sundoku-recessed-field-stats-content">
              <p>Games Played: {personalStats.gamesPlayed}</p>
              <p>Games Won: {personalStats.gamesWon}</p>
              <p>Points: {personalStats.points}</p>
              <p>Total Time Spent Playing: {personalStats.totalTimeSpentPlaying}</p>
              <p>Fastest Completion Time: {personalStats.fastestCompletionTime}</p>
              <p>Games Completed Under 5 Minutes: {personalStats.gamesCompletedUnder5Minutes}</p>
              <p>Games Completed Under 10 Minutes: {personalStats.gamesCompletedUnder10Minutes}</p>
              <p>Games Completed Over 10 Minutes: {personalStats.gamesCompletedOver10Minutes}</p>
              <p>Average Time Per Move: {personalStats.averageTimePerMove}</p>
              <p>Total Moves Made: {personalStats.totalMovesMade}</p>
              <p>Average Moves Per Game: {personalStats.averageMovesPerGame}</p>
              <p>Average Points Per Game: {personalStats.averagePointsPerGame}</p>
              <p>Average Completion Time: {personalStats.averageCompletionTime}</p>
            </div>
            <div className="sundoku-game-stats-recessed-field-bottom">

            <button className="pinned-button" onClick={addStatAttestation}>
            <FontAwesomeIcon icon={faFileCirclePlus} />
              </button>

            <button onClick={clearStats} className="stats-broom-icon">
            <FontAwesomeIcon icon={faBroom} />
          </button>
          </div>
          </div>
                    <div className="sundoku-game-achievements-sundoku-recessed-field2">
                        <div className="sundoku-recessed-field-achievements-content-top">
                        <h3>Achievements</h3>
                        </div>  
                        <div className="sundoku-game-achievements-sundoku-recessed-field2-content">
                        <ul>
                        {achievements.map((achievement, index) => (
                          <li key={index}>
                            {achievement.description} - Points: {achievement.points} - {achievement.icon}
                          </li>
                        ))}
                      </ul>
                      </div>
                    <div className="sundoku-recessed-field-achievements-content-bottom">
                    <button onClick={addAchievementAttestation} className="pinned-button">
                      <FontAwesomeIcon icon={faFileCirclePlus} />
                    </button>

                    <button onClick={clearAchievements} className="achievements-broom-icon">
                    <FontAwesomeIcon icon={faBroom} />
                    </button>
                  </div>
              </div>
        </div>
      </>
    ) : (
      <div className="sundoku-leaderboard">
        <div className="sundoku-attestation-module-top">
          <h3>Leaderboard</h3>
        </div>
        {/* Add your leaderboard content here */}
      </div>
    )}
  </div>
      </div>

      <ToastContainer />
    </div>
  </div>
);
}