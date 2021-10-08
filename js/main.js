const galleryClassName = 'gallery',
  galleryDraggableClassName = 'gallery-draggable',
  galleryLineClassName = 'gallery-line',
  gallerySlideClassName = 'gallery-slide';
class Gallery {
  constructor(element, options = {}) {
    this.container = element;
    this.size = element.childElementCount;
    this.currentSlide = 0;
    this.currentSlideWasChanged = false;
    this.settings = {
      margin: options.margin || 0
    }

    this.manageHTML = this.manageHTML.bind(this);
    this.setParameters = this.setParameters.bind(this);
    this.setEvents = this.setEvents.bind(this);
    this.resizeGallery = this.resizeGallery.bind(this);
    this.startDrag = this.startDrag.bind(this);
    this.stopDrag = this.stopDrag.bind(this);
    this.dragging = this.dragging.bind(this);
    this.setStylePosition = this.setStylePosition.bind(this);
    this.manageHTML();
    this.setParameters();
    this.setEvents();
  }

  manageHTML() {
    this.container.classList.add(galleryClassName);
    this.container.innerHTML = `
      <div class="${galleryLineClassName}">
        ${this.container.innerHTML}
      </div>
    `;
    this.line = this.container.querySelector(`.${galleryLineClassName}`);
    this.slides = Array.from(this.line.children).map(item => 
      wrapElementByDiv ({
        element: item,
        className: gallerySlideClassName
      })
    );
  }


  setParameters() {
    const slidesContainer = this.container.getBoundingClientRect();
    this.width = slidesContainer.width;
    this.maximumX = -(this.size - 1) * (this.width + this.settings.margin);
    this.x = -this.currentSlide * (this.width + this.settings.margin);
    this.line.style.width = `${this.size * (this.width + this.settings.margin)}px`;
    this.setStylePosition();
    [...this.slides].forEach(slide => {
      slide.style.width = `${this.width}px`;
      slide.style.marginRight = `${this.settings.margin}px`;
    })
  }

  setEvents() {
    this.debouncedResizeGallery =  debounce(this.resizeGallery);
    window.addEventListener('resize', debounce(this.resizeGallery));
    this.line.addEventListener('pointerdown', this.startDrag);
    window.addEventListener('pointerup', this.stopDrag);
    window.addEventListener('pointercancel', this.stopDrag);
  }

  destroyEvents() {
    window.removeEventListener('resize', this.debouncedResizeGallery);
    this.line.removeEventListener('pointerdown', this.startDrag);
    window.removeEventListener('pointerup', this.stopDrag);
    window.removeEventListener('pointercancel', this.stopDrag);
  }

  resizeGallery() {
    this.setParameters();
  }

  startDrag(position) {
    this.currentSlideWasChanged = false;
    this.clickX = position.pageX;
    this.startX = this.x;
    this.resetStyleTransition();
    this.container.classList.add(galleryDraggableClassName);
    window.addEventListener('pointermove', this.dragging);
  }

  stopDrag() {
    this.container.classList.remove(galleryDraggableClassName);
    window.removeEventListener('pointermove', this.dragging);
    this.x = -this.currentSlide * (this.width + this.settings.margin);
    this.setStylePosition();
    this.setStyleTransition();
  }

  dragging(position) {
    this.dragX = position.pageX;
    const dragShift = this.dragX - this.clickX;
    const easing = dragShift / 5;
    this.x = Math.max(Math.min(this.startX + dragShift, easing), this.maximumX + easing);
    this.setStylePosition();

    // change active slide whole
    if (dragShift > 20 && dragShift > 0 && !this.currentSlideWasChanged && this.currentSlide > 0) {
      this.currentSlideWasChanged = true;
      this.currentSlide--;
    }
    if (dragShift < -20 && dragShift < 0 && !this.currentSlideWasChanged && this.currentSlide < this.size - 1) {
      this.currentSlideWasChanged = true;
      this.currentSlide++;
    }
  }

  setStylePosition() {
    this.line.style.transform = `translate3d(${this.x}px, 0, 0)`;
  }

  setStyleTransition () {
    this.line.style.transition = `all .25s ease 0s`;
  }

  resetStyleTransition() {
    this.line.style.transition = `all 0s ease 0s`;
  }
}

function wrapElementByDiv({element, className}) {
  const wrapper = document.createElement('div');
  wrapper.classList.add(className);
  element.parentNode.insertBefore(wrapper, element);
  wrapper.appendChild(element);
  return wrapper;
}

function debounce(func, time = 100) {
  let timer;
  return function (e) {
    clearTimeout(timer);
    timer = setTimeout(func, time, e);
  }
}

new Gallery(document.getElementById('gallery'), {
  margin: 20
});