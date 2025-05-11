const { ethers } = require("ethers");

const RPC_URL = "https://rpc.soneium.org";
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Contract addresses aligned with variables
const contractMap = {
  purchasedpoint: "0x155a0d960E76909905446118499Df6E0D0123122",
  claimedpoints: "0xeb9415D0B989B18231E6977819c24DEF47c855A8",
};

// Completion conditions for each Call
const completionThresholds = {
  purchasedpoint: 1000,
  claimedpoints: 7500,
  snakeclaims: 0,
};

const ABI = ["function balanceOf(address) view returns (uint256)"];

module.exports = async (req, res) => {
  const { address } = req.query;

  if (!address || !ethers.isAddress(address)) {
    return res.status(400).json({ error: "Invalid wallet address" });
  }

  const data = {};

  for (const [key, contractAddress] of Object.entries(contractMap)) {
    try {
      const contract = new ethers.Contract(contractAddress, ABI, provider);
      const balanceBN = await contract.balanceOf(address);
      const balance = parseFloat(ethers.formatUnits(balanceBN, 18)); // assuming 18 decimals

      const threshold = completionThresholds[key];
      const completed = typeof threshold === "number" ? balance > threshold : null;

      data[key] = {
        balance,
        completed
      };
    } catch (error) {
      data[key] = {
        balance: null,
        completed: false,
        error: error.message
      };
    }
  }

   // Add snakeclaims entry based on the sum of purchasedpoint + claimedpoints
  const snakeThreshold = completionThresholds.snakeclaims;
  const snakeCompleted = totalSnakePoints > snakeThreshold;

  data["snakeclaims"] = {
    balance: totalSnakePoints,
    completed: snakeCompleted
  };

  res.status(200).json({
    wallet: address,
    data
  });
};
