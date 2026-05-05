document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('createElectionForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const titre = document.getElementById('titre').value.trim();
        const description = document.getElementById('description').value.trim();

        if (!titre || !description) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        alert(`Élection "${titre}" créée avec succès !`);
        form.reset();
    });
});
