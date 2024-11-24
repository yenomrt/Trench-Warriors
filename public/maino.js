

document.addEventListener("DOMContentLoaded", async function () {
    // Create search input and button for the last tab
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Enter token ID...';
    searchInput.id = 'tokenSearchInput';
    searchInput.className = 'search-input';

    const searchButton = document.createElement('button');
    searchButton.innerText = 'Search';
    searchButton.className = 'search-button';

    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchButton);
    document.body.insertBefore(searchContainer, document.body.firstChild);

    searchButton.addEventListener('click', async () => {
        const mint = searchInput.value.trim();
        if (mint) {
            showTokenDetails(mint);
            fetchLpInformation(mint);
            showDexScreenerChart(mint);
        }
    });

    // Elements for wallet connection and token details
    const connectButton = document.getElementById('connectButton');
    const status = document.getElementById('status');
    const tokenTableBody = document.querySelector('#tokenTable tbody');
    const tokenDetailsDiv = document.getElementById('tokenDetails');
    const tokenMintElement = document.getElementById('tokenMint');
    const tokenNameElement = document.getElementById('tokenName');
    const tokenSymbolElement = document.getElementById('tokenSymbol');
    const tokenBalanceElement = document.getElementById('tokenBalance');
    const tokenDecimalsElement = document.getElementById('tokenDecimals');
    const lpInfoDiv = document.getElementById('lpInfo');
    let chartDiv = document.getElementById('chart');

    // Handle search input and button for the first tab
    const searchButtonTab1 = document.getElementById('searchButtonTab1');
    const searchInputTab1 = document.getElementById('tokenSearchInputTab1');
    const tokenDetailsTab1 = document.getElementById('tokenDetailsTab1');

    if (searchButtonTab1 && searchInputTab1 && tokenDetailsTab1) {
        searchButtonTab1.addEventListener('click', async () => {
            console.log("Search button clicked in the first tab");
            const mint = searchInputTab1.value.trim();
            if (mint) {
                console.log("Mint address entered:", mint);
                await showTokenDetailsInTab(mint, tokenDetailsTab1);
            } else {
                console.log("No mint address entered");
            }
        });
    } else {
        console.error("Search elements not found in the first tab");
    }

    // Handle search input and button for the second tab
    const searchButtonTab2 = document.getElementById('searchButtonTab2');
    const searchInputTab2 = document.getElementById('tokenSearchInputTab2');
    const tokenDetailsTab2 = document.getElementById('tokenDetailsTab2');

    if (searchButtonTab2 && searchInputTab2 && tokenDetailsTab2) {
        searchButtonTab2.addEventListener('click', async () => {
            console.log("Search button clicked in the second tab");
            const mint = searchInputTab2.value.trim();
            if (mint) {
                console.log("Mint address entered for traders:", mint);
                await fetchTopTraders(mint, tokenDetailsTab2);
            } else {
                console.log("No mint address entered");
            }
        });
    } else {
        console.error("Search elements not found in the second tab");
    }

    // Function to fetch top traders for a specific mint
    async function fetchTopTraders(mint, targetDiv) {
        try {
            console.log(`Fetching top traders for mint: ${mint}`);
            const response = await fetch('http://localhost:3001/fetch-top-traders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mint }),
            });
            console.log('Server response:', response);

            if (!response.ok) {
                throw new Error('Failed to fetch top traders data');
            }

            const tradersData = await response.json();
            console.log("Top traders data fetched:", tradersData);

            // Display traders information in a table
            const tradersTable = document.createElement('table');
            tradersTable.className = 'traders-table';
            tradersTable.innerHTML = `
                <thead>
                    <tr>
                        <th>Trader Address</th>
                        <th>Realized Profit</th>
                        <th>SOL Balance</th>
                        <th>Buy Volume</th>
                        <th>Sell Volume</th>
                        <th>PNL</th>
                        <th>Average Cost</th>
                        <th>Average Sold</th>
                    </tr>
                </thead>
                <tbody>
                    ${tradersData.map(trader => `
                        <tr>
                            <td>${trader.address}</td>
                            <td>${Math.floor(trader.realized_profit)}</td>
                            <td>${(trader.sol_balance / 1000000000).toFixed(2)}</td>
                            <td>${Math.floor(trader.buy_volume_cur)}</td>
                            <td>${Math.floor(trader.sell_volume_cur)}</td>
                            <td>${Math.floor(trader.profit)}</td>
                            <td>${trader.avg_cost}</td>
                            <td>${trader.avg_sold}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;

            targetDiv.innerHTML = '';
            targetDiv.appendChild(tradersTable);
        } catch (error) {
            console.error('Error fetching top traders data:', error);
            targetDiv.innerHTML = `<p>Failed to fetch top traders data. Please try again later.</p>`;
        }
    }

    // Function to create chart div if not found
    function createChartDiv() {
        const chartContainer = document.createElement('div');
        chartContainer.id = 'chart';
        chartContainer.className = 'chart-container';
        tokenDetailsDiv.appendChild(chartContainer);
        return chartContainer;
    }

    // Check if Phantom wallet is installed
    if (window.solana && window.solana.isPhantom) {
        console.log("Phantom Wallet is detected.");

        connectButton.addEventListener('click', async () => {
            console.log("Connect button clicked.");

            try {
                console.log("Attempting to connect to Phantom wallet...");
                const resp = await window.solana.connect({ onlyIfTrusted: false });
                console.log("Connection successful:", resp);
                status.innerText = `Connected to wallet: ${resp.publicKey.toString()}`;
                status.className = 'status-connected';

                // Fetch and display tokens from the backend
                await fetchTokensFromBackend(resp.publicKey);
            } catch (err) {
                console.error('Connection to wallet failed:', err);
                status.innerText = 'Connection to wallet failed. Please try again.';
                status.className = 'status-error';
            }
        });
    } else {
        console.error("Phantom Wallet is not installed.");
        connectButton.innerText = 'Install Phantom Wallet';
        connectButton.className = 'install-button';
        connectButton.addEventListener('click', () => {
            window.open('https://phantom.app/', '_blank');
        });
    }

    // Function to show detailed information about a token in a specific tab
    async function showTokenDetailsInTab(mint, targetDiv) {
        try {
            console.log(`Fetching metadata for mint: ${mint}`);
            // Fetch metadata from the backend
            const response = await fetch('http://localhost:3001/get-token-metadata', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mint }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch token metadata');
            }

            const metadata = await response.json();
            console.log("Metadata fetched:", metadata);

            // Display metadata details
            targetDiv.innerHTML = `
                <h3>Token Details</h3>
                <p><strong>Mint Address:</strong> ${mint}</p>
                <p><strong>Name:</strong> ${metadata.name || 'N/A'}</p>
                <p><strong>Symbol:</strong> ${metadata.symbol || 'N/A'}</p>
            `;

            // Now fetch holders data and display it in a table
            console.log(`Fetching holders data for mint: ${mint}`);
            const holdersResponse = await fetch('http://localhost:3001/scrape-holders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mint }),
            });

            if (!holdersResponse.ok) {
                throw new Error('Failed to fetch holders information');
            }

            const holdersData = await holdersResponse.json();
            console.log("Holders data fetched:", holdersData);

            // Create a table for holders information
            const holdersTable = document.createElement('table');
            holdersTable.className = 'holders-table';
            holdersTable.innerHTML = `
                <thead>
                    <tr>
                        <th>Address</th>
                        <th>Balance</th>
                        <th>SOL Balance</th>
                        <th>Age</th>
                    </tr>
                </thead>
                <tbody>
                    ${holdersData.holders.map(holder => `
                        <tr>
                            <td>${holder.address}</td>
                            <td>${holder.balance}</td>
                            <td>${holder.solbalance}</td>
                            <td>${holder.age}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;

            targetDiv.appendChild(holdersTable);
        } catch (error) {
            console.error('Error fetching token metadata or holders information:', error);
            targetDiv.innerHTML = `<p>Failed to fetch token details. Please try again later.</p>`;
        }
    }

    // Function to fetch tokens from the backend
    async function fetchTokensFromBackend(walletPublicKey) {
        try {
            const response = await fetch('http://localhost:3001/get-wallet-tokens', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ walletPublicKey: walletPublicKey.toString() }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch wallet tokens');
            }

            const tokens = await response.json();

            // Clear the existing table
            const tokenTableBody = document.querySelector('#tokenTable tbody');
            tokenTableBody.innerHTML = '';

            if (tokens.length === 0) {
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.colSpan = 3;
                cell.textContent = "No tokens found with a positive balance.";
                cell.className = 'no-tokens-message';
                row.appendChild(cell);
                tokenTableBody.appendChild(row);
                return;
            }

            // Iterate over the tokens and add details to the table
            tokens.forEach(({ mint, name, symbol, balance, decimals, imageUrl }) => {
                const row = document.createElement('tr');
                row.dataset.mint = mint;
                row.dataset.balance = balance;
                row.dataset.decimals = decimals;
                row.className = 'token-row';

                const nameCell = document.createElement('td');
                nameCell.className = 'token-name-cell';
                if (imageUrl) {
                    const imageElement = document.createElement('img');
                    imageElement.src = imageUrl;
                    imageElement.alt = name;
                    imageElement.className = 'token-image-small';
                    nameCell.appendChild(imageElement);
                }
                nameCell.appendChild(document.createTextNode(` ${name}`));
                row.appendChild(nameCell);

                const symbolCell = document.createElement('td');
                symbolCell.className = 'token-symbol-cell';
                symbolCell.textContent = symbol;
                row.appendChild(symbolCell);

                const balanceCell = document.createElement('td');
                balanceCell.className = 'token-balance-cell';
                balanceCell.textContent = balance.toFixed(2);
                row.appendChild(balanceCell);

                row.addEventListener('click', () => {
                    showTokenDetails(mint, balance, decimals);
                    fetchLpInformation(mint);
                    showDexScreenerChart(mint);
                });

                tokenTableBody.appendChild(row);
            });

            console.log("Token information fetched and displayed successfully.");
        } catch (error) {
            console.error('Error fetching tokens from backend:', error);
            const status = document.getElementById('status');
            status.innerText = 'Failed to fetch tokens. Please try again later.';
            status.className = 'status-error';
        }
    }

    async function fetchLpInformation(mint) {
        console.log("Fetching LP information for mint:", mint);
        // Placeholder logic
        // Implement your real LP fetching logic here if required
    }
});

// Include Google Fonts
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);
