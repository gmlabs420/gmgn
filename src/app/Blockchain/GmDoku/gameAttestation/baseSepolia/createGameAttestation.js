require('dotenv').config(); // Load environment variables from .env and .env.local

const { ethers } = require('ethers');
const { SchemaEncoder } = require('@ethereum-attestation-service/eas-sdk');
const fs = require('fs');

// Load ABI files
const EAS_ABI = JSON.parse(fs.readFileSync('src/app/Blockchain/GmDoku/gameAttestation/baseSepolia/EAS.json', 'utf-8'));

// Define Ethereum provider and signer
const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const signer = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, provider);

// Initialize EAS instance
const easAddress = process.env.SEPOLIA_EAS_ADDRESS;
const eas = new ethers.Contract(easAddress, EAS_ABI, signer);

// Assume schemaUID is obtained after registering the schema
const schemaUID = "your_schema_uid_here";

// Create attestation data
const points = 100;
const difficulty = 3;
const timer = 600000; // Example timer value in milliseconds
const timerUp = 300000; // Example timerUp value in milliseconds
const boardImage = "<svg>Your_SVG_Data_Here</svg>"; // SVG data

const schemaEncoder = new SchemaEncoder("address recipient,uint256 points,uint8 difficulty,uint256 timer,uint256 timerUp,string boardImage");
const encodedData = schemaEncoder.encodeData([
  { name: "recipient", value: ethers.constants.AddressZero, type: "address" },
  { name: "points", value: points, type: "uint256" },
  { name: "difficulty", value: difficulty, type: "uint8" },
  { name: "timer", value: timer, type: "uint256" },
  { name: "timerUp", value: timerUp, type: "uint256" },
  { name: "boardImage", value: boardImage, type: "string" },
]);

async function createAttestation() {
  try {
    const tx = await eas.attest({
      schema: schemaUID,
      data: {
        recipient: ethers.constants.AddressZero,
        expirationTime: 0, // 0 means no expiration
        revocable: false,  // Non-revocable
        data: encodedData,
      },
      value: ethers.utils.parseEther("0.01"), // Amount to pay for the attestation
    });
    await tx.wait();
    console.log(`Attestation created with transaction hash: ${tx.hash}`);
  } catch (error) {
    console.error("Error creating attestation:", error);
  }
}

createAttestation();
