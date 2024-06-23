import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsUpDownLeftRight, faTimes, faPencilAlt, faWandMagic, faPlay, faPause } from '@fortawesome/free-solid-svg-icons';

const NumberPad = ({ onClose, onSelectNumber, onTogglePencilMode, onMagicWand, onTogglePlayPause, isPencilMode, isGameRunning }) => {
  const numberPadRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartPosition({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - startPosition.x,
        y: e.clientY - startPosition.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startPosition]);

  return (
    <div
      ref={numberPadRef}
      className="number-pad"
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
    >
      <div className="number-pad-header" onMouseDown={handleMouseDown}>
        <span>Number Pad</span>
        <FontAwesomeIcon icon={faTimes} onClick={onClose} style={{ cursor: 'pointer' }} />
      </div>
      <div className="number-pad-body">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
          <button key={number} onClick={() => onSelectNumber(number)}>
            {number}
          </button>
        ))}
        <button onClick={onTogglePencilMode} className={isPencilMode ? 'active' : ''}>
          <FontAwesomeIcon icon={faPencilAlt} />
        </button>
        <button onClick={onMagicWand}>
          <FontAwesomeIcon icon={faWandMagic} />
        </button>
        <button onClick={onTogglePlayPause}>
          <FontAwesomeIcon icon={isGameRunning ? faPause : faPlay} />
        </button>
      </div>
      <div className="number-pad-drag-area" onMouseDown={handleMouseDown}>
        <FontAwesomeIcon icon={faArrowsUpDownLeftRight} />
      </div>
    </div>
  );
};

export default NumberPad;
