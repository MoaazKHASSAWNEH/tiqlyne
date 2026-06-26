# Structifyx Motion Engine - Direct API Design Decisions

> Document de developpement interne.
> Ce document n'est pas une documentation utilisateur finale.

## 1. Objectif

Ce document fixe les decisions de conception pour l'API officielle du moteur.

L'API doit etre :

```txt
- aussi puissante que le modele bas niveau
- plus confortable a utiliser
- explicite pour les developpeurs
- compatible multi-tracks et multi-steps
- compatible avec les futures timelines separees / scenes / sequences
- reutilisable dans les MotionDefinition
- compatible avec les builders visuels et les generateurs dynamiques
```

L'API ne doit jamais reduire les capacites du moteur. Elle doit seulement fournir une syntaxe plus agreable au-dessus des modeles existants.

## 2. Regle principale

Le modele officiel reste `MotionTimelineDefinition`.

Le builder et l'engine API sont des couches de confort autour de ce modele.

```txt
MotionTimelineDefinition
  -> format officiel
  -> serializable
  -> compatible JSON
  -> compatible builder visuel
  -> compatible stockage en base
  -> compatible generation IA

TimelineBuilder
  -> facilite la creation
  -> produit une MotionTimelineDefinition
  -> ne joue pas l'animation

MotionEngine
  -> possede la config globale
  -> joue les motions registry
  -> joue les timelines directes
  -> expose une API officielle pratique
```

## 3. Configuration globale

La configuration globale doit etre definie a la creation de l'engine.

API cible :

```ts
const motion = createMotionEngine({
  driver: new WebMotionDriver(),
  registry,
  defaults: {
    duration: 300,
    easing: 'ease-out',
    fill: 'both'
  },
  validation: {
    performanceDiagnostics: {
      filter: 'warning',
      shadow: 'warning',
      paint: 'info'
    }
  }
});
```

Cette config globale represente la politique de l'application, pas une animation precise.

Elle pourra contenir progressivement :

```txt
- driver
- registry
- defaults globaux de timeline
- options de validation
- runtime options
- reduced motion
- conflict strategy
- event listeners globaux
- logger
- mode debug / strict
- plugins ou features globales
```

## 4. Priorite des configurations

Pour les options de timing et de timeline :

```txt
step value
  > track defaults
  > timeline defaults
  > engine defaults
  > core defaults
```

Pour les options de validation et de runtime :

```txt
play options
  > engine config
  > core defaults
```

Exemple :

```ts
const motion = createMotionEngine({
  validation: {
    performanceDiagnostics: {
      filter: 'warning'
    }
  }
});

await motion.playTimeline(target, timeline, {
  validation: {
    performanceDiagnostics: {
      filter: 'error'
    }
  }
});
```

Dans ce cas, `filter: 'error'` gagne pour cet appel precis.

## 5. Deux modes d'utilisation officiels

### 5.1 Mode registry

Le mode registry utilise des classes `MotionDefinition`.

```ts
motion.register(new SlideInMotion());

await motion.play(target, {
  type: 'slide-in',
  options: {
    direction: 'bottom',
    distance: 48,
    fade: true
  }
});
```

Ce mode est important pour :

```txt
- packs de motions
- builder visuel
- reutilisation
- presets
- marketplace future
- configuration par UI
```

### 5.2 Mode direct timeline

Le mode direct joue une timeline sans passer par une classe de motion.

```ts
const timeline = createMotionTimeline((timeline) => {
  timeline.track('self', (track) => {
    track.step({ duration: 300 }, (step) => {
      step.from({ opacity: 0, transform: { y: 24 } });
      step.to({ opacity: 1, transform: { y: 0 } });
    });
  });
});

await motion.playTimeline(target, timeline);
```

Ce mode est important pour :

```txt
- cas simples
- animations dynamiques
- generation depuis un builder
- generation depuis une IA
- tests
- runtime de pages dynamiques
```

## 6. Timeline Builder API

Le builder doit supporter nativement :

```txt
- defaults de timeline
- labels
- multi-tracks
- track defaults
- stagger
- multi-steps
- keyframes libres
- from/to helpers
- build final immutable
```

API cible principale :

```ts
const timeline = createMotionTimeline((timeline) => {
  timeline.defaults({
    duration: 300,
    easing: 'ease-out',
    fill: 'both'
  });

  timeline.label('intro', 0);
  timeline.label('outro', 1200);

  timeline.track('self', (track) => {
    track.step({ at: 'intro' }, (step) => {
      step.from({ opacity: 0, transform: { y: 24 } });
      step.to({ opacity: 1, transform: { y: 0 } });
    });

    track.step({ at: 'outro', duration: 200 }, (step) => {
      step.to({ opacity: 0 });
    });
  });

  timeline.track({ type: 'child', name: 'title' }, (track) => {
    track.step({ at: 100 }, (step) => {
      step.from({ opacity: 0, transform: { x: -16 } });
      step.to({ opacity: 1, transform: { x: 0 } });
    });
  });
});
```

## 7. Callback API vs chain API

Decision : la premiere version doit privilegier une API callback-based.

Raison : elle est plus claire pour multi-tracks et multi-steps.

```ts
timeline.track('self', (track) => {
  track.step({ duration: 300 }, (step) => {
    step.from(...);
    step.to(...);
  });
});
```

Une API chainable pourra etre ajoutee plus tard si elle n'affaiblit pas le modele.

## 8. Target input

Pour simplifier l'usage courant, le builder accepte `self` comme raccourci.

```ts
timeline.track('self', (track) => {
  // ...
});
```

Ce raccourci produit :

```ts
{
  type: 'self'
}
```

Les references structurees restent disponibles :

```ts
timeline.track({ type: 'child', name: 'title' }, (track) => {
  // ...
});
```

## 9. Etat d'implementation actuel

Les elements suivants sont maintenant implementes :

```txt
- createMotionTimeline()
- createMotionTimelineBuilder()
- createMotionEngine()
- engine defaults
- engine validation options
- playTimeline()
- createTimelinePlayback()
- planTimeline()
- register()
- registerMany()
- has()
- get()
- getAll()
- getByCategory()
```

Le document public detaille se trouve dans :

```txt
docs/developer-api-guide.md
```

## 10. Ordre d'implementation retenu

```txt
1. feat(core): add timeline builder API
2. feat(core): add direct timeline playback API
3. feat(core): add createMotionEngine facade
4. feat(core): add engine defaults and validation config
5. feat(core): add engine registry helpers
6. docs: add developer API guide and audit
7. refactor(pack-basic): use timeline builder in basic motions
8. feat(core): add global playback event listeners
```
