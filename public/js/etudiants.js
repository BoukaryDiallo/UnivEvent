document.addEventListener('DOMContentLoaded', () => {
    // Activer Select2 sur le champ user_id
    $('#user_id').select2({
        placeholder: "Sélectionner un utilisateur",
        allowClear: true
    });

    const form = document.getElementById('createEtudiantForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert("Étudiant créé avec succès !");
    });
});

//Modification d un etudiant

document.getElementById('editEtudiantForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert("Étudiant mis à jour !");
});

// Lister les etudiants
document.querySelectorAll('.btn-danger').forEach(btn => {
    btn.addEventListener('click', () => {
        if(confirm("Voulez-vous vraiment supprimer cet étudiant ?")) {
            alert("Étudiant supprimé !");
        }
    });
});
