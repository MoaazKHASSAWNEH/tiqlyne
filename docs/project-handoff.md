# Structifyx Motion Engine - Document de reprise projet

> Status: document de reprise principal.
> Objectif: permettre a Moaaz, a un autre agent LLM ou a un developpeur de reprendre le projet exactement au bon point.
> Dernier etat verifie: apres `7f9e6df feat(core): add numeric option validators`, apres la migration du pack basic vers `SchemaMotionDefinition`, et apres l'ajout du guide `docs/writing-custom-motion-definition.md`.

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

Le moteur doit pouvoir servir a:

```txt
- Structifyx
- Sondatio
- builders visuels
- runtimes dynamiques
- applications Angular
- applications React
- applications vanilla Web
- plateformes plugin-based
```

Le moteur n'est pas une simple collection d'effets. Il fournit une architecture complete:

```txt
config utilisateur
  -> normalisation
  -> motion definition / direct timeline
  -> defaults
  -> validation
  -> preparation
  -> scheduling
  -> execution plan
  -> driver plateforme
  -> playback result / playback controller
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

## 4. Packages du monorepo

### 4.1 `@structifyx/motion-core`

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
- controllers generiques
- drivers neutres de test
- helpers DX pour custom MotionDefinition
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

### 4.2 `@structifyx/motion-web`

Role:

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

### 4.3 `@structifyx/motion-pack-basic`

Role: pack de motions reutilisables.

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

### 4.4 `examples/vanilla`

Role: exemple navigateur Vite.

Etat actuel: exemple minimal centre sur le test visuel de `iterations: 'infinite'`, `yoyo: true`, et du playback controller.

Il sert a verifier rapidement:

```txt
- infinite playback
- yoyo
- pause
- resume
- finish sur infinite -> skipped controle
- cancel
- reset
- events controller
```

Prochaine amelioration utile: ajouter un petit exemple de custom motion locale, sans transformer l'exemple en visual builder complet.

## 5. Commandes de validation

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

pnpm --filter @structifyx/motion-example-vanilla build
pnpm --filter @structifyx/motion-example-vanilla dev
```

Dernier resultat global connu:

```txt
format OK
test OK
build OK
motion-core: 19 test files, 254 tests passed
motion-pack-basic: 4 test files, 25 tests passed
motion-web: 12 test files, 159 tests passed
examples/vanilla: build OK
```

## 6. Architecture actuelle du pipeline

Pipeline logique:

```txt
MotionConfig ou MotionTimelineDefinition
  -> normalisation / direct timeline
  -> applyMotionTimelineDefaults()
  -> validateMotionTimeline()
  -> prepareMotionTimeline()
  -> scheduleMotionTimeline()
  -> createMotionExecutionPlan()
  -> MotionDriver.play() ou createPlayback()
  -> MotionPlaybackResult / MotionPlaybackController
```

Le core prepare, valide, schedule et planifie.

Le driver execute.

Le driver Web traduit vers WAAPI.

## 7. API publique importante

### 7.1 Creation du moteur

```ts
const motion = createMotionEngine<Element>({
  driver: new WebMotionDriver(),
  defaults: {
    duration: 300,
    easing: 'ease-out',
    fill: 'both'
  }
});
```

### 7.2 Timeline directe

```ts
const timeline = createMotionTimeline((timeline) => {
  timeline.track('self', (track) => {
    track.step((step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });
  });
});

await motion.playTimeline(element, timeline);
```

### 7.3 Registered motions

```ts
const registry = new DefaultMotionRegistry();
registerBasicMotions(registry);

const motion = createMotionEngine<Element>({
  driver: new WebMotionDriver(),
  registry
});

await motion.play(element, {
  id: 'hero-in',
  type: 'slide-in',
  options: {
    direction: 'bottom',
    distance: 56,
    fade: true
  }
});
```

### 7.4 Custom MotionDefinition

Le guide principal est:

```txt
docs/writing-custom-motion-definition.md
```

API recommandee pour la plupart des custom motions:

```txt
SchemaMotionDefinition
  garde une classe explicite tout en supprimant le boilerplate options/defaults/normalize.

defineMotionOptions()
  source unique pour optionDefinitions, defaults, normalization et typing.

optionValidators
  validation semantique des relations entre options normalisees.

createMotionTimeline()
  construction explicite de la timeline serialisable.
```

Regles importantes:

```txt
- ne pas dupliquer optionDefinitions/getDefaultOptions/normalizeOptions si defineMotionOptions suffit
- preferer InferMotionOptions au type manuel duplique
- valider l'intention avec validateIncreasing/validateDecreasing quand le sens compte
- ne pas ajouter de shortcuts animation-specific dans le timeline builder
```

### 7.5 Playback controller

```ts
const playback = motion.createTimelinePlayback(element, timeline);

await playback.pause();
await playback.resume();
await playback.finish();
await playback.cancel();
playback.dispose();
```

Controller events:

```txt
start
statusChange
pause
resume
cancel
finish
skip
fail
```

## 8. Timing, iterations, yoyo et direction

Options importantes:

```ts
iterations?: number | 'infinite';
direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
yoyo?: boolean;
endDelay?: number;
playbackRate?: number;
```

`iterations: 'infinite'` est supporte.

Dans le Web driver, `iterations: 'infinite'` est mappe vers:

```ts
iterations: Infinity;
```

Regle de validation importante:

```txt
yoyo: true ne doit pas etre combine avec direction.
```

Invalide:

```ts
{
  iterations: 'infinite',
  yoyo: true,
  direction: 'alternate'
}
```

Valide:

```ts
{
  iterations: 'infinite',
  yoyo: true
}
```

Valide aussi:

```ts
{
  iterations: 'infinite',
  direction: 'alternate'
}
```

Diagnostic en cas de conflit:

```txt
timeline-yoyo-direction-conflict
```

## 9. Playback controller Web: comportement important

Correction recente:

```txt
5880634 fix(web): skip finish for infinite playback controllers
```

Avant cette correction, `finish()` sur une animation infinite appelait `animation.finish()` et pouvait provoquer:

```txt
InvalidStateError: Animation.finish: Can't finish infinite animation
```

Le controller passait alors en `failed`, ce qui bloquait ensuite `pause`, `resume` et `cancel`.

Comportement actuel attendu:

```txt
finish() sur animation infinite
  -> status: skipped
  -> reason: web-playback-finish-not-supported-for-infinite-animation
  -> diagnostic warning
  -> animation.finish() n'est pas appele
  -> le controller garde son statut precedent running ou paused
  -> pause/resume/cancel restent utilisables
```

Documentation detaillee:

```txt
docs/playback-controller-behavior.md
```

## 10. Reduced motion

Strategies:

```txt
skip
simplify
preserve
```

Le Web driver ne lit pas `matchMedia` tout seul. L'application doit fournir:

```ts
new WebMotionDriver({
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
});
```

Pour les custom motions avec mouvement, scale ou rotation, ajouter si possible `buildReducedMotionTimeline()`.

## 11. Conflict strategy

Strategies:

```txt
replace
parallel
ignore
```

Comportement Web:

```txt
ignore + animation active -> skipped reason motion-conflict-ignored
replace -> annule les animations existantes sur les cibles resolues
cancelPreviousAnimations: false -> replace est traite comme parallel cote Web driver
```

## 12. Diagnostics

Un diagnostic contient:

```ts
level: 'info' | 'warning' | 'error';
code: string;
message: string;
source: string;
metadata?: Record<string, string | number | boolean | null>;
```

Regles:

```txt
- garder des codes stables
- ne pas renommer sans raison
- ne pas mettre d'objets complexes dans metadata
- preferer warning/skipped pour les limites controlees
- utiliser failed seulement pour les erreurs inattendues ou bloquantes
```

## 13. Documentation actuelle

Carte des docs:

```txt
docs/project-handoff.md
  Document de reprise principal. A lire en premier.

docs/developer-api-guide.md
  Grand guide API historique.

docs/developer-api-guide-current-status.md
  Addendum de statut courant.

docs/writing-custom-motion-definition.md
  Guide pour creer des MotionDefinition reutilisables avec SchemaMotionDefinition.

docs/engine-events-api.md
  Reference des events globaux moteur.

docs/skip-event-api.md
  Reference du onSkip moteur.

docs/web-driver-quickstart.md
  Guide rapide du Web driver.

docs/playback-controller-behavior.md
  Reference comportementale des playback controllers.

docs/motion-core-web-examples.md
  Exemples core + Web.

docs/development-motion-definition-dx-audit.md
  Audit interne de la DX MotionDefinition.

docs/development-architecture-audit.md
  Audit technique interne.

docs/development-direct-api-design.md
  Notes de design de l'API directe.
```

## 14. Historique fonctionnel recent

Etapes deja implementees:

```txt
1. timeline builder API
2. direct timeline playback API
3. createMotionEngine facade
4. engine defaults et validation config
5. engine registry helpers
6. pack-basic utilise createMotionTimeline
7. global engine events
8. skip event
9. Web driver quickstart docs
10. motion-core + motion-web examples docs
11. execution plan transmis aux drivers
12. scheduling des tasks
13. stagger et stagger avance start/end/center
14. reduced motion helpers
15. conflict helpers
16. timeline playable validation
17. labels et anchors
18. playback timing options
19. playbackRate
20. iterations: 'infinite'
21. yoyo
22. exemple vanilla minimal infinite/yoyo
23. Web playback controller: finish infinite retourne skipped au lieu de failed
24. playback controller behavior docs
25. SchemaMotionDefinition
26. defineMotionOptions + option builders
27. InferMotionOptions
28. migration fade-in vers SchemaMotionDefinition
29. migration fade-out et slide-in vers SchemaMotionDefinition
30. numeric option validators
31. validateIncreasing applique a fade-in
32. validateDecreasing applique a fade-out
33. guide docs/writing-custom-motion-definition.md
```

## 15. Limites connues / features manquantes a auditer ensuite

Features non implementees ou non stabilisees:

```txt
- composition/orchestration de plusieurs motions
- sequences ou groups de motions haut niveau
- variants/presets reutilisables
- custom MotionDriver guide
- validateWhen() pour validations conditionnelles
- warning-level option validation
- structured option validation issues avec code/path/level
- metadata UI pour options: group/order/advanced/visibleWhen/disabledWhen
- dynamic event subscription API motion.on(...)
- events plus fins: step start/finish, track start/finish, repeat, reverse, progress
- color format validation stricte
- versioning / compatibility policy
- exemple vanilla avec custom motion locale
- plus de motions pack-basic: scale, rotate, blur, expand/collapse, attention
```

Priorite probable pour le prochain audit fonctionnel:

```txt
1. composition/orchestration de motions
2. structured validation issues pour builder UI
3. metadata UI pour options
4. custom MotionDriver guide
5. exemple vanilla custom motion
```

## 16. Regles a preserver

```txt
- motion-core doit rester framework-agnostic.
- motion-core ne doit pas importer DOM, WAAPI, Angular, React ou GSAP.
- MotionTimelineDefinition reste la source de verite serialisable.
- createMotionTimeline() est une convenience de builder, pas un remplacement du modele.
- createMotionEngine() est la factory publique.
- DefaultMotionEngine est un detail d'implementation pour la plupart des utilisateurs.
- Engine defaults ne doivent pas override les valeurs timeline, track ou step.
- Per-play validation doit override engine validation.
- Engine events sont observationnels.
- Controller events sont separes des engine events.
- Les proprietes optionnelles doivent etre omises plutot que mises a undefined.
- Utiliser skipped pour les operations non supportees mais controlees.
- Utiliser failed pour les erreurs runtime inattendues.
- Garder createMotionTimeline() explicite.
- Ne pas ajouter de shortcuts animation-specific comme timeline.fade() ou fadeTimeline().
- Pour les custom motions, preferer SchemaMotionDefinition par defaut.
- Pour les options, garder defineMotionOptions() comme source unique.
- Pour les validations d'intention, preferer validateIncreasing/validateDecreasing a validateDifferent.
```
