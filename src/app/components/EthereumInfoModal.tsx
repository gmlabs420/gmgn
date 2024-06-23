import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEthereum } from '@fortawesome/free-brands-svg-icons';

const EthereumInfoModal = ({ onClose }) => {
  return (
    <div className="ethereum-modal-overlay" onClick={onClose}>
      <div className="ethereum-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <FontAwesomeIcon icon={faEthereum} />
          <h2>Ethereum Information</h2>
          <button onClick={onClose} className="close-modal-button">&times;</button>
        </div>
        <p>Platform Fee: $1.00 per attestation + L2 Gas fees.</p>
        <p>Learn more about the Ethereum blockchain, Ethereum Attestation Service, Base Blockchain, and Optimism Superchain.</p>
        <ul>
          <li><strong>Ethereum:</strong> A decentralized platform that enables smart contracts and decentralized applications (dApps) to be built and run without any downtime, fraud, control, or interference from a third party.</li>
          <li><strong>Ethereum Attestation Service:</strong> A service providing verifiable attestations on the Ethereum blockchain.</li>
          <li><strong>Base Blockchain:</strong> A scalable blockchain network that is interoperable with Ethereum.</li>
          <li><strong>Optimism Superchain:</strong> A set of Layer 2 chains that scale Ethereum's capabilities.</li>
        </ul>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default EthereumInfoModal;
