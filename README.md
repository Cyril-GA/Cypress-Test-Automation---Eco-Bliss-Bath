# OpenClassrooms - Eco-Bliss-Bath

# Prérequis

Pour démarrer cet applicatif web vous devez avoir les outils suivants:

- Docker
- NodeJs

# Installation et démarrage

Clonez le projet pour le récupérer

```
git clone https://github.com/OpenClassrooms-Student-Center/Eco-Bliss-Bath-V2.git
cd Eco-Bliss-Bath-V2
```

Pour démarrer l'API avec ça base de données.

```
docker compose up -d
```

# Pour démarrer le frontend de l'applicatif

Rendez-vous dans le dossier frontend

```
cd ./frontend
```

Installez les dépendances du projet

```
npm i
ou
npm install (si vous préférez)
```

# Cypress Test Automation – Eco Bliss Bath

Ce projet contient les tests automatisés du site e-commerce **Eco Bliss Bath**, développés avec **Cypress**.  
Les tests couvrent l’API, les smoke tests, les tests de sécurité XSS et des scénarios fonctionnels critiques.

---

## Prérequis

Avant d’installer le projet, assurez-vous d’avoir :

- **Node.js** (version recommandée : LTS)
- **npm** ou **yarn**
- Un navigateur compatible (Chrome recommandé)

---

## Installation du projet

1. Cloner le dépôt GitHub :

```bash
git clone git@github.com:Cyril-GA/Projet-12---Portfolio.git
```

2. Accéder au dossier du projet :

```bash
cd ECO-BLISS-BATH
```

3. Installer les dépendances :

```bash
npm install
```

## Lancement des tests Cypress

### Lancer Cypress en mode interactif

Cette commande ouvre l'interface graphique de Cypress :

```bash
npx cypress open
```

Sélectionner ensuite le navigateur et les tests à exécuter

### Lancer les test en mode headless

Cette commande exécute tous les tests en ligne de commande :

```bash
npx cypress run
```
