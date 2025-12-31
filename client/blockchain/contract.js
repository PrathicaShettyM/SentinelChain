import { ethers } from "ethers";
import { getProvider } from "./provider";

const ABI = [
  "function getLog(string) view returns (string,uint256,uint8,bytes32,string)",
  "function verifyLog(string,string) view returns (bool)",
  "event AlertTriggered(string,string,uint8,uint256)",
  "event CriticalAlert(string,string,uint256)"
];

const ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

export const getContract = async () => {
  const provider = getProvider();
  const signer = await provider.getSigner();
  return new ethers.Contract(ADDRESS, ABI, signer);
};
