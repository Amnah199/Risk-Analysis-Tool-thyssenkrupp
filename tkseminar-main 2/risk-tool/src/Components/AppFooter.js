import { Container, Navbar, NavbarBrand, Image } from "react-bootstrap";
import tklogo from "../Media/wwu_logo.png";

function AppFooter() {
  return (
    <div className="fixed-bottom">
      <Navbar bg="dark" variant="dark">
        <Container>
          <NavbarBrand>
            <Image src={tklogo} style={{ height: "40px" }} responsive></Image>
          </NavbarBrand>
          <Navbar.Text>Copyright © {new Date().getFullYear()}</Navbar.Text>
        </Container>
      </Navbar>
    </div>
  );
}
export default AppFooter;
