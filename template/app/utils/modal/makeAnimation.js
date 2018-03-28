const effectConfig = {
    fade: {
        enter: 'fade',
        leave: 'fadeOut'
    },
    slide: {
        enter: 'slide',
        leave: 'slideOut'
    },
    zoom: {
        enter: 'zoom',
        leave: 'zoomOut'
    }
}

const supportAnimation = 'AnimationEvent' in window || 'WebKitAnimationEvent' in window || 'MozAnimationEvent' in window;

const prefixer = 'modal-animation-';

const animationendEvents = 'animationend webkitAnimationEnd mozAnimationEnd';

const bindOnce = (element, events, handler) => {
    let executed = false;
    const eventsArray = events.split(' ');
    const onceHanler = e => {
        if (executed) {
            return;
        }

        eventsArray.forEach(eventName => element.removeEventListener(eventName, onceHanler, false));
        handler(e);
        executed = true;
    }

    eventsArray.forEach(eventName => element.addEventListener(eventName, onceHanler, false));
}

const makeAnimation = (elements = [], type = 'enter', animation = 'fade', duration = 600) => {
    return new Promise(resolve => {
        if (elements.length < 1 || !animation || !supportAnimation) {
            resolve();
        } else {
            bindOnce(elements[0], animationendEvents, () => {
                resolve();

                setTimeout(() => elements.forEach((element, index) => {
                    element.classList.remove(prefixer + effectConfig[index + 1 == elements.length ? animation : 'fade'][type]);
                }));
            });

            setTimeout(resolve, duration);
            elements.forEach((element, index) => {
                element.classList.add(prefixer + effectConfig[index + 1 == elements.length ? animation : 'fade'][type]);
            });
        }
    });
}

export default makeAnimation;
