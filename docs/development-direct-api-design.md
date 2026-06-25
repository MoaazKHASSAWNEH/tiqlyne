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
const timeline = motion.createTimeline((timeline) => {
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

Le builder doit accepter des raccourcis lisibles.

```ts
timeline.track('self', ...);
timeline.track({ type: 'self' }, ...);
timeline.track({ type: 'child', name: 'title' }, ...);
timeline.track({ type: 'selector', selector: '.item' }, ...);
timeline.track({ type: 'named', name: 'modal-title' }, ...);
```

Decision : `'self'` est un raccourci officiel pour `{ type: 'self' }`.

Les autres targets restent explicites pour eviter l'ambiguite.

## 9. Step helpers

Le `StepBuilder` doit supporter :

```txt
keyframe(keyframe)
keyframes(keyframes)
from(keyframe)
to(keyframe)
```

Regles :

```txt
from(k) -> keyframe({ ...k, offset: 0 })
to(k)   -> keyframe({ ...k, offset: 1 })
```

Si le developpeur veut des offsets precis, il utilise directement `keyframe()`.

Exemple :

```ts
step.keyframe({ offset: 0, opacity: 0 });
step.keyframe({ offset: 0.4, opacity: 0.6 });
step.keyframe({ offset: 1, opacity: 1 });
```

## 10. Utilisation dans les MotionDefinition

Le builder doit aussi simplifier les classes de motion.

Exemple cible :

```ts
export class SlideInMotion extends BaseMotionDefinition<SlideInOptions> {
  readonly type = 'slide-in';

  buildTimeline(options: SlideInOptions): MotionTimelineDefinition {
    const distance = options.distance ?? 32;

    return createMotionTimeline((timeline) => {
      timeline.track('self', (track) => {
        track.step(
          {
            duration: options.duration ?? 300,
            easing: options.easing ?? 'ease-out'
          },
          (step) => {
            step.from({
              opacity: options.fade === false ? 1 : 0,
              transform: { y: distance }
            });

            step.to({
              opacity: 1,
              transform: { y: 0 }
            });
          }
        );
      });
    });
  }
}
```

## 11. Engine API cible

L'engine doit devenir la facade officielle.

API cible progressive :

```ts
const motion = createMotionEngine({ driver, registry });

motion.register(new SlideInMotion());
motion.registerMany([new FadeInMotion(), new FadeOutMotion()]);

const timeline = motion.createTimeline((timeline) => {
  timeline.track('self', (track) => {
    track.step({ duration: 300 }, (step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });
  });
});

await motion.play(target, { type: 'fade-in' });
await motion.playTimeline(target, timeline);
```

L'engine pourra aussi accepter des ecouteurs globaux plus tard :

```ts
const motion = createMotionEngine({
  driver,
  events: {
    onStart(event) {},
    onFinish(event) {},
    onFail(event) {}
  }
});
```

Decision : les listeners globaux sont une future feature, pas dans la premiere implementation.

## 12. Separation des timelines / scenes

Il faut prevoir la separation des timelines, mais ne pas l'ajouter trop tot.

Future API possible :

```ts
const scene = createMotionScene((scene) => {
  scene.timeline('intro', (timeline) => {});
  scene.timeline('content', (timeline) => {});
  scene.timeline('outro', (timeline) => {});
});
```

Decision actuelle :

```txt
Maintenant : TimelineBuilder robuste
Plus tard : SceneBuilder / MotionSequence / TimelineGroup
```

Le TimelineBuilder doit donc rester extensible et ne pas bloquer cette couche superieure.

## 13. Ordre d'implementation recommande

```txt
1. feat(core): add timeline builder API
2. feat(core): add direct timeline playback API
3. feat(core): add createMotionEngine facade
4. docs: document direct API and registry usage modes
5. refactor(pack-basic): use timeline builder in basic motions
6. feat(core): add global engine config
7. feat(core): add global playback event listeners
```

La premiere implementation doit rester petite mais solide :

```txt
- createMotionTimeline(callback)
- createMotionTimelineBuilder()
- MotionTimelineBuilder
- MotionTrackBuilder
- MotionStepBuilder
- target input normalization
- tests multi-tracks / multi-steps / labels / defaults / stagger / from/to
```

## 14. Decision finale

L'API officielle doit etre confortable, mais elle ne doit jamais cacher ou limiter la puissance du modele.

Le principe est :

```txt
API confortable
  -> produit le meme modele abstrait
  -> utilise le meme pipeline
  -> donne les memes performances
  -> ne bloque aucune feature avancee
```

La prochaine etape de code est donc :

```txt
feat(core): add timeline builder API
```
