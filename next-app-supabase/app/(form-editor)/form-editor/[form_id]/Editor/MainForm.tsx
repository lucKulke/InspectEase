import React from "react";
import { SideBar } from "./SideBar";

export const MainForm = () => {
  return (
    <div className="flex h-screen p-4">
      <div className="flex flex-1 overflow-hidden bg-white rounded-lg shadow-lg ">
        <SideBar></SideBar>
        <div className="flex-1 bg-gray-100 p-4 overflow-y-auto">Editor</div>
      </div>
    </div>
  );
};
