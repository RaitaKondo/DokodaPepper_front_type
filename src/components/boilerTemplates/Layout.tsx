import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Container } from 'react-bootstrap';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <Container className="my-4 flex-grow-1 d-flex justify-content-center">
        {children}
      </Container>
      <Footer />
    </div>
  );
};

export default Layout;
