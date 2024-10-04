import cssText from "./button.scss?inline";

class Button extends HTMLElement {
    static sheet = null;

    static get observedAttributes() {
        return ['icon', 'url'];
    }

    constructor () {
        super();
        this.attachShadow({mode: 'open'})
        this.initialize();
    }
  
    async initialize() {
      // On charge la feuille de style si ce n'est pas déjà le cas
      if (!Button.sheet) {
        // On crée une nouvelle  CSSStyleSheet object et on utilise replaceSync pour set son content
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(cssText);  // Set de la feuille en sync
        Button.sheet = sheet;
      }
  
      // Application de la feuille à ce shadowDoom
      this.shadowRoot.adoptedStyleSheets = [Button.sheet];
  
      // Du contenu autre dans shadowdom
      const content = document.createElement('div');
      const a = document.createElement('a');
      a.setAttribute('href', this.getAttribute('url'));
      const icon = document.createElement('img');
      icon.classList.add('icon');
      let src = this.getAttribute('icon');
      if(src) {
          icon.setAttribute('src', `imgs/icons/${this.getAttribute('icon')}.svg`);
      }
      
      const slot = document.createElement('slot');
      a.appendChild(icon);
      a.appendChild(slot);
      content.appendChild(a);
      this.shadowRoot.appendChild(content);
    }

    attributeChangedCallback(name, oldVal, newVal) {
        switch (name) {
            case 'icon':
                const img = this.shadowRoot.querySelector('img');
                if(img) {
                    img.setAttribute('src', `imgs/icons/${newVal}.svg`);
                }
                break;
            case 'url':
                const a = this.shadowRoot.querySelector('a');
                if(a) {
                    a.setAttribute('href', newVal);
                }
                break;
        }    
    }
}

customElements.define('custom-button', Button);