# Tiqlyne Motion Engine - Document de reprise projet

> Status: document de reprise principal.
> Objectif: permettre a Moaaz, a un autre agent ChatGPT/LLM ou a un developpeur de reprendre le projet exactement au bon point.
> Dernier etat verifie: apres `77f3beb docs(core): add tsdoc to engine factory and base definitions`.
> Derniere validation complete connue: `pnpm format`, `pnpm test`, `pnpm typecheck`, `pnpm build`, puis build cible `@tiqlyne/motion-core` OK.

Ce document doit etre lu avant de modifier le projet.

## 1. Identite du projet

Repository GitHub:

```txt
MoaazKHASSAWNEH/motion-engine
```

Branche principale actuelle:

```txt
main
```

Package scope:

```txt
@tiqlyne
```

Objectif du projet: construire un moteur d'animation TypeScript, framework-agnostic, fortement type, extensible, documente et utilisable dans plusieurs produits ou frameworks.

Le moteur doit servir de base officielle pour:

```txt
- Tiqlyne
- Sondatio
- futurs builders visuels
- applications Web vanilla
- integrations Angular / React / autres frameworks via adaptateurs
- plateformes dynamiques et plugin-based
```

## 2. Regle de travail importante

Regle utilisateur actuelle:

```txt
Ne pas modifier le code source directement sans autorisation explicite.
Les modifications directes autorisees dans cette demande concernent uniquement les fichiers docs.
```

Pour le code source:

```txt
- fournir des patchs
- fournir des contenus de fichiers a copier
- fournir des commandes locales
- ne pas pousser de code sans autorisation explicite
```

Pour les fichiers docs:

```txt
- les mises a jour directes sur GitHub sont autorisees dans cette phase
- ne pas modifier les fichiers TypeScript pendant cette phase
```

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

### 4.1 `@tiqlyne/motion-core`

Role:

```txt
- contrats publics
- modeles serialisables
- registry
- normalisation des MotionConfig
- engine par defaut
- diagnostics structures
- validation
- defaults timeline/track/step
- preparation de timeline
- scheduling
- execution plan
- timeline sampler
- timeline inspector
- composition/orchestration
- playback controller contracts
- playback state model
- playback result reasons
- event types
- drivers neutres de test/noop
- helpers DX pour custom MotionDefinition
```

Regle absolue:

```txt
motion-core ne doit pas importer DOM, WAAPI, Angular, React, GSAP ou une API navigateur.
```

### 4.2 `@tiqlyne/motion-web`

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
- controles avancees: seek, progress seek, jumpToLabel, direction, playbackRate
- getState() base sur Animation.currentTime, duration, playbackRate et sampler quand possible
```

### 4.3 `@tiqlyne/motion-pack-basic`

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
- fade-in utilise validateIncreasing
- fade-out utilise validateDecreasing
- slide-in utilise option.select/range/boolean et conserve buildReducedMotionTimeline()
```

### 4.4 `examples/vanilla`

Role:

```txt
- exemple d'integration Web
- validation manuelle du driver Web
- demonstration du basic pack
- demonstration composition/controller selon l'etat actuel de l'exemple
```

## 5. Pipeline conceptuel

```txt
MotionConfig / MotionCompositionDefinition / MotionTimelineDefinition
  -> normalisation ou compilation
  -> defaults
  -> validation
  -> preparation
  -> scheduling
  -> execution plan
  -> driver plateforme
  -> playback result / playback controller / diagnostics / events
```

Regles importantes:

```txt
MotionTimelineDefinition = source runtime serialisable.
MotionCompositionDefinition = source authoring/orchestration serialisable.
MotionCompositionDefinition -> compileMotionComposition() -> MotionTimelineDefinition.
La composition n'est pas un deuxieme runtime.
MotionDriver = adaptateur plateforme, pas definition d'effet reutilisable.
Timeline Sampler = lecture pure de l'etat temporel d'une timeline sans driver.
Timeline Inspector = rapport developer tooling sans execution.
Playback State = etat commun expose par MotionPlaybackController.
Diagnostics = messages structures, pas exceptions systematiques.
Reasons = raison stable d'un MotionPlaybackResult.
```

## 6. API publique actuelle importante

### 6.1 Engine

```txt
createMotionEngine()
MotionEngine
MotionEngineConfig
DefaultMotionEngine
MotionEngineEvents
MotionEngineEventTypes
MotionEngineEventSources
```

Capacites actuelles du moteur:

```txt
register()
registerMany()
has()
get()
getAll()
getByCategory()
play()
playTimeline()
plan()
planTimeline()
playComposition()
planComposition()
createPlayback()
createTimelinePlayback()
createCompositionPlayback()
cancel()
finish()
reset()
```

### 6.2 Definitions et options

```txt
MotionDefinition
BaseMotionDefinition
SchemaMotionDefinition
MotionBuildContext
defineMotionOptions()
InferMotionOptions
MotionOptionsSchema
option.number()
option.range()
option.string()
option.boolean()
option.select()
option.color()
MotionOptionValidator
validateDifferent()
validateGreaterThan()
validateGreaterThanOrEqual()
validateLessThan()
validateLessThanOrEqual()
validateIncreasing()
validateDecreasing()
```

### 6.3 Timelines

```txt
MotionTimelineDefinition
MotionTrackDefinition
MotionStepDefinition
MotionKeyframe
MotionTargetReference
MotionTimelineDefaults
MotionTimelineLabels
MotionStepPosition
MotionLabelStepPosition
MotionAnchorStepPosition
MotionPlaybackDirection
MotionIterationCount
MotionStaggerDefinition
createMotionTimeline()
createMotionTimelineBuilder()
MotionTimelineBuilder
MotionTrackBuilder
MotionStepBuilder
```

### 6.4 Planning / scheduling

```txt
createMotionExecutionPlan()
createMotionExecutionPlanSummary()
MotionExecutionPlan
MotionExecutionPlanSummary
prepareMotionTimeline()
scheduleMotionTimeline()
applyMotionTimelineDefaults()
resolveMotionStepPosition()
```

### 6.5 Playback controllers

```txt
MotionPlaybackController
MotionPlaybackControllerStatus
MotionPlaybackState
MotionPlaybackDirectionState
MotionPlaybackResult
MotionPlaybackStatus
MotionPlaybackResultReasons
MotionPlaybackEvent
MotionPlaybackEventTypes
MotionPlaybackEventListener
PromiseMotionPlaybackController
BaseMotionPlaybackController
```

Controles V1 implementes:

```txt
pause()
resume()
cancel()
finish()
dispose()
getState()
seek(time)
seekProgress(progress)
jumpToLabel(label)
playForward()
playBackward()
setPlaybackRate(rate)
on()
once()
```

### 6.6 Diagnostics

```txt
MotionDiagnostic
MotionDiagnosticLevel
MotionDiagnosticMetadata
MotionDiagnosticCodes
MotionDiagnosticCode
MotionDiagnosticSources
MotionDiagnosticSource
createMotionDiagnostic()
createMotionInfoDiagnostic()
createMotionWarningDiagnostic()
createMotionErrorDiagnostic()
createPlaybackInvalidTransitionDiagnostic()
createPlaybackUnsupportedDiagnostic()
createPlaybackInvalidInputDiagnostic()
createPlaybackOperationFailedDiagnostic()
```

### 6.7 Composition

```txt
MotionCompositionDefinition
MotionCompositionItem
RegisteredMotionCompositionItem
TimelineCompositionItem
CompileMotionCompositionContext
createMotionComposition()
MotionCompositionBuilder
compileMotionComposition()
```

Etat actuel:

```txt
- composition de motions enregistrees et de timelines directes
- block offset placement via item.at
- labels d'items
- references a des labels precedents
- compilation vers MotionTimelineDefinition
- runtime shortcuts dans MotionEngine
```

Limitations connues:

```txt
- pas encore de groupes imbriques
- pas encore de reduced motion specifique par item
- pas encore de presets/variants de composition
- diagnostics composition encore simples par rapport a un futur systeme avance
```

### 6.8 Sampler et inspector

```txt
sampleMotionTimeline()
sampleMotionTimelineAtTime()
sampleMotionTimelineAtProgress()
MotionTimelineSample
MotionTimelineTrackSample
MotionTimelineStepSample
MotionSampleStepStatus
MotionTimelineSampleInput
inspectMotionTimeline()
MotionTimelineInspection
MotionTimelineTrackInspection
MotionTimelineStepInspection
MotionTimelineLabelInspection
```

Sampler supporte actuellement:

```txt
- sampling par time
- sampling par progress sur timeline finie
- pending / active / completed
- reverse direction
- yoyo
- iterations finies et infinies
- interpolation opacity
- interpolation custom numerique
- fallback discret pour les valeurs non numeriques
```

Inspector supporte actuellement:

```txt
- duree totale
- nombre de tracks
- nombre de steps
- labels tries
- targets uniques
- proprietes animees
- diagnostics pour timeline infinie
- diagnostics pour timeline longue
- diagnostics pour step longue
- diagnostics pour step sans keyframes
```

## 7. Etat V1 actuel

La phase suivante est la preparation release V1.

Etat estime:

```txt
V1 technical progress: environ 88-92%
V1 publishable progress: environ 75-80%
```

Deja termine:

```txt
- architecture core/driver
- direct timeline API
- createMotionEngine facade
- engine defaults
- validation config
- registry helpers
- event system global
- skip event
- execution plan
- scheduling
- stagger / labels / anchors
- playback timing options
- iterations / yoyo / infinite
- MotionDefinition DX
- SchemaMotionDefinition
- option schemas
- option validators
- basic pack migration
- composition compiler
- composition builder
- composition runtime shortcuts
- composition item labels
- timeline sampler
- playback state
- seek(time)
- seekProgress(progress)
- jumpToLabel(label)
- playForward/playBackward
- setPlaybackRate(rate)
- currentLabel
- active indexes
- advanced playback events
- timeline inspector
- centralized diagnostics
- centralized diagnostic codes
- centralized diagnostic sources
- centralized playback result reasons
- centralized engine/playback event types
- TSDoc public API pass
```

A ne pas oublier:

```txt
- V1 n'est pas encore publiee.
- Le root package.json est private.
- Les packages sont en 0.1.0.
- La prochaine etape est la finalisation release/package/docs, pas un nouveau gros feature set.
```

## 8. Derniere validation complete connue

Derniere validation observee apres:

```txt
77f3beb docs(core): add tsdoc to engine factory and base definitions
```

Commandes passees:

```bash
git status
pnpm format
pnpm test
pnpm typecheck
pnpm build
pnpm --filter @tiqlyne/motion-core build
```

Resultat:

```txt
git status: working tree clean
motion-core: 29 test files passed / 328 tests passed
motion-web: 12 test files passed / 159 tests passed
motion-pack-basic: 4 test files passed / 25 tests passed
examples/vanilla build OK
@tiqlyne/motion-core build OK
```

## 9. Commandes de validation recommandees

Avant chaque commit:

```bash
pnpm format
pnpm test
pnpm typecheck
pnpm build
```

Validation ciblee:

```bash
pnpm --filter @tiqlyne/motion-core test
pnpm --filter @tiqlyne/motion-core typecheck
pnpm --filter @tiqlyne/motion-core build

pnpm --filter @tiqlyne/motion-web test
pnpm --filter @tiqlyne/motion-web typecheck
pnpm --filter @tiqlyne/motion-web build

pnpm --filter @tiqlyne/motion-pack-basic test
pnpm --filter @tiqlyne/motion-pack-basic typecheck
pnpm --filter @tiqlyne/motion-pack-basic build
```

Audit exports publics:

```bash
grep -R "MotionDiagnosticCodes" -n packages/motion-core/src/index.ts
grep -R "MotionPlaybackResultReasons" -n packages/motion-core/src/index.ts
grep -R "SchemaMotionDefinition" -n packages/motion-core/src/index.ts
```

## 10. Documentation a lire pour reprendre

Lire dans cet ordre:

```txt
1. docs/chatgpt-project-resume.md
2. docs/project-handoff.md
3. docs/developer-api-guide-current-status.md
4. docs/complete-usage-guide.md
5. docs/version-roadmap-v1-v2-v3.md
6. docs/developer-api-guide.md
7. docs/writing-custom-motion-definition.md
8. docs/writing-custom-motion-driver.md
9. docs/motion-composition-api.md
10. docs/timeline-sampler-api.md
11. docs/playback-controller-behavior.md
12. docs/web-driver-quickstart.md
```

## 11. Prochaine etape recommandee

Phase suivante:

```txt
Phase V1 Refactor 10 - finalisation release V1 package
```

Objectif:

```txt
Preparer le moteur pour une release V1 publique ou pre-release propre.
```

Sous-etapes recommandees:

```txt
10.1 Audit package.json des packages
10.2 Audit exports publics et types .d.ts
10.3 Rediger ou mettre a jour README racine
10.4 Rediger README par package si necessaire
10.5 Creer CHANGELOG.md
10.6 Creer docs/release-v1-checklist.md
10.7 Tester pnpm pack sur les packages publiables
10.8 Verifier files/dist/exports/main/types
10.9 Decider version: rester 0.1.0 ou passer en 1.0.0 plus tard
10.10 Derniere validation complete avant release
```

Ne pas commencer maintenant:

```txt
- visual builder complet
- nouveau driver majeur
- plugin ecosystem complet
- integration Angular/React officielle
- refonte d'API publique sans raison forte
```

## 12. Message court a donner a un nouveau ChatGPT

```txt
Lis docs/chatgpt-project-resume.md puis docs/project-handoff.md. Le projet est un monorepo TypeScript pnpm nomme motion-engine, avec packages @tiqlyne/motion-core, @tiqlyne/motion-web et @tiqlyne/motion-pack-basic. La phase TSDoc public API est terminee au commit 77f3beb. Ne modifie pas le code sans autorisation. La prochaine etape est Phase V1 Refactor 10: finalisation release V1 package/docs/publication readiness.
```
