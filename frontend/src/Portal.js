// Portal.js
import { createPortal } from 'react-dom';

const Portal = ({ children, targetId }) => {
  const targetElement = document.getElementById(targetId);
  return createPortal(children, targetElement);
};

export default Portal;
