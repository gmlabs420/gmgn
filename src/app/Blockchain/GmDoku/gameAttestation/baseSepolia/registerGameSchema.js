require('dotenv').config(); // Load environment variables from .env and .env.local
const { ethers } = require('ethers');
const fs = require('fs');

// Load ABI files
const schemaRegistryABI = JSON.parse(fs.readFileSync('src/app/Blockchain/GmDoku/gameAttestation/baseSepolia/SchemaRegistry.json', 'utf-8'));

// Define Ethereum provider and signer
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const signer = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, provider);

// Initialize SchemaRegistry instance
const schemaRegistryAddress = process.env.SEPOLIA_SCHEMA_REGISTRY_ADDRESS;
const schemaRegistry = new ethers.Contract(schemaRegistryAddress, schemaRegistryABI, signer);

// Schema details
const schema = "address recipient,uint256 points,uint8 difficulty,uint256 timer,uint256 timerUp,string boardImage";
const resolver = 0x000000000000000000000000000000000000
const revocable = false; // Non-revocable

async function registerSchema() {
  try {
    const gasEstimate = await schemaRegistry.estimateGas.register(schema, resolver, revocable);
    console.log(`Estimated gas: ${gasEstimate.toString()}`);

    const tx = await schemaRegistry.register(schema, resolver, revocable, {
      gasLimit: gasEstimate.mul(2), // Set gas limit to twice the estimated amount
      value: ethers.utils.parseEther("0.0001") // Set value to make it payable
    });
    await tx.wait();
    const schemaUID = tx.logs[0].args[0]; // Assuming the schemaUID is the first argument in the logs
    console.log(`Schema registered with UID: ${schemaUID}`);
  } catch (error) {
    console.error("Error registering schema:", error);
    if (error.reason) {
      console.error("Error reason:", error.reason);
    }
    if (error.transaction) {
      console.error("Transaction data:", error.transaction);
    }
    if (error.receipt) {
      console.error("Transaction receipt:", error.receipt);
    }
  }
}

registerSchema();
