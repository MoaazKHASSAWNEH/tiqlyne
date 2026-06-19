# Structifyx Motion Engine - Architecture V1

## 1. Objectif

Structifyx Motion Engine est un moteur d'animation TypeScript framework-agnostic.

Son objectif est de permettre a une application, un builder ou un runtime dynamique de decrire une animation avec une configuration JSON, puis de laisser le moteur normaliser cette configuration, trouver la definition de motion correspondante, construire une timeline abstraite et deleguer son execution a un driver adapte a l'environnement.

Le moteur doit rester utilisable dans plusieurs contextes : navigateur, SSR, tests, integration Angular, integration React, runtime dynamique, builder visuel ou application metier.

## 2. Principes d'architecture

Les principes V1 sont les suivants :

- `motion-core` reste pur TypeScript.
- `motion-core` ne depend pas du DOM, d'Angular, de React, de GSAP ou d'une librairie d'animation concrete.
- Les animations concretes sont declarees dans des packs separes.
- L'execution concrete est deleguee a un driver.
- Une animation est decrite par une `MotionConfig` JSON.
- Une motion produit une `MotionTimelineDefinition` abstraite.
- Un driver transforme cette timeline en execution reelle ou simulee.

## 3. Packages

### `@structifyx/motion-core`

Package central du moteur.

Il contient :

- les modeles principaux : `MotionConfig`, `NormalizedMotionConfig`, `MotionTimelineDefinition`, `MotionKeyframe` ;
- les contrats : `MotionEngine`, `MotionDriver`, `MotionRegistry`, `MotionDefinition`, `MotionConfigNormalizer` ;
- le normalizer par defaut ;
- le registry par defaut ;
- le moteur par defaut ;
- les drivers neutres `NoopMotionDriver` et `TestMotionDriver`.

Ce package doit rester independant de toute plateforme.

### `@structifyx/motion-pack-basic`

Package contenant les premieres motions concretes.

Motions V1 actuellement disponibles :

- `FadeInMotion` ;
- `FadeOutMotion` ;
- `SlideInMotion`.

Le package expose aussi `registerBasicMotions(registry)`, qui permet d'enregistrer toutes les motions du pack dans un `MotionRegistry`.

### `@structifyx/motion-web`

Package d'execution navigateur.

Il contient :

- `WebMotionDriver` ;
- `toWebKeyframes()`.

`WebMotionDriver` transforme les timelines abstraites du core en animations reelles via la Web Animations API (`element.animate`).

### `examples/vanilla`

Exemple navigateur minimal avec Vite.

Il valide l'integration complete :

- creation du registry ;
- enregistrement du pack basic ;
- creation du `WebMotionDriver` ;
- creation du `DefaultMotionEngine` ;
- execution reelle de `fade-in`, `fade-out` et `slide-in` ;
- controle via `engine.reset()`.

## 4. Flux d'execution

Le flux V1 est le suivant :

```txt
MotionConfig JSON
  -> MotionConfigNormalizer
  -> NormalizedMotionConfig
  -> MotionRegistry
  -> MotionDefinition
  -> normalizeOptions()
  -> validateOptions()
  -> buildTimeline()
  -> MotionTimelineDefinition
  -> MotionDriver.play()
  -> MotionPlaybackResult
```

Exemple conceptuel :

```ts
const result = await engine.play(target, {
  id: 'example_slide_in',
  type: 'slide-in',
  trigger: 'onClick',
  duration: 500,
  easing: 'ease-out',
  options: {
    direction: 'bottom',
    distance: 56,
    fade: true
  }
});
```

## 5. Role de `MotionDefinition`

Une `MotionDefinition` est la description executable d'une motion.

Elle fournit :

- un type stable (`fade-in`, `fade-out`, `slide-in`) ;
- des metadonnees pour les outils et builders ;
- une liste d'options configurables ;
- des options par defaut ;
- une normalisation des options ;
- une validation des options ;
- une methode `buildTimeline()`.

Elle ne joue pas directement l'animation. Elle construit seulement une timeline abstraite.

## 6. Role de `MotionTimelineDefinition`

`MotionTimelineDefinition` represente une animation abstraite.

Elle contient des tracks. Chaque track cible un element logique :

- `self` ;
- `child` ;
- `selector` ;
- `named`.

Chaque track contient des steps. Chaque step contient :

- `duration` ;
- `delay` ;
- `easing` ;
- `fill` ;
- `keyframes`.

Cette abstraction permet de garder le core independant du DOM.

## 7. Role de `MotionDriver`

Un driver est responsable de l'execution concrete d'une timeline.

V1 definit :

```ts
play(target, timeline, options)
cancel(target)
finish(target)
reset(target)
```

Les methodes de controle sont optionnelles au niveau du contrat driver, mais le `DefaultMotionEngine` expose une API stable :

```ts
engine.play(target, config)
engine.cancel(target)
engine.finish(target)
engine.reset(target)
```

Si un driver ne supporte pas une action de controle, le moteur retourne un resultat `skipped` explicite.

## 8. Role de `WebMotionDriver`

`WebMotionDriver` execute les timelines avec la Web Animations API.

Fonctionnalites V1 :

- respecte l'option `reducedMotion` ;
- resout les cibles `self`, `child`, `selector`, `named` ;
- convertit les `MotionKeyframe` en `Keyframe` navigateur ;
- annule par defaut les animations precedentes sur les cibles concernees ;
- expose `cancel`, `finish` et `reset` ;
- retourne un `MotionPlaybackResult` standardise.

## 9. Etat valide

Etat valide au moment de ce document :

```txt
motion-core        23 tests
motion-pack-basic 20 tests
motion-web          2 tests
total              45 tests
```

Les commandes suivantes passent :

```bash
pnpm build
pnpm typecheck
pnpm test
```

Le test navigateur dans `examples/vanilla` est valide :

- `Fade In` fonctionne ;
- `Fade Out` fonctionne ;
- `Slide In` fonctionne ;
- `Reset` fonctionne via `engine.reset()`.

## 10. Points forts actuels

- Architecture separee et extensible.
- Core sans dependance plateforme.
- Motions declarees sous forme de definitions reutilisables.
- Driver web isole dans un package dedie.
- Tests unitaires sur les briques critiques.
- Exemple navigateur fonctionnel.
- API de controle deja presente dans le moteur.

## 11. Limites actuelles

### Style et formatage

Le projet n'a pas encore de configuration Prettier/ESLint dediee. Certains fichiers peuvent donc avoir une indentation differente.

### Gestion avancee des timelines

La V1 supporte deja plusieurs tracks et plusieurs steps, mais il n'existe pas encore de systeme avance pour :

- sequencing complexe ;
- parallele controle ;
- stagger ;
- groups ;
- callbacks de lifecycle ;
- events internes.

### Controle d'animation

`cancel`, `finish` et `reset` fonctionnent, mais il n'existe pas encore d'objet `MotionPlaybackController` permettant de suivre une animation precise, de connaitre son etat courant ou de l'annuler individuellement.

### Reduced motion

Le support reduced motion existe dans le driver web, mais il reste simple. Les strategies `skip`, `simplify` et `preserve` existent dans les modeles, mais ne sont pas encore completement exploitees dans le driver.

### Tests DOM

`motion-web` teste la conversion des keyframes, mais il n'y a pas encore de tests automatises complets pour `WebMotionDriver` avec un environnement DOM simule ou un test navigateur.

### Documentation utilisateur

Il manque encore :

- README complet ;
- exemples d'utilisation ;
- guide de creation de motion ;
- guide de creation de driver ;
- conventions de nommage ;
- politique de versioning.

## 12. Roadmap V1 proposee

### Phase 1 - Stabilisation technique

- Ajouter Prettier et/ou ESLint.
- Harmoniser l'indentation.
- Ajouter des tests pour les methodes de controle dans `NoopMotionDriver` et `TestMotionDriver` si necessaire.
- Ajouter des tests DOM pour `WebMotionDriver`.

### Phase 2 - API de controle avancee

- Etudier l'ajout d'un `MotionPlaybackController`.
- Permettre de suivre une animation precise.
- Ajouter des hooks ou callbacks : `onStart`, `onFinish`, `onCancel`, `onError`.

### Phase 3 - Reduced motion avance

- Implementer les strategies :
  - `skip` ;
  - `simplify` ;
  - `preserve`.
- Permettre aux motions de fournir une timeline simplifiee.

### Phase 4 - Documentation publique

- Ecrire le README principal.
- Ajouter un guide de demarrage rapide.
- Documenter la creation d'une motion custom.
- Documenter la creation d'un driver custom.

### Phase 5 - Integrations frameworks

- Creer un adapter Angular.
- Creer un adapter React.
- Prevoir une integration builder/runtime pour Structifyx.

## 13. Decision actuelle

La base V1 est validee.

Avant d'ajouter beaucoup de nouvelles motions, il faut continuer a stabiliser :

1. qualite du code ;
2. tests web ;
3. controle avance ;
4. documentation ;
5. integration framework.

Le moteur est maintenant suffisamment solide pour servir de fondation technique a Structifyx, Sondatio ou d'autres projets dynamiques.
