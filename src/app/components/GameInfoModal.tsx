import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';

interface GameInfoModalProps {
  onClose: () => void;
}

const GameInfoModal: React.FC<GameInfoModalProps> = ({ onClose }) => {
  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  return (
    <div className="game-info-modal-overlay" onClick={onClose}>
      <div className="sundoku-game-info-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Information</h2>
          <button onClick={onClose} className="close-modal-button">
            <FontAwesomeIcon icon={faCircleXmark} />
          </button>
        </div>
        <p>This is the information screen for the Sunrise Sudoku game module.</p>
        <button onClick={onClose} className="close-button">Close</button>
      </div>
    </div>
  );
};

export default GameInfoModal;
