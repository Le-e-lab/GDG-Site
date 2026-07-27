import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Hero Image Rotator', () => {
  it('should increment slide index and roll over at end of images list', () => {
    let activeIndex = 0;
    const images = ['img1.jpg', 'img2.jpg', 'img3.jpg'];
    const nextSlide = () => {
      activeIndex = (activeIndex + 1) % images.length;
    };
    
    nextSlide();
    expect(activeIndex).toBe(1);
    nextSlide();
    expect(activeIndex).toBe(2);
    nextSlide();
    expect(activeIndex).toBe(0);
  });
});
