class NavLink extends HTMLElement {
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
      if (!NavLink.sheet) {
        const response = await fetch('/src/styles/components/nav-link.scss');
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
        NavLink.sheet = sheet;
      }
  
      // Application de la feuille à ce shadowDoom
      this.shadowRoot.adoptedStyleSheets = [NavLink.sheet];
  
      // Du contenu autre dans shadowdom
      const content = document.createElement('li');
      const a = document.createElement('a');
      a.setAttribute('href', this.getAttribute('url'));
      const icon = document.createElement('img');
      icon.classList.add('icon');
      let src = this.getAttribute('icon');
      if(src) {
          icon.setAttribute('src', `/public/imgs/icons/${this.getAttribute('icon')}.svg`);
      }
      
      const slot = document.createElement('slot');
      a.appendChild(icon);
      a.appendChild(slot);
      content.appendChild(a);
      this.shadowRoot.appendChild(content);

      // Vérification de l'url
      this.verifyUrl(this.getAttribute('url'));
    }

    attributeChangedCallback(name, oldVal, newVal) {
        switch (name) {
            case 'icon':
                const img = this.shadowRoot.querySelector('img');
                if(img) {
                    img.setAttribute('src', `/public/imgs/icons/${newVal}.svg`);
                }
                break;
            case 'url':
                this.verifyUrl(newVal);
                break;
        }    
    }

    verifyUrl(url) {
        const a = this.shadowRoot.querySelector('a');
        if(a) {
            const route = document.location.href.replace(`${document.location.protocol}//${document.location.host}`, '');
            let icon = this.getAttribute('icon');
            if(icon) {
                if(route === url) {
                    a.classList.add('current');
                    this.setAttribute('icon', `${icon}-fill`);
                } else {
                    a.classList.remove('current');
                    this.setAttribute('icon', `${icon.replace('-fill', '')}`);
                }
            }
        }
    }
}

customElements.define('nav-link', NavLink);