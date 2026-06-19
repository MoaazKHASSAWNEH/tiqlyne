import { DefaultMotionConfigNormalizer, DefaultMotionEngine, DefaultMotionRegistry } from '@structifyx/motion-core';
import { registerBasicMotions } from '@structifyx/motion-pack-basic';
import { WebMotionDriver } from '@structifyx/motion-web';
import './styles.css';
const registry = new DefaultMotionRegistry();
registerBasicMotions(registry);
const driver = new WebMotionDriver({
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
});
const engine = new DefaultMotionEngine({
    registry,
    driver,
    normalizer: new DefaultMotionConfigNormalizer()
});
const target = getElementByIdOrThrow('motionTarget');
const log = getElementByIdOrThrow('log');
const reducedMotionStrategySelect = getElementByIdOrThrow('reducedMotionStrategySelect');
const reducedMotionStatus = getElementByIdOrThrow('reducedMotionStatus');
writeReducedMotionStatus();
const fadeInButton = getElementByIdOrThrow('fadeInButton');
const fadeOutButton = getElementByIdOrThrow('fadeOutButton');
const slideInButton = getElementByIdOrThrow('slideInButton');
const resetButton = getElementByIdOrThrow('resetButton');
fadeInButton.addEventListener('click', () => {
    void playMotion({
        id: 'example_fade_in',
        type: 'fade-in',
        trigger: 'onClick',
        duration: 450,
        easing: 'ease-out',
        respectReducedMotion: true,
        reducedMotionStrategy: getReducedMotionStrategy(),
        options: {
            fromOpacity: 0,
            toOpacity: 1
        }
    });
});
fadeOutButton.addEventListener('click', () => {
    void playMotion({
        id: 'example_fade_out',
        type: 'fade-out',
        trigger: 'onClick',
        duration: 350,
        easing: 'ease-in',
        respectReducedMotion: true,
        reducedMotionStrategy: getReducedMotionStrategy(),
        options: {
            fromOpacity: 1,
            toOpacity: 0
        }
    });
});
slideInButton.addEventListener('click', () => {
    void playMotion({
        id: 'example_slide_in',
        type: 'slide-in',
        trigger: 'onClick',
        duration: 500,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        respectReducedMotion: true,
        reducedMotionStrategy: getReducedMotionStrategy(),
        options: {
            direction: 'bottom',
            distance: 56,
            fade: true
        }
    });
});
resetButton.addEventListener('click', () => {
    void resetMotion();
});
async function resetMotion() {
    const result = await engine.reset(target);
    writeLog(result);
}
async function playMotion(config) {
    writeLog({
        status: 'finished',
        reason: `playing ${config.type}`
    });
    const result = await engine.play(target, config);
    writeLog(result);
}
function writeLog(result) {
    log.textContent = JSON.stringify(result, null, 2);
}
function getReducedMotionStrategy() {
    const value = reducedMotionStrategySelect.value;
    if (value === 'preserve' || value === 'simplify' || value === 'skip') {
        return value;
    }
    return 'skip';
}
function writeReducedMotionStatus() {
    const reducedMotionEnabled = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    reducedMotionStatus.textContent = `prefers-reduced-motion: ${reducedMotionEnabled ? 'reduce' : 'no-preference'}`;
}
function getElementByIdOrThrow(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Element not found: ${id}`);
    }
    return element;
}
//# sourceMappingURL=main.js.map