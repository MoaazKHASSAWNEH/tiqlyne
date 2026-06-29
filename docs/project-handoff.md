# Structifyx Motion Engine - Document de reprise projet

> Status: document de reprise principal.
> Objectif: permettre a Moaaz, a un autre agent LLM ou a un developpeur de reprendre le projet exactement au bon point.
> Dernier etat verifie: apres `9e336a0 docs: add custom motion driver guide`.

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

Document driver a lire:

```txt
docs/writing-custom-motion-driver.md
```

Conclusion audit driver actuelle:

```txt
- contrat petit et sain
- target generique
- play() obligatoire
- cancel/finish/reset/createPlayback optionnels
- executionPlan disponible pour les drivers avances
- reduced motion et conflict strategy passes explicitement
```

Limitations driver connues:

```txt
- pas encore declaration formelle de capacites driver
- pas encore hook de validation specifique driver
- pas encore matrice standard de support des proprietes keyframes
- pas encore helper generique d'interpolation/easing runtime
- pas encore active playback registry generique
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

Comportement de placement composition actuel:

```txt
item.at decale l'item compile comme un bloc.

Exemple:
step interne 1 at = 0
step interne 2 at = 300
item.at = 1000
=> step 1 at = 1000
=> step 2 at = 1300
```

Comportement de labels composition actuel:

```txt
composition.labels declare des labels manuels.
item.label ajoute un label calcule depuis item.at.
les items suivants peuvent referencer un item.label precedent.

Exemple:
item A label = card-enter, at = 300
item B at = { label: 'card-enter', offset: 150 }
=> item B commence a 450
```

Erreurs controlees liees a item.label:

```txt
composition-duplicate-label
composition-item-label-reference-missing
composition-item-label-anchor-position-unsupported
```

Limitations composition restantes:

```txt
- pas encore groupes imbriques
- pas encore reduced motion specifique par item
- pas encore diagnostics structures specialises composition
- pas encore presets/variants
- pas encore materialisation de label depuis anchor position
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

Etat actuel: exemple minimal centre sur le test visuel de `iterations: 'infinite'`, `yoyo: true`, du playback controller, et de la composition runtime.

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
- createMotionComposition()
- compileMotionComposition()
- motion.playComposition()
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
```

Derniere validation complete connue:

```txt
21 test files passed
293 tests passed
motion-core build OK
motion-web build OK
motion-pack-basic build OK
examples/vanilla build OK
```

Validation observee apres:

```txt
9866774 feat(core): add composition item labels
```

Derniere mise a jour documentation:

```txt
9e336a0 docs: add custom motion driver guide
```
