const { ethers } = require("ethers");

const RPC_URL = "https://rpc.ankr.com/somnia_testnet/6e3fd81558cf77b928b06b38e9409b4677b637118114e83364486294d5ff4811";
const CONTRACT_ADDRESSES = [
  "0x878bf527Abe53f973c5f43eB171c6111d76A0FC5"
];

const provider = new ethers.JsonRpcProvider(RPC_URL);

const SAFE_ABI = [
  "function balanceOf(address owner) view returns (uint256)"
];

module.exports = async (req, res) => {
  const { address } = req.query;

  if (!address || !ethers.isAddress(address)) {
    return res.status(400).json({ error: "Invalid wallet address" });
  }

  const results = [];

  for (const ca of CONTRACT_ADDRESSES) {
    try {
      const token = new ethers.Contract(ca, SAFE_ABI, provider);
      const balance = await token.balanceOf(address);

      results.push({
        contract: ca,
        balance: balance.toString()  // You can later format this manually if you know decimals
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
