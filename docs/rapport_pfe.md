# Rapport de Projet de Fin d'Études (PFE)
## Sujet : Conception et Réalisation d'une Plateforme Intégrée de Gestion Clinique Hautement Sécurisée : Clinique Mounsif

---

## 1. Introduction

Dans le contexte actuel de transformation numérique, le secteur de la santé au Maroc connaît une évolution majeure. La digitalisation des établissements de soins, et plus particulièrement des cliniques privées, est devenue un levier incontournable pour optimiser la prise en charge des patients, fluidifier la communication interprofessionnelle et garantir la sécurité des données médicales. 

La **Clinique Mounsif**, située à Casablanca, s'inscrit dans cette dynamique en cherchant à moderniser l'intégralité de ses flux cliniques et administratifs. Le présent projet de fin d'études consiste à concevoir et réaliser une plateforme web sur-mesure répondant aux exigences réglementaires et opérationnelles d'une structure médicale moderne. Notre objectif est de remplacer les supports papier traditionnels et les processus manuels par un système d'information clinique (SIC) robuste, capable de centraliser les dossiers patients, les rendez-vous, les examens de laboratoire et les ordonnances de manière fluide et intuitive.

---

## 2. Problématique

Bien qu'il existe de nombreux progiciels de gestion intégrés (ERP) génériques sur le marché, la plupart d'entre eux présentent des lacunes majeures lorsqu'ils sont appliqués à un environnement clinique critique :

1. **Absence de cloisonnement et de contrôle d'accès granulaire (RBAC) :** Les systèmes génériques manquent souvent d'un contrôle d'accès basé sur les rôles rigoureux, exposant ainsi des données de santé confidentielles à des utilisateurs non autorisés.
2. **Faible tolérance aux pannes cliniques :** En médecine, une panne système ne doit pas bloquer la prise en charge d'un patient. Si un sous-système secondaire (comme l'affichage de l'historique ou des statistiques d'agenda) échoue, les fonctionnalités vitales (telles que le dossier médical actif, les prescriptions et la file d'attente en temps réel) doivent rester opérationnelles de manière résiliente.
3. **Ergonomie inadaptée au flux de travail des praticiens :** Les interfaces surchargées augmentent la charge cognitive des médecins et du personnel infirmier, entraînant une perte de temps et un risque accru d'erreurs de saisie ou de diagnostic.
4. **Non-conformité avec les spécificités locales marocaines :** Les outils internationaux ne prennent pas toujours en compte les particularités administratives régionales (comme le format des numéros de sécurité sociale AMO/CNOPS ou l'organisation locale des rôles cliniques).

Pour répondre à ces défis, ce projet propose la mise en place d'un moteur clinique hautement sécurisé, basé sur une architecture découplée (API Gateway Node.js + Backend Laravel + Frontend React) garantissant à la fois isolation des droits, performance d'affichage et haute disponibilité des données cliniques clés.

---

## 3. Conception
*(Section en cours d'initialisation. Les diagrammes de cas d'utilisation, de séquence UML et les MCD/ERD y seront insérés lors de la modélisation des entités.)*

---

## 4. Démonstration
*(Section en cours d'initialisation. Elle décrira le fonctionnement de l'application, enrichie de captures d'écran des fonctionnalités clés après déploiement.)*

---

## 5. Perspectives
*(Section en cours d'initialisation. Elle abordera les pistes d'évolution futures, notamment l'intégration de l'intelligence artificielle pour l'aide au diagnostic ou la télé-consultation sécurisée.)*
