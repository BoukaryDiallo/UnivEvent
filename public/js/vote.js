document.getElementById('voteForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const choix = document.querySelector('input[name="candidat"]:checked');
    if (!choix) {
        alert('Veuillez sélectionner un candidat.');
        return;
    }
    alert(`Vote enregistré pour ${choix.value} !`);
});
