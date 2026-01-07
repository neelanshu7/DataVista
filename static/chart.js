let columns = [];
let chartType = "bar";
let chart;
let selectedX = null;
let selectedY = null;
let aggregation = "SUM";

document.getElementById("themeToggle").onclick = () => {
    document.body.classList.toggle("dark");
};

function uploadFile() {
    let file = document.getElementById("file").files[0];
    let formData = new FormData();
    formData.append("file", file);

    fetch("/upload", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        columns = data.columns;
        document.getElementById("chartOptions").classList.remove("hidden");
    });
}

function showChartOptions(type) {
    chartType = type;
    document.getElementById("selectors").classList.remove("hidden");

    renderPills("xButtons", true);
    renderPills("yButtons", false);
}

function renderPills(containerId, isX) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    columns.forEach(col => {
        const btn = document.createElement("button");
        btn.className = "pill";
        btn.innerText = col;

        btn.onclick = () => {
            [...container.children].forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            isX ? selectedX = col : selectedY = col;
        };

        container.appendChild(btn);
    });
}

function setAgg(type) {
    aggregation = type;
    document.querySelectorAll(".pill-group button")
        .forEach(b => b.classList.remove("active"));
    event.target.classList.add("active");
}

function generateChart() {
    if (!selectedX || !selectedY) {
        alert("Please select both X and Y columns");
        return;
    }

    fetch("/data", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            x: selectedX,
            y: selectedY,
            agg: aggregation
        })
    })
    .then(res => res.json())
    .then(data => {
        if (chart) chart.destroy();

        chart = new Chart(chartCanvas, {
            type: chartType,
            data: {
                labels: data.labels,
                datasets: [{
                    label: `${aggregation} of ${selectedY} by ${selectedX}`,
                    data: data.values,
                    borderWidth: 2,
                    fill: chartType === "line"
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    });
}
