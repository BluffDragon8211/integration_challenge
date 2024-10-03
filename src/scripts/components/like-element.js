class LikeElement extends HTMLElement {
    static sheet = null;

    static get observedAttributes() {
        return ['active'];
    };

    constructor () {
        super();
        this.attachShadow({mode: 'open'})
        this.initialize();
    }
  
    async initialize() {
        // On charge la feuille de style si ce n'est pas déjà le cas
        if (!LikeElement.sheet) {
            const response = await fetch('/src/styles/components/like-element.scss');
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
            LikeElement.sheet = sheet;
        }
    
        // Application de la feuille à ce shadowDoom
        this.shadowRoot.adoptedStyleSheets = [LikeElement.sheet];
    
        // Du contenu autre dans shadowdom
        const content = document.createElement('div');
        const icon = document.createElement('img');
        content.appendChild(icon);
        this.shadowRoot.appendChild(content);
        this.verifyActive();
        this.addEventListener('click', this.onClickAction);
    }

    onClickAction(e) {
        e.preventDefault();
        let active = this.getAttribute('active');
        if(active === null) {
            this.setAttribute('active', '');
        } else {
            this.removeAttribute('active');
        }
    }

    verifyActive() {
        const icon = this.shadowRoot.querySelector('img');
        if(icon) {
            let active = this.getAttribute('active');
            if(active !== null) {
                icon.setAttribute('src', '/public/imgs/icons/heart-fill.svg');
            } else {
                icon.setAttribute('src', '/public/imgs/icons/heart.svg');
            }
        }
    }

    attributeChangedCallback(name) {
        if(name === 'active') {
            this.verifyActive();
        }
    }
}

customElements.define('like-element', LikeElement);