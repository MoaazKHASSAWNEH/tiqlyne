# Structifyx Motion Engine - Document de reprise projet

Ce document sert de point de reprise pour un autre agent LLM, une autre discussion ChatGPT, ou un developpeur qui doit continuer le projet sans perdre le contexte.

Il doit etre lu avant de modifier le code.

## 1. Identite du projet

Nom du projet : `motion-engine`.

Objectif : construire un moteur d'animation TypeScript, framework-agnostic, fortement type, extensible, utilisable dans des projets comme Structifyx, Sondatio, un builder visuel, un runtime dynamique, Angular, React ou une application metier.

Le moteur ne doit pas etre une simple collection d'effets. Il doit fournir une architecture complete :

```txt
config
  -> normalisation
  -> motion definition
  -> timeline abstraite
  -> defaults
  -> validation
  -> preparation
  -> scheduling
  -> execution plan
  -> driver
  -> playback result / controller
```

## 2. Repository et branche

Repository GitHub : `MoaazKHASSAWNEH/motion-engine`.

Branche principale actuelle : `main`.

Dernier commit fonctionnel connu avant cette documentation :

```txt
d70c942 feat(core,web): add playback rate support
```

Un commit documentaire peut exister apres ce commit.

## 3. Stack technique

- TypeScript strict.
- Monorepo pnpm workspace.
- Vitest pour les tests.
- Vite pour `examples/vanilla`.
- Web Animations API cote navigateur.
- Pas de dependance DOM dans `motion-core`.
- `exactOptionalPropertyTypes` est actif ou doit etre considere comme actif.

Regle importante : ne jamais ajouter une propriete optionnelle avec une valeur `undefined` dans un objet retourne. Utiliser des spreads conditionnels :

```ts
...(value !== undefined
  ? {
      value
    }
  : {})
```

## 4. Packages du monorepo

### 4.1 `@structifyx/motion-core`

Package principal.

Responsabilites :

- contrats ;
- modeles ;
- normalisation ;
- registry ;
- moteur par defaut ;
- diagnostics ;
- validation ;
- defaults ;
- preparation timeline ;
- scheduling ;
- execution plan ;
- controllers generiques ;
- drivers neutres de test.

Ce package ne doit pas importer le DOM, Angular, React, GSAP ou Web Animations API.

### 4.2 `@structifyx/motion-web`

Package navigateur.

Responsabilites :

- Web driver ;
- resolution de cibles DOM ;
- conversion des keyframes ;
- conversion des options de timing ;
- creation d'animations Web ;
- orchestration des animations ;
- reduced motion Web ;
- conflict strategy Web ;
- playback controller Web.

### 4.3 `@structifyx/motion-pack-basic`

Package d'effets de base.

Motions actuellement presentes :

- `fade-in` ;
- `fade-out` ;
- `slide-in`.

### 4.4 `examples/vanilla`

Exemple navigateur simple avec Vite.

Doit rester fonctionnel apres les modifications.

## 5. Commandes de validation

Commande globale recommandee avant chaque commit :

```bash
pnpm format && pnpm build && pnpm typecheck && pnpm test
```

Commandes ciblees utiles :

```bash
pnpm --filter @structifyx/motion-core build
pnpm --filter @structifyx/motion-core typecheck
pnpm --filter @structifyx/motion-core test

pnpm --filter @structifyx/motion-web build
pnpm --filter @structifyx/motion-web typecheck
pnpm --filter @structifyx/motion-web test

pnpm --filter @structifyx/motion-pack-basic build
pnpm --filter @structifyx/motion-pack-basic typecheck
pnpm --filter @structifyx/motion-pack-basic test
```

Derniers resultats globaux connus avant cette documentation :

```txt
motion-core        155 tests
motion-web         131 tests
motion-pack-basic 21 tests
examples/vanilla   build + typecheck OK
```

Apres les changements `playbackRate`, les tests ont ete commites. Si ce document est lu plus tard, relancer les commandes ci-dessus avant de continuer.

## 6. Architecture actuelle du pipeline

Pipeline logique :

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

Le core prepare et planifie.

Le driver execute.

Le driver Web traduit vers la Web Animations API.

## 7. Modeles importants

### 7.1 `MotionTimelineDefinition`

Contient :

- `tracks` ;
- `defaults` ;
- `labels`.

### 7.2 `MotionTrackDefinition`

Contient :

- `target` ;
- `steps` ;
- `stagger` ;
- `defaults`.

### 7.3 `MotionStepDefinition`

Options actuelles importantes :

```ts
export type MotionStepDefinition = {
  readonly iterations?: number;
  readonly direction?: MotionPlaybackDirection;
  readonly endDelay?: number;
  readonly playbackRate?: number;
  readonly at?: MotionStepPosition;
  readonly keyframes: ReadonlyArray<MotionKeyframe>;
  readonly duration?: number;
  readonly delay?: number;
  readonly easing?: string;
  readonly offset?: number;
  readonly fill?: MotionFillMode;
};
```

### 7.4 `MotionTimelineDefaults`

Options actuelles importantes :

```ts
export type MotionTimelineDefaults = {
  readonly iterations?: number;
  readonly direction?: MotionPlaybackDirection;
  readonly endDelay?: number;
  readonly duration?: number;
  readonly delay?: number;
  readonly easing?: string;
  readonly fill?: MotionFillMode;
  readonly playbackRate?: number;
};
```

Ordre de priorite :

```txt
step value > track defaults > timeline defaults
```

## 8. Timeline positions

### 8.1 Formes supportees

```ts
at: 300
at: 'label-name'
at: { label: 'label-name', offset: 100 }
at: { anchor: 'track-start' }
at: { anchor: 'track-end', offset: 100 }
at: { anchor: 'previous-start', offset: -50 }
at: { anchor: 'previous-end', offset: 100 }
```

### 8.2 Types importants

```ts
export type MotionStepAnchor = 'track-start' | 'track-end' | 'previous-start' | 'previous-end';

export type MotionLabelStepPosition = {
  readonly label: string;
  readonly offset?: number;
};

export type MotionAnchorStepPosition = {
  readonly anchor: MotionStepAnchor;
  readonly offset?: number;
};

export type MotionStepPosition =
  | number
  | string
  | MotionLabelStepPosition
  | MotionAnchorStepPosition;
```

### 8.3 Regles

- Si `at` est absent, la step commence au curseur courant.
- Un nombre est une position absolue.
- Une string est un label.
- `{ label, offset }` permet un label avec decalage.
- `track-start` vaut `0`.
- `track-end` vaut le curseur courant.
- `previous-start` vaut le `startTime` de la step precedente.
- `previous-end` vaut le `endTime` de la step precedente.
- `previous-start` et `previous-end` ne doivent pas etre utilises sur la premiere step d'une track.

## 9. Playback timing options

Options actuellement supportees :

```ts
iterations?: number;
direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
endDelay?: number;
playbackRate?: number;
```

Validation :

- `iterations` doit etre un nombre fini strictement positif ;
- `direction` doit etre une valeur connue ;
- `endDelay` doit etre un nombre fini non negatif ;
- `playbackRate` doit etre un nombre fini strictement positif.

Diagnostics :

```txt
timeline-invalid-iterations
timeline-invalid-direction
timeline-invalid-end-delay
timeline-invalid-playback-rate
```

Decision importante :

```txt
playbackRate est une option runtime. Il ne modifie pas encore activeDuration.
```

Le calcul actuel est :

```txt
activeDuration = duration * iterations + endDelay
```

Pas :

```txt
activeDuration / playbackRate
```

Ne pas changer cette decision sans creer une feature separee.

## 10. Preparation de timeline

`prepareMotionTimeline()` :

1. applique les defaults ;
2. resout les positions ;
3. calcule `startTime` ;
4. calcule `activeDuration` ;
5. calcule `endTime` ;
6. avance le curseur ;
7. conserve les options utiles dans `PreparedMotionStep`.

`PreparedMotionStep` contient notamment :

```ts
readonly startTime: number;
readonly endTime: number;
readonly duration: number;
readonly delay: number;
readonly activeDuration: number;
readonly iterations?: number;
readonly direction?: MotionPlaybackDirection;
readonly endDelay?: number;
readonly playbackRate?: number;
```

## 11. Scheduling

`scheduleMotionTimeline()` cree des tasks a partir de la timeline preparee.

Une task pointe vers sa `PreparedMotionStep`.

Le Web driver cree ensuite les animations a partir de ces tasks.

## 12. Web timing mapping

Le fichier important est :

```txt
packages/motion-web/src/utils/to-web-timing-options.ts
```

Il mappe vers `KeyframeAnimationOptions` :

```txt
duration
delay
easing
fill
iterations
direction
endDelay
playbackRate
```

Pour `toWebScheduledTaskTimingOptions(task)`, le `delay` utilise `task.startTime`, pas `task.delay`.

Cette decision permet d'executer les tasks schedulees au bon moment dans la timeline globale.

## 13. Reduced motion

Strategies modelisees :

```txt
skip
simplify
preserve
```

Ne pas supprimer cette architecture.

Reduced motion doit rester une responsabilite du moteur/driver, pas des motions individuelles uniquement.

## 14. Conflict strategy

Strategies :

```txt
replace
parallel
ignore
```

Le Web driver possede des helpers de conflit.

`ignore` doit produire un resultat skipped explicite si une animation est ignoree.

## 15. Diagnostics

Un diagnostic contient :

```ts
level: 'info' | 'warning' | 'error';
code: string;
message: string;
source: string;
metadata?: Record<string, string | number | boolean | null>;
```

Regles :

- garder des codes stables ;
- ne pas mettre d'objets complexes dans metadata ;
- utiliser `null` si une valeur est absente mais utile a afficher ;
- eviter les messages ambigus.

## 16. Tests existants importants

Ne pas casser ces zones sans raison :

```txt
packages/motion-core/src/compiler/apply-motion-timeline-defaults.spec.ts
packages/motion-core/src/compiler/prepare-motion-timeline.spec.ts
packages/motion-core/src/compiler/resolve-motion-step-position.spec.ts
packages/motion-core/src/scheduler/schedule-motion-timeline.spec.ts
packages/motion-core/src/validators/validate-motion-timeline.spec.ts
packages/motion-web/src/utils/to-web-timing-options.spec.ts
packages/motion-web/src/utils/create-web-animation.spec.ts
packages/motion-web/src/utils/create-web-timeline-animations.spec.ts
packages/motion-web/src/drivers/web-motion-driver.spec.ts
```

Quand `PreparedMotionStep` est modifie, beaucoup de mocks Web doivent etre mis a jour.

## 17. Historique fonctionnel recent

Etapes deja implementees :

1. execution plan transmis aux drivers ;
2. driver Web lit l'execution plan ;
3. execution des scheduled tasks ;
4. extraction des timing options Web ;
5. support du stagger ;
6. support du stagger avance `start | end | center` ;
7. fallback playback avec stagger ;
8. extraction target resolution helpers ;
9. extraction animation creation helpers ;
10. extraction playback result helpers ;
11. extraction reduced motion helpers ;
12. extraction conflict helpers ;
13. extraction timeline animation creation ;
14. extraction playable timeline validation ;
15. timeline defaults ;
16. numeric step positioning ;
17. labels ;
18. typed relative label positions ;
19. typed timeline anchors ;
20. typed playback timing options ;
21. playback rate support.

## 18. Dernier etat connu

Dernier commit de feature connu :

```txt
d70c942 feat(core,web): add playback rate support
```

Derniere decision de suite : mettre a jour la documentation et creer ce document de reprise avant de continuer le refactor.

## 19. Prochaine etape recommandee

La prochaine etape technique recommandee est :

```txt
refactor(core): extract timeline validation helpers
```

Mais il faut la faire progressivement.

Ordre conseille :

### 19.1 Extraire playback options validation

Nouveau fichier conseille :

```txt
packages/motion-core/src/validators/validate-motion-playback-options.ts
```

A extraire :

- `validatePlaybackTimingOptions()` ;
- `validateIterations()` ;
- `validatePlaybackDirection()` ;
- `validateEndDelay()` ;
- `validatePlaybackRate()` ;
- `isMotionPlaybackDirection()`.

Il faudra probablement exporter :

```ts
export function validatePlaybackTimingOptions(...): void
```

### 19.2 Extraire step position validation

Nouveau fichier conseille :

```txt
packages/motion-core/src/validators/validate-motion-step-position.ts
```

A extraire :

- `validateStepPosition()` ;
- `validateStepLabelStepPosition()` ;
- `validateStepLabelPosition()` ;
- `validateAnchorStepPosition()` ;
- `isMotionStepAnchor()`.

### 19.3 Extraire keyframe validation

Nouveau fichier conseille :

```txt
packages/motion-core/src/validators/validate-motion-keyframe.ts
```

A extraire :

- `validateKeyframe()`.

### 19.4 Extraire target, stagger, labels

Fichiers conseilles :

```txt
validate-motion-target.ts
validate-motion-stagger.ts
validate-motion-labels.ts
```

### 19.5 Extraire diagnostic factory

Nouveau fichier conseille :

```txt
create-motion-validation-diagnostic.ts
```

A extraire :

- `createErrorDiagnostic()`.

## 20. Regles pour le prochain agent

1. Ne pas faire un gros refactor en une fois.
2. Extraire un module, lancer les tests, puis continuer.
3. Ne pas changer les comportements pendant un refactor.
4. Ne pas renommer les diagnostics sans raison.
5. Ne pas modifier `activeDuration` avec `playbackRate` dans le refactor.
6. Ne pas ajouter `iterations: 'infinite'` pendant le refactor.
7. Ne pas introduire de dependance DOM dans `motion-core`.
8. Ne pas ajouter `any`.
9. Respecter `exactOptionalPropertyTypes`.
10. Garder les tests existants et en ajouter seulement si le refactor revele un trou.

## 21. Objectif apres le refactor validation

Apres `refactor(core): extract timeline validation helpers`, l'etape feature recommandee est :

```txt
feat(core,web): add typed transform helpers
```

Objectif futur :

```ts
keyframes: [
  {
    transform: {
      translateX: 0,
      scale: 1
    }
  },
  {
    transform: {
      translateX: 100,
      scale: 1.1
    }
  }
];
```

Mais cette feature ne doit pas etre commencee tant que la validation n'est pas mieux decoupee.

## 22. Resume tres court pour reprise rapide

Le moteur est fonctionnel et avance.

Etat actuel :

```txt
core pur TypeScript
web driver avec WAAPI
pack basic
execution plan
prepared timeline
scheduled timeline
labels
anchors
stagger
reduced motion
conflict strategy
playback controller
iterations/direction/endDelay/playbackRate
validation stricte
```

Prochaine action recommandee :

```txt
Extraire d'abord validate-motion-playback-options.ts depuis validate-motion-timeline.ts.
```

Validation apres chaque modification :

```bash
pnpm --filter @structifyx/motion-core build
pnpm --filter @structifyx/motion-core typecheck
pnpm --filter @structifyx/motion-core test
```

Puis global avant commit :

```bash
pnpm format && pnpm build && pnpm typecheck && pnpm test
```
