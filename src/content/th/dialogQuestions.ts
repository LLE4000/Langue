/**
 * Questions de compréhension orale, rédigées pour chaque conversation : on écoute le dialogue sans le texte,
 * puis on répond en français. Elles portent sur le sens (prix, heures, décisions, détails), pas sur la forme.
 * L'index `answer` désigne la bonne réponse ; les propositions sont mélangées à l'affichage.
 */
import type { DialogQuestion } from '../types';

const Q = (q: string, choices: string[], answer: number): DialogQuestion => ({ q: { fr: q }, choices: choices.map((c) => ({ fr: c })), answer });

export const DIALOG_QUESTIONS: Record<string, DialogQuestion[]> = {
  'd:market': [
    Q('Quel est le prix annoncé au départ ?', ['250 bahts', '200 bahts', '400 bahts', '20 bahts'], 0),
    Q('Combien d’articles le client achète-t-il finalement ?', ['Deux', 'Un', 'Trois', 'Quatre'], 0),
    Q('Que fait la vendeuse quand le client trouve que c’est cher ?', ['Elle baisse le prix de vingt bahts', 'Elle refuse toute réduction', 'Elle propose un autre article', 'Elle ajoute un cadeau'], 0),
  ],
  'd:resto': [
    Q('Combien de personnes sont à table ?', ['Deux', 'Une', 'Trois', 'Quatre'], 0),
    Q('Que commande le client ?', ['Un pad thaï aux crevettes et un riz sauté au poulet', 'Deux pad thaï', 'Une soupe et un curry', 'Un riz sauté au porc'], 0),
    Q('Le client veut-il son plat épicé ?', ['Non, pas épicé', 'Oui, très épicé', 'Un peu épicé', 'Il ne répond pas'], 0),
  ],
  'd:taxi': [
    Q('Combien de temps le trajet doit-il durer environ ?', ['40 minutes', '14 minutes', '4 heures', '20 minutes'], 0),
    Q('Que demande le passager au chauffeur ?', ['De mettre le compteur', 'De rouler plus vite', 'D’éviter la voie express', 'De s’arrêter à une station-service'], 0),
    Q('Que fait le passager au moment de payer ?', ['Il laisse la monnaie', 'Il demande une facture', 'Il conteste le prix', 'Il paie par carte'], 0),
  ],
  'd:hosp': [
    Q('Dans quelle chambre se trouve le patient ?', ['502, au cinquième', '205, au deuxième', '52, au premier', '520, au cinquième'], 0),
    Q('Jusqu’à quelle heure peut-on rendre visite ?', ['20 h', '18 h', '22 h', '14 h'], 0),
    Q('Comment trouve-t-on l’ascenseur ?', ['Tout droit, puis à gauche', 'Tout droit, puis à droite', 'Au fond du couloir à droite', 'Derrière l’accueil'], 0),
  ],
  'd:intro': [
    Q('De quel pays vient la personne qui se présente ?', ['De Belgique', 'De France', 'De Suisse', 'Du Canada'], 0),
    Q('Quel est son métier ?', ['Ingénieur en structure', 'Médecin', 'Professeur', 'Architecte'], 0),
    Q('Que dit-elle de son niveau de thaï ?', ['Elle parle juste un peu', 'Elle parle couramment', 'Elle ne parle pas du tout', 'Elle apprend depuis dix ans'], 0),
  ],
  'd:hotel': [
    Q('Combien de nuits le client reste-t-il ?', ['Trois', 'Deux', 'Quatre', 'Une'], 0),
    Q('À quelle heure est servi le petit déjeuner ?', ['De 6 h à 10 h', 'De 7 h à 9 h', 'De 6 h à 9 h', 'De 8 h à 11 h'], 0),
    Q('À quel niveau se trouve la chambre ?', ['Au quatrième', 'Au deuxième', 'Au cinquième', 'Au premier'], 0),
  ],
  'd:site': [
    Q('Que remarque l’ingénieur sur la poutre ?', ['Une fissure', 'De la rouille', 'Une déformation', 'Rien d’anormal'], 0),
    Q('Quel est le diamètre des armatures ?', ['20 mm', '12 mm', '25 mm', '16 mm'], 0),
    Q('Quelle consigne donne l’ingénieur avant de partir ?', ['Ne pas couler le béton avant le résultat du contrôle', 'Couler le béton aujourd’hui', 'Démonter la poutre', 'Commander plus d’acier'], 0),
  ],
  'd:meeting': [
    Q('À quelle heure commence la réunion ?', ['10 h', '9 h', '14 h', '11 h'], 0),
    Q('De quoi va-t-on parler aujourd’hui ?', ['Des fondations et des pieux', 'Des façades', 'Du planning', 'De la toiture'], 0),
    Q('Que faut-il ajouter parce que les charges ont changé ?', ['Deux poteaux', 'Une poutre', 'Un étage', 'Des fenêtres'], 0),
  ],
  'd:way': [
    Q('Où faut-il tourner pour trouver la station ?', ['À droite au carrefour', 'À gauche au carrefour', 'À droite au feu', 'Juste après le pont'], 0),
    Q('La station est-elle loin ?', ['Non, environ cinq minutes à pied', 'Oui, environ vingt minutes', 'Il faut prendre un taxi', 'Le passant ne sait pas'], 0),
  ],
  'd:grab': [
    Q('Où se trouve le client ?', ['Devant l’hôtel', 'À l’aéroport', 'Au marché', 'Devant la gare'], 0),
    Q('Dans combien de temps le chauffeur arrive-t-il ?', ['Trois minutes', 'Dix minutes', 'Une minute', 'Un quart d’heure'], 0),
    Q('De quelle couleur est la voiture ?', ['Noire', 'Blanche', 'Rouge', 'Grise'], 0),
  ],
  'd:friends': [
    Q('Que propose l’amie ?', ['D’aller manger ensemble', 'D’aller au cinéma', 'De faire du sport', 'De rester à la maison'], 0),
    Q('Quel type de cuisine choisissent-ils ?', ['De la cuisine de l’Isan', 'De la cuisine chinoise', 'Des fruits de mer', 'Des nouilles'], 0),
    Q('À quelle heure se retrouvent-ils ?', ['18 h', '19 h', '17 h', '20 h'], 0),
  ],
  'd:pharm': [
    Q('Depuis quand le client a-t-il mal à la tête ?', ['Depuis hier', 'Depuis ce matin', 'Depuis une semaine', 'Depuis trois jours'], 0),
    Q('Comment faut-il prendre le médicament ?', ['Un comprimé après le repas', 'Deux comprimés à jeun', 'Un comprimé avant de dormir', 'Trois comprimés par jour'], 0),
    Q('Combien coûte le médicament ?', ['60 bahts', '16 bahts', '600 bahts', '65 bahts'], 0),
  ],
  'd:cafe': [
    Q('Que commande le client ?', ['Un café glacé', 'Un thé chaud', 'Un café chaud', 'Un jus d’orange'], 0),
    Q('Comment le veut-il ?', ['Peu sucré', 'Très sucré', 'Sans sucre', 'Sucré normalement'], 0),
    Q('Combien paie-t-il ?', ['55 bahts', '45 bahts', '50 bahts', '65 bahts'], 0),
  ],
  'd:visit': [
    Q('Comment va le patient ?', ['Mieux, mais il a encore un peu mal', 'Très mal', 'Complètement guéri', 'Il ne peut pas parler'], 0),
    Q('Que dit-il de la nourriture de l’hôpital ?', ['Qu’elle n’est pas bonne du tout', 'Qu’elle est excellente', 'Qu’il n’a pas faim', 'Qu’elle est trop épicée'], 0),
    Q('Quand pourra-t-il rentrer chez lui ?', ['Dans deux ou trois jours', 'Demain', 'Dans une semaine', 'Ce soir'], 0),
  ],
  'd:office': [
    Q('Quand la collègue envoie-t-elle les plans ?', ['Aujourd’hui', 'Demain matin', 'Vendredi', 'La semaine prochaine'], 0),
    Q('Et la note de calcul ?', ['Demain matin, elle n’est pas finie', 'Aujourd’hui', 'Elle est déjà envoyée', 'Elle n’existe pas'], 0),
    Q('Quand est fixée la réunion avec l’entrepreneur ?', ['Vendredi à 14 h', 'Lundi à 10 h', 'Vendredi à 9 h', 'Jeudi à 14 h'], 0),
  ],
  'd:sim': [
    Q('Pour combien de temps le client veut-il une carte SIM ?', ['Deux semaines', 'Un mois', 'Une semaine', 'Trois mois'], 0),
    Q('Combien coûte l’offre proposée ?', ['300 bahts pour 30 jours', '200 bahts pour 15 jours', '500 bahts pour 30 jours', '300 bahts pour 7 jours'], 0),
    Q('Où trouve-t-on le numéro de téléphone ?', ['Sur la pochette', 'Sur le ticket de caisse', 'Par SMS', 'Sur le passeport'], 0),
  ],
  'd:seven': [
    Q('Le client a-t-il la carte de membre ?', ['Non', 'Oui', 'Il l’a oubliée', 'Il en demande une'], 0),
    Q('Que veut le client pour son plat ?', ['Qu’on le réchauffe', 'Qu’on l’emballe', 'Des baguettes', 'Une sauce'], 0),
    Q('Combien paie-t-il en tout ?', ['85 bahts', '58 bahts', '95 bahts', '80 bahts'], 0),
  ],
  'd:train': [
    Q('Où va le voyageur ?', ['À Chiang Mai', 'À Phuket', 'À Ayutthaya', 'À Pattaya'], 0),
    Q('À quelle heure part le train ?', ['18 h', '7 h', '16 h', '20 h'], 0),
    Q('Quelle place demande-t-il ?', ['Côté fenêtre', 'Côté couloir', 'Près de la porte', 'En première classe'], 0),
  ],
  'd:massage': [
    Q('Combien coûte une heure de massage ?', ['300 bahts', '200 bahts', '350 bahts', '500 bahts'], 0),
    Q('Où le client a-t-il mal ?', ['Au dos et aux épaules', 'Aux jambes', 'À la tête', 'Aux pieds'], 0),
    Q('Que demande-t-il pendant le massage ?', ['D’appuyer plus doucement', 'D’appuyer plus fort', 'D’arrêter', 'De changer de salle'], 0),
  ],
  'd:scooter': [
    Q('Combien coûte la location par jour ?', ['250 bahts', '200 bahts', '150 bahts', '350 bahts'], 0),
    Q('Quel est le montant de la caution ?', ['2 000 bahts', '200 bahts', '1 000 bahts', '500 bahts'], 0),
    Q('Que faut-il faire en rendant le scooter ?', ['Faire le plein, avant 18 h', 'Le laver', 'Le rendre avant midi', 'Payer un supplément'], 0),
  ],
  'd:doctor': [
    Q('De quoi souffre le patient ?', ['Mal au ventre et diarrhée', 'Mal de tête', 'Fièvre et toux', 'Mal au dos'], 0),
    Q('Depuis quand ?', ['Depuis hier soir', 'Depuis ce matin', 'Depuis trois jours', 'Depuis une semaine'], 0),
    Q('Comment prendre le médicament ?', ['Après les repas, trois fois par jour', 'Avant les repas, une fois par jour', 'Le soir seulement', 'Toutes les deux heures'], 0),
  ],
  'd:exchange': [
    Q('À combien est l’euro aujourd’hui ?', ['38 bahts', '48 bahts', '35 bahts', '30 bahts'], 0),
    Q('Combien le client change-t-il ?', ['200 euros', '100 euros', '500 euros', '250 euros'], 0),
    Q('Que demande-t-il en plus ?', ['Des petites coupures', 'Un reçu', 'Des dollars', 'Une carte'], 0),
  ],
  'd:lunch': [
    Q('Où vont-ils déjeuner ?', ['Au restaurant de riz au poulet, tout près', 'Dans un centre commercial', 'À la cantine', 'Chez un collègue'], 0),
    Q('Pourquoi la collègue préfère-t-elle un endroit proche ?', ['Il fait très chaud', 'Elle est pressée', 'Il pleut', 'Elle a mal aux pieds'], 0),
    Q('Qui paie aujourd’hui ?', ['La personne qui invite (« moi »)', 'La collègue', 'Chacun paie sa part', 'L’entreprise'], 0),
  ],
  'd:pour': [
    Q('À quelle heure coule-t-on le béton ?', ['9 h', '10 h', '7 h', '14 h'], 0),
    Q('À quels âges teste-t-on la résistance du béton ?', ['7 et 28 jours', '3 et 14 jours', '1 et 7 jours', '28 et 56 jours'], 0),
    Q('Combien de jours de cure faut-il ?', ['Sept', 'Trois', 'Quatorze', 'Un'], 0),
  ],
  'd:phone': [
    Q('À qui veut-on parler ?', ['À Khun Somchai', 'À Khun Somsak', 'Au directeur', 'À la comptable'], 0),
    Q('Que répond la standardiste ?', ['Il n’est pas là pour le moment', 'Il est en réunion', 'Il arrive tout de suite', 'Il est parti en vacances'], 0),
    Q('Que demande l’appelant ?', ['Qu’on lui dise de rappeler', 'De rappeler dans une heure', 'Une adresse e-mail', 'Un rendez-vous'], 0),
  ],
  'd:chat': [
    Q('Pourquoi le passager est-il en Thaïlande ?', ['Pour le travail, et voir un ami', 'En vacances', 'Pour étudier', 'Pour un mariage'], 0),
    Q('Combien de temps reste-t-il ?', ['Deux semaines', 'Un mois', 'Trois jours', 'Un an'], 0),
    Q('Que dit-il de la cuisine thaïe ?', ['Il l’aime beaucoup mais supporte mal le piment', 'Il ne l’aime pas', 'Il la trouve fade', 'Il ne l’a jamais goûtée'], 0),
  ],
  'd:fruits': [
    Q('Les mangues sont-elles mûres ?', ['Oui, et très sucrées', 'Non, pas encore', 'Il n’y a plus de mangues', 'La vendeuse ne sait pas'], 0),
    Q('Quel est le prix du kilo de mangues ?', ['80 bahts', '18 bahts', '200 bahts', '50 bahts'], 0),
    Q('Que prend le client en plus des mangues ?', ['Un demi-kilo de ramboutans', 'Des bananes', 'Un ananas', 'Rien d’autre'], 0),
  ],
  'd:temple': [
    Q('Que faut-il faire avant d’entrer dans la chapelle ?', ['Enlever ses chaussures', 'Acheter un billet', 'Se couvrir la tête', 'Faire une offrande'], 0),
    Q('Peut-on prendre des photos à l’intérieur ?', ['Oui, sans tourner le dos au Bouddha', 'Non, jamais', 'Oui, sans restriction', 'Seulement avec un guide'], 0),
    Q('Quand les Thaïlandais viennent-ils surtout faire des mérites ?', ['Les jours saints bouddhiques', 'Le dimanche', 'Le matin tôt', 'Au Nouvel An seulement'], 0),
  ],
  'd:hobby': [
    Q('Quels sont les loisirs de la personne interrogée ?', ['Nager et lire', 'Courir et cuisiner', 'Jouer au football', 'Voyager'], 0),
    Q('À quelle fréquence nage-t-elle ?', ['Deux fois par semaine', 'Tous les jours', 'Une fois par mois', 'Le week-end'], 0),
    Q('Quand le collègue joue-t-il au football ?', ['Le samedi soir', 'Le dimanche matin', 'Le mercredi', 'Tous les soirs'], 0),
  ],
  'd:weekend': [
    Q('Où va la personne ce week-end ?', ['À la mer, à Hua Hin', 'À la montagne', 'À Bangkok', 'Chez ses parents'], 0),
    Q('Avec qui ?', ['Deux amis', 'Sa famille', 'Seule', 'Ses collègues'], 0),
    Q('Que conseille l’amie ?', ['De ne pas oublier la crème solaire', 'De prendre un parapluie', 'De réserver un hôtel', 'De partir tôt'], 0),
  ],
};
