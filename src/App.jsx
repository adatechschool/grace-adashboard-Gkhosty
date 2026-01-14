import { useEffect, useState } from "react";
import Theme from "./components/Theme";
import "./App.css";

function App() {
  // Liste de tous les thèmes )
  const [themes, setThemes] = useState([]);
  // Nom du nouveau thème à ajouter
  const [newThemeName, setNewThemeName] = useState("");
  // Au chargement de la page : récupérer tous les thèmes depuis la base de données
  useEffect(() => {
    fetch("http://localhost:3000/themes")
      .then((res) => res.json())
      .then(setThemes)
      .catch(console.error);
  }, []);

  // Fonction pour supprimer un thème
  const deleteTheme = (id) => {
    // Supprimer dans la base de données
    fetch(`http://localhost:3000/themes/${id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur suppression");
        // Supprimer localement de la liste
        setThemes(themes.filter((theme) => theme.id !== id));
      })
      .catch(console.error);
  };

  // Fonction pour ajouter un nouveau thème
  const addTheme = () => {
    // Si le nom est vide, on ne fait rien
    if (!newThemeName.trim()) return;

    const newTheme = { name: newThemeName, skills: [] };

    // Envoyer vers la base de données
    fetch("http://localhost:3000/themes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTheme),
    }).catch(console.error);

    // Ajouter localement dans la liste pour l'afficher tout de suite
    setThemes([...themes, { ...newTheme, id: Date.now() }]);
    // Vider le champ de saisie
    setNewThemeName("");
  };

  return (
    <div>
      <h1>Adashboard</h1>

      {/* Zone pour ajouter un nouveau thème */}
      <div className="add-theme-container">
        <input
          type="text"
          placeholder="Nom du nouveau thème"
          value={newThemeName}
          onChange={(e) => setNewThemeName(e.target.value)}
        />
        <button onClick={addTheme}>Ajouter un thème</button>
      </div>

      {/* Afficher tous les thèmes */}
      {themes.map((theme) => (
        <div key={theme.id} className="theme-card">
          <div className="theme-header">
            <Theme theme={theme} />
            <button className="delete-btn" onClick={() => deleteTheme(theme.id)}>
              Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;