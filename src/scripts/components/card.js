class Card extends HTMLElement {
    static sheet = null;

    constructor () {
        super();
        this.attachShadow({mode: 'open'})
        this.initialize();
    }
  
    async initialize() {
        // On charge la feuille de style si ce n'est pas déjà le cas
        if (!Card.sheet) {
            const response = await fetch('/src/styles/components/card.scss');
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
            Card.sheet = sheet;
        }
    
        // Application de la feuille à ce shadowDoom
        this.shadowRoot.adoptedStyleSheets = [Card.sheet];
    
        // Du contenu autre dans shadowdom
        const content = document.createElement('article');
        const relative = document.createElement('div');
        const image = document.createElement('img');
        let src = this.getAttribute('image');
        if(src) {
            image.setAttribute('src', `/public/imgs/icons/${this.getAttribute('image')}.svg`);
        } else {
            image.setAttribute('src', '/public/imgs/image.svg');
        }
        const tag = document.createElement('span');
        tag.textContent = this.getAttribute('tag');
        tag.classList.add('tag');
        const like = document.createElement('like-element');
        relative.appendChild(image);
        relative.appendChild(tag);
        relative.appendChild(like);
        content.appendChild(relative);
        const p = document.createElement('p');
        const title = document.createElement('slot');
        p.appendChild(title);
        content.appendChild(p);
        this.shadowRoot.appendChild(content);
    }
}

customElements.define('custom-card', Card);