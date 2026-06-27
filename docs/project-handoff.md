# Structifyx Motion Engine - Document de reprise projet

> Status: document de reprise principal.
> Objectif: permettre a Moaaz, a un autre agent LLM ou a un developpeur de reprendre le projet exactement au bon point.
> Dernier etat verifie: apres `5880634 fix(web): skip finish for infinite playback controllers` et apres la mise a jour documentaire du comportement des playback controllers.

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
```

Regle absolue: `motion-core` ne doit pas importer DOM, WAAPI, Angular, React, GSAP ou une API navigateur.

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

## 5. Commandes de validation

Commande globale recommandee avant chaque commit:

```bash
pnpm format && pnpm build && pnpm typecheck && pnpm -r --workspace-concurrency=1 test && git --no-pager diff --name-only
```

Commandes ciblees:

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

pnpm --filter @structifyx/motion-example-vanilla build
pnpm --filter @structifyx/motion-example-vanilla typecheck
pnpm --filter @structifyx/motion-example-vanilla dev
```

Dernier resultat global connu:

```txt
format OK
build OK
typecheck OK
motion-core: 234 tests passed
motion-pack-basic: 21 tests passed
motion-web: 159 tests passed
examples/vanilla: build + typecheck OK
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

### 7.4 Playback controller

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
```

## 15. Etat exact du dernier point de travail

Dernier commit code pousse par Moaaz:

```txt
5880634 fix(web): skip finish for infinite playback controllers
```

Derniere validation locale apres ce commit:

```txt
format OK
build OK
typecheck OK
motion-core: 234 tests passed
motion-pack-basic: 21 tests passed
motion-web: 159 tests passed
```

Derniers fichiers code modifies dans ce commit:

```txt
examples/vanilla/index.html
examples/vanilla/src/main.ts
examples/vanilla/src/styles.css
packages/motion-web/src/controllers/web-motion-playback-controller.ts
packages/motion-web/src/drivers/web-motion-driver.spec.ts
```

Derniers fichiers docs mis a jour ensuite:

```txt
docs/playback-controller-behavior.md
docs/project-handoff.md
docs/developer-api-guide-current-status.md
docs/web-driver-quickstart.md
```

## 16. Prochaines etapes recommandees

### 16.1 Court terme: stabilisation docs

Objectif:

```txt
S'assurer que toutes les docs disent la meme chose sur infinite/yoyo/controller.
```

A verifier:

```txt
docs/web-driver-quickstart.md
docs/developer-api-guide-current-status.md
docs/motion-core-web-examples.md
docs/skip-event-api.md
```

### 16.2 Court terme: guide custom MotionDefinition

Prochaine vraie documentation utile:

```txt
docs/writing-custom-motion-definition.md
```

Objectif:

```txt
expliquer comment creer une motion reusable type fade/slide/custom
```

Plan conseille:

```txt
1. structure d'une MotionDefinition
2. options typees
3. validateOptions
4. buildTimeline avec createMotionTimeline
5. reduced motion timeline optionnel
6. tests Vitest
7. registration dans une registry
```

### 16.3 Court terme: guide custom MotionDriver

Ensuite:

```txt
docs/writing-custom-motion-driver.md
```

Objectif:

```txt
expliquer comment porter le moteur vers une autre plateforme que le Web
```

### 16.4 Feature technique possible apres docs

Feature recommandee apres les guides:

```txt
feat(core): add dynamic event subscription API
```

Idee:

```ts
const unsubscribe = motion.on('finish', listener);
```

Mais cette feature n'est pas encore implementee. Ne pas la documenter comme disponible.

### 16.5 Future visual lab

Le builder visuel complet a ete juge trop ambitieux pour maintenant.

Decision actuelle:

```txt
Garder examples/vanilla simple et cible.
Ne pas construire un editeur complet tant que le moteur n'est pas stabilise et documente.
```

Un futur visual lab pourrait revenir plus tard avec:

```txt
- panel preview fixe
- panel controls scrollable
- creation de tracks/steps
- edition des keyframes
- generation JSON timeline
```

Mais ce n'est pas la prochaine etape.

## 17. Regles pour le prochain agent

```txt
1. Lire ce fichier avant toute proposition.
2. Ne pas faire de gros refactor en une fois.
3. Ne pas changer les comportements pendant une phase docs.
4. Ne pas renommer les diagnostics sans raison.
5. Ne pas introduire de dependance DOM dans motion-core.
6. Ne pas ajouter any.
7. Respecter exactOptionalPropertyTypes.
8. Garder MotionTimelineDefinition serializable.
9. Garder createMotionTimeline comme helper, pas comme source de verite unique.
10. Pour les limitations controlees, preferer skipped + diagnostic warning.
11. Pour les erreurs inattendues, utiliser failed + diagnostic error.
12. Valider localement apres chaque modification.
```

## 18. Resume tres court pour reprise rapide

Le moteur est dans un bon etat.

Etat actuel:

```txt
core pur TypeScript
web driver WAAPI
pack basic
registry
createMotionEngine facade
direct timelines
registered motions
timeline builder
defaults
validation stricte
prepared timeline
scheduled timeline
execution plan
labels
anchors
stagger
reduced motion
conflict strategy
playback controller
engine events
controller events
skip event
iterations infinite
yoyo
playbackRate
example vanilla infinite/yoyo
```

Point exact de reprise:

```txt
Apres correction du comportement finish() sur animation infinite.
La prochaine etape recommandee est documentation/custom guides, pas gros refactor.
```

Commande de securite avant de continuer:

```bash
git pull
pnpm format && pnpm build && pnpm typecheck && pnpm -r --workspace-concurrency=1 test
```
