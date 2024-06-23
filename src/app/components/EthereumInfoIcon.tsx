import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEthereum } from '@fortawesome/free-brands-svg-icons';
import EthereumInfoModal from './EthereumInfoModal';

const EthereumInfoIcon: React.FC = () => {
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

export default EthereumInfoIcon;
