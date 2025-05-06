const { ethers } = require("ethers");

const RPC_URL = "https://rpc.ankr.com/somnia_testnet/6e3fd81558cf77b928b06b38e9409b4677b637118114e83364486294d5ff4811";
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Map variable names to contract addresses
const contractMap = {
  rpsPurch: "0xD1fC78e743B06F90E2B6A36022763d3E35160E0a",
  rpsScore: "0x89cD2e2124b48737A220b7cA264b12a461e225d3",
  rpsScoreTotal: "0x89cD2e2124b48737A220b7cA264b12a461e225d3",
  snkA: "0x696ee979e8CC1D5a2CA7778606a3269C00978346",
  snkScore: "0x5Cb442D8A3D7A7153BE93202e232919bE3C84C5A",
  petScore: "0x754F014dFC79eE5b3bd4335637622Ce03f26bBd9",
  petScoreTotal: "0x754F014dFC79eE5b3bd4335637622Ce03f26bBd9"
};

// Standard ABI just for `balanceOf`
const ABI = ["function balanceOf(address) view returns (uint256)"];

module.exports = async (req, res) => {
  const { address } = req.query;

  if (!address || !ethers.isAddress(address)) {
    return res.status(400).json({ error: "Invalid wallet address" });
  }

  const balances = {};

  for (const [name, contractAddress] of Object.entries(contractMap)) {
    try {
      const contract = new ethers.Contract(contractAddress, ABI, provider);
      const balance = await contract.balanceOf(address);
      balances[name] = parseFloat(ethers.formatUnits(balance, 18)); // assuming 18 decimals
    } catch (error) {
      balances[name] = `Error: ${error.message}`;
    }
  }

  res.status(200).json({
    wallet: address,
    balances
  });
};
