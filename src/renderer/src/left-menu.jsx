import React from "react";
import { NavLink } from "react-router-dom";

const LeftMenu = () => {
  return (
    <div id="left-menu">
      <ul>
        <li>
          <NavLink to="/">Главная</NavLink>
        </li>
        <li>
          <NavLink to="/editor">Редактор</NavLink>
        </li>
        <li>
          <NavLink to="/options">Настройки</NavLink>
        </li>
      </ul>
    </div>
  );
};

export default LeftMenu;
