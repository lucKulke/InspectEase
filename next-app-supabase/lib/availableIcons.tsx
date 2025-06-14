import {
  Bike,
  Car,
  Truck,
  Bus,
  Train,
  Plane,
  Ship,
  Tractor,
  Rocket,
  TramFront,
  CableCar,
  CarFront,
  BusFront,
  ParkingCircle,
  KeyRound,
  CircleHelp,
} from "lucide-react";

export type IconType =
  | "default"
  | "car"
  | "truck"
  | "motorbike"
  | "bus"
  | "train"
  | "plane"
  | "ship"
  | "tractor"
  | "rocket"
  | "tram"
  | "cablecar"
  | "carFront"
  | "busFront"
  | "parking"
  | "key";

export const profileIcons = {
  default: <CircleHelp />,
  car: <Car />,
  truck: <Truck />,
  motorbike: <Bike />,
  bus: <Bus />,
  train: <Train />,
  plane: <Plane />,
  ship: <Ship />,
  tractor: <Tractor />,
  rocket: <Rocket />,
  tram: <TramFront />,
  cablecar: <CableCar />,
  carFront: <CarFront />,
  busFront: <BusFront />,
  parking: <ParkingCircle />,

  key: <KeyRound />,
};
