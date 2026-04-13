/*///////////////////////////////////VALIDATION DE FORMULAIRE DE CREATION USER*/

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('createUserForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const role = document.getElementById('role').value;
        const password = document.getElementById('password').value.trim();

        if (!name || !email || !password) {
            alert("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        alert(`Utilisateur ${name} (${role}) créé avec succès !`);
        form.reset();
    });
});
