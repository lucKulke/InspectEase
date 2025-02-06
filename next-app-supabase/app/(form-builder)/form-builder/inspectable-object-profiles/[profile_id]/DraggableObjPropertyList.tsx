"use client";

import { useEffect, useState } from "react";
import { Reorder } from "framer-motion";
import { IInspectableObjectProfileObjPropertyResponse } from "@/lib/database/form-builder/formBuilderInterfaces";
import { deleteProfileObjProperty, updateProfileObjProperty } from "./actions";
import { useNotification } from "@/app/context/NotificationContext";
import { Ellipsis, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UUID } from "crypto";

// Helper function to update order numbers

const debounce = (func: Function, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

interface DraggableObjPropertyListProps {
  propertyList: IInspectableObjectProfileObjPropertyResponse[];
  setPropertyList: React.Dispatch<
    React.SetStateAction<IInspectableObjectProfileObjPropertyResponse[]>
  >;
}

export const DraggableObjPropertyList = ({
  propertyList,
  setPropertyList,
}: DraggableObjPropertyListProps) => {
  const { showNotification } = useNotification();

  const updateOrderInDB = async (
    updatedItems: IInspectableObjectProfileObjPropertyResponse[]
  ) => {
    const {
      updatedInspectableObjectProfileObjPropertys,
      updatedInspectableObjectProfileObjPropertysError,
    } = await updateProfileObjProperty(updatedItems);

    if (updatedInspectableObjectProfileObjPropertysError) {
      showNotification(
        "Obj property order",
        `Error: ${updatedInspectableObjectProfileObjPropertysError.message} (${updatedInspectableObjectProfileObjPropertysError.code})`,
        "error"
      );
    }
  };

  const debouncedUpdate = debounce(updateOrderInDB, 500);

  const handleReorder = (
    newOrder: IInspectableObjectProfileObjPropertyResponse[]
  ) => {
    const updatedItems = reorderItems(newOrder);
    setPropertyList(updatedItems);
    debouncedUpdate(updatedItems);
  };

  const reorderItems = (
    newOrder: IInspectableObjectProfileObjPropertyResponse[]
  ) => {
    return newOrder.map((item, index) => ({
      ...item,
      order_number: index + 1, // Assign new order_number
    }));
  };

  function compare(
    a: IInspectableObjectProfileObjPropertyResponse,
    b: IInspectableObjectProfileObjPropertyResponse
  ) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }

  const handleDeleteProperty = async (propertyId: UUID) => {
    const {
      deletedInspectableObjectProfileObjProperty,
      deletedInspectableObjectProfileObjPropertyError,
    } = await deleteProfileObjProperty(propertyId);
    if (deletedInspectableObjectProfileObjPropertyError) {
      showNotification(
        "Delete property",
        `Error: ${deletedInspectableObjectProfileObjPropertyError.message} (${deletedInspectableObjectProfileObjPropertyError.code})`,
        "error"
      );
      return;
    }
    showNotification(
      "Delete property",
      `Successfully deleted property '${deletedInspectableObjectProfileObjProperty.name}' with id '${deletedInspectableObjectProfileObjProperty.id}'`,
      "info"
    );

    const updatedList = propertyList
      .filter(
        (prop) => prop.id !== deletedInspectableObjectProfileObjProperty.id
      )
      .map((item, index) => ({
        ...item,
        order_number: index + 1, // Ensure sequential order numbers
      }));

    setPropertyList(updatedList);
    await updateOrderInDB(updatedList);
  };

  return (
    <div>
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
            className="flex items-center justify-between bg-white border p-4 rounded-md shadow cursor-grab "
            whileDrag={{ scale: 1.05 }}
            dragConstraints={{ top: 0, bottom: 0 }}
          >
            <div className="flex items-center space-x-4">
              <span className="text-gray-500 font-bold w-6">
                {item.order_number}.
              </span>
              <span>{item.name}</span>
              <p className="text-sm text-slate-600">{item.description}</p>
            </div>

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger>
                <Ellipsis className="text-slate-500 "></Ellipsis>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => handleDeleteProperty(item.id)}
                >
                  delete <Trash2></Trash2>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
};
