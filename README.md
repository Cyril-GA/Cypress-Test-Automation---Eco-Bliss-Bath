# Cypress Test Automation – Eco Bliss Bath

Ce projet contient les tests automatisés du site e-commerce **Eco Bliss Bath**, développés avec **Cypress**.  
Les tests couvrent l’API, les smoke tests, les tests de sécurité XSS et des scénarios fonctionnels critiques.

---

## Prérequis

Avant d’installer le projet, assurez-vous d’avoir :

- **Docker**
- **Node.js** (version recommandée : LTS)
- **npm** ou **yarn**
- Un navigateur compatible (Chrome recommandé)

---

## Installation du projet

1. Cloner le dépôt GitHub :

```bash
git clone git@github.com:Cyril-GA/Cypress-Test-Automation---Eco-Bliss-Bath.git
```

2. Accéder au dossier du projet :

```bash
cd Eco-Bliss-Bath-V2
```

3. Installer les dépendances :

```bash
npm install
```

Pour lancer le back-end

```bash
docker compose up -d
```

## Lancement des tests Cypress

### Lancer Cypress en mode interactif

Cette commande ouvre l'interface graphique de Cypress :

```bash
npx cypress open
```

Sélectionner ensuite le navigateur et les tests à exécuter.

### Lancer les tests en mode headless

Cette commande exécute tous les tests en ligne de commande :

```bash
npx cypress run
```

### Génération du rapport

Lors de l’exécution des tests, les résultats sont affichés directement dans la console.

En cas d’échec :

- Cypress génère automatiquement des captures d’écran.
- Des vidéos peuvent être générées en mode headless selon la configuration.

Les fichiers générés sont disponibles dans les dossiers :

```bash
cypress/screenshots
cypress/videos
```
