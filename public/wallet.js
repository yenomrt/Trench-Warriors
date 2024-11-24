document.addEventListener("DOMContentLoaded", async function () {
    console.log("DOM fully loaded and parsed.");

    const connectButton = document.getElementById('connectButton');
    const status = document.getElementById('status');
    const coinsList = document.getElementById('coinsList');

    let tokensMap = {};

    // Load SPL Token Registry asynchronously
    try {
        console.log("Loading token list...");
        const { TokenListProvider } = window["@solana/spl-token-registry"];
        const tokenListProvider = new TokenListProvider();
        const tokenList = await tokenListProvider.resolve();
        tokensMap = tokenList.getList().reduce((map, token) => {
            map[token.address] = token;
            return map;
        }, {});
        console.log("Token list loaded successfully.");
    } catch (error) {
        console.error("Failed to load token list:", error);
        tokensMap = {}; // Fall back to an empty map if loading fails
    }

    const connectWallet = async () => {
        if (window.solana && window.solana.isPhantom) {
            try {
                console.log("Attempting to connect to Phantom wallet...");
                const resp = await window.solana.connect({ onlyIfTrusted: false });
                console.log("Connection successful:", resp);
                status.innerText = `Connected to wallet: ${resp.publicKey.toString()}`;
                await fetchAndDisplayTokens(resp.publicKey);
            } catch (err) {
                console.error('Connection to wallet failed:', err);
                status.innerText = 'Connection to wallet failed. Please try again.';
            }
        } else {
            console.error("Phantom wallet is not installed.");
            connectButton.innerText = 'Install Phantom Wallet';
            connectButton.addEventListener('click', () => {
                window.open('https://phantom.app/', '_blank');
            });
        }
    };

    // Phantom wallet event listener for disconnection
    if (window.solana) {
        window.solana.on('disconnect', () => {
            console.log("Wallet disconnected.");
            status.innerText = 'Wallet disconnected. Please reconnect.';
        });
    }

    // Attach connect button click event listener
    connectButton.addEventListener('click', async () => {
        console.log("Connect button clicked.");
        await connectWallet();
    });

    // Function to fetch and display tokens held by the connected wallet
    async function fetchAndDisplayTokens(walletPublicKey) {
        const connection = new solanaWeb3.Connection('https://mainnet.helius-rpc.com/?api-key=586264ce-df55-4e09-8f4f-3cf8dd64940e', 'confirmed');

        try {
            console.log("Fetching token accounts for wallet:", walletPublicKey.toString());
            const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPublicKey, {
                programId: new solanaWeb3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
            });

            // Clear the existing list
            coinsList.innerHTML = '';

            // Filter out tokens with a balance of 0 and display the rest
            const tokens = tokenAccounts.value.filter((tokenAccount) => {
                const tokenInfo = tokenAccount.account.data.parsed.info;
                const tokenAmount = tokenInfo.tokenAmount.uiAmount;
                return tokenAmount > 0; // Only include tokens with a positive balance
            });

            if (tokens.length === 0) {
                coinsList.innerHTML = `<li>No tokens found with a positive balance.</li>`;
                return;
            }

            // Display each token with a positive balance
            tokens.forEach((tokenAccount) => {
                const tokenInfo = tokenAccount.account.data.parsed.info;
                const tokenMintAddress = tokenInfo.mint;
                const tokenAmount = tokenInfo.tokenAmount.uiAmount;

                // Get the token name from the token registry
                const tokenDetails = tokensMap[tokenMintAddress];
                const tokenName = tokenDetails ? tokenDetails.name : `Unknown Token (${tokenMintAddress})`;

                // Create a list item to display the token details in a more user-friendly way
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <strong>Token:</strong> ${tokenName} <br>
                    <strong>Balance:</strong> ${tokenAmount.toFixed(2)}
                `;
                coinsList.appendChild(listItem);
            });

            console.log("Token information fetched successfully.");
        } catch (error) {
            console.error('Error fetching tokens:', error);
            status.innerText = 'Failed to fetch tokens. Please try again later.';
        }
    }
});
