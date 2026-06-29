# Structifyx Motion Engine - Document de reprise projet

> Status: document de reprise principal.
> Objectif: permettre a Moaaz, a un autre agent LLM ou a un developpeur de reprendre le projet exactement au bon point.
> Dernier etat verifie: apres `4a7161d feat(core): add playback state model`.

Ce document doit etre lu avant de modifier le code.

## 1. Identite du projet

Repository GitHub:

```txt
MoaazKHASSAWNEH/motion-engine
```

Branche principale actuelle:

```txt
main
```

Objectif du projet: construire un moteur d'animation TypeScript, framework-agnostic, fortement type, extensible, utilisable dans plusieurs produits ou frameworks.

Pipeline conceptuel:

```txt
config utilisateur / composition / direct timeline
  -> normalisation ou compilation
  -> defaults
  -> validation
  -> preparation
  -> scheduling
  -> execution plan
  -> driver plateforme
  -> playback result / playback controller
```

Regles importantes:

```txt
MotionCompositionDefinition -> compileMotionComposition() -> MotionTimelineDefinition.
La composition est une couche d'authoring/orchestration, pas un deuxieme runtime.
MotionDriver = adaptateur plateforme, pas definition d'effet reutilisable.
Timeline Sampler = lecture pure de l'etat temporel d'une timeline sans driver.
Playback State = etat commun expose par tous les MotionPlaybackController.
```

Documents a lire:

```txt
docs/version-roadmap-v1-v2-v3.md
docs/timeline-sampler-api.md
docs/playback-state-api.md
docs/motion-composition-api.md
docs/writing-custom-motion-definition.md
docs/writing-custom-motion-driver.md
```

## 2. Regle de travail importante

Regle utilisateur actuelle:

```txt
Ne pas toucher directement au code source du depot GitHub sans autorisation explicite.
Les modifications directes autorisees ici concernent uniquement les fichiers docs.
```

Pour le code source, donner les patchs, les contenus de fichiers ou les instructions locales. Pour les docs, les mises a jour directes sur GitHub sont autorisees.

## 3. Stack technique

```txt
TypeScript strict
pnpm workspace
Vitest
Vite pour examples/vanilla
Web Animations API dans motion-web
Aucune dependance DOM dans motion-core
exactOptionalPropertyTypes a respecter
```

Regle `exactOptionalPropertyTypes`:

```ts
return {
  required,
  ...(optionalValue !== undefined
    ? {
        optionalValue
      }
    : {})
};
```

Ne pas retourner une propriete optionnelle avec `undefined`.

## 4. Etat actuel de `@structifyx/motion-core`

Role:

```txt
- contrats publics
- modeles
- normalisation
- registry
- moteur par defaut
- diagnostics
- validation
- defaults
- preparation de timeline
- scheduling
- execution plan
- timeline sampler
- playback state
- controllers generiques
- drivers neutres de test
- helpers DX pour custom MotionDefinition
- composition/orchestration de motions et timelines
```

Regle absolue: `motion-core` ne doit pas importer DOM, WAAPI, Angular, React, GSAP ou une API navigateur.

API sampler actuellement disponible:

```txt
sampleMotionTimeline()
sampleMotionTimelineAtTime()
sampleMotionTimelineAtProgress()
MotionTimelineSample
MotionTimelineTrackSample
MotionTimelineStepSample
MotionSampleStepStatus
MotionTimelineSampleInput
```

API playback state actuellement disponible:

```txt
MotionPlaybackState
MotionPlaybackDirectionState
MotionPlaybackController.getState()
```

Comportement playback state actuel:

```txt
- PromiseMotionPlaybackController expose status, playbackRate 1, direction forward, timing null.
- WebMotionPlaybackController expose currentTime/duration/progress quand les animations Web le permettent.
- activeTrackIndexes, activeStepIndexes et currentLabel sont reserves pour l'integration sampler/seek.
```

API composition actuellement disponible:

```txt
MotionCompositionDefinition
RegisteredMotionCompositionItem
TimelineCompositionItem
CompileMotionCompositionContext
createMotionComposition()
MotionCompositionBuilder
compileMotionComposition()
motion.planComposition()
motion.playComposition()
motion.createCompositionPlayback()
composition block offset placement
composition item labels
```

Limitations composition restantes:

```txt
- pas encore groupes imbriques
- pas encore reduced motion specifique par item
- pas encore diagnostics structures specialises composition
- pas encore presets/variants
- pas encore materialisation de label depuis anchor position
```

## 5. Autres packages

### `@structifyx/motion-web`

```txt
- WebMotionDriver
- resolution des cibles DOM
- conversion keyframes Motion -> Web keyframes
- conversion timing Motion -> KeyframeAnimationOptions
- creation d'animations WAAPI
- reduced motion Web
- conflict strategy Web
- WebMotionPlaybackController
- getState() Web base sur Animation.currentTime, endTime et playbackRate quand disponible
```

### `@structifyx/motion-pack-basic`

Motions actuelles:

```txt
fade-in
fade-out
slide-in
```

Etat DX actuel:

```txt
- les trois motions utilisent SchemaMotionDefinition
- les options utilisent defineMotionOptions()
- les types publics utilisent InferMotionOptions
- fade-in utilise validateIncreasing pour garantir une opacite montante
- fade-out utilise validateDecreasing pour garantir une opacite descendante
- slide-in utilise option.select/range/boolean et conserve buildReducedMotionTimeline()
```

## 6. Roadmap V1 actuelle

Timeline Sampler et Playback State sont termines pour leur premiere version.

Prochaines etapes V1 recommandees:

```txt
1. seek(time)
2. seekProgress(progress)
3. jumpToLabel(label)
4. reverse/playBackward minimal
5. setPlaybackRate(rate)
6. advanced playback events minimum
7. inspectMotionTimeline()
8. V1 docs/publication cleanup
```

## 7. Commandes de validation

Commandes globales recommandees avant chaque commit:

```bash
pnpm format
pnpm test
pnpm build
```

Commandes ciblees:

```bash
pnpm --filter @structifyx/motion-core build
pnpm --filter @structifyx/motion-core test

pnpm --filter @structifyx/motion-web build
pnpm --filter @structifyx/motion-web test

pnpm --filter @structifyx/motion-pack-basic build
pnpm --filter @structifyx/motion-pack-basic test
```

Derniere validation complete connue:

```txt
motion-core: 23 test files passed
motion-core: 305 tests passed
motion-pack-basic: 4 test files passed
motion-pack-basic: 25 tests passed
motion-web: 12 test files passed
motion-web: 159 tests passed
motion-core build OK
motion-web build OK
motion-pack-basic build OK
examples/vanilla build OK
```

Validation observee apres:

```txt
4a7161d feat(core): add playback state model
```

Derniere mise a jour documentation:

```txt
68be4c9 docs: add playback state API guide
```
