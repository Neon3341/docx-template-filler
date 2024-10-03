import React from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
const LeftMenu = () => {

  const curDocName = useSelector((state) => state.CurDoc.name);
  const curDocPath = useSelector((state) => state.CurDoc.path);
  const docSerName = useSelector((state) => state.DocSer.name);
  const docSerFields = useSelector((state) => state.DocSer.fields);

 

  return (
    <div id="left-menu">
      <ul>
        <li>
          <NavLink to="/">Вернуться на главную</NavLink>
        </li>       
      </ul>
    </div>
  );
};

export default LeftMenu;
