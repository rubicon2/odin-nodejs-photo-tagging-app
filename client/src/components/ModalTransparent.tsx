import Modal from './Modal';
import styled from 'styled-components';

// The regular Modal just follows the standard background-color css rules
// and respects dark mode. I just want the background's opacity to change,
// not the text etc. as that makes it hard to read. The only way to do that
// is to copy across the colours from the css file and change the opacity
// value. Pretty terrible. If the css values change, then this will become
// incorrect. Thinking about this, the division of variables between styled
// components and the css files that cover the base styles - I think perhaps
// the solution is to make everything a styled component. So even the root
// styles that cover basic things like a css reset, css variables, and basic
// styling could go on some kind of root component. Styled components can add
// styling to <html> tag and <body> tag. Something to think about.
const ModalTransparent = styled(Modal)`
  background-color: #ffffffee;

  @media (prefers-color-scheme: dark) {
    background-color: #242424ee;
  }
`;

export default ModalTransparent;
