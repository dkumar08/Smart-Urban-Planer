let map = L.map('map').setView([38.8462, -77.3064], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let heatmapLayer = null;
let developmentZones = [];
let transitMap = null; // Separate transit map instance

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const geoData = JSON.parse(e.target.result);
                L.geoJSON(geoData, { style: { color: '#2A9D8F' } }).addTo(map);
                generateSuggestions(geoData);
                calculateSustainabilityScore(geoData);
            } catch (error) {
                console.error("Error parsing GeoJSON:", error);
            }
        };
        reader.readAsText(file);
    }
});

function generateSuggestions(data) {
    const suggestionBox = document.getElementById('suggestions');
    if (!data.features.length) {
        suggestionBox.innerHTML = "<strong>No data detected.</strong> Please upload a valid GeoJSON file.";
        return;
    }

    let suggestions = [
        { title: "Traffic Optimization", text: "Consider optimizing road layouts and improving public transport.", expandedText: [
            "Implement synchronized traffic lights for better flow.",
            "Develop dedicated bus lanes and pedestrian zones.",
            "Encourage carpooling and high-occupancy vehicle lanes."
        ]},
        { title: "Green Space Improvement", text: "Increasing parks and green zones will enhance urban sustainability.", expandedText: [
            "Expand urban tree coverage to improve air quality.",
            "Convert underutilized land into public parks.",
            "Implement green rooftops and vertical gardens."
        ]},
        { title: "Infrastructure Development", text: "Aging infrastructure noted. Focus on repairs and urban development.", expandedText: [
            "Upgrade outdated bridges and roads.",
            "Enhance accessibility by expanding sidewalks.",
            "Improve public facilities for long-term urban growth."
        ]},
        { title: "Public Transit Expansion", text: "Adding more transit options can improve mobility and reduce congestion.", expandedText: [
            "Increase bus and metro frequency in high-density areas.",
            "Introduce smart ticketing systems for seamless travel.",
            "Develop light rail or tram networks in underserved regions."
        ]},
        { title: "Sustainable Urban Planning", text: "Mixed-use zoning and smart city solutions can optimize sustainability.", expandedText: [
            "Incorporate renewable energy into public infrastructure.",
            "Use AI-based analytics for real-time traffic management.",
            "Encourage mixed-use development to reduce commuting times."
        ]}
    ];

    suggestionBox.innerHTML = `<h3>Urban Planning Recommendations</h3>
        <ul id="suggestion-list">${suggestions.map(s => `<li><strong>${s.title}:</strong> ${s.text} <br>
            <span id="${s.title.replace(/\s/g, '-').toLowerCase()}-details"></span>
            </li>`).join('')}</ul>
        <button class="explore-btn" onclick="expandRecommendations()">Explore More</button>`;

    // Store expanded state
    window.expansionCount = 0;
    window.suggestionsData = suggestions;
}

function expandRecommendations() {
    window.expansionCount++;
    let suggestions = window.suggestionsData;

    suggestions.forEach(suggestion => {
        let detailBox = document.getElementById(`${suggestion.title.replace(/\s/g, '-').toLowerCase()}-details`);
        
        // Add one additional point per click
        if (window.expansionCount <= suggestion.expandedText.length) {
            let newDetail = document.createElement('p');
            newDetail.textContent = `• ${suggestion.expandedText[window.expansionCount - 1]}`;
            detailBox.appendChild(newDetail);
        }
    });
}

function calculateSustainabilityScore(data) {
    const scoreBox = document.getElementById('sustainability-score');
    let score = 100; // Start with perfect score

    let deduction = 0;
    data.features.forEach(feature => {
        if (feature.properties && feature.properties.type) {
            switch (feature.properties.type) {
                case "high_traffic":
                    deduction += 15;
                    break;
                case "low_greenery":
                    deduction += 10;
                    break;
                case "poor_infrastructure":
                    deduction += 20;
                    break;
            }
        }
    });

    score = Math.max(0, score - deduction);
    scoreBox.innerHTML = `<h3>Sustainability Score: <strong>${score}/100</strong></h3>`;
}
