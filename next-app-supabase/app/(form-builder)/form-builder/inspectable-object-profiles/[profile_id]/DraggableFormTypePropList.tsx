"use client";

import { useEffect, useState } from "react";
import { Reorder } from "framer-motion";
import {
  IInspectableObjectProfileFormTypePropertyResponse,
  IInspectableObjectProfileFormTypePropertyInsert,
  IInspectableObjectProfileObjPropertyResponse,
  IInspectableObjectProfileFormTypeResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import {
  updateProfileFormProperty,
  deleteProfileFormProperty,
  fetchFormTypeProps,
  createFormTypeProp,
  deleteFormTypeProp,
  deleteFormType,
} from "./actions";
import { useNotification } from "@/app/context/NotificationContext";
import { Ellipsis, GripHorizontal, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UUID } from "crypto";
import { updateProfileFormTypeProps } from "./actions";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";
import { useRouter } from "next/navigation";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

// Helper function to update order numbers

const debounce = (func: Function, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

interface DraggableFormTypePropListProps {
  type: IInspectableObjectProfileFormTypeResponse;
}

export const DraggableFormTypePropList = ({
  type,
}: DraggableFormTypePropListProps) => {
  const { showNotification } = useNotification();
  const router = useRouter();

  const [formTypeProps, setFormTypeProps] = useState<
    IInspectableObjectProfileFormTypePropertyResponse[]
  >([]);
  const [spinnerActive, setSpinnerActive] = useState<boolean>(true);
  const [openCreateFormTypePropDialog, setOpenCreateFormTypePropDialog] =
    useState<boolean>(false);

  const [newTypePropertyName, setNewTypePropertyName] = useState<string>("");
  const [newTypePropertyDescription, setNewTypePropertyDescription] =
    useState<string>("");

  const fetchformTypeProperties = async () => {
    const {
      inspectableObjectProfileFormTypeProps,
      inspectableObjectProfileFormTypePropsError,
    } = await fetchFormTypeProps(type.id);

    if (inspectableObjectProfileFormTypePropsError) {
      showNotification(
        "Fetch form type props",
        `Error: ${inspectableObjectProfileFormTypePropsError.message} (${inspectableObjectProfileFormTypePropsError.code})`,
        "error"
      );
    }
    if (inspectableObjectProfileFormTypeProps) {
      setFormTypeProps(inspectableObjectProfileFormTypeProps);

      setSpinnerActive(false);
    }
  };

  useEffect(() => {
    fetchformTypeProperties();
  }, []);

  const handleCreateFormTypeProp = async (
    formTypeProp: IInspectableObjectProfileFormTypePropertyInsert
  ) => {
    const {
      inspectableObjectProfileFormTypeProp,
      inspectableObjectProfileFormTypePropError,
    } = await createFormTypeProp(formTypeProp);
    if (inspectableObjectProfileFormTypePropError) {
    } else if (inspectableObjectProfileFormTypeProp) {
      setFormTypeProps([
        ...formTypeProps,
        inspectableObjectProfileFormTypeProp,
      ]);
      router.refresh();
    }
  };

  const updateOrderInDB = async (
    updatedItems: IInspectableObjectProfileFormTypePropertyResponse[]
  ) => {
    const {
      updatedInspectableObjectProfileFormTypeProperty,
      updatedInspectableObjectProfileFormTypePropertyError,
    } = await updateProfileFormTypeProps(updatedItems);

    if (updatedInspectableObjectProfileFormTypePropertyError) {
      showNotification(
        "Form property order",
        `Error: ${updatedInspectableObjectProfileFormTypePropertyError.message} (${updatedInspectableObjectProfileFormTypePropertyError.code})`,
        "error"
      );
    }
    router.refresh();
  };

  const debouncedUpdate = debounce(updateOrderInDB, 500);

  const handleReorder = (
    newOrder: IInspectableObjectProfileFormTypePropertyResponse[]
  ) => {
    const updatedItems = reorderItems(newOrder);
    setFormTypeProps(updatedItems);
    debouncedUpdate(updatedItems);
  };

  const reorderItems = (
    newOrder: IInspectableObjectProfileFormTypePropertyResponse[]
  ) => {
    return newOrder.map((item, index) => ({
      ...item,
      order_number: index + 1, // Assign new order_number
    }));
  };

  function compare(
    a: IInspectableObjectProfileFormTypePropertyResponse,
    b: IInspectableObjectProfileFormTypePropertyResponse
  ) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }

  const handleDeleteProperty = async (propertyId: UUID) => {
    const {
      deletedInspectableObjectProfileFormTypeProperty,
      deletedInspectableObjectProfileFormTypePropertyError,
    } = await deleteFormTypeProp(propertyId);
    if (deletedInspectableObjectProfileFormTypePropertyError) {
      showNotification(
        "Delete form type property",
        `Error: ${deletedInspectableObjectProfileFormTypePropertyError.message} (${deletedInspectableObjectProfileFormTypePropertyError.code})`,
        "error"
      );
      return;
    }

    if (!deletedInspectableObjectProfileFormTypeProperty) return;
    setFormTypeProps(
      formTypeProps.filter(
        (prop) => prop.id !== deletedInspectableObjectProfileFormTypeProperty.id
      )
    );

    const updatedList = formTypeProps
      .filter(
        (prop) => prop.id !== deletedInspectableObjectProfileFormTypeProperty.id
      )
      .map((item, index) => ({
        ...item,
        order_number: index + 1, // Ensure sequential order numbers
      }));

    setFormTypeProps(updatedList);
    await updateOrderInDB(updatedList);

    showNotification(
      "Delete form type property",
      `Successfully deleted property '${deletedInspectableObjectProfileFormTypeProperty.name}' with id '${deletedInspectableObjectProfileFormTypeProperty.id}'`,
      "info"
    );
    router.refresh();
  };

  return (
    <div>
      <div className="p-2">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-slate-700">Properties</p>
          <Button onClick={() => setOpenCreateFormTypePropDialog(true)}>
            Create
          </Button>
        </div>
        {spinnerActive ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={formTypeProps}
            onReorder={handleReorder}
            className="space-y-2 p-2 "
          >
            {formTypeProps.sort(compare).map((item) => (
              <Reorder.Item
                key={item.id}
                value={item}
                className=" "
                whileDrag={{ scale: 1.0 }}
                dragConstraints={{ top: 0, bottom: 0 }}
              >
                <ContextMenu>
                  <ContextMenuTrigger className="flex items-center justify-between bg-white border p-4 rounded-md shadow cursor-grab">
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-500 font-bold w-6">
                        {item.order_number}.
                      </span>
                      <span>{item.name}</span>
                    </div>
                    <GripHorizontal></GripHorizontal>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      className="text-red-600 flex justify-between"
                      onClick={() => handleDeleteProperty(item.id)}
                    >
                      <p>delete </p>
                      <Trash2 size={20}></Trash2>
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>
      <Dialog
        open={openCreateFormTypePropDialog}
        onOpenChange={setOpenCreateFormTypePropDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add property</DialogTitle>
            <DialogDescription>Add a new profile property</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newTypePropertyName" className="text-right">
                Name
              </Label>
              <Input
                id="newTypePropertyName"
                value={newTypePropertyName} // Controlled input
                onChange={(e) => setNewTypePropertyName(e.target.value)} // Update state on input change
                className="col-span-3"
              />
              <Label
                htmlFor="newTypePropertyDescription"
                className="text-right"
              >
                Description
              </Label>
              <Input
                id="newTypePropertyDescription"
                value={newTypePropertyDescription} // Controlled input
                onChange={(e) => setNewTypePropertyDescription(e.target.value)} // Update state on input change
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            {newTypePropertyName.length > 1 &&
            newTypePropertyDescription.length > 1 ? (
              <Button
                onClick={() => {
                  handleCreateFormTypeProp({
                    name: newTypePropertyName,
                    description: newTypePropertyDescription,
                    form_type_id: type.id,
                    order_number: formTypeProps.length + 1,
                  });
                }}
              >
                Save changes
              </Button>
            ) : (
              <Button disabled variant="outline">
                Save changes
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
