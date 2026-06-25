# Structifyx Motion Engine - Development Architecture Audit

> Document de travail pour guider le developpement.
> Ce document n'est pas une documentation utilisateur finale.

## 1. Objectif de ce document

Ce document sert a verrouiller la vision technique actuelle du moteur avant de continuer les features.

Le but est de verifier que le projet reste bien un moteur de motion abstrait, framework-agnostic et driver-agnostic, et non une simple librairie Web d'animations.

Il doit aider a prendre les prochaines decisions de developpement : API directe, registry, builder-readiness, drivers, packs de motions, diagnostics, performance et controle avance du playback.

## 2. Vision generale du moteur

Structifyx Motion Engine doit etre un moteur de motion TypeScript capable de decrire, valider, preparer, planifier et executer des animations via des drivers.

La vision cible est la suivante :

```txt
motion-core
  -> langage abstrait de motion
  -> modeles, timeline, registry, validation, preparation, scheduling, execution plan
  -> aucune dependance DOM, WAAPI, Angular, React, Vue, GSAP ou autre technologie concrete

motion-web
  -> driver navigateur
  -> resolution de cibles Web
  -> conversion vers Web Animations API
  -> gestion concrete du playback Web

motion-pack-basic
  -> pack de motions pretes a l'emploi
  -> classes reutilisables comme FadeInMotion, FadeOutMotion, SlideInMotion
  -> enregistrement dans une registry

adapters futurs
  -> Angular, React, Vue, Native, Canvas, WebGL, Builder, Runtime dynamique
  -> ils utilisent le core et/ou un driver adapte
```

Le moteur doit permettre deux grands modes d'utilisation :

1. une API directe pour jouer une timeline ou une motion decrite directement ;
2. une API basee sur des classes de motions enregistrees dans une registry, utilisable par un builder et par des packs.

## 3. Principes non negociables

### 3.1 Le core reste pur

`@structifyx/motion-core` ne doit pas importer ni utiliser :

```txt
window
document
HTMLElement
Element
Node
Animation
KeyframeEffect
CSSStyleDeclaration
Angular
React
Vue
GSAP
Anime.js
WAAPI
```

Le core peut utiliser des concepts de motion communs comme :

```txt
transform
filter
opacity
keyframe
timeline
track
step
target
selector
px
%
rem
em
vw
vh
```

Mais ces concepts doivent rester des concepts de motion transportables. Ils ne doivent pas obliger le core a connaitre le DOM ou CSSOM.

### 3.2 Le driver traduit

Le driver est responsable de convertir le langage abstrait du core vers une plateforme concrete.

Exemples :

```txt
motion-web
  transform: { y: 24 } -> translateY(24px)
  filter: { blur: 8 } -> blur(8px)
  target selector -> querySelectorAll ou strategie Web equivalente

motion-native futur
  transform: { y: 24 } -> translationY native
  filter: { blur: 8 } -> effet natif si supporte
```

### 3.3 La registry ne doit pas etre le seul chemin

La registry est essentielle pour les packs et les builders, mais elle ne doit pas empecher l'utilisation directe.

Le moteur doit permettre a terme :

```ts
engine.play(target, {
  type: 'slide-in',
  options: {
    direction: 'bottom'
  }
});
```

et aussi :

```ts
engine.playTimeline(target, {
  tracks: [
    {
      target: { type: 'self' },
      steps: [
        {
          duration: 300,
          keyframes: [
            { opacity: 0, transform: { y: 24 } },
            { opacity: 1, transform: { y: 0 } }
          ]
        }
      ]
    }
  ]
});
```

## 4. Etat actuel des packages

### 4.1 `@structifyx/motion-core`

Role actuel :

```txt
- contrats du moteur
- MotionConfig et NormalizedMotionConfig
- MotionDefinition
- MotionRegistry
- MotionTimelineDefinition
- defaults timeline/track/step
- validation timeline
- preparation timeline
- scheduling
- execution plan
- diagnostics
- performance diagnostics
- performance tiers
- controllers abstraits
- drivers neutres NoopMotionDriver et TestMotionDriver
```

Evaluation : bonne base.

Risque principal : le core doit continuer a eviter toute logique Web cachee.

### 4.2 `@structifyx/motion-web`

Role actuel :

```txt
- WebMotionDriver
- WebMotionPlaybackController
- resolution des targets Web
- conversion keyframes core -> keyframes Web
- conversion timing options core -> timing Web
- gestion reduced motion Web
- gestion des conflits Web
- creation des animations via element.animate
- securisation des erreurs pause/resume/cancel/finish/reset
```

Evaluation : bon isolement du Web.

Risque principal : ne pas faire remonter des contraintes WAAPI dans les modeles core sans abstraction.

### 4.3 `@structifyx/motion-pack-basic`

Role actuel :

```txt
- animations pretes a l'emploi
- classes de MotionDefinition
- registerBasicMotions(registry)
```

Motions actuelles :

```txt
- FadeInMotion
- FadeOutMotion
- SlideInMotion
```

Evaluation : bonne preuve de concept pour la registry.

Risque principal : les metadata/options doivent devenir assez riches pour un builder.

### 4.4 `examples/vanilla`

Role actuel :

```txt
- validation d'integration navigateur
- registry + pack basic + web driver + engine
```

Evaluation : utile comme test d'integration manuel.

Risque principal : l'exemple ne doit pas devenir la seule preuve d'integration. Il faudra garder des tests automatises.

## 5. Pipeline actuel du moteur

Pipeline logique actuel :

```txt
MotionConfig
  -> MotionConfigNormalizer
  -> NormalizedMotionConfig
  -> MotionRegistry
  -> MotionDefinition
  -> normalizeOptions()
  -> validateOptions()
  -> buildTimeline()
  -> MotionTimelineDefinition
  -> applyMotionTimelineDefaults()
  -> validateMotionTimeline()
  -> prepareMotionTimeline()
  -> scheduleMotionTimeline()
  -> createMotionExecutionPlan()
  -> MotionDriver.play()
  -> MotionPlaybackController / MotionPlaybackResult
```

Evaluation : tres bonne structure.

Ce pipeline separe bien :

```txt
configuration utilisateur
resolution de definition
construction abstraite
validation
preparation temporelle
scheduling
execution concrete
```

Point a surveiller : les options de validation doivent etre propagees dans tout le pipeline public, pas seulement dans l'appel direct a `validateMotionTimeline()`.

## 6. Deux modes d'utilisation

### 6.1 Mode registry / MotionDefinition

C'est le mode le plus avance actuellement.

Objectif :

```ts
registry.register(new SlideInMotion());

engine.play(target, {
  type: 'slide-in',
  options: {
    direction: 'bottom',
    distance: 56,
    fade: true
  }
});
```

Ce mode est essentiel pour :

```txt
- packs de motions
- builder visuel
- presets reutilisables
- configuration par UI
- marketplace future de motions
- reutilisation entre projets
```

Etat actuel : bon.

A ameliorer plus tard : metadata/options plus riches pour builder.

### 6.2 Mode API directe

Objectif : permettre d'utiliser le moteur sans creer une classe `MotionDefinition`.

Exemple cible :

```ts
engine.playTimeline(target, timeline, options);
```

ou :

```ts
engine.play(target, {
  timeline,
  trigger: 'manual'
});
```

Ce mode est important pour :

```txt
- usages simples
- animations dynamiques generees par IA ou builder
- tests
- runtime de pages dynamiques
- integration rapide dans une application
```

Etat actuel : concept present via `MotionTimelineDefinition`, mais API publique dediee encore manquante.

Priorite recommandee apres l'audit : haute.

## 7. MotionDefinition et builder-readiness

Une `MotionDefinition` doit devenir un contrat stable pour les packs et le builder.

Elle doit idealement exposer :

```txt
- type stable
- nom lisible
- description
- categorie
- tags
- options configurables
- defaults
- validation d'options
- normalisation d'options
- buildTimeline()
```

Pour le builder, les options devraient progressivement supporter :

```txt
- type d'input
- label
- description
- defaultValue
- required
- min/max
- step
- enum values
- unite conseillee
- groupe ou section UI
- niveau avance ou simple
```

Etat actuel : base correcte, mais il faudra auditer `MotionOptionDefinition` plus tard.

Priorite : moyenne, avant un vrai builder.

## 8. Timeline model

Le modele de timeline est sain :

```txt
MotionTimelineDefinition
  tracks[]
  defaults?
  labels?

track
  target
  steps[]
  stagger?
  defaults?

step
  at?
  keyframes[]
  duration?
  delay?
  easing?
  fill?
  offset?
  iterations?
  direction?
  yoyo?
  endDelay?
  playbackRate?
```

Points forts :

```txt
- multi-tracks
- labels
- anchors temporels
- defaults globaux et par track
- iterations et infinite
- yoyo
- reduced motion possible
```

Points a surveiller :

```txt
- repeatDelay non supporte
- groupes/sequences pas encore formalises
- composition de timelines pas encore formalisee
```

## 9. Keyframe model

Etat actuel : le modele a bien evolue.

Le core supporte maintenant :

```txt
- opacity
- transform string ou objet structure
- filter string ou objet structure
- couleurs sous forme string
- boxShadow string
- outlineColor/borderColor/etc.
- offset
- custom
```

Decision importante : `transform` et `filter` peuvent rester dans le core comme concepts de motion. Le driver decide comment les traduire.

### 9.1 Transform structure

Exemple :

```ts
transform: {
  x: 24,
  y: '10%',
  scale: 0.95,
  rotate: -4,
  origin: 'top center'
}
```

Le Web driver traduit vers une string transform Web.

### 9.2 Filter structure

Exemple :

```ts
filter: {
  blur: 8,
  brightness: 0.8,
  saturate: 1.2
}
```

Le Web driver traduit vers une string filter Web.

### 9.3 Unites

Les unites comme `px`, `%`, `rem`, `em`, `vw`, `vh` sont acceptees comme unites de motion communes.

Regle :

```txt
number length -> unite par defaut du driver
number angle  -> degre par defaut
string        -> valeur explicite interpretee par le driver
```

Ce ne sont pas des dependances CSS tant que le core ne depend pas de CSSOM/DOM.

## 10. Diagnostics et performance

Etat actuel : tres bonne progression.

Le moteur supporte :

```txt
- diagnostics error/warning/info
- diagnostics de performance
- options configurables par categorie
- classification par performance tier
```

Categories actuelles :

```txt
filter
shadow
paint
```

Niveaux configurables :

```txt
off
info
warning
error
```

Tiers de performance :

```txt
compositor
paint
layout
unknown
```

Classification actuelle :

```txt
opacity, transform -> compositor
filter, boxShadow, color properties -> paint
unknown -> unknown
```

Point fort : on peut maintenant utiliser le moteur en mode souple ou strict.

Exemple :

```ts
validateMotionTimeline(timeline, {
  performanceDiagnostics: {
    filter: 'warning',
    shadow: 'error',
    paint: 'off'
  }
});
```

Point a surveiller : les options de validation doivent etre disponibles dans les APIs haut niveau du moteur.

## 11. Web driver

Le Web driver doit rester une couche de traduction et d'execution.

Responsabilites valides :

```txt
- resoudre les targets Web
- convertir MotionKeyframe vers Keyframe
- convertir MotionTiming vers KeyframeAnimationOptions
- creer les animations Web
- gerer les conflits Web
- appliquer reduced motion selon le contexte Web
- fournir un WebMotionPlaybackController
```

Responsabilites a eviter :

```txt
- recalculer la timeline logique
- redefinir les diagnostics core
- imposer des modeles Web au core
- connaitre les details des MotionDefinition
```

Etat actuel : bon.

## 12. Playback controller

Etat actuel : le controller gere deja :

```txt
pause()
resume()
cancel()
finish()
dispose()
on()
once()
```

Statuts :

```txt
idle
running
paused
finished
cancelled
skipped
failed
```

Limites actuelles :

```txt
- pas encore de seek
- pas encore de seekProgress
- pas encore de seek par label
- pas encore de reverse runtime
- pas encore de playForward/playBackward
- pas encore de setPlaybackRate runtime expose proprement
- pas encore de currentTime/progress standardises
```

Cette feature est importante, mais sensible.

Elle doit etre faite apres stabilisation des APIs directes et des options de validation, car elle touche :

```txt
- finished promise
- infinite timelines
- yoyo/direction
- playbackRate
- reduced motion
- multi-tracks
- capabilities des drivers
```

## 13. Reduced motion

Etat actuel : le modele prevoit :

```txt
skip
simplify
preserve
```

Points forts : le concept est deja present dans l'architecture.

A auditer plus tard :

```txt
- compatibilite avec structured transform/filter
- compatibilite avec infinite timelines
- compatibilite avec future API directe
- diagnostics associes
```

## 14. Points obsoletes dans `docs/architecture-v1.md`

Le document `docs/architecture-v1.md` est utile mais n'est plus a jour.

Elements obsoletes ou incomplets :

```txt
- anciens nombres de tests
- validation encore decrite comme trop centralisee alors que plusieurs validators ont ete extraits
- typed transform indique comme manquant alors qu'il existe maintenant
- structured filter non documente
- structured easing non documente correctement
- yoyo non documente dans toutes les sections
- infinite iterations et resume infinite incomplets
- diagnostics de performance non documentes
- options configurables de performance non documentees
- performance tiers non documentes
- API directe non clarifiee comme objectif
```

Decision : ne pas transformer maintenant `architecture-v1.md` en documentation utilisateur finale.

Proposition : garder `architecture-v1.md` comme historique V1, puis creer progressivement une documentation de developpement plus actuelle.

## 15. Risques techniques principaux

### 15.1 Derive Web dans le core

Risque : ajouter trop de details Web dans les modeles core.

Protection : chaque nouveau modele doit repondre a la question :

```txt
Est-ce un concept de motion transportable ou une API Web concrete ?
```

### 15.2 API directe absente trop longtemps

Risque : le moteur devient trop centre sur la registry et moins pratique pour les animations dynamiques.

Protection : ajouter une API directe dediee.

### 15.3 Builder pas assez prepare

Risque : les definitions fonctionnent en code, mais ne donnent pas assez d'informations au builder.

Protection : enrichir progressivement les metadata et option definitions.

### 15.4 Controller avance trop tot

Risque : introduire seek/reverse sans modeliser correctement infinite, labels, finished, capabilities.

Protection : introduire d'abord un modele de capabilities ou une API controlee.

### 15.5 Documentation en retard

Risque : perdre la vision et casser les frontieres core/driver.

Protection : maintenir des docs de developpement apres chaque bloc important.

## 16. Roadmap technique priorisee

### Phase A - Stabilisation architecture

```txt
1. docs: audit current motion engine architecture      DONE
2. feat(core): add direct timeline playback API        NEXT RECOMMENDED
3. docs: document direct API and registry modes
4. feat(core): expose validation options in engine flow
```

### Phase B - Builder-readiness

```txt
5. audit(core): review MotionOptionDefinition for builder usage
6. feat(core): enrich motion option metadata
7. docs: document MotionDefinition builder contract
```

### Phase C - Motion capabilities

```txt
8. feat(core): add motion composition helpers
9. feat(pack-basic): add slide-out/scale/blur motions
10. feat(core): add timeline composition utilities
```

### Phase D - Playback controls

```txt
11. feat(core): model advanced playback controls
12. feat(web): implement seek/reverse controls
13. feat(core,web): add driver playback capabilities
```

### Phase E - Advanced runtime

```txt
14. feat(core,web): add optimization hints
15. feat(core,web): add repeatDelay if model is validated
16. feat(core,web): add SVG motion properties
```

## 17. Prochaine etape recommandee

La prochaine etape de code recommandee est :

```txt
feat(core): add direct timeline playback API
```

Pourquoi :

```txt
- elle correspond directement a la vision des deux modes d'utilisation
- elle rend le moteur utilisable sans MotionDefinition
- elle aide les tests et les integrations dynamiques
- elle sera utile au builder et aux runtimes generatifs
- elle clarifie la frontiere entre API directe et registry
```

API cible possible :

```ts
const playback = await engine.playTimeline(target, {
  tracks: [
    {
      target: { type: 'self' },
      steps: [
        {
          duration: 300,
          keyframes: [
            { opacity: 0, transform: { y: 24 } },
            { opacity: 1, transform: { y: 0 } }
          ]
        }
      ]
    }
  ]
});
```

Important : cette API doit reutiliser le meme pipeline que les motions en registry :

```txt
MotionTimelineDefinition
  -> apply defaults
  -> validate
  -> prepare
  -> schedule
  -> execution plan
  -> driver.play
```

Elle ne doit pas creer une deuxieme logique parallele.

## 18. Decision finale de l'audit

Le projet est sain et bien oriente.

La priorite n'est pas de changer l'architecture, mais de la rendre plus explicite et plus utilisable.

Decision : continuer avec une API directe de timeline, puis documenter clairement les deux modes d'utilisation.

Ordre recommande immediat :

```txt
1. feat(core): add direct timeline playback API
2. docs: document direct API and registry usage modes
3. audit(core): review MotionOptionDefinition builder readiness
4. feat(core,web): advanced playback controls
```
