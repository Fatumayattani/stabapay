import { ethers } from 'ethers';

export const USDC_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

export const formatUSDC = (amount: string): string => {
  try {
    // USDC has 6 decimals
    const formatted = ethers.formatUnits(amount, 6);
    // Format to 2 decimal places for display
    return Number(formatted).toFixed(2);
  } catch (error) {
    console.error('Error formatting USDC amount:', error);
    return '0.00';
  }
};

export const parseUSDCAmount = (amount: string): string => {
  try {
    // Convert amount to USDC units (6 decimals)
    return ethers.parseUnits(amount, 6).toString();
  } catch (error) {
    console.error('Error parsing USDC amount:', error);
    return '0';
  }
};

export const getUSDCBalance = async (
  address: string,
  contractAddress: string,
  provider: ethers.Provider
): Promise<string> => {
  try {
    const contract = new ethers.Contract(contractAddress, USDC_ABI, provider);
    const balance = await contract.balanceOf(address);
    return balance.toString();
  } catch (error) {
    console.error('Error getting USDC balance:', error);
    return '0';
  }
};

export const approveUSDC = async (
  spender: string,
  amount: string,
  contractAddress: string,
  signer: ethers.Signer
): Promise<boolean> => {
  try {
    const contract = new ethers.Contract(contractAddress, USDC_ABI, signer);
    const tx = await contract.approve(spender, amount);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error approving USDC:', error);
    return false;
  }
};
