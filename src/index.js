import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { TokenListProvider } from '@solana/spl-token-registry';
// Use the imports in your code
const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

const tokenListProvider = new TokenListProvider();
tokenListProvider.resolve().then(tokenListContainer => {
  const tokens = tokenListContainer.getList();
  console.log('Loaded token list:', tokens);
});
