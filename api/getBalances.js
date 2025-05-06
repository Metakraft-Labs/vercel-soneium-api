const { ethers } = require("ethers");

const RPC_URL = "https://rpc.ankr.com/somnia_testnet/6e3fd81558cf77b928b06b38e9409b4677b637118114e83364486294d5ff4811"; // 👈 Replace with actual RPC

const CONTRACT_ADDRESSES = [
  "0xYourToken1",
  "0x0000000000000000000000000000000000000000"
];

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

const provider = new ethers.JsonRpcProvider(RPC_URL);

module.exports = async (req, res) => {
  const { address } = req.query;

  if (!address || !ethers.isAddress(address)) {
    return res.status(400).json({ error: "Invalid wallet address" });
  }

  const results = [];

  for (const ca of CONTRACT_ADDRESSES) {
    try {
      const token = new ethers.Contract(ca, ERC20_ABI, provider);
      const [balance, decimals, symbol] = await Promise.all([
        token.balanceOf(address),
        token.decimals(),
        token.symbol()
      ]);
      results.push({
        contract: ca,
        symbol,
        balance: parseFloat(ethers.formatUnits(balance, decimals))
      });
    } catch (e) {
      results.push({
        contract: ca,
        error: e.message
      });
    }
  }

  res.status(200).json({
    wallet: address,
    balances: results
  });
};
