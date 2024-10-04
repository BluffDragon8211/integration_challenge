class MiniPlayer extends HTMLElement {
    static sheet = null;

    static get observedAttributes() {
        return ['image', 'audio', 'playing'];
    }

    constructor () {
        super();
        this.attachShadow({mode: 'open'})
        this.initialize();
    }
  
    async initialize() {
        // On charge la feuille de style si ce n'est pas déjà le cas
        if (!MiniPlayer.sheet) {
            const response = await fetch('/src/styles/components/mini-player.scss');
            let cssText = await response.text();
            let cssBegin = cssText.indexOf('__vite__css');
            let cssEnd = cssText.lastIndexOf('__vite__update');
            

            // Netoyage du résultat du fetch pour ne récuperer que le css
            if(cssBegin !== -1 && cssEnd !== -1) {
                cssText = cssText.substring(cssBegin + 15, cssEnd - 2);
                cssText = cssText.replaceAll('\\r', '');
                cssText = cssText.replaceAll('\\n', '');
            }

            // On crée une nouvelle  CSSStyleSheet object et on utilise replaceSync pour set son content
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(cssText);  // Set de la feuille en sync
            MiniPlayer.sheet = sheet;
        }
    
        // Application de la feuille à ce shadowDoom
        this.shadowRoot.adoptedStyleSheets = [MiniPlayer.sheet];
    
        // Du contenu autre dans shadowdom
        const content = document.createElement('article');
        const image = document.createElement('img');
        let src = this.getAttribute('image');
        if(src) {
            image.setAttribute('src', `/public/imgs/icons/${this.getAttribute('image')}.svg`);
        } else {
            image.setAttribute('src', '/public/imgs/image.svg');
        }
        content.appendChild(image);
        const main = document.createElement('div');
        const title = document.createElement('slot');
        title.setAttribute('name', 'title');
        const autor = document.createElement('slot');
        autor.setAttribute('name', 'autor');
        const audio = document.createElement('audio');
        src = this.getAttribute('audio');
        if(src) {
            audio.setAttribute('src', `/public/audios/${this.getAttribute('audio')}`);
        }
        audio.addEventListener('timeupdate', this.updateTime.bind(this));
        const progress = document.createElement('progress');
        progress.setAttribute('max', 100);
        progress.setAttribute('value', 0);
        progress.classList.add('progress');
        progress.addEventListener('click', this.onProgressClick.bind(this));
        const like = document.createElement('like-element');
        const play = document.createElement('img');
        play.classList.add('play');
        play.setAttribute('src', '/public/imgs/play.svg');
        play.addEventListener('click', this.onPlayClick.bind(this));
        const time = document.createElement('span');
        audio.currentTime = 0.001;
        time.classList.add('time');
        main.appendChild(title);
        main.appendChild(autor);
        main.appendChild(audio);
        main.appendChild(progress);
        main.appendChild(like);
        main.appendChild(play);
        main.appendChild(time);
        content.appendChild(main);
        //content.style.setProperty('--stop', `${i}%`)
        this.shadowRoot.appendChild(content);
        this.isPlaying = false;
    }

    onProgressClick(e) {
        e.preventDefault();
        const audio = this.shadowRoot.querySelector('audio');
        if (audio) {
            let coef = e.offsetX / e.target.offsetWidth;
            audio.currentTime = audio.duration * coef;    
        }
    }

    onPlayClick(e = null) {
        if(e) {
            e.preventDefault();
        }
        const audio = this.shadowRoot.querySelector('audio');
        if (audio) {
            if(this.isPlaying === false) {
                const players = document.querySelectorAll('*[playing]');
                for(let player of players) {
                    player.removeAttribute('playing');
                }
                this.setAttribute('playing', '');
            } else {
                this.removeAttribute('playing');
            }
        }
    }

    setPlayIcon() {
        const play = this.shadowRoot.querySelector('.play');
        if(play) {
            let src = play.getAttribute('src');
            if(src !== null) {
                if(src.includes('play')) {
                    play.setAttribute('src', '/public/imgs/pause.svg');
                } else if(src.includes('pause')) {
                    play.setAttribute('src', '/public/imgs/play.svg');
                }
            }
        }
    }

    updateTime(e) {
        const audio = this.shadowRoot.querySelector('audio');
        const progress = this.shadowRoot.querySelector('.progress');
        const time = this.shadowRoot.querySelector('.time');
        if(progress && time && audio) {
            let progressValue = Math.round((audio.currentTime / audio.duration) * 100);
            progress.setAttribute('value', progressValue);
            time.textContent = `${this.convertTime(audio.currentTime)}min sur ${this.convertTime(audio.duration)}`;
            if(audio.currentTime >= audio.duration) {
                this.onPlayClick();
                audio.currentTime = 0;
            }
        }
    }

    convertTime(time) {
        time = time / 60;
        let minutes = Math.floor(time);
        let rawSec = time - minutes;
        let seconds = Math.round(rawSec * 60);
        if(seconds < 10) {
            seconds = `0${seconds}`;
        }
        return `${minutes}:${seconds}`;
    }

    attributeChangedCallback(name, oldVal, newVal) {
        let audio = null;
        switch (name) {
            case 'image':
                const img = this.shadowRoot.querySelector('img');
                if(img) {
                    img.setAttribute('src', `/public/imgs/${newVal}`);
                }
                break;
            case 'audio':
                audio = this.shadowRoot.querySelector('audio');
                if(audio) {
                    audio.setAttribute('src', `/public/audios/${newVal}`);
                    audio.pause();
                    audio.currentTime = 0;
                }
                break;
            case 'playing':
                audio = this.shadowRoot.querySelector('audio');
                if(audio) {
                    if(newVal === null) {
                        audio.pause();
                        this.isPlaying = false;
                    } else {
                        audio.play();
                        this.isPlaying = true;
                    }
                    this.setPlayIcon();
                }
                break;
        }    
    }
}

customElements.define('mini-player', MiniPlayer);