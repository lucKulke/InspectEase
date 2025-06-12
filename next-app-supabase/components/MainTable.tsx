"use client";

import type React from "react";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type ColumnDef = {
  key: string;
  header: string;
  cell?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
  className?: string;
};

type SortDirection = "asc" | "desc" | null;

interface DynamicTableProps {
  columns: ColumnDef[];
  data: Record<string, any>[];
  className?: string;
  basePath: string;
}

export function DynamicTable({
  columns,
  data,
  className,
  basePath,
}: DynamicTableProps) {
  const router = useRouter();

  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: SortDirection;
  }>({
    key: null,
    direction: null,
  });

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current.key === key) {
        // Cycle through: asc -> desc -> null
        if (current.direction === "asc") {
          return { key, direction: "desc" };
        } else if (current.direction === "desc") {
          return { key: null, direction: null };
        } else {
          return { key, direction: "asc" };
        }
      }
      // New column, start with ascending
      return { key, direction: "asc" };
    });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (sortConfig.direction === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [data, sortConfig]);

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <ChevronsUpDown className="ml-1 h-4 w-4" />;
    }

    return sortConfig.direction === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  return (
    <div className={cn("w-full overflow-auto", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={cn(column.className)}>
                {column.sortable !== false ? (
                  <div
                    className={`flex ${
                      column.className?.includes("text-left") ||
                      !column.className
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 data-[state=open]:bg-accent flex items-center font-medium"
                      onClick={() => handleSort(column.key)}
                    >
                      {column.header}
                      {getSortIcon(column.key)}
                    </Button>
                  </div>
                ) : (
                  column.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                onClick={() => router.push(basePath + "/" + row.id)}
              >
                {columns.map((column) => (
                  <TableCell
                    key={`${rowIndex}-${column.key}`}
                    className={column.className}
                  >
                    {column.cell
                      ? column.cell(row[column.key], row)
                      : row[column.key] !== undefined &&
                        row[column.key] !== null
                      ? String(row[column.key])
                      : ""}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
