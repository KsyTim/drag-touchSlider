class Gallery {
  constructor(element) {
    this.container = element;
    this.slider = this.container.querySelector('.slider');
    this.currentSlide = 0;
    this.size = this.slider.childElementCount;
    this.currentSlideWasChanged = false;
    this.elements = this.slider.querySelectorAll('.slide');
    this.setParameters = this.setParameters.bind(this);
    this.doSlideAbsolutePosition = this.doSlideAbsolutePosition.bind(this);
    this.doSlideTransparent = this.doSlideTransparent.bind(this);
    this.setEvents = this.setEvents.bind(this);
    this.forwardSlide = this.forwardSlide.bind(this);
    this.backSlide = this.backSlide.bind(this);
    this.resizeGallery = this.resizeGallery.bind(this);
    this.startDrag = this.startDrag.bind(this);
    this.stopDrag = this.stopDrag.bind(this);
    this.dragging = this.dragging.bind(this);
    this.clickDots = this.clickDots.bind(this);
    this.changeActiveDotClass = this.changeActiveDotClass.bind(this);
    this.changeCurrentSlide = this.changeCurrentSlide.bind(this);
    this.autoplay = this.autoplay.bind(this);
    this.autoplayStop = this.autoplayStop.bind(this);
    this.setParameters(); 
    this.setEvents();
    this.autoplay();
  }

  setParameters() {
    this.containerWidth = document.querySelector('body').getBoundingClientRect().width - 100;
    this.containerHeight = 0;
    this.elements.forEach(elem => {
      this.containerHeight += elem.getBoundingClientRect().height;
    })
    this.container.style.cssText = 
      `
        width: ${this.containerWidth*0.9}px;
        height: ${this.containerWidth*0.5}px;
      `;
    this.doSlideAbsolutePosition();
    let hasArrows = this.container.querySelector('.gallery-arrows'),
      hasDots = this.container.querySelector('.gallery-dots');
    if (hasArrows && hasDots) {
      return;
    } else {
      this.container.insertAdjacentHTML('beforeend', `
        <div class="gallery-arrows">
          <button class="gallery-arrow_left"></button>
          <button class="gallery-arrow_right"></button>
        </div>
        <div class="gallery-dots"></div>
      `);
      this.dots = this.container.querySelector(`.gallery-dots`);
      for (let i = 0; i < this.size; i++) {
        this.dots.insertAdjacentHTML('beforeend', `<button class="gallery-dot ${i === this.currentSlide ? 'gallery-dot-active' : ''}"></button>`)
      } 
      this.dot = this.dots.querySelectorAll(`.gallery-dot`);
      this.arrowLeft = this.container.querySelector(`.gallery-arrow_left`);
      this.arrowRight = this.container.querySelector(`.gallery-arrow_right`);
      this.changeActiveDotClass();
    }
  }

  doSlideTransparent() {
    this.elements.forEach(elem => {
      elem.classList.add('transparent');
    });   
  }

  doSlideAbsolutePosition() {
    this.elements.forEach(elem => {
      elem.style.position = 'absolute';  
    });
  }

  backSlide() {
    this.doSlideTransparent();
    if (this.currentSlideWasChanged) {
      this.currentSlide--;
    } else {
      this.currentSlide = 0;
    }
    if (this.currentSlide < this.size && this.currentSlide >= 0) {
      this.elements[this.currentSlide].classList.remove('transparent');
      this.currentSlideWasChanged = true;
    } else if (this.currentSlide < 0) {
      this.currentSlide = this.size - 1;
      this.elements[this.currentSlide].classList.remove('transparent');
      this.currentSlideWasChanged = true;
    } 
    this.changeActiveDotClass();
  }

  forwardSlide() {
    this.doSlideTransparent();
    if (this.currentSlideWasChanged) {
      this.currentSlide++;
    } else {
      this.currentSlide = 0;
    }
    if (this.currentSlide < this.size) {
      this.elements[this.currentSlide].classList.remove('transparent');
      this.currentSlideWasChanged = true;
    } else if (this.currentSlide >= this.size) {
      this.currentSlide = 0;
      this.elements[this.currentSlide].classList.remove('transparent');
      this.currentSlideWasChanged = true;
    } 
    this.changeActiveDotClass();
  }

  setEvents() {
    this.debouncedResizeGallery = debounce(this.resizeGallery);
    window.addEventListener('resize', this.debouncedResizeGallery);
    this.slider.addEventListener('pointerdown', this.startDrag);
    window.addEventListener('pointerup', this.stopDrag);
    window.addEventListener('pointercancel', this.stopDrag);
    this.dots.addEventListener('click', this.clickDots);
    this.arrowLeft.addEventListener('click', this.backSlide);
    this.arrowRight.addEventListener('click', this.forwardSlide);
    this.pointAndRemove(this.arrowLeft);
    this.pointAndRemove(this.arrowRight);
    this.pointAndRemove(this.dots);
    this.elements.forEach(elem => {
      this.pointAndRemove(elem);
    });
  }

  destroyEvents() {
    window.removeEventListener('resize', this.debouncedResizeGallery);
    this.slider.removeEventListener('pointerdown', this.startDrag);
    window.removeEventListener('pointerup', this.stopDrag);
    window.removeEventListener('pointercancel', this.stopDrag);
    this.dots.removeEventListener('click', this.clickDots);
    this.arrowLeft.removeEventListener('click', this.moveToLeft);
    this.arrowRight.removeEventListener('click', this.moveToRight);
    this.slider.removeEventListener('click', this.backSlide);
  }

  resizeGallery() {
    this.setParameters();
  }

  startDrag(position) {
    this.clickX = position.pageX;
    this.slider.classList.add('draggable');
    window.addEventListener('pointermove', this.dragging);
  }

  stopDrag() {
    window.removeEventListener('pointermove', this.dragging);
    this.slider.classList.remove('draggable'); 
  }

  dragging(position) {
    this.dragX = position.pageX;
    const dragShift = this.dragX - this.clickX;
    // if (this.clickX > document.querySelector('.slider').getBoundingClientRect().width/2) {
    //   this.forwardSlide();
    // } else { 
    //   this.backSlide();
    // }
    if (dragShift > 20 && dragShift > 0) {
      this.backSlide();
    }
    if (dragShift < -20 && dragShift < 0) {
      this.forwardSlide();
    }
  }

  clickDots(e) {
    const dot = e.target.closest('button'); 
    if (!dot) {
      return;
    }
    let dotNumber;
    for (let i = 0; i < this.dot.length; i++) {
      if (this.dot[i] === dot) {
        dotNumber = i;
        break;
      }
    }
    if (dotNumber === this.currentSlide) {
      return;
    }
    this.currentSlide = dotNumber;
    this.changeActiveDotClass();
    this.changeCurrentSlide();
  }

  changeActiveDotClass() {
    for (let i = 0; i < this.dot.length; i++) {
      this.dot[i].classList.remove('gallery-dot-active');
    }
    this.dot[this.currentSlide].classList.add('gallery-dot-active');
  }

  changeCurrentSlide() {
    this.doSlideTransparent();
    this.elements[this.currentSlide].classList.remove('transparent');
  }

  autoplay(time = 2000) {
    this.interval = setInterval(this.forwardSlide, time);
  }

  autoplayStop() {
		clearInterval(this.interval);
	}

  pointAndRemove(elem) {
    elem.addEventListener('mouseover', this.autoplayStop);
    elem.addEventListener('mouseout', ()=> {
      console.log('play');
      this.autoplay();
    });
  }
}

function debounce(func, time = 100) {
  let timer;
  return function (e) {
    clearTimeout(timer);
    timer = setTimeout(func, time, e);
  }
}

new Gallery(document.getElementById('gallery'));