# Bot Discord.js pour serveurs de boost BS


## Présentation du bot 

### Fonctionnalités
- l'ouverture de ticket
- la mise en vente de comptes
- l'ajout payant de joueurs de haut niveau sur le jeu

### Fonctionnalités à venir :
- calcul du prix des comptes ou des boosts
- niveau de départ dans les tickets
- afficher les stats des joeurs
- vérification des nombres pour le 'actual_rank-input'
- mettre en vente son compte


## Installation

### Modules requis 
- node
- discord.js
- typescript
- pm2
- fs
- path

### Étapes
1. Télecharger le dossier à l'aide de la commande <br>`git clone https://github.com/kaliba0/bsbot.git`
2. Aller dans le dossier : <br>`cd bsbot`
3. Completer le dossier config.json avec les informations nécessaires : <br> `nano config.json`
4. Avec pm2, lancer le script main.js <br> `pm2 start main.js --name "[nom_de_votre_bot]"`