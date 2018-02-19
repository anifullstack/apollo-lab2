import { expect } from 'chai';
import { step } from 'mocha-steps';
import Renderer from '../../../testHelpers/Renderer';

describe('Karma UI works', () => {
  const renderer = new Renderer({});
  let app;
  let content;

  step('Karma page renders on mount', () => {
    app = renderer.mount();
    renderer.history.push('/karma');
    content = app.find('#content');
    expect(content).to.not.be.empty;
  });
});
