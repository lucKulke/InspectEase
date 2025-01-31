import { Bike, Car, CircleHelp, Truck } from "lucide-react";

export type IconType = "default" | "car" | "truck" | "motorbike";

export const profileIcons = {
  default: <CircleHelp />,
  car: <Car />,
  truck: <Truck />,
  motorbike: <Bike />,
};
