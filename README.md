# Waxtubi — Application religieuse islamique (2026)

Le nom vient du wolof *waxtu* (l'heure, le moment) : Waxtubi est une appli
centrée sur le temps sacré — horaires de prière, calendrier lunaire,
compteur de dhikr.

## Stack
- React 19 + Vite
- Firebase (auth anonyme + Firestore) — projet dédié, séparé de Xaritsoccer
- API Aladhan (api.aladhan.com) pour horaires de prière, Hijri et Qibla — gratuite, sans clé

## Statut de cette première étape
✅ Construits et fonctionnels :
- Design system complet (couleurs, typo, composant signature "arc gradué")
- Page Accueil : horaires de prière du jour + compte à rebours vers la prochaine prière
- Page Qibla : boussole avec direction de la Mecque (utilise la boussole du téléphone si disponible)
- Navigation flottante entre les 5 sections
- Géolocalisation avec repli automatique sur Dakar

🚧 Placeholders à construire ensuite (structure déjà posée) :
- Coran (texte + audio)
- Calendrier Hijri détaillé + événements
- Dhikr (compteur) + Duas

## Lancer le projet

```bash
npm install
npm run dev
```

## Configurer Firebase (avant déploiement)

1. Crée un nouveau projet Firebase dédié à Waxtubi (séparé de Xaritsoccer)
2. Active "Authentication" → méthode "Anonyme"
3. Active "Firestore Database"
4. Copie `.env.example` vers `.env.local` et remplis les valeurs depuis
   Firebase Console → Paramètres du projet → Tes applications
5. Sur Vercel : ajoute les mêmes variables dans Project Settings → Environment Variables

## Avatars récitateurs & mode Mushaf

**Avatars** : chaque récitateur a un avatar généré (silhouette géométrique
abstraite + couleur dérivée du nom, déterministe) à la place du menu
déroulant texte précédent. Volontairement **aucune photo réelle** —
les photographies de personnes sont soumises au droit à l'image, donc
on ne les récupère ni ne les recrée.

**Mode Mushaf** : bouton "Liste / Mushaf" dans la vue de lecture d'une
sourate. Le mode Mushaf affiche le texte en continu façon page de livre,
avec :
- Bordures ornementales géométriques (motif original, dessiné en SVG —
  pas une reproduction d'une page de Coran imprimée existante)
- Cartouche avec le nom de la sourate
- Pagination par boutons précédent/suivant

Note importante : le découpage en "pages" est un regroupement indicatif
par lots de versets pour l'affichage — **ce n'est pas la pagination
éditoriale officielle** d'un Coran imprimé (qui suit des règles de mise
en page spécifiques à chaque éditeur). Le mode karaoke verset par verset
fonctionne aussi dans ce mode (le verset en cours est surligné dans le texte).

## Lecture verset par verset (karaoke)

Bouton "📖 Activer la lecture verset par verset" dans la page de lecture
d'une sourate. Une fois activé :
- Chaque verset a son propre fichier audio (CDN islamic.network, endpoint
  `/quran/audio/{bitrate}/{edition}/{ayahNumber}.mp3`) — pas d'estimation
  de timing, la précision vient du découpage natif de la source audio
- Lecture séquentielle automatique : le verset suivant démarre dès que
  le précédent se termine
- Le verset en cours est surligné dans la liste (fond cuivre dégradé)
- Touche n'importe quel verset pour démarrer la lecture à partir de lui
- Contrôles play/pause/position affichés au-dessus de la liste

Note : ce mode est distinct du lecteur audio "sourate entière" existant
(qui utilise un seul fichier MP3 par sourate) — les deux restent
disponibles, le karaoke est un mode optionnel en plus.

## Animations d'entrée

- **Lancement de l'app** : l'arc gradué se dessine progressivement
  (splash screen, voir section dédiée plus haut)
- **Page Accueil** : header, arc et liste des horaires de prière
  apparaissent en fondu échelonné (chaque ligne avec un léger décalage)
  à chaque ouverture de la page
- Toutes les animations respectent `prefers-reduced-motion` (désactivées
  automatiquement si l'utilisateur a ce réglage actif sur son téléphone)

## Onglet Sira (vie du Prophète & Sahabas)

Nouvel onglet "Sira" avec deux sections :
- **Chronologie** : grandes étapes de la vie du Prophète Muhammad (ﷺ),
  de sa naissance à son décès
- **Sahabas** : fiches dépliantes sur les compagnons les plus connus
  (les quatre premiers califes, Khadija, Aisha, Bilal)

**Sur le contenu** : entièrement rédigé pour Waxtubi à partir de faits
historiques largement reconnus et concordants entre plusieurs sources
(pas de copie d'un texte existant). Une note de source et de neutralité
est affichée en bas de chaque section :
- Les dates antérieures à l'Hégire restent approximatives, comme dans
  l'ensemble de la littérature sur le sujet
- Le statut respectif des trois premiers califes fait l'objet d'un
  désaccord de fond entre traditions sunnite et chiite : ce désaccord
  n'est pas tranché dans l'app, les fiches se limitent aux faits
  biographiques largement admis
- Ce contenu est à visée d'étude générale, pas un avis savant (fatwa) —
  pour aller plus loin, mieux vaut consulter une source savante reconnue

## Animation d'entrée & polices arabes

**Splash screen** : à l'ouverture de l'app, l'arc gradué se dessine
progressivement (façon cadran solaire qui s'éveille), puis le nom Waxtubi
apparaît. Durée totale ≈ 2.2s, désactivée automatiquement si l'utilisateur
a activé "réduire les animations" sur son appareil.

**Polices arabes** : 4 styles sélectionnables (bouton "✒ Style d'écriture"
en haut de la page Coran), appliqués à tout le texte arabe de l'app :
- **Manuscrit** (Amiri) — calligraphique classique
- **Naskh** (Noto Naskh Arabic) — traditionnel, lisible
- **Kufi** (Noto Kufi Arabic) — géométrique, anguleux
- **Moderne** (Noto Sans Arabic) — épuré, contemporain

Préférence sauvegardée en localStorage. Note honnête : "Amiri" est une
police calligraphique moderne inspirée des manuscrits anciens, pas la
police Uthmani officielle propriétaire (KFGQPC) utilisée dans les Corans
imprimés — c'est le style gratuit le plus proche visuellement disponible.

## Mode hors-ligne (PWA)

L'app fonctionne sans connexion une fois installée, à deux niveaux :

- **Texte du Coran et horaires de prière** : mis en cache automatiquement
  via un service worker (vite-plugin-pwa / Workbox) au fil de la navigation.
  Aucune action requise de l'utilisateur — léger, donc invisible.
- **Audio des sourates** : volontairement *pas* mis en cache automatique
  (trop volumineux). L'utilisateur télécharge explicitement via :
  - le bouton ⬇ sur une sourate individuelle (page de lecture)
  - le bouton "Tout télécharger" dans le panneau "Écoute hors-ligne"
    (liste des sourates) — télécharge les 114 sourates pour le récitateur
    choisi, séquentiellement, avec barre de progression et possibilité
    d'annuler
- Les fichiers téléchargés sont stockés dans **IndexedDB** (pas le Cache
  API classique, pour permettre un suivi de progression et une suppression
  individuelle). Bouton de suppression disponible par sourate ou en masse.
- Avertissement de taille affiché avant le téléchargement groupé
  (~350-500 Mo selon le récitateur — variable selon le débit audio source).

### Notes techniques
- Le service worker se mnet à jour automatiquement (`registerType: 'autoUpdate'`)
- Si IndexedDB est indisponible (navigation privée stricte sur certains
  navigateurs), l'app continue de fonctionner en streaming uniquement —
  aucune erreur bloquante, juste pas de persistance hors-ligne

## Thème clair / sombre

Trois modes : **Auto** (suit le système), **Clair**, **Sombre** — bouton en haut à droite de l'app.
- La préférence est sauvegardée en localStorage (`waxtubi:theme`)
- En mode Auto, l'app réagit en direct si l'utilisateur change le thème de son téléphone
- Limite connue : la couleur de la barre de statut du téléphone (`theme-color`) suit le système, pas l'override manuel — c'est une limitation du HTML statique, sans impact sur le contenu de l'app elle-même

## Notes techniques importantes
- Aucune clé API n'est en dur dans le code — tout passe par variables d'environnement Vite (`VITE_*`)
- L'API Aladhan ne nécessite pas de clé
- La boussole Qibla demande une permission explicite sur iOS (bouton "Activer la boussole")
- Méthode de calcul des horaires : Muslim World League (méthode 3), standard en Afrique de l'Ouest francophone

## Compte utilisateur & règles Firestore (Dhikr)

Le compteur Dhikr se sauvegarde automatiquement par utilisateur dans Firestore,
sous `users/{uid}/dhikr/counter`. Sans compte créé, l'utilisateur a quand même
un identifiant anonyme (Firebase Auth anonyme) qui persiste tant qu'il ne
change pas de téléphone ou n'efface pas les données du navigateur.

**Créer un compte (email + mot de passe)** lie ce compte à l'UID anonyme
existant — le compteur déjà accumulé n'est donc pas perdu. Se connecter avec
ce compte sur un autre téléphone restaure le même compteur.

### Règles de sécurité Firestore à configurer

Dans Firebase Console → Firestore Database → Règles, utilise :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Sans ces règles (mode "test" par défaut qui expire après 30 jours, ou règles
trop restrictives), les sauvegardes du compteur échoueront silencieusement —
l'app continuera de fonctionner en local, mais sans persistance cross-device.

## Récitateurs audio (Coran)

Chaque sourate peut être écoutée avec différents récitateurs (Alafasy, Sudais,
Shuraim, Ghamdi, Husary, etc.), streamés depuis le CDN officiel
islamic.network — gratuit, sans clé API.

**Important** : la liste des récitateurs proposée n'est pas codée en dur.
Le code interroge le catalogue réel de l'API à chaque chargement et ne
propose que les récitateurs effectivement disponibles à ce moment-là. Si un
nom précis demandé (ex. Ali Jaber) n'apparaît pas dans le catalogue actuel
de l'API alquran.cloud, il sera simplement absent du sélecteur plutôt que de
pointer vers un fichier audio cassé.

### Son des perles (Dhikr)

Généré directement en Web Audio API (pas de fichier audio à héberger) :
- Réglable : on/off, style "Discret"/"Tactile", volume — bouton 🔊 en haut de la page Dhikr
- Préférence sauvegardée en localStorage (par appareil, pas liée au compte)
