document.addEventListener('DOMContentLoaded', function() {
    const checkButton = document.getElementById('checkButton');
    // Removed appSelect and durationSelect as they are no longer needed
    const sentimentIndicator = document.getElementById('sentimentIndicator');
    const summaryContent = document.getElementById('summaryContent');
    const outputContainer = document.getElementById('outputContainer');
    const loading = document.getElementById('loading');

    const API_ENDPOINT_URL = window._env_?.API_ENDPOINT_URL;
    if (!API_ENDPOINT_URL) {
        // Using a custom message box instead of alert
        showCustomAlert('API endpoint is not configured.');
        return;
    }

    checkButton.addEventListener('click', function() {
        // No need to check appSelect.value or durationSelect.value as they are hardcoded
        outputContainer.style.display = 'none';
        loading.style.display = 'block';
        checkButton.disabled = true;
        checkButton.textContent = 'Analyzing...';

        // Hardcoded appId for Instagram
        const appId = '389801252'; // This ID is typically associated with Instagram in some contexts, or it can be a placeholder.
        const fullApiUrl = `${API_ENDPOINT_URL}`; 
        
        fetch(fullApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' , 'Access-Control-Allow-Origin': '*'},
            body: JSON.stringify({ appId: appId }) // Sending the hardcoded appId
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData?.error || response.statusText);
                }).catch(() => {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            sentimentIndicator.style.backgroundColor = '#e6e6e6';
            const sentiment = data?.sentiment?.toLowerCase();
            if (sentiment == 'positive') {
                sentimentIndicator.style.backgroundColor = '#65D273';
            } else if (sentiment == 'negative') {
                sentimentIndicator.style.backgroundColor = '#EF476F';
            } else if (sentiment == 'neutral') {
                sentimentIndicator.style.backgroundColor = '#FFD166';
            }
            summaryContent.textContent = data?.summary || 'No summary available.';
            loading.style.display = 'none';
            outputContainer.style.display = 'block';
            checkButton.disabled = false;
            checkButton.textContent = 'Check Now';
        })
        .catch(error => {
            // Using a custom message box instead of alert
            showCustomAlert('An error occurred: ' + error.message);
            loading.style.display = 'none';
            checkButton.disabled = false;
            checkButton.textContent = 'Check Now';
            sentimentIndicator.style.backgroundColor = '#e6e6e6';
            summaryContent.textContent = 'Error retrieving sentiment data.';
            outputContainer.style.display = 'none';
        });
    });

    // Custom alert function to replace window.alert
    function showCustomAlert(message) {
        const alertBox = document.createElement('div');
        alertBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 1000;
            text-align: center;
            font-family: 'Segoe UI', 'Roboto', sans-serif;
            color: var(--dark);
            max-width: 90%;
        `;
        alertBox.innerHTML = `
            <p>${message}</p>
            <button style="
                margin-top: 15px;
                padding: 8px 20px;
                background-color: var(--primary);
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 1rem;
            ">OK</button>
        `;
        document.body.appendChild(alertBox);

        alertBox.querySelector('button').addEventListener('click', () => {
            document.body.removeChild(alertBox);
        });
    }
});
