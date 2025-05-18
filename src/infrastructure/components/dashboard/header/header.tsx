import React from "react";
import SearchDasboardh from "../searchCommand";
import { NavUser } from "./nav-user";
import { Bells } from "./bells";
import { Mode } from "./mode";

function Header() {

  return (
    <div className="flex  bg-white dark:bg-gray-800 w-full p-6  items-end justify-end gap-4 ">
      <SearchDasboardh />
      <Mode />
      <Bells />
      <NavUser />
    </div>
  );
}

export default Header;
