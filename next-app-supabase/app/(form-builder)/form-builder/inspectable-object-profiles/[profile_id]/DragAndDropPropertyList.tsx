"use client";

import { useEffect, useState } from "react";
import { Reorder } from "framer-motion";
import { IInspectableObjectProfilePropertyResponse } from "@/lib/database/form-builder/formBuilderInterfaces";
import { updateProfileProperty } from "./actions";

// Helper function to update order numbers

const debounce = (func: Function, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

interface DragAndDropPropertyListProps {
  propertyList: IInspectableObjectProfilePropertyResponse[];
  setPropertyList: React.Dispatch<
    React.SetStateAction<IInspectableObjectProfilePropertyResponse[]>
  >;
}

export const DragAndDropPropertyList = ({
  propertyList,
  setPropertyList,
}: DragAndDropPropertyListProps) => {
  useEffect(() => {
    console.log("items", propertyList);
  }, [propertyList]);

  const updateOrderInDB = async (
    updatedItems: IInspectableObjectProfilePropertyResponse[]
  ) => {
    const {
      updatedInspectableObjectProfilePropertys,
      updatedInspectableObjectProfilePropertysError,
    } = await updateProfileProperty(updatedItems);
  };

  const debouncedUpdate = debounce(updateOrderInDB, 500);

  const handleReorder = (
    newOrder: IInspectableObjectProfilePropertyResponse[]
  ) => {
    const updatedItems = reorderItems(newOrder);
    setPropertyList(updatedItems);
    debouncedUpdate(updatedItems);
  };

  const reorderItems = (
    newOrder: IInspectableObjectProfilePropertyResponse[]
  ) => {
    return newOrder.map((item, index) => ({
      ...item,
      order_number: index + 1, // Assign new order_number
    }));
  };

  function compare(
    a: IInspectableObjectProfilePropertyResponse,
    b: IInspectableObjectProfilePropertyResponse
  ) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }

  return (
    <div className="flex justify-center">
      <Reorder.Group
        axis="y"
        values={propertyList}
        onReorder={handleReorder}
        className="space-y-2 "
      >
        {propertyList.sort(compare).map((item) => (
          <Reorder.Item
            key={item.id}
            value={item}
            className="flex items-center bg-white border p-4 rounded-md shadow cursor-grab space-x-4"
            whileDrag={{ scale: 1.05 }}
            dragConstraints={{ top: 0, bottom: 0 }}
          >
            <span className="text-gray-500 font-bold w-6">
              {item.order_number}.
            </span>
            <span>{item.name}</span>
            <p className="text-sm text-slate-600">{item.description}</p>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
};
