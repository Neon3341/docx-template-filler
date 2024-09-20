import React from "react";
import {
  HashRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";

// Global Elements
import LeftMenu from "./left-menu";


// Pages
import Home from "./pages/home";
import Editor from "./pages/editor";
import Options from "./pages/options";

// Styles
import "./App.scss";


function AnimatedRoutes() {
  const location = useLocation();
  return (
    <TransitionGroup>
      <CSSTransition key={location.key} classNames="fade" timeout={1000}>
        <Routes location={location}>
          <Route exact path="/" element={<Home />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/options" element={<Options />} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
}


function App() {

  return (
    <Router>
      <div id="wrapper" >
        <header id="header">
          <LeftMenu />
        </header>
        <main id="content" className="scrollable">
          <AnimatedRoutes />
        </main>
      </div>
    </Router>
  );
}

export default App;
