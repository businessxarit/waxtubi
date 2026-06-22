import { useState } from "react";
import { createAccountFromAnonymous, signInWithEmail, signOut } from "../lib/firebase";
import "./AccountPanel.css";

export default function AccountPanel({ user, onClose }) {
  const [mode, setMode] = useState("create"); // "create" | "login"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const hasRealAccount = user && !user.isAnonymous;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "create") {
        await createAccountFromAnonymous(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err) {
      setError(translateFirebaseError(err.code));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignOut() {
    setSubmitting(true);
    try {
      await signOut();
      onClose();
    } catch (err) {
      setError(translateFirebaseError(err.code));
      setSubmitting(false);
    }
  }

  if (hasRealAccount) {
    return (
      <div className="account-panel">
        <p className="account-status">
          Connecté avec <strong>{user.email}</strong>
        </p>
        <p className="account-hint">
          Ton compteur Dhikr est sauvegardé et te suivra si tu changes de téléphone.
        </p>
        <button className="account-btn account-btn-secondary" onClick={handleSignOut} disabled={submitting}>
          Se déconnecter
        </button>
      </div>
    );
  }

  return (
    <div className="account-panel">
      <div className="account-tabs">
        <button className={mode === "create" ? "is-active" : ""} onClick={() => setMode("create")}>
          Créer un compte
        </button>
        <button className={mode === "login" ? "is-active" : ""} onClick={() => setMode("login")}>
          Se connecter
        </button>
      </div>

      <p className="account-hint">
        {mode === "create"
          ? "Garde ton compteur Dhikr même si tu changes de téléphone."
          : "Retrouve ton compteur sur ce téléphone."}
      </p>

      <form onSubmit={handleSubmit} className="account-form">
        <input
          type="email"
          placeholder="Adresse e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Mot de passe (6 caractères min.)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete={mode === "create" ? "new-password" : "current-password"}
        />
        {error && <p className="account-error">{error}</p>}
        <button className="account-btn" type="submit" disabled={submitting}>
          {submitting ? "Patiente…" : mode === "create" ? "Créer mon compte" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}

function translateFirebaseError(code) {
  switch (code) {
    case "auth/email-already-in-use":
      return "Cette adresse e-mail est déjà utilisée. Essaie de te connecter plutôt.";
    case "auth/invalid-email":
      return "Adresse e-mail invalide.";
    case "auth/weak-password":
      return "Mot de passe trop court (6 caractères minimum).";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "E-mail ou mot de passe incorrect.";
    case "auth/user-not-found":
      return "Aucun compte trouvé avec cette adresse e-mail.";
    case "auth/credential-already-in-use":
      return "Ce compte existe déjà — connecte-toi plutôt depuis cet appareil.";
    default:
      return "Une erreur est survenue. Réessaie dans un instant.";
  }
}
