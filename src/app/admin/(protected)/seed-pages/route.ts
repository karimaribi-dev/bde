import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const PAGES = [
  {
    slug: 'a-propos',
    title: 'À propos',
    content: `<h2>Notre mission</h2><p>AI Trends News est une publication indépendante de veille quotidienne sur l'intelligence artificielle. Nous suivons de près l'évolution des modèles de langage, des agents autonomes, de la réglementation et des usages professionnels de l'IA.</p><h2>Notre approche</h2><p>Face à un secteur qui évolue à une vitesse sans précédent, notre ambition est simple : vous donner les clés pour comprendre ce qui se passe vraiment. Pas de sensationnalisme, pas de jargon inutile — des analyses rigoureuses, contextualisées et accessibles.</p><h2>Pour qui ?</h2><p>Nos lecteurs sont des professionnels, des chercheurs, des décideurs et des curieux qui souhaitent rester informés sans se noyer dans le flux permanent d'informations. AI Trends News est leur boussole dans l'écosystème IA.</p><h2>Indépendance éditoriale</h2><p>AI Trends News est une publication indépendante. Notre ligne éditoriale n'est pas influencée par nos partenaires commerciaux. Les contenus sponsorisés sont clairement identifiés comme tels.</p>`,
  },
  {
    slug: 'equipe',
    title: "L'équipe",
    content: `<h2>Une rédaction passionnée</h2><p>AI Trends News est portée par une petite équipe éditoriale réunissant des profils complémentaires : journalistes spécialisés en technologies, ingénieurs en science des données, consultants en stratégie digitale et veilleurs passionnés par les mutations de l'intelligence artificielle.</p><h2>Notre engagement</h2><p>Chaque membre de l'équipe partage la même conviction : l'IA est une transformation de civilisation, et la qualité de l'information sur ce sujet est un enjeu démocratique. Nous travaillons chaque jour pour être à la hauteur de cet enjeu.</p><h2>Rejoignez-nous</h2><p>Vous êtes journaliste, chercheur, expert ou praticien de l'IA ? Nous sommes toujours à la recherche de nouvelles voix pour enrichir notre couverture. Consultez notre page <a href="/p/contribuer">Contribuer</a> pour en savoir plus.</p>`,
  },
  {
    slug: 'contribuer',
    title: 'Contribuer',
    content: `<h2>Vous avez quelque chose à dire sur l'IA ?</h2><p>AI Trends News est ouverte aux contributions extérieures. Si vous êtes chercheur, praticien, expert ou observateur de l'intelligence artificielle, nous serions ravis de publier votre analyse, votre retour d'expérience ou votre point de vue.</p><h2>Ce que nous recherchons</h2><p>Nous privilégions les articles qui apportent une valeur ajoutée réelle à nos lecteurs : analyses de fond, décryptages de tendances, retours d'expérience concrets, comparaisons de modèles ou de solutions. Les tribunes d'opinion sont acceptées si elles sont argumentées et sourcées.</p><h2>Nos critères éditoriaux</h2><p>Tout article soumis doit être original, inédit et non publié ailleurs. Nous nous réservons le droit de refuser ou de demander des modifications pour respecter notre charte éditoriale. Les sources doivent être citées et vérifiables.</p><h2>Comment soumettre un article ?</h2><p>Envoyez votre proposition (résumé de 200 mots + plan détaillé) à notre équipe via la page <a href="/p/contact">Contact</a>. Nous accusons réception sous 48 heures et répondons à toutes les soumissions sous 10 jours.</p>`,
  },
  {
    slug: 'partenariats',
    title: 'Partenariats',
    content: `<h2>Travailler ensemble</h2><p>AI Trends News touche chaque semaine des milliers de professionnels, décideurs et passionnés de l'intelligence artificielle. Notre audience est qualifiée, engagée et en recherche active d'informations fiables sur l'IA.</p><h2>Nos formats partenaires</h2><p><strong>Display et newsletter</strong> — Emplacements publicitaires sur le site et dans notre newsletter hebdomadaire. Formats IAB standards.</p><p><strong>Contenu de marque</strong> — Articles sponsorisés, études de cas, livres blancs mis en avant auprès de notre audience. Clairement identifiés comme contenu partenaire.</p><p><strong>Événements</strong> — Co-organisation de webinaires, tables rondes ou conférences sur des thématiques IA.</p><h2>Nous contacter</h2><p>Pour toute demande de partenariat ou renseignements sur nos tarifs, contactez notre équipe via la page <a href="/p/contact">Contact</a>.</p>`,
  },
  {
    slug: 'contact',
    title: 'Contact',
    content: `<h2>Nous écrire</h2><p>Pour toute question, suggestion, signalement d'erreur ou demande de contact presse, n'hésitez pas à nous écrire. Nous lisons tous les messages et répondons dans un délai de 48 à 72 heures ouvrées.</p><p><strong>Contact général :</strong> contact@aitrendsnews.fr</p><p><strong>Partenariats et publicité :</strong> partenariats@aitrendsnews.fr</p><p><strong>Presse :</strong> presse@aitrendsnews.fr</p><h2>Signaler une erreur</h2><p>La rigueur factuelle est au cœur de notre démarche. Si vous identifiez une erreur dans l'un de nos articles, merci de nous le signaler en précisant l'URL de l'article et la nature de l'erreur. Nous traitons chaque signalement avec sérieux.</p><h2>Droit de réponse</h2><p>Conformément à la loi du 29 juillet 1881 sur la liberté de la presse, toute personne nommée ou désignée dans un article dispose d'un droit de réponse. Les demandes doivent être adressées à contact@aitrendsnews.fr.</p>`,
  },
  {
    slug: 'mentions-legales',
    title: 'Mentions légales',
    content: `<h2>Éditeur</h2><p>AI Trends News est édité par [NOM DE LA SOCIÉTÉ OU PERSONNE], [FORME JURIDIQUE].<br>Adresse : [ADRESSE COMPLÈTE]<br>SIRET : [NUMÉRO SIRET]<br>Directeur de la publication : [NOM DU DIRECTEUR]<br>Contact : contact@aitrendsnews.fr</p><h2>Hébergement</h2><p>Ce site est hébergé par Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis — <a href="https://vercel.com" target="_blank">vercel.com</a></p><h2>Propriété intellectuelle</h2><p>L'ensemble des contenus publiés sur AI Trends News (textes, images, graphiques, logos) est protégé par le droit d'auteur. Toute reproduction, même partielle, est soumise à autorisation préalable de l'éditeur.</p><h2>Responsabilité</h2><p>AI Trends News s'efforce d'assurer l'exactitude des informations publiées mais ne peut garantir leur exhaustivité. L'éditeur ne saurait être tenu responsable des erreurs ou omissions, ni des dommages résultant de l'utilisation des informations contenues sur ce site.</p>`,
  },
  {
    slug: 'credits',
    title: 'Crédits',
    content: `<h2>Technologies utilisées</h2><p><strong>Next.js</strong> — Framework React pour le rendu serveur. Développé par Vercel.</p><p><strong>Supabase</strong> — Base de données PostgreSQL et authentification. Plateforme open-source.</p><p><strong>Tiptap</strong> — Éditeur de texte riche basé sur ProseMirror.</p><p><strong>Tailwind CSS</strong> — Framework CSS utilitaire.</p><p><strong>date-fns</strong> — Bibliothèque de manipulation de dates en JavaScript.</p><h2>Typographie</h2><p><strong>JetBrains Mono</strong> — Police à chasse fixe développée par JetBrains, utilisée pour les textes courants. Licence SIL Open Font License.</p><p><strong>Georgia</strong> — Police serif utilisée pour les titres et accents typographiques.</p><h2>Icônes</h2><p>Les icônes d'interface sont issues de <strong>Font Awesome</strong> (licence CC BY 4.0) et de jeux d'icônes SVG open-source.</p><h2>Images</h2><p>Les images d'illustration sont issues de banques d'images libres de droits ou produites en interne. Les crédits spécifiques sont mentionnés dans les articles concernés.</p>`,
  },
  {
    slug: 'charte-editoriale',
    title: 'Charte éditoriale',
    content: `<h2>Principes fondamentaux</h2><p>AI Trends News est une publication indépendante dont la crédibilité repose sur le respect de principes éditoriaux stricts. Cette charte définit nos engagements vis-à-vis de nos lecteurs.</p><h2>Exactitude et vérification</h2><p>Tout article publié fait l'objet d'une vérification des faits avant publication. Nos journalistes s'appuient sur des sources primaires (publications scientifiques, communiqués officiels, entretiens directs) et secondaires reconnues. Toute affirmation factuelle doit être sourcée ou recoupée.</p><h2>Indépendance</h2><p>Notre ligne éditoriale est indépendante de toute influence commerciale, politique ou institutionnelle. Nos partenaires commerciaux n'ont aucun droit de regard sur nos contenus rédactionnels. Les contenus sponsorisés sont systématiquement identifiés comme tels.</p><h2>Transparence</h2><p>Lorsque nous commettons une erreur, nous la corrigeons publiquement et rapidement. Les corrections sont signalées en bas d'article avec la date de modification. Nous ne supprimons pas les articles incorrects — nous les corrigeons et en rendons compte.</p><h2>Utilisation de l'IA</h2><p>AI Trends News peut utiliser des outils d'intelligence artificielle pour certaines tâches rédactionnelles. Tout contenu assisté par IA est relu, vérifié et validé par un journaliste humain avant publication. Nous nous engageons à signaler clairement tout article produit majoritairement par IA.</p><h2>Droit de réponse</h2><p>Toute personne mise en cause dans un article dispose d'un droit de réponse. Nous nous engageons à publier les démentis dans un délai raisonnable. Les signalements peuvent être adressés à contact@aitrendsnews.fr.</p>`,
  },
  {
    slug: 'confidentialite',
    title: 'Confidentialité',
    content: `<h2>Introduction</h2><p>AI Trends News accorde une importance primordiale à la protection de vos données personnelles. Cette politique décrit quelles données nous collectons, comment nous les utilisons et quels sont vos droits conformément au RGPD (Règlement UE 2016/679).</p><h2>Données collectées</h2><p><strong>Données de navigation</strong> — Lors de votre visite, nous collectons des données techniques anonymisées (adresse IP, type de navigateur, pages consultées) à des fins statistiques.</p><p><strong>Cookies</strong> — Nous utilisons des cookies techniques nécessaires au bon fonctionnement du site. Aucun cookie publicitaire tiers n'est déposé sans votre consentement explicite.</p><h2>Finalités du traitement</h2><p>Les données collectées sont utilisées exclusivement pour : améliorer l'expérience utilisateur, produire des statistiques de fréquentation anonymisées, et assurer la sécurité du site.</p><h2>Vos droits</h2><p>Conformément au RGPD, vous disposez des droits suivants : droit d'accès, droit de rectification, droit à l'effacement, droit à la portabilité, droit d'opposition et droit à la limitation du traitement. Pour exercer ces droits : contact@aitrendsnews.fr. Vous pouvez également introduire une réclamation auprès de la CNIL (cnil.fr).</p><h2>Partage des données</h2><p>Nous ne vendons pas vos données personnelles à des tiers. Certaines données peuvent être partagées avec nos sous-traitants techniques (hébergeur, outil d'analyse) dans le cadre strict de leurs missions.</p><p><em>Dernière mise à jour : mai 2026</em></p>`,
  },
]

export async function GET() {
  const supabase = await createClient()

  for (const page of PAGES) {
    await supabase
      .from('pages')
      .upsert(
        {
          slug: page.slug,
          title: page.title,
          content: page.content,
          is_published: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'slug' }
      )
  }

  redirect('/admin/pages')
}
