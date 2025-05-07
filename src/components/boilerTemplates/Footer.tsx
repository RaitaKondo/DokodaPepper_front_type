import React from 'react';
import { Container } from 'react-bootstrap';

const Footer: React.FC = () => {
  return (
    <footer className="bg-light py-3 mt-auto">
      <Container className="text-center">
        <small>&copy; {new Date().getFullYear()} DokodaPepper. All rights reserved.</small>
      </Container>
    </footer>
  );
};

export default Footer;
