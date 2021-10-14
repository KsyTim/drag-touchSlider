const galleryClassName = 'gallery',
  galleryDraggableClassName = 'gallery-draggable',
  galleryLineClassName = 'gallery-line',
  galleryLineContainerClassName = 'gallery-line-container',
  gallerySlideClassName = 'gallery-slide',
  galleryDotsClassName = 'gallery-dots',
  galleryDotClassName = 'gallery-dot',
  galleryDotActiveClassName = 'gallery-dot-active',
  galleryArrowsClassName = 'gallery-arrows',
  galleryArrowLeftClassName = 'gallery-arrow_left',
  galleryArrowRightClassName = 'gallery-arrow_right',
  galleryArrowDisableClassName = 'gallery-arrow-disabled';
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
    this.clickDots = this.clickDots.bind(this);
    this.moveToLeft = this.moveToLeft.bind(this);
    this.moveToRight = this.moveToRight.bind(this);
    this.changeCurrentSlide = this.changeCurrentSlide.bind(this);
    this.changeActiveDotClass = this.changeActiveDotClass.bind(this);
    this.addDisabledClass = this.addDisabledClass.bind(this);
    this.autoplay = this.autoplay.bind(this);
    this.autoplayStop = this.autoplayStop.bind(this);
    this.infinitySlider = this.infinitySlider.bind(this);
    this.manageHTML();
    this.setParameters();
    this.setEvents();
    this.autoplay();
  }

  manageHTML() {
    this.container.classList.add(galleryClassName);
    this.container.innerHTML = `
      <div class="${galleryLineContainerClassName}">
        <div class="${galleryLineClassName}">
          ${this.container.innerHTML}
        </div>
      </div>
      <div class="${galleryArrowsClassName}">
        <button class="${galleryArrowLeftClassName}">Left</button>
        <button class="${galleryArrowRightClassName}">Right</button>
      </div>
      <div class="${galleryDotsClassName}"></div>
    `;
    this.lineContainer = this.container.querySelector(`.${galleryLineContainerClassName}`); 
    this.line = this.container.querySelector(`.${galleryLineClassName}`);
    this.dots = this.container.querySelector(`.${galleryDotsClassName}`);
    this.slides = Array.from(this.line.children).map(item => 
      wrapElementByDiv ({
        element: item,
        className: gallerySlideClassName
      })
    );
    for (let i = 0; i < this.size; i++) {
      this.dots.insertAdjacentHTML('beforeend', `<button class="${galleryDotClassName} ${i === this.currentSlide ? galleryDotActiveClassName : ''}"></button>`)
    } 
    this.dot = this.dots.querySelectorAll(`.${galleryDotClassName}`);
    this.arrowLeft = this.container.querySelector(`.${galleryArrowLeftClassName}`);
    this.arrowRight = this.container.querySelector(`.${galleryArrowRightClassName}`);
    this.slidesImg = this.container.querySelectorAll('.slide img');
  }


  setParameters() {
    const slidesLineContainer = this.lineContainer.getBoundingClientRect();
    this.width = slidesLineContainer.width;
    // this.width = Math.floor(slidesLineContainer.width + slidesLineContainer.y);
    // console.log(window.innerWidth);
    this.maximumX = -(this.size - 1) * (this.width + this.settings.margin);
    this.x = -this.currentSlide * (this.width + this.settings.margin);
    this.resetStyleTransition();
    this.line.style.width = `${this.size * (this.width + this.settings.margin)}px`;
    this.setStylePosition();
    this.changeActiveDotClass();
    this.addDisabledClass();
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
    this.dots.addEventListener('click', this.clickDots);
    this.arrowLeft.addEventListener('click', this.moveToLeft);
    this.arrowRight.addEventListener('click', this.moveToRight);
    this.pointAndRemove(this.arrowLeft);
    this.pointAndRemove(this.arrowRight);
    this.pointAndRemove(this.dots);
    this.slidesImg.forEach(elem => {
      this.pointAndRemove(elem);
    });
  }

  destroyEvents() {
    window.removeEventListener('resize', this.debouncedResizeGallery);
    this.line.removeEventListener('pointerdown', this.startDrag);
    window.removeEventListener('pointerup', this.stopDrag);
    window.removeEventListener('pointercancel', this.stopDrag);
    this.dots.removeEventListener('click', this.clickDots);
    this.arrowLeft.removeEventListener('click', this.moveToLeft);
    this.arrowRight.removeEventListener('click', this.moveToRight);
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
    window.removeEventListener('pointermove', this.dragging);
    this.container.classList.remove(galleryDraggableClassName);
    this.changeCurrentSlide();    
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

  setStyleTransition (countSwipes = 1) {
    this.line.style.transition = `all ${0.25 * countSwipes}s ease 0s`;
  }

  resetStyleTransition() {
    this.line.style.transition = `all 0s ease 0s`;
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
    // пропорциональная скорость передвижения между слайами при клике на навигационные "точечки"
    const countSwipes = Math.abs(this.currentSlide - dotNumber);
    this.currentSlide = dotNumber;
    this.changeCurrentSlide(countSwipes);
  }

  moveToLeft() {
    if(this.currentSlide <= 0) {
      this.currentSlide = this.size;
      this.infinitySlider(this.currentSlide-1, -4170);
      this.currentSlide--;
      return;
    }
    this.currentSlide--;
    this.changeCurrentSlide();
  }

  moveToRight() {
    if(this.currentSlide >= this.size - 1) {
      this.currentSlide = -1; 
      this.infinitySlider(this.currentSlide+1, 0);
      this.currentSlide++;
      return;
    }
    this.currentSlide++;
    this.changeCurrentSlide();
  }

  infinitySlider(arg, position) {
    this.line.style.transform = `translate3d(${position}px, 0, 0)`;
    this.line.style.transition = `all 0.001s ease 0s`;
    for (let i = 0; i < this.dot.length; i++) {
      this.dot[i].classList.remove(galleryDotActiveClassName);
    }
    this.dot[arg].classList.add(galleryDotActiveClassName);
  }

  changeCurrentSlide(countSwipes) {
    this.x = -this.currentSlide * (this.width + this.settings.margin);
    this.setStylePosition();
    this.setStyleTransition(countSwipes);
    this.changeActiveDotClass();
    // this.addDisabledClass();
  }

  addDisabledClass() {
    if (this.currentSlide <= 0) {
      this.arrowLeft.classList.add(galleryArrowDisableClassName);
    } else {
      this.arrowLeft.classList.remove(galleryArrowDisableClassName);
    }
    if (this.currentSlide >= this.size - 1) {
      this.arrowRight.classList.add(galleryArrowDisableClassName);
    } else {
      this.arrowRight.classList.remove(galleryArrowDisableClassName);
    }
  }

  changeActiveDotClass() {
    for (let i = 0; i < this.dot.length; i++) {
      this.dot[i].classList.remove(galleryDotActiveClassName);
    }
    this.dot[this.currentSlide].classList.add(galleryDotActiveClassName);
  }

  autoplay(time = 2000) {
    this.interval = setInterval(this.moveToRight, time);
  }

  autoplayStop() {
		clearInterval(this.interval);
	}

  pointAndRemove(elem) {
    elem.addEventListener('mouseover', this.autoplayStop);
    elem.addEventListener('mouseout', ()=> {
      this.autoplay();
    });
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
  margin: 50
});