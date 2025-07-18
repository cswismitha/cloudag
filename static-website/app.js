document.addEventListener('DOMContentLoaded', function() {
    const checkButton = document.getElementById('checkButton');
    const appSelect = document.getElementById('appSelect');
    const durationSelect = document.getElementById('durationSelect');
    const sentimentIndicator = document.getElementById('sentimentIndicator');
    const summaryContent = document.getElementById('summaryContent');
    const outputContainer = document.getElementById('outputContainer');
    const loading = document.getElementById('loading');

    const API_ENDPOINT_URL = window._env_?.API_ENDPOINT_URL;
    if (!API_ENDPOINT_URL) {
        alert('API endpoint is not configured.');
        return;
    }

    checkButton.addEventListener('click', function() {
        if (!appSelect.value || !durationSelect.value) {
            alert('Please select both App and Duration');
            return;
        }

        outputContainer.style.display = 'none';
        loading.style.display = 'block';
        checkButton.disabled = true;
        checkButton.textContent = 'Analyzing...';

        const durationMonths = durationSelect.value;
        const fullApiUrl = `${API_ENDPOINT_URL}`; 
        
        fetch(fullApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' , 'Access-Control-Allow-Origin': '*'},
			body: JSON.stringify({ appId : '389801252' })
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
            alert('An error occurred: ' + error.message);
            loading.style.display = 'none';
            checkButton.disabled = false;
            checkButton.textContent = 'Check Now';
            sentimentIndicator.style.backgroundColor = '#e6e6e6';
            summaryContent.textContent = 'Error retrieving sentiment data.';
            outputContainer.style.display = 'none';
        });
    });
});
