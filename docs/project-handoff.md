# Structifyx Motion Engine - Document de reprise projet

> Status: document de reprise principal.
> Objectif: permettre a Moaaz, a un autre agent LLM ou a un developpeur de reprendre le projet exactement au bon point.
> Dernier etat verifie: apres `e263246 feat(core): add timeline sampler`.

Ce document doit etre lu avant de modifier le code.

## 1. Identite du projet

Nom du repository: `motion-engine`.

Repository GitHub:

```txt
MoaazKHASSAWNEH/motion-engine
```

Branche principale actuelle:

```txt
main
```

Objectif du projet: construire un moteur d'animation TypeScript, framework-agnostic, fortement type, extensible, utilisable dans plusieurs produits ou frameworks.

Le moteur n'est pas une simple collection d'effets. Il fournit une architecture complete:

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

Regle importante pour la composition:

```txt
MotionCompositionDefinition
  -> compileMotionComposition()
  -> MotionTimelineDefinition
  -> planTimeline() / playTimeline() / createTimelinePlayback()
```

La composition est une couche d'authoring/orchestration. Elle ne doit pas devenir un deuxieme runtime.

Regle importante pour les drivers:

```txt
MotionDriver = adaptateur plateforme.
Il execute une MotionTimelineDefinition sur un type de target concret.
Il ne definit pas les effets reutilisables.
```

Regle importante pour le sampler:

```txt
Timeline Sampler = lecture pure de l'etat temporel d'une timeline.
Il ne joue pas l'animation.
Il ne depend pas du DOM, WAAPI ou d'un driver.
Il sert de base pour seek, progress, state, inspector et builder preview.
```

Documents a lire:

```txt
docs/version-roadmap-v1-v2-v3.md
docs/timeline-sampler-api.md
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
- controllers generiques
- drivers neutres de test
- helpers DX pour custom MotionDefinition
- composition/orchestration de motions et timelines
```

Regle absolue: `motion-core` ne doit pas importer DOM, WAAPI, Angular, React, GSAP ou une API navigateur.

API DX custom motions actuellement disponible:

```txt
SchemaMotionDefinition
defineMotionOptions()
option.number()
option.range()
option.string()
option.boolean()
option.select()
option.color()
InferMotionOptions
optionValidators
validateDifferent()
validateGreaterThan()
validateGreaterThanOrEqual()
validateLessThan()
validateLessThanOrEqual()
validateIncreasing()
validateDecreasing()
```

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

Comportement sampler actuel:

```txt
- sampling par time
- sampling par progress sur timelines finies
- progress sampling refuse sur timelines infinies
- classification pending / active / completed
- opacity interpolation
- custom numeric interpolation
- fallback discret pour transform/filter/couleurs/string
- support direction reverse/alternate/alternate-reverse
- support yoyo
- support iterations finies et infinies
```

API driver actuellement disponible:

```txt
MotionDriver<TTarget>
MotionPlayOptions
MotionCreatePlaybackOptions
MotionPlaybackResult
MotionPlaybackController
NoopMotionDriver
TestMotionDriver
PromiseMotionPlaybackController
MotionExecutionPlan
ScheduledMotionTimeline
PreparedMotionTimeline
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

### `examples/vanilla`

Etat actuel: exemple minimal centre sur le test visuel de `iterations: 'infinite'`, `yoyo: true`, du playback controller, et de la composition runtime.

## 6. Roadmap V1 actuelle

Timeline Sampler est termine pour sa premiere version.

Prochaines etapes V1 recommandees:

```txt
1. Playback state model
2. seek(time)
3. seekProgress(progress)
4. jumpToLabel(label)
5. reverse/playBackward minimal
6. setPlaybackRate(rate)
7. advanced playback events minimum
8. inspectMotionTimeline()
9. V1 docs/publication cleanup
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
motion-core: 22 test files passed
motion-core: 302 tests passed
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
e263246 feat(core): add timeline sampler
```

Derniere mise a jour documentation:

```txt
e02f7a1 docs: add timeline sampler API guide
1aa31af docs: update roadmap after timeline sampler
```
