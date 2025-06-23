import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { useAuthContext } from "../AuthContext";

const Header: React.FC = () => {
  const { isAuthenticated, user } = useAuthContext();
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="fixed-top">
      <Container>
        <Navbar.Brand as={NavLink} to="/">
          DokodaPepper
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            {isAuthenticated ? (
              <Nav.Link as={NavLink} to="/" end>
                Home
              </Nav.Link>
            ) : (
              <Nav.Link as={NavLink} to="/login" end>
                Login
              </Nav.Link>
            )}
            {isAuthenticated ?? (
              <Nav.Link as={NavLink} to="/post_new" end>
                Post New
              </Nav.Link>
            )}

            {isAuthenticated ? (
              <Nav.Link as={NavLink} to="/logout">
                Logout
              </Nav.Link>
            ) : (
              <Nav.Link as={NavLink} to="/register" end>
                Register
              </Nav.Link>
            )}
          </Nav>
          {isAuthenticated && (
            <Nav className="ms-auto">
              <span className="navbar-text text-white">
                {user?.username} でログイン中
              </span>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
