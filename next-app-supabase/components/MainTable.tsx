"use client";

import type React from "react";
import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp, ChevronsUpDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  onBulkDelete?: (selectedIds: string[]) => void;
  rowsPerPage?: number;
  alertDialogDescription?: string;
}

export function DynamicTable({
  columns,
  data,
  className,
  basePath,
  onBulkDelete,
  rowsPerPage,
  alertDialogDescription,
}: DynamicTableProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: SortDirection;
  }>({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openDeleteAlertDialog, setOpenDeleteAlertDialog] = useState(false);

  // Auto rowsPerPage if not provided
  const estimatedRowHeight = 48;
  const headerOffset = 300;
  const [autoRowsPerPage, setAutoRowsPerPage] = useState(rowsPerPage ?? 10);

  useEffect(() => {
    if (rowsPerPage !== undefined) return;
    const computeRows = () => {
      const availableHeight = window.innerHeight - headerOffset;
      const rows = Math.floor(availableHeight / estimatedRowHeight);
      setAutoRowsPerPage(Math.max(1, rows));
    };
    computeRows();
    window.addEventListener("resize", computeRows);
    return () => window.removeEventListener("resize", computeRows);
  }, [rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current.key === key) {
        if (current.direction === "asc") return { key, direction: "desc" };
        if (current.direction === "desc") return { key: null, direction: null };
        return { key, direction: "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((row) =>
      Object.values(row)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return sortConfig.direction === "asc"
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
        ? 1
        : -1;
    });
  }, [filteredData, sortConfig]);

  const effectiveRowsPerPage = rowsPerPage ?? autoRowsPerPage;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * effectiveRowsPerPage;
    return sortedData.slice(start, start + effectiveRowsPerPage);
  }, [sortedData, currentPage, effectiveRowsPerPage]);

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key)
      return <ChevronsUpDown className="ml-1 h-4 w-4" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  const toggleSelectAll = (checked: boolean) => {
    const idsOnPage = paginatedData.map((row) => row.id);
    setSelectedIds((prev) => {
      const updated = new Set(prev);
      idsOnPage.forEach((id) =>
        checked ? updated.add(id) : updated.delete(id)
      );
      return updated;
    });
  };

  useEffect(() => {
    const totalPages = Math.ceil(sortedData.length / effectiveRowsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [sortedData, currentPage, effectiveRowsPerPage]);

  const isAllSelected = paginatedData.every((row) => selectedIds.has(row.id));

  const handleDelete = () => {
    setOpenDeleteAlertDialog(false);
    if (onBulkDelete && selectedIds.size > 0) {
      onBulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  return (
    <div className={cn("w-full overflow-auto", className)}>
      {/* Search and Delete Row */}
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm max-w-xs"
        />
        {selectedIds.size > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setOpenDeleteAlertDialog(true)}
            className="ml-4"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete ({selectedIds.size})
          </Button>
        )}
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={paginatedData.length === 0 ? false : isAllSelected}
                onCheckedChange={(val) => toggleSelectAll(Boolean(val))}
              />
            </TableHead>
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
          {paginatedData.length === 0 ? (
            <TableRow key={uuidv4()}>
              <TableCell
                colSpan={columns.length + 1}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((row, rowIndex) => (
              <TableRow key={row.id} className="cursor-pointer">
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(row.id)}
                    onCheckedChange={(val) => {
                      setSelectedIds((prev) => {
                        const updated = new Set(prev);
                        val ? updated.add(row.id) : updated.delete(row.id);
                        return updated;
                      });
                    }}
                  />
                </TableCell>
                {columns.map((column) => (
                  <TableCell
                    key={`${rowIndex}-${column.key}`}
                    className={column.className}
                    onClick={() => router.push(basePath + "/" + row.id)}
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

      {/* Pagination */}
      {sortedData.length > effectiveRowsPerPage && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from(
            { length: Math.ceil(sortedData.length / effectiveRowsPerPage) },
            (_, index) => (
              <Button
                key={index + 1}
                variant={index + 1 === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </Button>
            )
          )}
        </div>
      )}
      <AlertDialog
        open={openDeleteAlertDialog}
        onOpenChange={setOpenDeleteAlertDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {alertDialogDescription ??
                "This action cannot be undone. This will permanently delete the selected rows from our servers."}
            </AlertDialogDescription>
            <p>Selected: {selectedIds.size}</p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleDelete();
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
