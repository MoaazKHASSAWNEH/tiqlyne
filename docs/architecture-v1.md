# Structifyx Motion Engine - Architecture V1

## 1. Objectif du moteur

Structifyx Motion Engine est un moteur d'animation TypeScript framework-agnostic.

Son objectif est de permettre a une application, un builder visuel, un runtime dynamique ou un framework adapter de decrire des animations avec une configuration typee, puis de laisser le moteur :

1. normaliser la configuration ;
2. resoudre la motion demandee ;
3. construire une timeline abstraite ;
4. appliquer les defaults ;
5. valider la timeline ;
6. preparer la timeline avec des temps calcules ;
7. scheduler les tasks d'execution ;
8. produire un execution plan ;
9. deleguer l'execution concrete a un driver.

Le moteur doit rester utilisable dans plusieurs contextes : navigateur, SSR, tests, integration Angular, integration React, runtime dynamique, builder visuel, application metier, ou moteur de pages dynamiques.

La V1 vise une base solide, testable et extensible, pas seulement une collection d'effets visuels.

## 2. Principes d'architecture

Les principes principaux sont les suivants :

- `motion-core` reste pur TypeScript.
- `motion-core` ne depend pas du DOM, d'Angular, de React, de GSAP ou d'une librairie d'animation concrete.
- Les animations concretes sont declarees dans des packs separes.
- L'execution concrete est deleguee a un driver.
- Une motion produit une `MotionTimelineDefinition` abstraite.
- Une timeline est validee avant execution.
- Une timeline est preparee avant scheduling.
- Le driver recoit une timeline deja planifiee via un execution plan quand c'est possible.
- Le Web driver traduit les timelines vers la Web Animations API.
- Le moteur doit rester fortement type, mais compatible avec des configurations dynamiques.

## 3. Packages

### 3.1 `@structifyx/motion-core`

Package central du moteur.

Il contient :

- les modeles principaux : `MotionConfig`, `NormalizedMotionConfig`, `MotionTimelineDefinition`, `MotionKeyframe` ;
- les modeles de timeline preparee et schedulee ;
- les contrats : `MotionEngine`, `MotionDriver`, `MotionRegistry`, `MotionDefinition`, `MotionConfigNormalizer` ;
- le normalizer par defaut ;
- le registry par defaut ;
- le moteur par defaut ;
- les erreurs de planning ;
- les diagnostics ;
- les helpers de defaults ;
- les helpers de resolution de positions ;
- la validation des timelines ;
- la creation de l'execution plan ;
- les drivers neutres `NoopMotionDriver` et `TestMotionDriver`.

Ce package doit rester independant de toute plateforme.

### 3.2 `@structifyx/motion-web`

Package d'execution navigateur.

Il contient notamment :

- `WebMotionDriver` ;
- `WebMotionPlaybackController` ;
- les helpers de resolution des cibles DOM ;
- les helpers reduced motion ;
- les helpers de conflit Web ;
- les helpers de creation d'animations Web ;
- les helpers de conversion des keyframes ;
- les helpers de conversion des timing options ;
- les helpers de creation de resultats de playback.

`WebMotionDriver` transforme les timelines abstraites du core en animations reelles via la Web Animations API (`element.animate`).

### 3.3 `@structifyx/motion-pack-basic`

Package contenant les premieres motions concretes.

Motions V1 actuellement disponibles :

- `FadeInMotion` ;
- `FadeOutMotion` ;
- `SlideInMotion`.

Le package expose aussi `registerBasicMotions(registry)`, qui permet d'enregistrer toutes les motions du pack dans un `MotionRegistry`.

### 3.4 `examples/vanilla`

Exemple navigateur minimal avec Vite.

Il valide l'integration complete :

- creation du registry ;
- enregistrement du pack basic ;
- creation du `WebMotionDriver` ;
- creation du `DefaultMotionEngine` ;
- execution reelle de `fade-in`, `fade-out` et `slide-in` ;
- controle via les actions disponibles dans l'exemple.

## 4. Flux d'execution actuel

Le flux d'execution logique est :

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

- un type stable, par exemple `fade-in`, `fade-out`, `slide-in` ;
- des metadonnees pour les outils et builders ;
- une liste d'options configurables ;
- des options par defaut ;
- une normalisation des options ;
- une validation des options ;
- une methode `buildTimeline()`.

Elle ne joue pas directement l'animation. Elle construit seulement une timeline abstraite.

## 6. Role de `MotionTimelineDefinition`

`MotionTimelineDefinition` represente une animation abstraite.

Elle contient :

- une liste de tracks ;
- des defaults globaux optionnels ;
- des labels temporels optionnels.

Chaque track contient :

- une cible logique ;
- une liste de steps ;
- un stagger optionnel ;
- des defaults de track optionnels.

Chaque step peut contenir :

- `at` : position temporelle optionnelle ;
- `keyframes` : liste de keyframes abstraites ;
- `duration` : duree d'un cycle ;
- `delay` : delai avant la step ;
- `easing` ;
- `fill` ;
- `offset` ;
- `iterations` ;
- `direction` ;
- `endDelay` ;
- `playbackRate`.

Cette abstraction permet de garder le core independant du DOM.

## 7. Cibles de track

Une track cible un element logique.

Cibles supportees :

```txt
self
child
selector
named
```

Signification :

- `self` : la cible principale fournie au moteur ou au driver ;
- `child` : un enfant logique resolu par convention ;
- `selector` : plusieurs elements resolus par selecteur dans le driver Web ;
- `named` : une cible nommee resolue par le driver.

Le core ne sait pas comment resoudre concretement ces cibles. Cette responsabilite appartient au driver.

## 8. Defaults de timeline et de track

Les defaults permettent d'eviter de repeter les memes options sur chaque step.

Exemple :

```ts
const timeline = {
  defaults: {
    duration: 300,
    easing: 'ease-out',
    fill: 'both',
    iterations: 2,
    direction: 'alternate',
    endDelay: 100,
    playbackRate: 1
  },
  tracks: [
    {
      target: { type: 'self' },
      steps: [
        {
          keyframes: [{ opacity: 1 }]
        }
      ]
    }
  ]
};
```

Ordre de priorite :

```txt
step value > track defaults > timeline defaults
```

Fonctions importantes :

- `mergeMotionTimelineDefaults()` ;
- `hasMotionTimelineDefaults()` ;
- `applyMotionStepDefaults()` ;
- `applyMotionTimelineDefaults()`.

## 9. Positions temporelles des steps

La propriete `at` controle la position temporelle d'une step.

Formes supportees :

```ts
at: 300
at: 'intro'
at: { label: 'intro', offset: 100 }
at: { anchor: 'track-start' }
at: { anchor: 'track-end', offset: 100 }
at: { anchor: 'previous-start', offset: -50 }
at: { anchor: 'previous-end', offset: 100 }
```

### 9.1 Position automatique

Si `at` est absent, la step commence au curseur courant de la track.

Le curseur avance avec :

```txt
max(cursor, step.endTime)
```

### 9.2 Position numerique

Une position numerique indique un temps absolu dans la track.

Exemple :

```ts
at: 500;
```

### 9.3 Labels

Les labels sont declares au niveau de la timeline :

```ts
labels: {
  intro: 0,
  content: 500,
  outro: 1200
}
```

Une step peut ensuite utiliser :

```ts
at: 'content';
```

ou :

```ts
at: { label: 'content', offset: 100 }
```

### 9.4 Anchors typés

Anchors disponibles :

```txt
track-start
track-end
previous-start
previous-end
```

Signification :

- `track-start` : debut de la track, donc `0` ;
- `track-end` : curseur courant de la track ;
- `previous-start` : debut de la step precedente ;
- `previous-end` : fin de la step precedente.

`previous-start` et `previous-end` sont interdits sur la premiere step d'une track.

## 10. Preparation de timeline

`prepareMotionTimeline()` transforme une timeline abstraite en timeline preparee.

Elle calcule pour chaque step :

- `trackIndex` ;
- `stepIndex` ;
- `startTime` ;
- `endTime` ;
- `duration` ;
- `delay` ;
- `activeDuration` ;
- les options de playback resolues ;
- la reference `source` vers la step resolue.

Calcul actuel :

```txt
iterations = step.iterations ?? 1
endDelay = step.endDelay ?? 0
activeDuration = duration * iterations + endDelay
endTime = startTime + activeDuration
```

Decision importante :

```txt
playbackRate ne modifie pas encore activeDuration.
```

Dans la V1 actuelle, `playbackRate` est une option runtime transmise au driver Web. Le planning reste base sur `duration`, `iterations` et `endDelay`.

## 11. Scheduling

`scheduleMotionTimeline()` transforme une timeline preparee en liste de tasks.

Une task contient :

- `taskIndex` ;
- `trackIndex` ;
- `stepIndex` ;
- `startTime` ;
- `endTime` ;
- `duration` ;
- `delay` ;
- `step`.

Les tasks sont triees par ordre temporel.

Le scheduler ne depend pas du DOM.

## 12. Execution plan

L'execution plan regroupe les informations necessaires a l'execution.

Il contient :

- la timeline resolue ;
- la timeline preparee ;
- la timeline schedulee ;
- la timeline reduced motion si disponible ;
- les diagnostics ;
- un resume.

Le resume contient :

- `trackCount` ;
- `taskCount` ;
- `totalDuration` ;
- `hasReducedMotionTimeline` ;
- `reducedMotionTotalDuration` si disponible.

Le but est d'eviter que les drivers recalculent eux-memes toute la logique.

## 13. Validation

`validateMotionTimeline()` valide la structure et les valeurs de la timeline.

Validations principales :

- timeline avec au moins une track ;
- track avec au moins une step ;
- target valide ;
- stagger valide ;
- labels valides ;
- duration non negative ;
- delay non negatif ;
- easing non vide ;
- offset entre `0` et `1` ;
- keyframes non vides ;
- opacity entre `0` et `1` ;
- keyframe offset entre `0` et `1` ;
- custom properties valides ;
- step position valide ;
- label position valide ;
- anchor position valide ;
- iterations strictement positif ;
- direction connue ;
- endDelay non negatif ;
- playbackRate strictement positif.

Diagnostics importants :

```txt
timeline-empty-tracks
timeline-empty-steps
timeline-empty-keyframes
timeline-invalid-duration
timeline-invalid-delay
timeline-invalid-easing
timeline-invalid-step-offset
timeline-invalid-label-name
timeline-invalid-label-position
timeline-invalid-step-label
timeline-unknown-step-label
timeline-invalid-step-position
timeline-invalid-step-position-offset
timeline-invalid-step-anchor
timeline-invalid-iterations
timeline-invalid-direction
timeline-invalid-end-delay
timeline-invalid-playback-rate
timeline-invalid-stagger
timeline-invalid-stagger-from
timeline-invalid-target-name
timeline-invalid-target-selector
timeline-invalid-opacity
timeline-invalid-keyframe-offset
timeline-invalid-custom-property
timeline-invalid-custom-value
```

## 14. Playback controller et resultats

Le moteur dispose d'un modele de controle de playback.

Statuts possibles :

```txt
idle
running
paused
finished
cancelled
skipped
failed
```

Evenements de playback :

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

Le controller permet de suivre une animation et de demander :

- `pause()` ;
- `resume()` ;
- `cancel()` ;
- `finish()` ;
- `dispose()` ;
- `on()` ;
- `once()`.

## 15. Reduced motion

Strategies supportees par le modele :

```txt
skip
simplify
preserve
```

Comportement attendu :

- `skip` : ne pas jouer l'animation et retourner un resultat skipped ;
- `simplify` : utiliser une timeline simplifiee ;
- `preserve` : conserver l'animation originale.

Le moteur peut produire des diagnostics lies au reduced motion, notamment quand une fallback timeline est utilisee.

## 16. Conflict strategy

Strategies supportees :

```txt
replace
parallel
ignore
```

Signification :

- `replace` : remplacer l'animation existante ;
- `parallel` : autoriser plusieurs animations en parallele ;
- `ignore` : ignorer la nouvelle animation en cas de conflit.

Le Web driver contient des helpers dedies pour resoudre ce comportement.

## 17. WebMotionDriver

`WebMotionDriver` execute les timelines avec la Web Animations API.

Fonctionnalites actuelles :

- respecte la strategie reduced motion ;
- resout les cibles `self`, `child`, `selector`, `named` ;
- convertit les `MotionKeyframe` en `Keyframe` navigateur ;
- convertit les options de timing vers `KeyframeAnimationOptions` ;
- mappe `duration`, `delay`, `easing`, `fill` ;
- mappe `iterations`, `direction`, `endDelay`, `playbackRate` ;
- applique le stagger ;
- gere les conflits ;
- cree les animations depuis une timeline schedulee ;
- expose les resultats de playback standardises.

Options Web mappees :

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

## 18. Stagger

Le stagger permet de decaler l'execution d'une meme step sur plusieurs cibles.

Formes supportees :

```ts
stagger: 80
stagger: { each: 80, from: 'start' }
stagger: { each: 80, from: 'end' }
stagger: { each: 80, from: 'center' }
```

Le stagger est applique par le Web driver lors de la creation des animations par cible.

## 19. Etat valide au moment de cette version

Etat apres les features suivantes :

- timeline defaults ;
- numeric step positioning ;
- labels ;
- typed relative label positions ;
- typed timeline anchors ;
- typed playback timing options ;
- playback rate support.

Derniers resultats globaux connus avant la mise a jour documentation :

```txt
motion-core        155 tests
motion-web         131 tests
motion-pack-basic 21 tests
examples/vanilla   build + typecheck OK
```

Commandes de validation recommandees :

```bash
pnpm format && pnpm build && pnpm typecheck && pnpm test
```

## 20. Points forts actuels

- Architecture separee et extensible.
- Core sans dependance plateforme.
- Motions declarees sous forme de definitions reutilisables.
- Driver web isole dans un package dedie.
- Pipeline complet : config, timeline, defaults, validation, preparation, scheduling, execution plan, driver.
- Diagnostics structures.
- Timeline positions avancees : numeric, labels, label offset, anchors.
- Options de playback solides : iterations, direction, endDelay, playbackRate.
- Reduced motion pris en compte dans l'architecture.
- Conflict strategy presente.
- Tests unitaires sur les briques critiques.
- Exemple navigateur fonctionnel.

## 21. Limites actuelles

### 21.1 Validation encore trop centralisee

`validate-motion-timeline.ts` fonctionne, mais il contient encore trop de responsabilites.

Prochaine etape recommandee :

```txt
refactor(core): extract timeline validation helpers
```

Sous-etapes conseillees :

1. extraire `validate-motion-playback-options.ts` ;
2. extraire `validate-motion-step-position.ts` ;
3. extraire `validate-motion-keyframe.ts` ;
4. extraire `validate-motion-target.ts` ;
5. extraire `validate-motion-stagger.ts` ;
6. extraire `validate-motion-labels.ts` ;
7. extraire `create-motion-validation-diagnostic.ts`.

### 21.2 Pas encore de typed transform helpers

Les keyframes supportent les valeurs abstraites actuelles, mais il manque une API plus typee pour les transforms :

```ts
transform: {
  translateX: 100,
  scale: 1.2,
  rotate: '15deg'
}
```

### 21.3 Pas encore de presets avances

Le pack basic contient les premieres motions, mais il manque encore :

- `slide-out` ;
- `scale-in` ;
- `scale-out` ;
- `zoom-in` ;
- `zoom-out` ;
- `blur-in` ;
- `blur-out` ;
- effects composes comme `fade-slide-in`.

### 21.4 Infinite playback non implemente

`iterations` supporte seulement les nombres finis.

Le support futur de `iterations: 'infinite'` doit etre traite separement, car il impacte :

- `finished` ;
- `cancel` ;
- `pause` ;
- `resume` ;
- `activeDuration` ;
- l'execution plan ;
- les resultats de playback.

### 21.5 `playbackRate` ne modifie pas encore le planning

Decision actuelle :

```txt
playbackRate est une option runtime.
```

Il ne modifie pas encore `activeDuration`. Une future version pourra introduire une notion d'`effectiveDuration` si necessaire.

### 21.6 Documentation utilisateur encore incomplete

Il manque encore :

- README complet ;
- guide de demarrage rapide ;
- guide de creation d'une motion custom ;
- guide de creation d'un driver custom ;
- conventions de nommage ;
- politique de versioning ;
- exemples complets.

## 22. Roadmap recommandee

### Phase 1 - Nettoyage architecture interne

- `refactor(core): extract timeline validation helpers`.
- Extraire les validators par responsabilite.
- Garder les tests verts a chaque sous-etape.

### Phase 2 - Keyframes et transforms

- `feat(core,web): add typed transform helpers`.
- Ajouter une conversion Web propre.
- Ajouter validation et tests.

### Phase 3 - Presets et pack basic

- Ajouter de nouvelles motions simples.
- Ajouter des motions composees.
- Stabiliser les options communes.

### Phase 4 - Runtime Web avance

- Renforcer orchestration group playback.
- Ameliorer lifecycle safety.
- Gerer cleanup, dispose, target removed.

### Phase 5 - Framework adapters

- Adapter Angular.
- Adapter React si necessaire.
- Integration builder/runtime Structifyx.

### Phase 6 - Documentation publique et release

- README.
- Guides.
- Exemples.
- Changelog.
- Versioning.
- Preparation publication package.

## 23. Decisions importantes a conserver

- Le core ne doit pas dependre du DOM.
- Les drivers executent, le core planifie.
- Le Web driver doit utiliser l'execution plan quand disponible.
- Les options optionnelles ne doivent pas etre ajoutees avec une valeur `undefined`, car le projet utilise `exactOptionalPropertyTypes`.
- `playbackRate` ne modifie pas encore `activeDuration`.
- `iterations: 'infinite'` doit etre une feature separee.
- Les diagnostics doivent rester structures, avec `level`, `code`, `message`, `source`, `metadata`.
- Les refactors doivent etre petits et valides par tests.

## 24. Decision actuelle

La base V1 est maintenant solide pour continuer vers une architecture plus professionnelle.

La prochaine etape recommandee est :

```txt
refactor(core): extract timeline validation helpers
```

Cette etape doit etre faite avant d'ajouter des features visuelles plus avancees, afin de garder le moteur maintenable.
