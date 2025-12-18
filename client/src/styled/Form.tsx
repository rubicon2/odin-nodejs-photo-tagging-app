// For basically a standard kind of form, with a grid based layout, and inputs
// nested within labels. So we can use and have an immediate result that doesn't
// look terrible.
import * as breakpoints from '../breakpoints';
import styled from 'styled-components';

const Form = styled.form`
  display: grid;
  grid-auto-rows: min-content;
  gap: 1rem 0;

  fieldset {
    display: grid;
    grid-auto-rows: min-content;
    gap: 1rem;
  }

  label {
    display: grid;
    grid-template-rows: min-content 1fr;
  }

  @media (min-width: ${breakpoints.tablet}) {
    label {
      grid-template-rows: 1fr;
      grid-template-columns: 1fr 1fr;
    }
  }
`;

export default Form;
