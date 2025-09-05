import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { getPaginationInfo, type PaginationResponse } from "@/hooks/usePagination";

interface PaginationControlsProps<T> {
  data: PaginationResponse<T>;
  currentPage: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  showLimitSelector?: boolean;
  limitOptions?: number[];
  className?: string;
}

export function PaginationControls<T>({
  data,
  currentPage,
  onPageChange,
  onLimitChange,
  showLimitSelector = true,
  limitOptions = [10, 20, 50, 100],
  className = "",
}: PaginationControlsProps<T>) {
  const info = getPaginationInfo(data);

  if (info.totalItems === 0) return null;

  return (
    <div className={`flex items-center justify-between space-x-4 ${className}`}>
      {/* Results Info */}
      <div className="text-sm text-gray-600">
        Showing {info.startItem} to {info.endItem} of {info.totalItems} results
      </div>

      <div className="flex items-center space-x-4">
        {/* Page Size Selector */}
        {showLimitSelector && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Show:</span>
            <Select
              value={data.pagination.limit.toString()}
              onValueChange={(value) => onLimitChange(parseInt(value))}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {limitOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Page Navigation */}
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={info.isFirstPage}
            className="h-8 w-8 p-0"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!info.hasPrevPage}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-1">
            {getPageNumbers(currentPage, info.totalPages).map((pageNum, index) => (
              pageNum === "..." ? (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                  ...
                </span>
              ) : (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum as number)}
                  className="h-8 w-8 p-0"
                >
                  {pageNum}
                </Button>
              )
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!info.hasNextPage}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(info.totalPages)}
            disabled={info.isLastPage}
            className="h-8 w-8 p-0"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Page Info */}
        <div className="text-sm text-gray-600">
          Page {currentPage} of {info.totalPages}
        </div>
      </div>
    </div>
  );
}

// Helper function to generate page numbers with ellipsis
function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  const pages: (number | string)[] = [];
  
  if (totalPages <= 7) {
    // Show all pages if there are 7 or fewer
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);
    
    if (currentPage <= 4) {
      // Show pages 1-5 and ellipsis + last page
      for (let i = 2; i <= 5; i++) {
        pages.push(i);
      }
      pages.push("...");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      // Show first page + ellipsis and last 5 pages
      pages.push("...");
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page + ellipsis + current-1, current, current+1 + ellipsis + last page
      pages.push("...");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push("...");
      pages.push(totalPages);
    }
  }
  
  return pages;
}

// Simple pagination for infinite scroll or load more
interface LoadMorePaginationProps<T> {
  data: PaginationResponse<T>;
  onLoadMore: () => void;
  isLoading?: boolean;
  className?: string;
}

export function LoadMorePagination<T>({
  data,
  onLoadMore,
  isLoading = false,
  className = "",
}: LoadMorePaginationProps<T>) {
  const info = getPaginationInfo(data);

  if (!info.hasNextPage) return null;

  return (
    <div className={`flex justify-center ${className}`}>
      <Button
        variant="outline"
        onClick={onLoadMore}
        disabled={isLoading}
        className="px-8"
      >
        {isLoading ? "Loading..." : "Load More"}
      </Button>
    </div>
  );
}