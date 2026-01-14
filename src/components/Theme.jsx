import { useState } from "react";

function Theme({ theme }) {
  // Liste des compétences avec leur état (acquis ou pas)
  const [skillsStatus, setSkillsStatus] = useState(
    theme.skills?.map((skill) => ({ ...skill, acquired: false })) || []
  );
  // Nom de la nouvelle compétence à ajouter
  const [newSkillLabel, setNewSkillLabel] = useState("");

  // Fonction pour marquer une compétence comme acquise ou non acquise
  const toggleAcquired = (index) => {
    const newSkills = [...skillsStatus];
    newSkills[index].acquired = !newSkills[index].acquired;
    setSkillsStatus(newSkills);

    // Sauvegarder le changement dans la base de données
    const skill = newSkills[index];
    fetch(`http://localhost:3000/themes/${theme.id}/skills/${skill.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acquired: skill.acquired })
    }).catch(console.error);
  };

  // Fonction pour ajouter une nouvelle compétence
  const addSkill = () => {
    if (!newSkillLabel.trim()) return;

    const newSkill = { label: newSkillLabel, theme_id: theme.id };

    // Envoyer vers la base de données
    fetch(`http://localhost:3000/themes/${theme.id}/skills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSkill)
    })
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((createdSkill) => {
        // Ajouter la compétence avec son ID de la base de données
        setSkillsStatus([...skillsStatus, { ...createdSkill, acquired: false }]);
        setNewSkillLabel("");
      })
      .catch(() => {
        // En cas d'erreur, ajouter quand même localement
        setSkillsStatus([...skillsStatus, { ...newSkill, id: Date.now(), acquired: false }]);
        setNewSkillLabel("");
      });
  };

  // Fonction pour supprimer une compétence
  const deleteSkill = (skillId, index) => {
    // Supprimer dans la base de données
    fetch(`http://localhost:3000/themes/${theme.id}/skills/${skillId}`, { method: "DELETE" })
      .then((res) => {
        // Si succès, supprimer localement
        if (res.ok) setSkillsStatus(skillsStatus.filter((_, i) => i !== index));
      })
      .catch(console.error);
  };
  // Calculer le pourcentage de compétences acquises
  const acquiredCount = skillsStatus.filter((skill) => skill.acquired).length;
  const percentage = skillsStatus.length > 0 ? Math.round((acquiredCount / skillsStatus.length) * 100) : 0;

  return (
    <div>
      <h2>{theme.name}</h2>

      {/* Barre de progression (affichée seulement s'il y a des compétences) */}
      {skillsStatus.length > 0 && (
        <div className="progress-container">
          <div className="progress-label">
            <span>Progression</span>
            <span>{percentage}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
          </div>
        </div>
      )}

      
      <ul>
        {skillsStatus.map((skill, index) => (
          <li key={skill.id || index}>
            <p>{skill.label}</p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button className="toggle-skill" onClick={() => toggleAcquired(index)}>
                {skill.acquired ? "Acquis ✅" : "Pas acquis ❌"}
              </button>
              <button className="delete-skill-btn" onClick={() => deleteSkill(skill.id, index)} title="Supprimer cette compétence">
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>
      {/*  nouvelle compétence */}
      <div className="add-skill-container">
        <input
          type="text"
          placeholder="Nouvelle compétence"
          value={newSkillLabel}
          onChange={(e) => setNewSkillLabel(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addSkill()}
        />
        <button onClick={addSkill}>Ajouter compétence</button>
      </div>
    </div>
  );
}

export default Theme;