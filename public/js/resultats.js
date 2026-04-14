document.addEventListener("DOMContentLoaded", function () {

    const ctx = document.getElementById('resultatsChart').getContext('2d');

    // données envoyées depuis Laravel
    const labels = window.labels;
    const data = window.data;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Votes',
                data: data,
                backgroundColor: '#198754',
                borderColor: '#198754',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

});