// Variables globales
const transactionPopup = document.getElementById("transactionPopup");
const userPopup = document.getElementById("userPopup");
const addTransactionButton = document.getElementById("addTransactionButton");
const addUserButton = document.getElementById("addUserButton");
const closeModal = document.getElementById("closeModal");
const closeUserModal = document.getElementById("closeUserModal");
const transactionForm = document.getElementById("transactionForm");
const userForm = document.getElementById("userForm");
const transactionsTable = document.getElementById("transactionsTable");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");

let currentUserIndex = 0;
let users = [];

// Charger les données des utilisateurs
async function loadUserData() {
  const storedData = localStorage.getItem("users");
  if (storedData) {
    users = JSON.parse(storedData);
  } else {
    try {
      const response = await fetch("db.json");
      const data = await response.json();
      users = data;
      localStorage.setItem("users", JSON.stringify(users)); // Sauvegarde initiale
    } catch (error) {
      console.error("Erreur de chargement des données:", error);
      users = []; // Initialise une liste vide si les données échouent
    }
  }
}

// Afficher les informations de l'utilisateur actuel
function displayUserData() {
  if (users.length === 0) {
    console.warn("Aucun utilisateur à afficher.");
    return;
  }

  const user = getCurrentUser();
  document.querySelector("#nom").textContent = `${user.prenom} ${user.nom}`;
  document.querySelector("#tel").textContent = `${user.telephone || "N/A"}`;
  document.querySelector("#SOLDE").textContent = `${user.montant || 0}€`;
  document.querySelector("#img").src = user.photo || "placeholder.jpg";

  // Mise à jour des transactions de l'utilisateur
  transactionsTable.innerHTML = "";
  user.transactions?.forEach((transaction) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="px-4 py-2 text-sm">${transaction.date}</td>
      <td class="px-4 py-2 text-sm">${transaction.numero}</td>
      <td class="px-4 py-2 text-sm">${transaction.type}</td>
      <td class="px-4 py-2 text-sm"><span class="${
        transaction.type === "retrait"
          ? "p-1 bg-purple-300 text-purple-500 rounded"
          : "p-1 bg-green-100 text-green-500 rounded"
      }">${transaction.montant}€</span></td>
    `;
    transactionsTable.appendChild(row);
  });

  updateNavigationButtons(); // Mise à jour des boutons
}

function getCurrentUser() {
  return users[currentUserIndex];
}

function setCurrentUserIndex(index) {
  currentUserIndex = index;
  displayUserData();
}

// Configurer la navigation (précédent/suivant)
function setupNavigation() {
  prevButton.addEventListener("click", () => {
    if (currentUserIndex > 0) {
      setCurrentUserIndex(currentUserIndex - 1);
    }
  });

  nextButton.addEventListener("click", () => {
    if (currentUserIndex < users.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1);
    }
  });
}

// Mettre à jour les boutons de navigation
function updateNavigationButtons() {
  prevButton.disabled = currentUserIndex === 0;
  nextButton.disabled = currentUserIndex === users.length - 1;
}

// Gérer l'ouverture et la fermeture des popups
function setupPopups() {
  // Ouvrir les popups
  addTransactionButton.addEventListener("click", () => {
    transactionPopup.classList.remove("hidden");
  });

  addUserButton.addEventListener("click", () => {
    userPopup.classList.remove("hidden");
  });

  // Fermer les popups
  closeModal.addEventListener("click", () => {
    transactionPopup.classList.add("hidden");
  });

  closeUserModal.addEventListener("click", () => {
    userPopup.classList.add("hidden");
  });

  // Fermer en cliquant à l'extérieur
  window.addEventListener("click", (event) => {
    if (event.target === transactionPopup) {
      transactionPopup.classList.add("hidden");
    }
    if (event.target === userPopup) {
      userPopup.classList.add("hidden");
    }
  });
}

// Valider les champs du formulaire
function validateForm(form) {
  let isValid = true;
  const fields = form.querySelectorAll("input, select, textarea");

  fields.forEach((field) => {
    const errorElement = field.nextElementSibling;
  
    if (!field.value.trim()) {
      // Vérifier le nom ou un attribut spécifique du champ
      if (field.name === "date") {
        errorElement.textContent = "La date  est obligatoire.";
      } else if (field.name === "numero") {
        errorElement.textContent = "Le numero est positif.";
      } else if (field.name === "montant") {
        errorElement.textContent = "Le montant est obligatoire.";
      } else {
        errorElement.textContent = "Ce champ est obligatoire.";
      }
      isValid = false;
    } else {
      errorElement.textContent = ""; // Réinitialiser les erreurs si le champ est valide
    }
  });
  

  return isValid;
}

// Ajouter une transaction et enregistrer dans localStorage
transactionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (validateForm(transactionForm)) {
    const formData = new FormData(transactionForm);
    const transaction = {
      date: new Date().toISOString().split("T")[0],
      numero: formData.get("numero"),
      type: formData.get("type"),
      montant: parseFloat(formData.get("montant")),
    };

    const user = getCurrentUser();
    user.transactions = user.transactions || [];
    user.transactions.push(transaction);

    // Mettre à jour le solde de l'utilisateur
    if (transaction.type === "retrait") {
      user.montant -= transaction.montant;
    } else if (transaction.type === "depot") {
      user.montant += transaction.montant;
    }

    // Sauvegarder dans localStorage
    users[currentUserIndex] = user;
    localStorage.setItem("users", JSON.stringify(users));

    // Rafraîchir les données affichées
    displayUserData();
    transactionPopup.classList.add("hidden");
    transactionForm.reset();
  }
});

// Initialisation du document
document.addEventListener("DOMContentLoaded", async () => {
  await loadUserData();
  if (users.length > 0) {
    displayUserData();
    setupNavigation();
    setupPopups();
  } else {
    console.warn("Aucun utilisateur disponible.");
  }
});
// validation des champs pour ajouter utilisateur
document.getElementById("userForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Empêche l'envoi du formulaire

  // Récupérer les champs
  const prenom = document.getElementById("userPrenom");
  const nom = document.getElementById("userNom");
  const montant = document.getElementById("userMontant");

  // Récupérer les éléments d'erreur
  const prenomError = document.getElementById("prenomError");
  const nomError = document.getElementById("nomError");
  const montantError = document.getElementById("montantError");

  let isValid = true;

  // Validation du prénom
  if (!prenom.value.trim()) {
    prenomError.textContent = "Le prénom est obligatoire.";
    isValid = false;
  } else {
    prenomError.textContent = ""; // Pas d'erreur
  }

  // Validation du nom
  if (!nom.value.trim()) {
    nomError.textContent = "Le nom est obligatoire.";
    isValid = false;
  } else {
    nomError.textContent = ""; // Pas d'erreur
  }

  // Validation du montant
  if (!montant.value.trim()) {
    montantError.textContent = "Le montant est obligatoire.";
    isValid = false;
  } else if (isNaN(montant.value) || parseFloat(montant.value) <= 0) {
    montantError.textContent = "Veuillez entrer un montant valide (nombre supérieur à 0).";
    isValid = false;
  } else {
    montantError.textContent = ""; // Pas d'erreur
  }

  // Si tous les champs sont valides
  if (isValid) {
    alert("Formulaire valide ! Données envoyées.");
    // Vous pouvez soumettre le formulaire ou effectuer une action
  }
});
