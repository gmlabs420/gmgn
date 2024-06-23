import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import GameInfoModal from './GameInfoModal';

const GameInfoIcon: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  const handleModalOpen = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  return (
    <div>
      <div className="sundoku-game-info-icon" onClick={handleModalOpen}>
        <FontAwesomeIcon icon={faInfoCircle} />
      </div>
      {showModal && <GameInfoModal onClose={handleModalClose} />}
    </div>
  );
};

export default GameInfoIcon;
