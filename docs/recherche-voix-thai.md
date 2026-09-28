# Offrir une voix thaïe native à tous les acheteurs, sans coût par utilisateur

*Note de décision. Faits vérifiés au 28 septembre 2026.*

**Légende**
- **vérifié** : lu dans le texte source.
- **source secondaire** : chiffre repris d'un site tiers ou d'un extrait de recherche, parce que la page officielle était inaccessible.
- **non vérifié / incertain** : à confirmer.
- **estimation** : calcul fait par nous, pas un devis.

---

## En bref

1. **Vos utilisateurs ont déjà une voix neuronale thaïe gratuite.** Les 5 322 textes fixes existent en MP3, pour une voix d'homme et une voix de femme, et fonctionnent hors ligne. Ce qui manque surtout, c'est une **licence commerciale incontestable**. Pour l'obtenir, il suffit de régénérer ces fichiers avec un compte Azure **payant (S0)**, pour **environ 3 US$ une seule fois**.
2. **Aucune solution gratuite étudiée ne s'est révélée meilleure.** Aucune n'est à la fois de meilleure qualité prouvée en thaï et autorisée pour la vente. Plusieurs modèles libres « gratuits » sont en réalité **interdits en usage commercial**. Il faut aussi écarter le raccourci « edge-tts » : pas de licence.
3. **Pour aller au-delà**, deux voies sont réalistes et restent sans coût par utilisateur :
   - un **test d'écoute à l'aveugle** avec des locuteurs thaïs, qui compare la voix Azure actuelle à 3 ou 4 concurrents ;
   - un **enregistrement humain** des 2 834 éléments courts (mots, expressions), dont les tons comptent le plus.
4. **Pour le contrôle de prononciation**, aucune solution n'est à la fois gratuite, illimitée et capable de noter les tons thaïs. Le mieux est de garder la reconnaissance vocale gratuite du navigateur et d'améliorer votre propre détecteur de tons, qui fonctionne sur l'appareil. Le service Azure qui note la prononciation reste payant à l'usage : à réserver à une option premium plafonnée.

---

## 1. Ce qui est déjà vrai aujourd'hui

**Ce qui fonctionne déjà, gratuitement pour chaque acheteur :**
- Les 5 322 textes thaïs fixes (≈ 91 500 caractères par voix) existent en MP3 pré-générés. Ce sont les voix Azure th-TH-NiwatNeural (homme) et th-TH-PremwadeeNeural (femme).
- Ils sont livrés avec l'application et mis en cache hors ligne.
- Leur taille réelle est d'environ 143 Mo pour les deux voix, soit environ 3,2 h et 3,5 h d'audio (68,2 Mo et 74,7 Mo en 48 kbit/s). Le chiffre de 159 Mo mesure l'espace disque occupé, pas la taille réelle des fichiers.
- Ces fichiers ne coûtent rien par utilisateur, ni à vous ni à eux.

**Ce qui manque encore :**

1. **Une licence propre pour vendre.** Les conditions Microsoft disent mot pour mot (vérifié) : *« TTS Service output use rights: For Customers of the paid tier TTS Service only, Customer may use the audio output of prebuilt neural voices generated using the TTS Service, including for commercial purposes. »* Autrement dit, l'usage commercial n'est accordé qu'aux clients de l'offre **payante**.
   - Le script `scripts/gen-voices.ts` (ligne 8) a été écrit pour le palier gratuit F0 : *« ≈ 28 000 caractères par voix, largement sous le palier gratuit »*. Ce chiffre est d'ailleurs dépassé : le volume réel est de 91 500 caractères par voix.
   - On ne peut pas savoir, depuis le dépôt, si la clé utilisée était F0 ou S0.
   - Sur le forum officiel Microsoft Q&A, les réponses se contredisent au sujet du F0. Le texte des conditions, lui, dit « paid tier only ». **La voie sûre est de régénérer sur S0 et de garder la facture.**
2. **Une mention « voix de synthèse ».** Ce n'est pas facultatif. La note de transparence Microsoft dit : *« Microsoft requires its customers to disclose the synthetic nature of text to speech voices to its users »*. Elle demande aussi d'informer les parents si des mineurs peuvent utiliser le produit.
3. **Le texte dynamique** : le prénom de l'apprenant en thaï, ou un texte libre. Aujourd'hui, c'est la voix intégrée à l'appareil qui le lit, avec une qualité variable, et elle est parfois absente sur Android ou sur ordinateur.
4. **Le contrôle de prononciation, en particulier des tons.** Aucun service commercial ne note les tons thaïs (voir la section 3).
5. **La clé Azure du Worker.** Le fichier `.github/workflows/deploy.yml` (lignes 48-52) envoie `AZURE_SPEECH_KEY` dans un Worker Cloudflare. Tout usage « en direct » servi à des clients payants (voix ou notation) doit lui aussi passer par une clé **S0**.
6. **La preuve d'une qualité vraiment native.** Aucun fournisseur n'a de mesure indépendante de la qualité des tons thaïs. Seul un test d'écoute avec des locuteurs natifs peut trancher.

---

## 2. Tableau comparatif des options de voix

Rappel : « gratuit pour l'utilisateur final » est acquis dans **toutes** les options ci-dessous, parce qu'on génère les fichiers une fois et qu'on les livre avec l'application. La question porte donc sur le **coût pour vous** et sur **le droit de vendre**.

### 2a. Options utilisables ou à tester

| Option | Qualité en thaï | Coût unique (2 voix) | Coût récurrent | Licence commerciale | Hors ligne |
|---|---|---|---|---|---|
| **Azure, voix neuronales actuelles sur S0** (Premwadee F, Niwat M, Achara F) | Voix natives, celles que vous entendez déjà. Aucune mesure indépendante. | **≈ 2,75–2,93 US$** (≈ 183 000 caractères × 15–16 US$ par million ; source secondaire) | 0 pour les fichiers ; paiement à l'usage pour le direct via le Worker | **Oui, mais seulement sur l'offre payante** (clause vérifiée mot pour mot). Mention « voix de synthèse » obligatoire. Aucune clause trouvée sur le stockage ou la redistribution des fichiers : c'est un silence, pas une autorisation explicite. | Oui (MP3) |
| **Azure Dragon HD Omni** (peut-être `th-TH-Premwadee:DragonHDOmniLatestNeural`) | **Incertain** : le thaï n'est pas listé nommément. Le modèle de nom rend son existence plausible. Un seul appel à l'API suffit pour trancher. | ≈ 4 US$ (tarif HD de 22 US$ par million, source secondaire) | 0 | Même clause, offre payante uniquement | Oui |
| **Azure MAI-Voice-2** (th-TH-Krit, th-TH-Nattapong) | Voix « expressives » selon Microsoft, sans évaluation en thaï. **Voix d'homme uniquement**, en préversion. | Prix **inconnu** (≈ 2 US$ par voix si facturé au tarif HD : incertain) | 0 | Même clause. La préversion n'est « pas recommandée en production » (conditions Azure). | Oui |
| **Google Neural2-C / Standard-A** | **Une seule voix, féminine** (pas de voix WaveNet en thaï) | **0 US$** dans le quota mensuel gratuit (un compte de facturation reste nécessaire) | 0 | Aucune clause restrictive trouvée. Voix probablement non « IA générative » (non vérifié). | Oui |
| **Google Chirp 3 HD** (seules voix d'homme thaïes chez Google) | ≈ 30 voix H/F ; pas de réglage de prononciation en thaï | 0 US$ dans le quota gratuit | 0 | **Incertain.** Google la décrit comme « Powered by our cutting-edge LLMs », donc elle pourrait relever des règles IA générative. Ces règles interdisent tout service « likely to be accessed by individuals under the age of 18 ». À faire confirmer par écrit par Google. | Oui |
| **ElevenLabs Eleven v3** | Le thaï figure dans la liste. v3 est sorti de préversion en 2026. Aucune évaluation des tons. Un avis signale une fidélité moindre sur les langues tonales (**non vérifié**). | ≈ **18 US$** (0,10 US$ pour 1 000 caractères ; source secondaire) | 0 si l'abonnement est arrêté après la génération | Offres payantes : licence commerciale « provided you're not using Beta Services » (résumé de recherche). **L'offre gratuite est interdite en usage commercial.** Vérifier aussi les conditions de la voix choisie dans leur bibliothèque (Voice Library). | Oui |
| **VoxCPM2** (modèle libre, 2 milliards de paramètres) | Thaï officiellement pris en charge. Test indépendant sur mots et phrases courtes : **4,98 % d'erreurs de caractères**, contre 1,98 % pour un humain. C'est moins bien que plusieurs concurrents. Sur texte long : 3,37 %, bon résultat. Le timbre peut varier d'une génération à l'autre. | Gratuit sur votre GPU (électricité) ; **≈ 10–40 US$** sur un GPU loué (**estimation non vérifiée**) | 0 | **Oui : Apache-2.0**, vérifié dans le dépôt (« free for commercial use »). Les données d'entraînement ne sont pas documentées. | Oui (pré-génération) |
| **MOSS-TTS-v1.5** (modèle libre, 8 milliards de paramètres) | Thaï officiel depuis le 26/05/2026. Test indépendant : 4,05 % (court), 4,39 % (long). | Même ordre que VoxCPM2 (modèle plus lourd) | 0 | **Oui : Apache-2.0** (vérifié). Données d'entraînement non vérifiées. | Oui (pré-génération) |
| **iApp (Kaitom V3)**, société thaïlandaise | Test indépendant : **2,34 %** sur les phrases courtes, parmi les meilleurs mesurés. Assortiment de voix limité ; présence d'une voix d'homme et d'une voix de femme **incertaine**. | 1 crédit par 400 caractères ; prix du crédit **non vérifié** | 0 | **Non vérifiée** : seul un résumé de leur outil web gratuit parle d'usage commercial. | Oui |
| **Botnoi Voice**, société thaïlandaise | Plus de 100 styles de voix, souvent recommandé sur les forums thaïs (anecdotique) | **Inconnu** | 0 | **Non vérifiée** (page des conditions inaccessible) | Oui |
| **Enregistrement humain complet** (studio à Bangkok) | Potentiellement le meilleur, **mais ce n'est pas prouvé**. Demander des démos et payer un essai. | ≈ **5 500–7 800 US$** pour les deux voix (**estimation**, tarifs non vérifiés) | 0 | Selon **votre contrat** : cession complète et transférable (voir la section 4) | Oui |
| **Humain hybride** (2 834 éléments de 3 mots ou moins, soit 19,1 % des caractères) | Des humains là où les tons comptent le plus ; la synthèse pour le reste | ≈ 160–245 US$ par voix (tarif au mot), 300–600 US$ (étudiants), 1 000–1 200 US$ (une journée de studio). **Estimations.** | 0 | Selon le contrat | Oui |

### 2b. Options écartées, et pourquoi

| Option | Raison |
|---|---|
| **edge-tts** (voix Microsoft gratuites via le navigateur Edge) | **Aucune licence.** C'est un client non officiel, sans contrat Azure, donc sans le droit d'usage commercial réservé à l'offre payante. À ne jamais utiliser pour un produit vendu, même si c'est le raccourci le plus répandu. |
| **Gemini TTS** (Google) | Interdit si le service est susceptible d'être utilisé par des moins de 18 ans. Accès **payant obligatoire** pour les utilisateurs de l'UE, de Suisse et du Royaume-Uni (vos marchés FR/BE/CH). Modèles en préversion. |
| **Amazon Polly** | Pas de thaï (vérifié). |
| **OpenAI TTS** | Voix « optimized for English » ; accent probable. |
| **OmniVoice** | **Interdit en usage commercial** : les poids du modèle sont sous licence CC-BY-NC depuis le 03/07/2026. Son composant audio est sous une licence Boson qui ajoute des contraintes. Présenté autrefois comme libre, ce n'est plus vrai. |
| **Kokoro-Thai / FastThaiG2P** | Entraîné uniquement sur de l'audio produit par OmniVoice, donc chaîne de licence **incertaine**. Fichier de 325 Mo, une seule voix féminine, qualité « prototype ». |
| **Meta MMS-TTS, F5-TTS-THAI, ThonburianTTS, Piper tsync2, KhanomTan, Typhoon2-Audio, Fish Audio S2** | **Non commercial** (licences CC-BY-NC ou NC-SA, ou licence Fish de recherche). KhanomTan n'a de toute façon plus de voix thaïe. |
| **VachanaTTS** | Aucun fichier de licence ; dérivé d'un modèle non commercial. |
| **Qwen3-TTS** | Thaï non officiel et lent (bons chiffres cependant : 2,56 %). À garder seulement comme point de comparaison. |
| **JaiTTS** | Les meilleurs chiffres en thaï (1,94 %, 283 victoires sur 400 face à ElevenLabs v3), mais **autodéclarés** et **poids non publiés**. À demander, pas à utiliser pour l'instant. |
| **Common Voice, Wikimedia, Forvo, Tatoeba** | Pas vos phrases, locuteurs et qualité hétérogènes ; Forvo et Tatoeba sont en partie non commerciaux. |
| **NECTEC VAJA** | Licence non publique, à négocier. |

**Conclusion honnête :** aucune option gratuite n'est à la fois de meilleure qualité prouvée en thaï et autorisée pour la vente. Les modèles libres à licence propre (VoxCPM2, MOSS) sont gratuits, mais leur qualité des tons **n'est pas démontrée meilleure** qu'Azure. Il faut donc un test d'écoute à l'aveugle avec des Thaïs avant de changer quoi que ce soit.

---

## 3. Contrôle de prononciation : options et coûts

| Option | Ce que ça mesure | Coût | Licence | Appareils |
|---|---|---|---|---|
| **Reconnaissance vocale du navigateur, en ligne** (déjà dans `src/engine/audio/mic.ts`) | Transcription et indice de confiance ; **pas de note ni de ton** | 0 € | Pas de restriction trouvée (non vérifié). L'audio part chez Google (Chrome) ou Microsoft (Edge), **à indiquer dans la politique de confidentialité**. | Chrome et Android : oui. iPhone/Safari en thaï : **non vérifié**, à tester. |
| **Reconnaissance vocale Chrome sur l'appareil** (th-TH, vérifié) | Transcription seulement | 0 € | API web standard | **Chrome sur ordinateur uniquement** ; pas sur Chrome Android |
| **Votre détecteur de tons `pitch.ts`**, à améliorer avec les algorithmes YIN/MPM de tonemirror | La **courbe des tons**, seule solution gratuite pour les tons thaïs | 0 € | tonemirror : MIT (garder la mention). Le classement des tons thaïs reste à développer vous-même. | Partout, hors ligne |
| **Azure Pronunciation Assessment** (th-TH, vérifié) | Précision, fluidité, complétude, notes par mot et par son. **Pas de prosodie ni de tons** (en-US uniquement). | ≈ 1,30 US$ par heure d'audio en direct (sources secondaires) ; 5 h par mois gratuites en F0 (mais S0 pour des clients payants). **Estimation** : 1 000 utilisateurs × 2 min par jour ≈ **1 300 US$ par mois**. | Commercial sous abonnement ; la clé reste côté serveur | En ligne uniquement |
| **Typhoon ASR** (modèle thaï sur l'appareil) | Transcription | 0 € à l'exécution | **Risquée** : la fiche du modèle renvoie à des conditions qui exigent un **accord écrit** de SCB10X pour un usage commercial | Possible, mais non démontré dans un navigateur |
| **sherpa-onnx zipformer thaï** | Transcription (démo navigateur disponible) | 0 € ; ≈ 150 Mo | **Non résolue** : les données d'entraînement (GigaSpeech2) sont réservées à la recherche non commerciale | Oui |
| **Thonburian Whisper** (Distilled Small) | Transcription | 0 € ; lourd (≈ 170 Mo, estimation) | Apache-2.0 selon les fiches (à revérifier modèle par modèle) | Oui, mais lourd sur téléphone ; tend à accepter les erreurs de l'apprenant |
| **wav2vec2 thaï** (VISTEC) | Base possible pour une vraie note par son | 0 € ; très lourd | CC-BY-SA-4.0 : commercial autorisé, avec attribution et partage à l'identique du fichier du modèle | Trop lourd pour une v1 |
| SpeechSuper, ELSA, Google STT | — | — | SpeechSuper et ELSA : **pas de thaï** ; Google STT : payant, sans notation | — |

**En résumé :**
- Aucune solution gratuite ne donne une vraie note de prononciation en thaï.
- **Aucun service, gratuit ou payant, ne note les tons thaïs.**
- Votre détecteur de tons fait maison est donc un atout, pas un pis-aller.

---

## 4. Recommandation

### Étape 1 (maintenant) : rendre l'existant vendable, pour ≈ 3 US$

1. Créer ou passer une ressource Azure Speech en **S0**. Relancer `scripts/gen-voices.ts` et corriger son commentaire, qui annonce 28 000 caractères et le palier gratuit. **Conserver la facture et la référence de l'offre (SKU)** comme preuve.
2. Utiliser **cette même clé S0 dans le Worker** Cloudflare.
3. Au passage, tester en un appel l'existence de `th-TH-Premwadee:DragonHDOmniLatestNeural` et de l'équivalent Niwat, ainsi que `th-TH-Krit:MAI-Voice-2`. Garder les extraits pour l'étape 2.
4. Ajouter dans l'application, les mentions légales et la fiche de vente une mention visible : **« Voix de synthèse (IA) »**. Prévoir une information adaptée aux parents si des mineurs peuvent utiliser l'application.
5. **Prénom en thaï** : deux solutions.
   - Pré-générer une liste fermée de prénoms thaïs courants.
   - Ou générer le prénom une seule fois via le Worker S0, puis le mettre en cache sur l'appareil. **Estimation** : environ 0,0003 US$ par prénom de 20 caractères. Ajouter une limite d'appels sur le Worker pour éviter les abus.
   - Pour le reste du texte libre, garder la voix de l'appareil en secours.
6. **Prononciation** : garder la reconnaissance gratuite du navigateur, activer le mode sur l'appareil quand Chrome ordinateur le permet, et renforcer `pitch.ts` pour les tons. Ne **pas** offrir la notation Azure en illimité.
7. **Ne pas utiliser** edge-tts, OmniVoice, Kokoro-Thai ni Gemini TTS.

### Étape 2 (dans les semaines qui viennent) : chercher « mieux » avec des preuves, pour ≈ 150–250 US$ (estimation)

1. Préparer environ 50 éléments : des mots isolés, des **paires de mots qui ne diffèrent que par le ton** (par exemple ป่า/ป้า), des phrases et un extrait de dialogue.
2. Les générer avec :
   - Azure actuel ;
   - Dragon HD Omni, s'il existe ;
   - ElevenLabs v3, en payant (jamais avec l'offre gratuite) ;
   - VoxCPM2 et MOSS-TTS-v1.5 : concevoir la voix **une fois**, figer l'extrait de référence, puis tout générer en clonant cet extrait pour garder un timbre constant ;
   - iApp et Botnoi, **seulement s'ils confirment la licence par écrit**.
3. Faire écouter **à l'aveugle** par 2 ou 3 locuteurs natifs du thaï central. Budget indicatif : environ 1 000 THB de l'heure, soit ≈ 125–190 US$. C'est une estimation fondée sur un taux horaire supposé et un taux de change de 32 THB par dollar.
4. Ne changer de voix que si un concurrent gagne **nettement sur les tons**. Sinon, Azure S0 reste la base.
5. Écrire à l'équipe JaiTTS (jts.ai.team@gmail.com) pour demander une licence commerciale sur de l'audio pré-généré.

### Étape 3 (après les premières ventes) : une vraie voix humaine là où c'est crucial, pour ≈ 300–2 400 US$ (estimation, 2 voix)

1. Faire enregistrer par des locuteurs natifs les **2 834 éléments de 3 mots ou moins**, pour les deux voix. Demander 2 ou 3 devis écrits (studio à Bangkok, Upwork ou Voice123 avec contrat sur mesure, ou étudiants encadrés) et commencer par un essai payant d'environ 50 lignes.
2. Le lecteur utilise déjà la clé `clipKey`. On peut donc jouer d'abord le clip humain, puis le clip de synthèse, puis la voix de l'appareil, sans rien reconstruire. Les fichiers vont dans `public/voices/{m,f}/<clé>.mp3`.
3. **Contrat indispensable** :
   - cession **complète, perpétuelle, mondiale** ;
   - usage dans une application payante et hors ligne, droit de montage ;
   - **aucun droit résiduel** (pas de paiements supplémentaires plus tard) ;
   - droits **transférables** en cas de vente de l'application ;
   - couverture à la fois de l'enregistrement **et** des **droits de l'interprète** ;
   - clause **IA** qui interdit, ou autorise contre paiement, le clonage de la voix ;
   - consentement écrit pour le traitement des données personnelles (loi thaïlandaise PDPA).
   - **Éviter la licence « Commercial Use » de Fiverr**, qui n'est pas transférable.
4. Plus tard, si c'est rentable : proposer la notation Azure comme **option premium plafonnée** (par exemple quelques minutes par jour).

### Budget total estimé

| Poste | Montant |
|---|---|
| Étape 1 | ≈ 3 US$ |
| Étape 2 | ≈ 150–250 US$ |
| Étape 3 | ≈ 300–2 400 US$ |
| **Total** | **≈ 0,5 k à 2,7 k US$, payés une seule fois** |

Coût récurrent pour vous : quasi nul (quelques centimes pour les prénoms). Coût pour chaque acheteur : **zéro**.

---

## 5. Ce qui reste incertain, à vérifier avec un juriste ou le fournisseur

1. **Azure** :
   - Faire confirmer par Microsoft que des MP3 générés sur S0 peuvent être **stockés et redistribués** dans une application vendue. Les conditions sont muettes sur ce point, ce qui n'est pas une autorisation explicite.
   - Faire confirmer que les fichiers actuels, peut-être générés sur F0, doivent bien être régénérés.
   - Les prix Azure viennent de sources secondaires (la page officielle était bloquée).
2. **Azure Dragon HD Omni** en thaï : existence à tester. **MAI-Voice-2** : prix inconnu, préversion.
3. **Google Chirp 3 HD** : relève-t-il des règles IA générative, avec l'interdiction des moins de 18 ans ? Demande écrite à Google.
4. **ElevenLabs** :
   - fin de la préversion de v3 et licence des offres payantes (confirmées seulement par des sources secondaires) ;
   - conditions propres à la voix choisie dans la bibliothèque ;
   - qualité réelle des tons.
5. **iApp et Botnoi** : licence, facturation par extrait ou au total, voix d'homme et de femme disponibles. Tout doit être confirmé **par écrit**.
6. **VoxCPM2 et MOSS** : Apache-2.0 est vérifié, mais **l'origine des données d'entraînement n'est pas publiée**. Un avis juridique est conseillé avant la vente. VoxCPM demande aussi de signaler l'audio généré par IA.
7. **Enregistrement humain** : tous les tarifs sont des estimations issues de pages bloquées ; seuls des devis écrits font foi. Faire vérifier par un juriste le droit thaï des interprètes et le statut de la voix sous la PDPA.
8. **Prononciation** :
   - fonctionnement de la reconnaissance en thaï sur **iPhone** (à tester sur un vrai appareil) ;
   - licence de Typhoon ASR (accord écrit de SCB10X) et de sherpa zipformer ;
   - prix officiel de la notation Azure.
9. **À surveiller** : le petit modèle thaï « voix fixe » de Typhoon (article de septembre 2026). S'il sort sous licence permissive, il répondrait exactement au besoin de voix sur l'appareil pour le texte dynamique.
10. **Droit européen et français** : obligations d'information sur les contenus générés par IA et sur les utilisateurs mineurs. Point non étudié dans cette recherche, à voir avec un juriste.

---

## 6. Sources

**Microsoft Azure**
- https://www.microsoft.com/licensing/terms/productoffering/MicrosoftAzure/MCA
- https://raw.githubusercontent.com/MicrosoftDocs/azure-ai-docs/main/articles/foundry/responsible-ai/speech-service/text-to-speech/transparency-note.md
- https://raw.githubusercontent.com/MicrosoftDocs/azure-ai-docs/main/articles/ai-services/speech-service/includes/language-support/tts.md
- https://raw.githubusercontent.com/MicrosoftDocs/azure-ai-docs/main/articles/ai-services/speech-service/high-definition-voices.md
- https://raw.githubusercontent.com/MicrosoftDocs/azure-ai-docs/main/articles/ai-services/speech-service/mai-voices.md
- https://raw.githubusercontent.com/MicrosoftDocs/azure-ai-docs/main/articles/ai-services/speech-service/includes/language-support/multilingual-voices.md
- https://learn.microsoft.com/en-us/answers/questions/5792674/can-the-audio-generated-by-azure-speech-studios-fr
- https://learn.microsoft.com/en-us/answers/questions/5805156/please-clarify-the-conflicting-information-regardi
- https://texttolab.com/blog/azure-text-to-speech-pricing (secondaire)
- https://www.stork.ai/en/microsoft-azure-neural-tts (secondaire)
- https://github.com/MicrosoftDocs/azure-ai-docs/blob/main/articles/ai-services/speech-service/includes/language-support/pronunciation-assessment.md
- https://learn.microsoft.com/en-us/answers/questions/5608069/pricing-and-usage-of-pronunciation-assessment-feat
- https://azure.microsoft.com/en-us/pricing/details/speech/

**Google**
- https://cloud.google.com/text-to-speech/pricing
- https://cloud.google.com/terms/service-terms
- https://cloud.google.com/terms/services
- https://docs.cloud.google.com/text-to-speech/docs/chirp3-hd
- https://docs.cloud.google.com/text-to-speech/docs/gemini-tts
- https://ai.google.dev/gemini-api/terms
- https://discuss.ai.google.dev/t/clarification-on-only-paid-services-for-eea-ch-uk/107860
- https://github.com/SubtitleEdit/subtitleedit/blob/main/src/ui/Assets/TextToSpeech/GoogleVoices.json
- https://github.com/twilio/twilio-node/blob/main/src/twiml/VoiceResponse.ts

**Autres services de synthèse vocale**
- https://elevenlabs.io/docs/help-center/legal/can-i-publish-the-content-i-generate-on-the-platform
- https://elevenlabs.io/blog/eleven-v3-is-now-generally-available
- https://developer.puter.com/tutorials/elevenlabs-api-pricing/ (secondaire)
- https://flexprice.io/blog/elevenlabs-pricing-breakdown (secondaire)
- https://developers.openai.com/api/docs/guides/text-to-speech
- https://raw.githubusercontent.com/awsdocs/amazon-polly-developer-guide/master/doc_source/SupportedLanguage.md
- https://voice.botnoi.ai/agreement
- https://iapp.co.th/docs/speech/text-to-speech/text-to-speech-v3
- https://iapp.co.th/tools/text-to-speech-thai-free
- https://aiforthai.in.th/service_ts.php
- https://github.com/rany2/edge-tts

**Modèles libres**
- https://github.com/OpenBMB/VoxCPM
- https://github.com/OpenBMB/VoxCPM/blob/main/LICENSE
- https://github.com/OpenMOSS/MOSS-TTS
- https://github.com/OpenMOSS/MOSS-TTS/blob/main/LICENSE
- https://github.com/JTS-AI-Team/JaiTTS (test indépendant en thaï)
- https://huggingface.co/k2-fsa/OmniVoice
- https://huggingface.co/k2-fsa/OmniVoice/discussions/1
- https://github.com/0xShug0/audio.cpp/blob/main/docs/model_licenses.md
- https://github.com/awslabs/FastThaiG2P
- https://github.com/wannaphong/som-tts-dataset-v1
- https://github.com/facebookresearch/fairseq/blob/main/examples/mms/README.md
- https://github.com/SWivid/F5-TTS
- https://github.com/biodatlab/thonburian-tts
- https://github.com/fishaudio/fish-speech/blob/main/LICENSE
- https://github.com/OHF-Voice/piper1-gpl/blob/main/CHANGELOG.md
- https://github.com/wannaphong/KhanomTan-TTS-v1.1
- https://github.com/scb-10x/typhoon2-audio
- https://arxiv.org/abs/2609.03502
- https://github.com/QwenLM/Qwen3-TTS

**Enregistrement humain et corpus**
- https://www.bangkokvideoproductions.com/film-services/Post-Production/voice-artists-services-rates-terms/voice-over-narration-services
- https://www.voicescloud.com/languages/other-languages/thai-voice-over-2/
- https://help.fiverr.com/hc/en-us/articles/360011569298--For-Commercial-Use-license-details
- https://www.upwork.com/hire/voice-actors/th/
- https://voice123.com/pages/voice-over-rates-calculator/
- https://raw.githubusercontent.com/common-voice/cv-dataset/main/README.md
- https://github.com/CAI-NECTEC/LOTUSDIS
- https://forvo.com/terms-and-conditions/
- https://www.pimlegal.com/2026/05/18/what-counts-as-sensitive-data-under-thai-law/

**Reconnaissance et prononciation**
- https://github.com/WebAudio/web-speech-api/blob/main/explainers/on-device-speech-recognition.md
- https://chromestatus.com/feature/6090916291674112
- https://chromestatus.com/feature/5136859632107520
- https://issues.chromium.org/issues/521896368
- https://bagrounds.org/ai-blog/2026-05-11-1-word-meter-android-rca
- https://learn.microsoft.com/en-us/microsoft-edge/web-platform/speech-recognition-api
- https://github.com/mdn/dom-examples/issues/197
- https://github.com/antonsoo/tonemirror
- https://github.com/scb-10x/typhoon-asr
- https://opentyphoon.ai/tac
- https://huggingface.co/typhoon-ai/typhoon-asr-realtime
- https://github.com/k2-fsa/sherpa/blob/master/docs/source/onnx/pretrained_models/offline-transducer/zipformer-transducer-models.rst
- https://huggingface.co/datasets/speechcolab/gigaspeech2
- https://github.com/k2-fsa/sherpa-onnx/issues/3926
- https://github.com/biodatlab/thonburian-whisper
- https://huggingface.co/airesearch/wav2vec2-large-xlsr-53-th
- https://github.com/speechsuper/SpeechSuper-API-Samples

**Dépôt du projet**
- /home/user/Langue/scripts/gen-voices.ts
- /home/user/Langue/.github/workflows/deploy.yml
- /home/user/Langue/src/engine/audio/mic.ts